import { NextRequest, NextResponse } from "next/server";
import { scanUrl } from "@/lib/header-scan";
import { SsrfBlockedError } from "@/lib/ssrf-guard";
import { checkScanLimit, recordScan, resolveScanIdentity } from "@/lib/scan-limit";
import { PLANS } from "@/lib/plans";

export async function POST(request: NextRequest) {
  let body: { url?: string; accessToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url, accessToken } = body;
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // If URL already has an explicit protocol, parse as-is; otherwise prepend https://
  const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(url);
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(hasProtocol ? url : `https://${url}`);
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: "Only HTTP and HTTPS URLs are supported" }, { status: 400 });
  }

  // Reject bare words like "not-a-url" that have no dots in the hostname
  if (!parsedUrl.hostname.includes(".") && parsedUrl.hostname !== "localhost") {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  const identity = await resolveScanIdentity(request, accessToken);
  const limit = await checkScanLimit(identity);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Free tier limit of ${PLANS.free.scansPerDay} scans/day reached. Upgrade to Pro for unlimited scans.`,
      },
      { status: 429 }
    );
  }

  try {
    const result = await scanUrl(parsedUrl.toString());
    // Awaited (not fire-and-forget): Vercel serverless functions can be frozen/killed
    // as soon as the response is sent, which would silently drop the write and let
    // the free-tier limit be trivially bypassed.
    await recordScan({ identity, url: result.url, grade: result.overallGrade, score: result.score });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof SsrfBlockedError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Scan failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
