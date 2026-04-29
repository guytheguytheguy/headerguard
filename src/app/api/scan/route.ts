import { NextRequest, NextResponse } from "next/server";
import { scanUrl } from "@/lib/header-scan";

export async function POST(request: NextRequest) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url } = body;
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

  try {
    const result = await scanUrl(parsedUrl.toString());
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scan failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
