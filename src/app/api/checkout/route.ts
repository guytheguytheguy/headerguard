import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  let body: { userId?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { userId, email } = body;

  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  }

  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/pricing`,
      ...(email ? { customer_email: email } : {}),
      metadata: userId ? { userId } : {},
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
