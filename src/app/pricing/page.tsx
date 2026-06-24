import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Check, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing — HeaderGuard",
  description:
    "Simple pricing for HeaderGuard. Scan for free, or upgrade for continuous monitoring, alerts and API access.",
};

interface Tier {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const tiers: Tier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "/mo",
    description: "Spot-check a site whenever you need to.",
    features: [
      "3-header check",
      "Scan on demand",
      "No history",
    ],
    cta: "Start scanning",
  },
  {
    name: "Pro",
    price: "$15",
    cadence: "/mo",
    description: "For developers shipping production sites.",
    features: [
      "All 6 headers analyzed",
      "10 URLs monitored",
      "Email alerts on changes",
      "90-day history",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$49",
    cadence: "/mo",
    description: "For teams managing a portfolio of properties.",
    features: [
      "Unlimited URLs",
      "API access",
      "Slack alerts",
      "Team seats",
      "Priority support",
    ],
    cta: "Contact sales",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50">
      {/* Nav */}
      <nav className="border-b border-zinc-800/80">
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
              href="/"
              className="text-zinc-400 transition-colors hover:text-zinc-50"
            >
              Scanner
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

      <main className="mx-auto max-w-6xl px-6">
        <section className="pt-20 pb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
            Start for free. Upgrade when you need continuous monitoring, alerts
            and API access across your portfolio.
          </p>
        </section>

        <section className="grid gap-6 pb-24 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                tier.highlighted
                  ? "border-red-500/60 bg-zinc-900/60 shadow-[0_0_80px_-30px] shadow-red-500/60"
                  : "border-zinc-800 bg-zinc-900/30"
              }`}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-semibold text-zinc-100">
                {tier.name}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">{tier.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-zinc-50">
                  {tier.price}
                </span>
                <span className="text-zinc-500">{tier.cadence}</span>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-zinc-300"
                  >
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        tier.highlighted ? "text-red-500" : "text-green-500"
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/"
                className={`mt-8 inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold transition-colors ${
                  tier.highlighted
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "border border-zinc-700 text-zinc-200 hover:border-zinc-500 hover:text-white"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-zinc-800/80">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-zinc-500 sm:flex-row">
          <span>
            © {new Date().getFullYear()} HeaderGuard. All rights reserved.
          </span>
          <Link href="/" className="transition-colors hover:text-zinc-300">
            Back to scanner
          </Link>
        </div>
      </footer>
    </div>
  );
}
