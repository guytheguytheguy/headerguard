"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { ScanResult } from "@/lib/header-scan";
import { getSupabase } from "@/lib/supabase";
import { ScanResults } from "./scan-results";

interface RecentScan {
  url: string;
  grade: string;
  score: number;
}

const RECENT_KEY = "hg_recent_scans";
const MAX_RECENT = 5;

const GRADE_COLOR: Record<string, string> = {
  A: "text-green-400",
  B: "text-blue-400",
  C: "text-yellow-400",
  D: "text-orange-400",
  F: "text-red-400",
};

function loadRecent(): RecentScan[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecent(scan: RecentScan) {
  try {
    const prev = loadRecent().filter((s) => s.url !== scan.url);
    localStorage.setItem(RECENT_KEY, JSON.stringify([scan, ...prev].slice(0, MAX_RECENT)));
  } catch {
    // localStorage unavailable
  }
}

export function ScanForm() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<RecentScan[]>([]);
  const autoScanned = useRef(false);

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  const doScan = useCallback(async (target: string) => {
    if (!target) {
      setError("Please enter a URL to scan.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let accessToken: string | undefined;
      try {
        const {
          data: { session },
        } = await getSupabase().auth.getSession();
        accessToken = session?.access_token;
      } catch {
        // Not signed in / Supabase unavailable -- scan proceeds as an anonymous request.
      }

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target, accessToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            (res.status === 429
              ? "Daily free-tier scan limit reached. Upgrade to Pro for unlimited scans."
              : "Scan failed. Please try again.")
        );
        return;
      }

      setResult(data);
      const entry: RecentScan = { url: data.url, grade: data.overallGrade, score: data.score };
      saveRecent(entry);
      setRecent(loadRecent());
    } catch {
      setError("Failed to connect to the scan service. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleScan = useCallback(() => doScan(url.trim()), [doScan, url]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleScan();
    },
    [handleScan]
  );

  // Auto-scan from ?url= query param
  useEffect(() => {
    const paramUrl = searchParams.get("url");
    if (paramUrl && !autoScanned.current) {
      autoScanned.current = true;
      setUrl(paramUrl);
      doScan(paramUrl);
    }
  }, [searchParams, doScan]);

  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
    setUrl("");
  }, []);

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
        We send a single HEAD request to fetch response headers. No content from your site is
        stored -- we only keep the scanned URL, grade, and score to enforce the free-tier daily
        scan limit.
      </p>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {!result && recent.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Recent scans</p>
          <div className="flex flex-wrap gap-2">
            {recent.map((s) => (
              <button
                key={s.url}
                onClick={() => {
                  setUrl(s.url);
                  doScan(s.url);
                }}
                className="flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-md px-3 py-1.5 transition-colors"
              >
                <span className={`font-bold ${GRADE_COLOR[s.grade] ?? "text-gray-400"}`}>{s.grade}</span>
                <span className="text-gray-400 max-w-[180px] truncate">{s.url.replace(/^https?:\/\//, "")}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {result && (
        <>
          <ScanResults result={result} />
          <button
            onClick={handleReset}
            className="w-full py-2.5 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/30 rounded-lg transition-colors"
          >
            ← Scan another URL
          </button>
        </>
      )}
    </div>
  );
}
