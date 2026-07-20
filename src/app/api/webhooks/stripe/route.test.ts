import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { constructEventMock, getServiceClientMock, supabaseCalls } = vi.hoisted(() => {
  return {
    constructEventMock: vi.fn(),
    getServiceClientMock: vi.fn(),
    supabaseCalls: [] as Array<{ table: string; method: string; data: unknown; eq?: { col: string; val: unknown } }>,
  };
});

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    webhooks: { constructEvent: constructEventMock },
  }),
}));

vi.mock("@/lib/supabase", () => ({
  getServiceClient: getServiceClientMock,
}));

function makeSupabaseClient() {
  return {
    from: (table: string) => ({
      upsert: (data: unknown, opts: unknown) => {
        supabaseCalls.push({ table, method: "upsert", data });
        void opts;
        return Promise.resolve({ error: null });
      },
      update: (data: unknown) => ({
        eq: (col: string, val: unknown) => {
          supabaseCalls.push({ table, method: "update", data, eq: { col, val } });
          return Promise.resolve({ error: null });
        },
      }),
    }),
  };
}

async function postWebhook(): Promise<Response> {
  const { POST } = await import("./route");
  const request = new NextRequest("https://headerguard.veridux.ai/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": "test-signature" },
    body: JSON.stringify({}),
  });
  return POST(request);
}

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    supabaseCalls.length = 0;
    getServiceClientMock.mockReturnValue(makeSupabaseClient());
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  });

  it("upserts the subscriptions table (not profiles) on checkout.session.completed", async () => {
    constructEventMock.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer: "cus_123",
          subscription: "sub_123",
          metadata: { userId: "user-abc" },
        },
      },
    });

    const res = await postWebhook();
    expect(res.status).toBe(200);

    expect(supabaseCalls).toHaveLength(1);
    const call = supabaseCalls[0];
    expect(call.table).toBe("subscriptions");
    expect(call.method).toBe("upsert");
    expect(call.data).toMatchObject({
      user_id: "user-abc",
      plan: "pro",
      status: "active",
      stripe_customer_id: "cus_123",
      stripe_sub_id: "sub_123",
    });
  });

  it("downgrades the subscriptions row by stripe_customer_id on customer.subscription.deleted", async () => {
    constructEventMock.mockReturnValue({
      type: "customer.subscription.deleted",
      data: { object: { customer: "cus_123" } },
    });

    await postWebhook();

    expect(supabaseCalls).toHaveLength(1);
    const call = supabaseCalls[0];
    expect(call.table).toBe("subscriptions");
    expect(call.data).toMatchObject({ plan: "free", status: "canceled" });
    expect(call.eq).toEqual({ col: "stripe_customer_id", val: "cus_123" });
  });

  it("maps an active subscription.updated event to plan=pro", async () => {
    constructEventMock.mockReturnValue({
      type: "customer.subscription.updated",
      data: { object: { customer: "cus_123", status: "active" } },
    });

    await postWebhook();

    const call = supabaseCalls[0];
    expect(call.data).toMatchObject({ plan: "pro", status: "active" });
  });

  it("maps an unrecognized Stripe status to a valid subscriptions.status value and plan=free", async () => {
    constructEventMock.mockReturnValue({
      type: "customer.subscription.updated",
      data: { object: { customer: "cus_123", status: "unpaid" } },
    });

    await postWebhook();

    const call = supabaseCalls[0];
    // "unpaid" isn't in the subscriptions.status check constraint — must not be written as-is.
    expect(call.data).toMatchObject({ plan: "free", status: "past_due" });
  });

  it("never writes to the profiles table", async () => {
    constructEventMock.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: { customer: "cus_1", subscription: "sub_1", metadata: { userId: "u1" } },
      },
    });

    await postWebhook();

    expect(supabaseCalls.every((c) => c.table !== "profiles")).toBe(true);
  });

  it("rejects requests missing the stripe-signature header", async () => {
    const { POST } = await import("./route");
    const request = new NextRequest("https://headerguard.veridux.ai/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
    });
    const res = await POST(request);
    expect(res.status).toBe(400);
  });
});
