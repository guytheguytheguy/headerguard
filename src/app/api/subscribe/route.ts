import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    console.error("[subscribe] BUTTONDOWN_API_KEY is not set");
    return NextResponse.json(
      { error: "Newsletter service not configured" },
      { status: 503 }
    );
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email } = body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const res = await fetch("https://api.buttondown.email/v1/subscribers", {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email_address: email }),
  });

  if (res.status === 201) {
    return NextResponse.json({ ok: true });
  }

  if (res.status === 400) {
    const data = await res.json().catch(() => ({}));
    const msg = (data as { email?: string[] }).email?.[0];
    if (msg?.includes("already subscribed")) {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }
    return NextResponse.json({ error: msg || "Invalid email" }, { status: 400 });
  }

  console.error("[subscribe] Buttondown error", res.status);
  return NextResponse.json({ error: "Failed to subscribe" }, { status: 502 });
}
