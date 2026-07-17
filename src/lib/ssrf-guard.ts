import dns from "node:dns";
import net from "node:net";

/**
 * SSRF protection for the scanner.
 *
 * HeaderGuard accepts an arbitrary user-supplied URL and fetches it server-side.
 * Without guarding this, the scanner itself becomes an SSRF vector — an attacker
 * could point it at internal services, localhost, or cloud metadata endpoints
 * (e.g. 169.254.169.254) and read the response via the scan results.
 *
 * This module resolves the target hostname and rejects it if it maps to a
 * private, loopback, link-local, or otherwise non-public IP range. Callers
 * must also re-validate on every redirect hop (see header-scan.ts), since a
 * public hostname can 302 to an internal address, or resolve differently
 * between the check and the fetch (DNS rebinding).
 */

const BLOCKED_HOSTNAMES = new Set(["localhost", "localhost.localdomain", "ip6-localhost"]);

function ipv4ToLong(ip: string): number {
  return ip
    .split(".")
    .reduce((acc, octet) => (acc << 8) + (parseInt(octet, 10) & 255), 0) >>> 0;
}

function isPrivateIPv4(ip: string): boolean {
  const long = ipv4ToLong(ip);
  const inRange = (base: string, bits: number) => {
    const baseLong = ipv4ToLong(base);
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (long & mask) === (baseLong & mask);
  };
  return (
    inRange("0.0.0.0", 8) || // "this" network
    inRange("10.0.0.0", 8) || // RFC1918
    inRange("100.64.0.0", 10) || // CGNAT
    inRange("127.0.0.0", 8) || // loopback
    inRange("169.254.0.0", 16) || // link-local (includes cloud metadata 169.254.169.254)
    inRange("172.16.0.0", 12) || // RFC1918
    inRange("192.0.0.0", 24) || // IETF protocol assignments
    inRange("192.0.2.0", 24) || // TEST-NET-1
    inRange("192.168.0.0", 16) || // RFC1918
    inRange("198.18.0.0", 15) || // benchmark testing
    inRange("198.51.100.0", 24) || // TEST-NET-2
    inRange("203.0.113.0", 24) || // TEST-NET-3
    inRange("224.0.0.0", 4) || // multicast
    inRange("240.0.0.0", 4) // reserved
  );
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fe80:") || lower.startsWith("fec0:")) return true; // link-local
  if (/^f[cd][0-9a-f]{2}:/.test(lower)) return true; // unique local fc00::/7
  // IPv4-mapped / IPv4-compatible IPv6 — unwrap and check the embedded IPv4 address
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  return false;
}

export function isPrivateOrReservedIp(ip: string): boolean {
  const version = net.isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) return isPrivateIPv6(ip);
  return true; // not a recognizable IP — fail closed
}

export class SsrfBlockedError extends Error {
  constructor(hostname: string) {
    super(
      `Scanning "${hostname}" is not allowed: it resolves to a private, loopback, or reserved network address.`
    );
    this.name = "SsrfBlockedError";
  }
}

/**
 * Resolves `hostname` and throws SsrfBlockedError if it points at a
 * non-public address. Must be called before every fetch, including each
 * redirect hop, since resolution can change between checks.
 */
export async function assertPublicHostname(hostname: string): Promise<void> {
  const bareHost = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (BLOCKED_HOSTNAMES.has(bareHost) || bareHost.endsWith(".localhost")) {
    throw new SsrfBlockedError(hostname);
  }

  // Literal IP supplied directly as the hostname
  const directIpVersion = net.isIP(bareHost);
  if (directIpVersion !== 0) {
    if (isPrivateOrReservedIp(bareHost)) throw new SsrfBlockedError(hostname);
    return;
  }

  let records: dns.LookupAddress[];
  try {
    records = await dns.promises.lookup(bareHost, { all: true, verbatim: true });
  } catch {
    // Unresolvable hostname — let the subsequent fetch() surface a clear network error
    return;
  }

  if (records.length === 0) return;

  for (const { address } of records) {
    if (isPrivateOrReservedIp(address)) {
      throw new SsrfBlockedError(hostname);
    }
  }
}
