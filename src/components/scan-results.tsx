"use client";

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
              <p className="text-xs text-red-300 mt-2">
                {header.recommendation}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
