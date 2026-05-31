"use client";

import { useEffect, useState } from "react";

export function CheckoutSuccessBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      setVisible(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-6 py-4 mb-8 flex items-start gap-4">
      <span className="text-green-400 text-2xl leading-none mt-0.5">✓</span>
      <div>
        <p className="text-sm font-semibold text-green-300">You&apos;re now on HeaderGuard Pro!</p>
        <p className="text-xs text-gray-400 mt-1">
          Unlimited scans, daily monitoring, and CI/CD integration are now active on your account.
          Sign in to manage your subscription.
        </p>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="ml-auto text-gray-500 hover:text-gray-300 transition-colors text-lg leading-none shrink-0"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
