"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      // Fetch session so the checkout can be linked to the user's account
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          email: session?.user?.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Checkout failed. Please try again.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:text-red-300 rounded-lg text-sm font-medium transition-colors"
      >
        {loading ? "Redirecting..." : "Upgrade to Pro"}
      </button>
      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}
