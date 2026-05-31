import { ScanForm } from "@/components/scan-form";
import { CheckoutSuccessBanner } from "@/components/checkout-success-banner";

const FAQ = [
  {
    q: "What security headers does HeaderGuard check?",
    a: "We check 10 critical HTTP security headers: Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-XSS-Protection, Cross-Origin-Embedder-Policy, Cross-Origin-Opener-Policy, and Cross-Origin-Resource-Policy.",
  },
  {
    q: "How is the A–F grade calculated?",
    a: "Each header is weighted by its security impact. Critical headers like HSTS and CSP carry more weight. Missing a critical header gives an F; a misconfigured one may give a C or D. The overall grade is a weighted average of all header grades.",
  },
  {
    q: "Does scanning my site affect its performance or availability?",
    a: "No. HeaderGuard sends a single HEAD request to fetch HTTP response headers. No page content is downloaded, no forms are submitted, and no data from your site is stored.",
  },
  {
    q: "What is included in HeaderGuard Pro?",
    a: "Pro ($9/mo) adds unlimited scans, daily automated monitoring with Slack and email alerts, CI/CD API integration, bulk sitemap scanning, 90-day header history, and PDF/JSON report export.",
  },
  {
    q: "Do I need an account to scan?",
    a: "No. Free scans (up to 3 per day) require no signup. Create an account to unlock Pro monitoring features.",
  },
];

export default function HomePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <CheckoutSuccessBanner />

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

      {/* FAQ */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold mb-8 text-center">Frequently asked questions</h2>
        <div className="space-y-4">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-medium text-white mb-2">{q}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
