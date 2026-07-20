import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { PLANS } from "@/lib/plans";

const WINDOW_MS = 24 * 60 * 60 * 1000;

export interface ScanIdentity {
  /** Verified Supabase user id, or null if anonymous / token invalid. */
  userId: string | null;
  /** Best-effort client IP, or null if unavailable (e.g. local dev). */
  ip: string | null;
}

export interface ScanLimitCheck {
  allowed: boolean;
  /** True when the identity resolved to an active/trialing Pro subscription. */
  isPro: boolean;
}

/** Extracts the caller's IP from standard proxy headers set by Vercel's edge network. */
export function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  return realIp || null;
}

/**
 * Resolves the caller's identity for scan-limit purposes. If an `accessToken` is
 * supplied, it is verified against Supabase Auth (never trusted as-is) so a client
 * can't spoof another user's id to inherit their Pro status.
 */
export async function resolveScanIdentity(
  request: NextRequest,
  accessToken?: string
): Promise<ScanIdentity> {
  const ip = getClientIp(request);

  if (!accessToken) {
    return { userId: null, ip };
  }

  try {
    const { data, error } = await getServiceClient().auth.getUser(accessToken);
    if (error || !data?.user) {
      return { userId: null, ip };
    }
    return { userId: data.user.id, ip };
  } catch (err) {
    console.error("[scan-limit] failed to verify access token:", err instanceof Error ? err.message : err);
    return { userId: null, ip };
  }
}

/**
 * Checks the free-tier daily scan limit against the real `scans` table in Supabase
 * (persisted, per-user/per-IP, works across Vercel's multiple serverless instances --
 * NOT an in-memory counter, which would silently reset per-instance and not actually
 * enforce anything).
 *
 * Fails open (allows the scan) if Supabase is unreachable, since a secondary
 * rate-limit-tracking outage should not take down the core scanning product.
 */
export async function checkScanLimit(identity: ScanIdentity): Promise<ScanLimitCheck> {
  const { userId, ip } = identity;

  if (userId) {
    try {
      const { data: sub } = await getServiceClient()
        .from("subscriptions")
        .select("plan,status")
        .eq("user_id", userId)
        .maybeSingle();

      const isPro =
        !!sub && sub.plan === "pro" && (sub.status === "active" || sub.status === "trialing");
      if (isPro) {
        return { allowed: true, isPro: true };
      }
    } catch (err) {
      console.error("[scan-limit] failed to look up subscription:", err instanceof Error ? err.message : err);
      // Fall through to free-tier counting below.
    }
  }

  // No verified identity at all (no user, no IP) -- can't enforce anything meaningful.
  if (!userId && !ip) {
    return { allowed: true, isPro: false };
  }

  try {
    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    let query = getServiceClient()
      .from("scans")
      .select("id", { count: "exact", head: true })
      .gte("scanned_at", since);

    query = userId ? query.eq("user_id", userId) : query.eq("ip_address", ip).is("user_id", null);

    const { count, error } = await query;
    if (error) {
      console.error("[scan-limit] count query failed:", error.message);
      return { allowed: true, isPro: false };
    }

    return { allowed: (count ?? 0) < PLANS.free.scansPerDay, isPro: false };
  } catch (err) {
    console.error("[scan-limit] count query threw:", err instanceof Error ? err.message : err);
    return { allowed: true, isPro: false };
  }
}

/** Persists a completed scan for history + scan-limit accounting. Best-effort. */
export async function recordScan(params: {
  identity: ScanIdentity;
  url: string;
  grade: string;
  score: number;
}): Promise<void> {
  const { identity, url, grade, score } = params;
  try {
    const { error } = await getServiceClient().from("scans").insert({
      user_id: identity.userId,
      url,
      grade,
      score,
      normalized_score: score,
      is_https: url.startsWith("https://"),
      ip_address: identity.ip,
    });
    if (error) {
      console.error("[scan-limit] failed to record scan:", error.message);
    }
  } catch (err) {
    console.error("[scan-limit] recordScan threw:", err instanceof Error ? err.message : err);
  }
}
