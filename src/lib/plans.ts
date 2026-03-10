export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    scansPerDay: 3,
    features: [
      "3 scans per day",
      "10 security headers checked",
      "A-F grading with breakdown",
      "Basic remediation snippets",
    ],
  },
  pro: {
    name: "Pro",
    price: 9,
    scansPerDay: Infinity,
    features: [
      "Unlimited scans",
      "10 security headers checked",
      "Framework-specific fix code (Next.js, Express, Nginx, Apache, Cloudflare)",
      "Daily monitoring with Slack & email alerts",
      "CI/CD API integration",
      "Bulk sitemap scanning",
      "90-day historical trends",
      "Export reports (PDF/JSON)",
    ],
  },
} as const;
