import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getServiceClient } from "@/lib/supabase";

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
            .from("profiles")
            .update({
              plan: "pro",
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
            })
            .eq("id", userId);
          if (error) {
            console.error("[webhook] checkout.session.completed profile update failed:", error.message);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const { error } = await supabase
          .from("profiles")
          .update({ plan: "free", stripe_subscription_id: null })
          .eq("stripe_customer_id", customerId);
        if (error) {
          console.error("[webhook] customer.subscription.deleted profile update failed:", error.message);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        if (status === "active") {
          const { error } = await supabase
            .from("profiles")
            .update({ plan: "pro" })
            .eq("stripe_customer_id", customerId);
          if (error) {
            console.error("[webhook] customer.subscription.updated (active) profile update failed:", error.message);
          }
        } else if (status === "canceled" || status === "unpaid") {
          const { error } = await supabase
            .from("profiles")
            .update({ plan: "free" })
            .eq("stripe_customer_id", customerId);
          if (error) {
            console.error("[webhook] customer.subscription.updated (canceled/unpaid) profile update failed:", error.message);
          }
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
