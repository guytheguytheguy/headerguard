import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HeaderGuard — Grade Your HTTP Security Headers Instantly",
  description:
    "Free HTTP security header scanner. Enter a URL and get an A-F grade for HSTS, CSP, X-Frame-Options, and more in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#09090b] text-zinc-50 antialiased`}
      >
        {children}
        <Script
          src="https://veridux-analytics.vercel.app/v1/agent.js"
          data-site="vdx_headerguard_01"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
