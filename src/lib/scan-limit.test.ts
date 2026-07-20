import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { getUserMock, subscriptionSelectMock, scansCountMock, scansInsertMock } = vi.hoisted(() => {
  return {
    getUserMock: vi.fn(),
    subscriptionSelectMock: vi.fn(),
    scansCountMock: vi.fn(),
    scansInsertMock: vi.fn(),
  };
});

// Mimics the supabase-js query builder: each filter method returns a new chainable,
// thenable object so `await` can resolve at any point in the chain (`.eq()` alone for
// the userId branch, or `.eq().is()` for the anonymous/IP branch).
function scansQueryChain(calls: Array<[string, unknown[]]> = []): Record<string, unknown> {
  const node: Record<string, unknown> = {};
  for (const method of ["gte", "eq", "is"]) {
    node[method] = (...args: unknown[]) => scansQueryChain([...calls, [method, args]]);
  }
  node.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
    Promise.resolve(scansCountMock(calls)).then(resolve, reject);
  return node;
}

vi.mock("@/lib/supabase", () => ({
  getServiceClient: () => ({
    auth: { getUser: getUserMock },
    from: (table: string) => {
      if (table === "subscriptions") {
        return { select: () => ({ eq: () => ({ maybeSingle: subscriptionSelectMock }) }) };
      }
      if (table === "scans") {
        return {
          select: () => scansQueryChain(),
          insert: (data: unknown) => scansInsertMock(data),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  }),
}));

import { checkScanLimit, getClientIp, recordScan, resolveScanIdentity } from "./scan-limit";

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("https://headerguard.veridux.ai/api/scan", {
    method: "POST",
    headers,
    body: JSON.stringify({ url: "https://example.com" }),
  });
}

describe("getClientIp", () => {
  it("reads the first hop of x-forwarded-for", () => {
    const req = makeRequest({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" });
    expect(getClientIp(req)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip", () => {
    const req = makeRequest({ "x-real-ip": "203.0.113.9" });
    expect(getClientIp(req)).toBe("203.0.113.9");
  });

  it("returns null when neither header is present", () => {
    expect(getClientIp(makeRequest())).toBeNull();
  });
});

describe("resolveScanIdentity", () => {
  beforeEach(() => {
    getUserMock.mockReset();
  });

  it("returns null userId when no accessToken is supplied", async () => {
    const identity = await resolveScanIdentity(makeRequest({ "x-real-ip": "1.2.3.4" }));
    expect(identity).toEqual({ userId: null, ip: "1.2.3.4" });
  });

  it("verifies the accessToken against Supabase Auth rather than trusting a client-supplied id", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    const identity = await resolveScanIdentity(makeRequest({ "x-real-ip": "1.2.3.4" }), "tok_valid");
    expect(getUserMock).toHaveBeenCalledWith("tok_valid");
    expect(identity).toEqual({ userId: "user-1", ip: "1.2.3.4" });
  });

  it("treats an invalid/expired token as anonymous", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: { message: "invalid token" } });
    const identity = await resolveScanIdentity(makeRequest({ "x-real-ip": "1.2.3.4" }), "tok_bad");
    expect(identity).toEqual({ userId: null, ip: "1.2.3.4" });
  });
});

describe("checkScanLimit", () => {
  beforeEach(() => {
    subscriptionSelectMock.mockReset();
    scansCountMock.mockReset();
  });

  it("bypasses the limit entirely for an active Pro subscriber", async () => {
    subscriptionSelectMock.mockResolvedValue({ data: { plan: "pro", status: "active" }, error: null });
    const result = await checkScanLimit({ userId: "user-1", ip: "1.2.3.4" });
    expect(result).toEqual({ allowed: true, isPro: true });
    expect(scansCountMock).not.toHaveBeenCalled();
  });

  it("does not bypass for a canceled subscription and falls back to counting", async () => {
    subscriptionSelectMock.mockResolvedValue({ data: { plan: "free", status: "canceled" }, error: null });
    scansCountMock.mockReturnValue({ count: 1, error: null });
    const result = await checkScanLimit({ userId: "user-1", ip: "1.2.3.4" });
    expect(result.isPro).toBe(false);
    expect(result.allowed).toBe(true);
  });

  it("blocks once the free-tier daily count reaches the limit", async () => {
    scansCountMock.mockReturnValue({ count: 3, error: null });
    const result = await checkScanLimit({ userId: null, ip: "1.2.3.4" });
    expect(result).toEqual({ allowed: false, isPro: false });
  });

  it("allows scans below the free-tier daily count", async () => {
    scansCountMock.mockReturnValue({ count: 2, error: null });
    const result = await checkScanLimit({ userId: null, ip: "1.2.3.4" });
    expect(result.allowed).toBe(true);
  });

  it("fails open (allows the scan) when there is no identity at all", async () => {
    const result = await checkScanLimit({ userId: null, ip: null });
    expect(result).toEqual({ allowed: true, isPro: false });
    expect(scansCountMock).not.toHaveBeenCalled();
  });
});

describe("recordScan", () => {
  beforeEach(() => {
    scansInsertMock.mockReset();
    scansInsertMock.mockReturnValue({ error: null });
  });

  it("persists the scan with normalized_score mirroring score and derived is_https", async () => {
    await recordScan({
      identity: { userId: "user-1", ip: "1.2.3.4" },
      url: "https://example.com",
      grade: "A",
      score: 92,
    });

    expect(scansInsertMock).toHaveBeenCalledWith({
      user_id: "user-1",
      url: "https://example.com",
      grade: "A",
      score: 92,
      normalized_score: 92,
      is_https: true,
      ip_address: "1.2.3.4",
    });
  });

  it("does not throw when the insert fails", async () => {
    scansInsertMock.mockReturnValue({ error: { message: "db down" } });
    await expect(
      recordScan({ identity: { userId: null, ip: "1.2.3.4" }, url: "http://example.com", grade: "F", score: 10 })
    ).resolves.toBeUndefined();
  });
});
