import { ScanForm } from "@/components/scan-form";

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Scan your site for <span className="text-red-400">security headers</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Check if your website has the right HTTP security headers.
          Get an A-F grade, detailed analysis, and copy-paste fix code for your framework.
          Free for one-off scans.{" "}
          <a href="/pricing" className="text-red-400 hover:text-red-300 underline underline-offset-2">
            See Pro plans &rarr;
          </a>
        </p>
      </div>

      <ScanForm />

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 rounded-lg p-6">
          <h3 className="font-medium text-red-400 mb-2">10 Headers Checked</h3>
          <p className="text-sm text-gray-400">
            HSTS, CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy,
            Permissions-Policy, and more critical security headers.
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-6">
          <h3 className="font-medium text-red-400 mb-2">Framework Fix Code</h3>
          <p className="text-sm text-gray-400">
            Get copy-paste remediation code for Next.js, Express, Nginx,
            Apache, and Cloudflare Workers.
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-6">
          <h3 className="font-medium text-red-400 mb-2">Instant Results</h3>
          <p className="text-sm text-gray-400">
            No signup required for basic scans. Enter a URL, get your grade
            in seconds with actionable recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
