"use client";

import { useState, useCallback } from "react";
import type { ScanResult } from "@/lib/header-scan";
import { ScanResults } from "./scan-results";

export function ScanForm() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL to scan.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setResult(data);
    } catch {
      setError("Failed to connect to the scan service. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleScan();
    },
    [handleScan]
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://example.com"
          className="flex-1 py-3 px-4 bg-black/50 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
          spellCheck={false}
        />
        <button
          onClick={handleScan}
          disabled={loading || !url.trim()}
          className="py-3 px-6 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>

      <p className="text-xs text-gray-500 -mt-3">
        We send a single HEAD request to fetch response headers. No data is stored.
      </p>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && <ScanResults result={result} />}
    </div>
  );
}
