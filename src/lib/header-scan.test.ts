import { describe, it, expect, vi, afterEach } from "vitest";
import { scanUrl } from "./header-scan";

function makeResponse(headers: Record<string, string>, status = 200) {
  const headerMap = new Headers(headers);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: headerMap,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("scanUrl — overall grade calculation", () => {
  it("returns grade A when all critical headers are set correctly", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeResponse({
          "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
          "content-security-policy": "default-src 'self'; script-src 'self'",
          "x-content-type-options": "nosniff",
          "x-frame-options": "DENY",
          "referrer-policy": "strict-origin-when-cross-origin",
          "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          "x-xss-protection": "0",
          "cross-origin-opener-policy": "same-origin",
          "cross-origin-resource-policy": "same-origin",
          "cross-origin-embedder-policy": "require-corp",
        })
      )
    );

    const result = await scanUrl("https://example.com");
    expect(result.overallGrade).toBe("A");
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.url).toBe("https://example.com");
  });

  it("returns grade F when no security headers are present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse({ "content-type": "text/html" }))
    );

    const result = await scanUrl("https://example.com");
    expect(result.overallGrade).toBe("F");
    expect(result.score).toBeLessThan(30);
  });

  it("includes exactly 10 header checks", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse({}))
    );

    const result = await scanUrl("https://example.com");
    expect(result.headers).toHaveLength(10);
  });
});

describe("scanUrl — individual header grading", () => {
  it("grades HSTS as A with long max-age and includeSubDomains", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeResponse({ "strict-transport-security": "max-age=63072000; includeSubDomains" })
      )
    );
    const result = await scanUrl("https://example.com");
    const hsts = result.headers.find((h) => h.name === "Strict-Transport-Security");
    expect(hsts?.grade).toBe("A");
    expect(hsts?.present).toBe(true);
  });

  it("grades HSTS as B with long max-age but no includeSubDomains", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeResponse({ "strict-transport-security": "max-age=31536000" })
      )
    );
    const result = await scanUrl("https://example.com");
    const hsts = result.headers.find((h) => h.name === "Strict-Transport-Security");
    expect(hsts?.grade).toBe("B");
  });

  it("grades HSTS as F when missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse({}))
    );
    const result = await scanUrl("https://example.com");
    const hsts = result.headers.find((h) => h.name === "Strict-Transport-Security");
    expect(hsts?.grade).toBe("F");
    expect(hsts?.present).toBe(false);
  });

  it("grades CSP as A when using default-src without unsafe-inline", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeResponse({ "content-security-policy": "default-src 'self'; script-src 'self'" })
      )
    );
    const result = await scanUrl("https://example.com");
    const csp = result.headers.find((h) => h.name === "Content-Security-Policy");
    expect(csp?.grade).toBe("A");
  });

  it("grades CSP as B when using default-src with unsafe-inline", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeResponse({ "content-security-policy": "default-src 'self' 'unsafe-inline'" })
      )
    );
    const result = await scanUrl("https://example.com");
    const csp = result.headers.find((h) => h.name === "Content-Security-Policy");
    expect(csp?.grade).toBe("B");
  });

  it("grades X-Content-Type-Options as A for 'nosniff'", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse({ "x-content-type-options": "nosniff" }))
    );
    const result = await scanUrl("https://example.com");
    const xcto = result.headers.find((h) => h.name === "X-Content-Type-Options");
    expect(xcto?.grade).toBe("A");
  });

  it("grades X-Frame-Options as A for DENY", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse({ "x-frame-options": "DENY" }))
    );
    const result = await scanUrl("https://example.com");
    const xfo = result.headers.find((h) => h.name === "X-Frame-Options");
    expect(xfo?.grade).toBe("A");
  });

  it("grades X-Frame-Options as B for SAMEORIGIN", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse({ "x-frame-options": "SAMEORIGIN" }))
    );
    const result = await scanUrl("https://example.com");
    const xfo = result.headers.find((h) => h.name === "X-Frame-Options");
    expect(xfo?.grade).toBe("B");
  });

  it("grades X-XSS-Protection as A when set to 0 (correctly disabled)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse({ "x-xss-protection": "0" }))
    );
    const result = await scanUrl("https://example.com");
    const xss = result.headers.find((h) => h.name === "X-XSS-Protection");
    expect(xss?.grade).toBe("A");
  });

  it("grades Referrer-Policy as A for strict-origin-when-cross-origin", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeResponse({ "referrer-policy": "strict-origin-when-cross-origin" })
      )
    );
    const result = await scanUrl("https://example.com");
    const rp = result.headers.find((h) => h.name === "Referrer-Policy");
    expect(rp?.grade).toBe("A");
  });

  it("grades COOP as A for same-origin", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeResponse({ "cross-origin-opener-policy": "same-origin" })
      )
    );
    const result = await scanUrl("https://example.com");
    const coop = result.headers.find((h) => h.name === "Cross-Origin-Opener-Policy");
    expect(coop?.grade).toBe("A");
  });

  it("grades COEP as A for require-corp", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeResponse({ "cross-origin-embedder-policy": "require-corp" })
      )
    );
    const result = await scanUrl("https://example.com");
    const coep = result.headers.find((h) => h.name === "Cross-Origin-Embedder-Policy");
    expect(coep?.grade).toBe("A");
  });
});

describe("scanUrl — error handling", () => {
  it("throws on timeout (AbortError)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError"))
    );

    await expect(scanUrl("https://slow.example.com")).rejects.toThrow(/Timeout/i);
  });

  it("throws on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("ECONNREFUSED"))
    );

    await expect(scanUrl("https://unreachable.example.com")).rejects.toThrow(
      /Failed to reach/i
    );
  });
});

describe("scanUrl — result shape", () => {
  it("includes rawHeaders in result", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeResponse({ "x-custom-header": "value", "content-type": "text/html" })
      )
    );
    const result = await scanUrl("https://example.com");
    expect(result.rawHeaders).toBeDefined();
    expect(typeof result.rawHeaders).toBe("object");
  });

  it("scannedAt is a valid ISO timestamp", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse({}))
    );
    const result = await scanUrl("https://example.com");
    expect(() => new Date(result.scannedAt)).not.toThrow();
    expect(new Date(result.scannedAt).toISOString()).toBe(result.scannedAt);
  });
});
