import { describe, it, expect, vi, afterEach } from "vitest";
import dns from "node:dns";
import { assertPublicHostname, isPrivateOrReservedIp, SsrfBlockedError } from "./ssrf-guard";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isPrivateOrReservedIp", () => {
  it.each([
    ["127.0.0.1", true],
    ["127.0.0.53", true],
    ["10.0.0.1", true],
    ["10.255.255.255", true],
    ["172.16.0.1", true],
    ["172.31.255.255", true],
    ["192.168.1.1", true],
    ["169.254.169.254", true], // cloud metadata endpoint (AWS/GCP/Azure)
    ["0.0.0.0", true],
    ["100.64.0.1", true], // CGNAT
    ["224.0.0.1", true], // multicast
    ["240.0.0.1", true], // reserved
  ])("flags private IPv4 %s as blocked", (ip) => {
    expect(isPrivateOrReservedIp(ip)).toBe(true);
  });

  it.each([
    ["8.8.8.8", false],
    ["1.1.1.1", false],
    ["93.184.216.34", false], // example.com
    ["172.15.255.255", false], // just outside RFC1918 172.16/12
    ["172.32.0.1", false], // just outside RFC1918 172.16/12
    ["169.253.255.255", false], // just outside link-local
  ])("allows public IPv4 %s", (ip) => {
    expect(isPrivateOrReservedIp(ip)).toBe(false);
  });

  it.each([
    ["::1", true],
    ["fe80::1", true],
    ["fc00::1", true],
    ["fd00::1", true],
    ["::ffff:127.0.0.1", true], // IPv4-mapped loopback
    ["::ffff:169.254.169.254", true], // IPv4-mapped cloud metadata
  ])("flags private IPv6 %s as blocked", (ip) => {
    expect(isPrivateOrReservedIp(ip)).toBe(true);
  });

  it.each([
    ["2606:4700:4700::1111", false], // Cloudflare public DNS
    ["2001:4860:4860::8888", false], // Google public DNS
  ])("allows public IPv6 %s", (ip) => {
    expect(isPrivateOrReservedIp(ip)).toBe(false);
  });
});

describe("assertPublicHostname", () => {
  it("rejects 'localhost' outright", async () => {
    await expect(assertPublicHostname("localhost")).rejects.toThrow(SsrfBlockedError);
  });

  it("rejects a literal private IP passed as the hostname", async () => {
    await expect(assertPublicHostname("192.168.1.1")).rejects.toThrow(SsrfBlockedError);
  });

  it("rejects the AWS/GCP metadata IP passed as the hostname", async () => {
    await expect(assertPublicHostname("169.254.169.254")).rejects.toThrow(SsrfBlockedError);
  });

  it("rejects a public-looking hostname that resolves to a private IP (DNS rebinding)", async () => {
    vi.spyOn(dns.promises, "lookup").mockResolvedValue([
      { address: "127.0.0.1", family: 4 },
    ] as never);

    await expect(assertPublicHostname("rebind.example.com")).rejects.toThrow(SsrfBlockedError);
  });

  it("allows a hostname that resolves only to public IPs", async () => {
    vi.spyOn(dns.promises, "lookup").mockResolvedValue([
      { address: "93.184.216.34", family: 4 },
    ] as never);

    await expect(assertPublicHostname("example.com")).resolves.toBeUndefined();
  });

  it("rejects if any resolved address (multi-A-record) is private", async () => {
    vi.spyOn(dns.promises, "lookup").mockResolvedValue([
      { address: "93.184.216.34", family: 4 },
      { address: "10.0.0.5", family: 4 },
    ] as never);

    await expect(assertPublicHostname("multi.example.com")).rejects.toThrow(SsrfBlockedError);
  });
});
