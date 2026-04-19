import { PLANS } from "@/lib/plans";
import { UpgradeButton } from "@/components/upgrade-button";

export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">Simple, transparent pricing</h1>
        <p className="text-gray-400">Start free. Upgrade when you need more.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
        {/* Free */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <h2 className="text-xl font-bold mb-1">{PLANS.free.name}</h2>
          <div className="text-3xl font-bold mb-6">
            $0<span className="text-sm text-gray-500 font-normal">/mo</span>
          </div>
          <ul className="space-y-3 mb-8">
            {PLANS.free.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="text-red-400 mt-0.5">&#10003;</span>
                {f}
              </li>
            ))}
          </ul>
          <a
            href="/"
            className="block text-center py-2.5 px-4 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Get Started
          </a>
        </div>

        {/* Pro */}
        <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-8 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            POPULAR
          </div>
          <h2 className="text-xl font-bold mb-1">{PLANS.pro.name}</h2>
          <div className="text-3xl font-bold mb-6">
            ${PLANS.pro.price}<span className="text-sm text-gray-500 font-normal">/mo</span>
          </div>
          <ul className="space-y-3 mb-8">
            {PLANS.pro.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-red-400 mt-0.5">&#10003;</span>
                {f}
              </li>
            ))}
          </ul>
          <UpgradeButton />
        </div>
      </div>
    </div>
  );
}
