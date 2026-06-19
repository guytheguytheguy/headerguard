"use client";

import { useState, useCallback } from "react";
import type { ScanResult, Grade, Severity } from "@/lib/header-scan";

const GRADE_COLORS: Record<Grade, string> = {
  A: "text-green-400 border-green-400/30 bg-green-400/10",
  B: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  C: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  D: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  F: "text-red-400 border-red-400/30 bg-red-400/10",
};

const SEVERITY_LABELS: Record<Severity, { label: string; color: string }> = {
  critical: { label: "Critical", color: "text-red-400" },
  high: { label: "High", color: "text-orange-400" },
  medium: { label: "Medium", color: "text-yellow-400" },
  low: { label: "Low", color: "text-blue-400" },
  info: { label: "Info", color: "text-gray-400" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available — silently ignore
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-gray-500 hover:text-gray-300 transition-colors ml-2 shrink-0"
      title="Copy to clipboard"
    >
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}

function ShareResults({ result }: { result: ScanResult }) {
  const [copied, setCopied] = useState(false);

  const shareText = `Just scanned ${result.url} with HeaderGuard — got a ${result.overallGrade} security grade (${result.score}/100). Check your site's HTTP security headers free 👇`;
  const scanLink = `https://headerguard.veridux.ai/?url=${encodeURIComponent(result.url)}`;

  const twitterUrl =
    "https://x.com/intent/tweet?text=" +
    encodeURIComponent(shareText) +
    "&url=" +
    encodeURIComponent(scanLink);

  const linkedInUrl =
    "https://www.linkedin.com/sharing/share-offsite/?url=" +
    encodeURIComponent(scanLink) +
    "&summary=" +
    encodeURIComponent(shareText);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(scanLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }, [scanLink]);

  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-xs text-gray-500 shrink-0">Share your results:</span>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 rounded-md px-3 py-1.5"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.254 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </a>
      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 rounded-md px-3 py-1.5"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        Share on LinkedIn
      </a>
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 rounded-md px-3 py-1.5"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}

export function ScanResults({ result }: { result: ScanResult }) {
  const passed = result.headers.filter((h) => h.grade === "A" || h.grade === "B").length;
  const failed = result.headers.filter((h) => h.grade === "F").length;

  return (
    <div className="space-y-6 mt-8">
      {/* Overall Grade */}
      <div className="flex items-center gap-6 p-6 bg-white/5 rounded-xl border border-white/10">
        <div
          className={`w-20 h-20 flex items-center justify-center text-4xl font-bold rounded-xl border-2 ${GRADE_COLORS[result.overallGrade]}`}
        >
          {result.overallGrade}
        </div>
        <div>
          <div className="text-2xl font-bold">{result.score}/100</div>
          <p className="text-sm text-gray-400 mt-1">
            {passed} passed, {failed} missing, {result.headers.length - passed - failed} partial
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Scanned {result.url} at {new Date(result.scannedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Header Cards */}
      <div className="space-y-3">
        {result.headers.map((header) => (
          <div
            key={header.name}
            className="p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded border ${GRADE_COLORS[header.grade]}`}
                >
                  {header.grade}
                </span>
                <span className="font-mono text-sm font-medium">{header.name}</span>
              </div>
              <span className={`text-xs font-medium ${SEVERITY_LABELS[header.severity].color}`}>
                {SEVERITY_LABELS[header.severity].label}
              </span>
            </div>

            {header.present && header.value && (
              <div className="mb-2">
                <code className="text-xs bg-black/40 px-2 py-1 rounded text-gray-300 break-all">
                  {header.value}
                </code>
              </div>
            )}

            <p className="text-xs text-gray-400 mb-1">{header.description}</p>

            {header.grade !== "A" && (
              <div className="flex items-start gap-1 mt-2">
                <p className="text-xs text-red-300 font-mono break-all flex-1">
                  {header.recommendation}
                </p>
                <CopyButton text={header.recommendation} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Share results */}
      <ShareResults result={result} />

      {/* Pro upsell — show when there are fixable issues */}
      {failed > 0 && (
        <div className="mt-6 p-5 bg-red-500/5 border border-red-500/20 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white mb-1">
                Get alerted when your headers regress
              </p>
              <p className="text-xs text-gray-400">
                HeaderGuard Pro monitors your site daily and notifies you via Slack or email
                if a header drops — plus CI/CD API, bulk scanning, and PDF export.
              </p>
            </div>
            <a
              href="/pricing"
              className="shrink-0 py-2 px-5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors text-center"
            >
              Try Pro — $9/mo
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
