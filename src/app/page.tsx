"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  Loader2,
  Search,
  Zap,
  ListChecks,
  UserX,
  Lock,
} from "lucide-react";

type Grade = "A+" | "A" | "B" | "C" | "D" | "F";

interface HeaderResult {
  name: string;
  key: string;
  value: string | null;
  grade: Grade;
  score: number;
  message: string;
  description: string;
}

interface ScanResult {
  url: string;
  grade: Grade;
  score: number;
  headers: HeaderResult[];
  scannedAt: string;
}

function gradeColorClasses(grade: Grade): string {
  switch (grade) {
    case "A+":
    case "A":
      return "bg-green-500/15 text-green-400 border-green-500/40";
    case "B":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/40";
    case "C":
      return "bg-orange-500/15 text-orange-400 border-orange-500/40";
    case "D":
    case "F":
    default:
      return "bg-red-500/15 text-red-400 border-red-500/40";
  }
}

function gradeRingClasses(grade: Grade): string {
  switch (grade) {
    case "A+":
    case "A":
      return "border-green-500 text-green-400 shadow-[0_0_60px_-15px] shadow-green-500/50";
    case "B":
      return "border-yellow-500 text-yellow-400 shadow-[0_0_60px_-15px] shadow-yellow-500/50";
    case "C":
      return "border-orange-500 text-orange-400 shadow-[0_0_60px_-15px] shadow-orange-500/50";
    case "D":
    case "F":
    default:
      return "border-red-500 text-red-400 shadow-[0_0_60px_-15px] shadow-red-500/50";
  }
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setResult(data as ScanResult);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50">
      {/* Nav */}
      <nav className="border-b border-zinc-800/80 backdrop-blur supports-[backdrop-filter]:bg-[#09090b]/60 sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-red-500/15 ring-1 ring-red-500/40">
              <Shield className="h-5 w-5 text-red-500" strokeWidth={2.4} />
            </span>
            <span className="text-lg tracking-tight">
              Header<span className="text-red-500">Guard</span>
            </span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/pricing"
              className="text-zinc-400 transition-colors hover:text-zinc-50"
            >
              Pricing
            </Link>
            <button
              type="button"
              className="rounded-lg border border-zinc-700 px-4 py-1.5 font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-50"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="pt-20 pb-12 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-xs font-medium text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5 text-red-500" />
            Free HTTP security header scanner
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Grade Your HTTP Security
            <br className="hidden sm:block" />{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
              Headers Instantly
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
            Enter any URL and HeaderGuard checks the six headers that matter
            most, scoring each from A+ to F so you know exactly what to fix.
          </p>

          {/* Scan form */}
          <form
            onSubmit={handleScan}
            className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row"
          >
            <div className="flex flex-1 items-center rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 transition-colors focus-within:border-red-500/60">
              <span className="select-none font-mono text-sm text-zinc-500">
                https://
              </span>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className="w-full bg-transparent py-3.5 pl-1 text-zinc-50 placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Analyze
                </>
              )}
            </button>
          </form>

          {error && (
            <p className="mx-auto mt-4 max-w-2xl rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </section>

        {/* Results */}
        {result && (
          <section className="mx-auto max-w-4xl pb-12">
            {/* Overall grade */}
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 sm:flex-row sm:items-center sm:gap-10">
              <div
                className={`grid h-32 w-32 shrink-0 place-items-center rounded-full border-4 bg-[#09090b] ${gradeRingClasses(
                  result.grade
                )}`}
              >
                <span className="text-5xl font-bold">{result.grade}</span>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm uppercase tracking-wider text-zinc-500">
                  Security Score
                </p>
                <p className="mt-1 text-4xl font-bold">
                  {result.score}
                  <span className="text-2xl text-zinc-500">/100</span>
                </p>
                <p className="mt-2 break-all font-mono text-sm text-zinc-400">
                  {result.url}
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Scanned {new Date(result.scannedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Header table */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800">
              <div className="divide-y divide-zinc-800">
                {result.headers.map((header) => (
                  <div
                    key={header.key}
                    className="grid grid-cols-1 gap-3 bg-zinc-900/30 p-5 transition-colors hover:bg-zinc-900/60 sm:grid-cols-[1fr_auto] sm:items-start"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm font-bold ${gradeColorClasses(
                            header.grade
                          )}`}
                        >
                          {header.grade}
                        </span>
                        <h3 className="truncate font-mono text-sm font-medium text-zinc-100">
                          {header.name}
                        </h3>
                      </div>
                      <p className="mt-2 text-sm text-zinc-400">
                        {header.message}
                      </p>
                      <p className="mt-2 truncate font-mono text-xs text-zinc-600">
                        {header.value
                          ? header.value.length > 90
                            ? `${header.value.slice(0, 90)}…`
                            : header.value
                          : "— not set —"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        {!result && (
          <section className="grid gap-6 py-16 sm:grid-cols-3">
            {[
              {
                icon: ListChecks,
                title: "6 Headers Analyzed",
                body: "HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy.",
              },
              {
                icon: Zap,
                title: "Instant Results",
                body: "We fetch your page server-side and grade every header in seconds, no setup required.",
              },
              {
                icon: UserX,
                title: "No Account Needed",
                body: "Paste a URL and go. No sign-up, no credit card, no tracking of the sites you scan.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6"
              >
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-red-500/15 ring-1 ring-red-500/30">
                  <feature.icon className="h-5 w-5 text-red-500" />
                </span>
                <h3 className="mt-4 font-semibold text-zinc-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">{feature.body}</p>
              </div>
            ))}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-zinc-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-zinc-600" />
            <span>© {new Date().getFullYear()} HeaderGuard. All rights reserved.</span>
          </div>
          <Link
            href="/pricing"
            className="transition-colors hover:text-zinc-300"
          >
            Pricing
          </Link>
        </div>
      </footer>
    </div>
  );
}
