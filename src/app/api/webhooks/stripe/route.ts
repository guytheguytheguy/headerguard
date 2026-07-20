import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getServiceClient } from "@/lib/supabase";

// Mirrors the `subscriptions.status` check constraint in Supabase:
// active | trialing | canceled | past_due | incomplete
const ALLOWED_STATUSES = new Set(["active", "trialing", "canceled", "past_due", "incomplete"]);

function toSubscriptionStatus(stripeStatus: string): string {
  return ALLOWED_STATUSES.has(stripeStatus) ? stripeStatus : "past_due";
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const supabase = getServiceClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (userId) {
          const { error } = await supabase
            .from("subscriptions")
            .upsert(
              {
                user_id: userId,
                plan: "pro",
                status: "active",
                stripe_customer_id: session.customer as string,
                stripe_sub_id: session.subscription as string,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );
          if (error) {
            console.error("[webhook] checkout.session.completed subscription upsert failed:", error.message);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const { error } = await supabase
          .from("subscriptions")
          .update({ plan: "free", status: "canceled", updated_at: new Date().toISOString() })
          .eq("stripe_customer_id", customerId);
        if (error) {
          console.error("[webhook] customer.subscription.deleted subscription update failed:", error.message);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const status = toSubscriptionStatus(subscription.status);
        const plan = status === "active" || status === "trialing" ? "pro" : "free";
        const { error } = await supabase
          .from("subscriptions")
          .update({ plan, status, updated_at: new Date().toISOString() })
          .eq("stripe_customer_id", customerId);
        if (error) {
          console.error("[webhook] customer.subscription.updated subscription update failed:", error.message);
        }
        break;
      }
    }
  } catch (err) {
    // Log but still return 200 — Stripe retries on non-2xx, and a config/DB
    // failure here won't be fixed by a retry storm. We want visibility, not backoff.
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[webhook] Failed to process ${event.type}:`, message);
  }

  return NextResponse.json({ received: true });
}
