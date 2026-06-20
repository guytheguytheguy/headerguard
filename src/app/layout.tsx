import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "HeaderGuard - Security Header Scanner",
  description: "Scan any website for security headers. Get A-F grades, detailed analysis, and framework-specific fix code. Free security header audit.",
  keywords: ["security headers", "http headers", "security scanner", "HSTS", "CSP", "X-Frame-Options", "web security"],
  metadataBase: new URL("https://headerguard.veridux.ai"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "HeaderGuard - Security Header Scanner",
    description: "Scan any website for security headers. Get A-F grades, detailed analysis, and framework-specific fix code. Free security header audit.",
    url: "https://headerguard.veridux.ai",
    siteName: "HeaderGuard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HeaderGuard - Security Header Scanner",
    description: "Scan any website for security headers. Get A-F grades, detailed analysis, and framework-specific fix code. Free security header audit.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <nav className="border-b border-white/10 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">
              <span className="text-red-400">Header</span>Guard
            </Link>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
