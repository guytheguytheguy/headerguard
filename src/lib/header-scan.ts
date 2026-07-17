import { assertPublicHostname, SsrfBlockedError } from "./ssrf-guard";

export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type Grade = "A" | "B" | "C" | "D" | "F";

export interface FixSnippets {
  nextjs: string;
  express: string;
  nginx: string;
  apache: string;
  cloudflare: string;
}

export interface HeaderCheck {
  name: string;
  present: boolean;
  value: string | null;
  severity: Severity;
  grade: Grade;
  description: string;
  recommendation: string;
  fixSnippets: FixSnippets;
}

export interface ScanResult {
  url: string;
  scannedAt: string;
  overallGrade: Grade;
  score: number;
  headers: HeaderCheck[];
  rawHeaders: Record<string, string>;
}

const SECURITY_HEADERS: {
  name: string;
  key: string;
  weight: number;
  severity: Severity;
  description: string;
  recommendation: string;
  fixSnippets: FixSnippets;
  validate: (value: string | null) => { grade: Grade; note?: string };
}[] = [
  {
    name: "Strict-Transport-Security",
    key: "strict-transport-security",
    weight: 15,
    severity: "critical",
    description: "Enforces HTTPS connections to prevent protocol downgrade attacks and cookie hijacking.",
    recommendation: "Add: Strict-Transport-Security: max-age=63072000; includeSubDomains; preload",
    fixSnippets: {
      nextjs: `// next.config.ts — headers()
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload',
}`,
      express: `// Express — npm install helmet
const helmet = require('helmet');
app.use(helmet.hsts({
  maxAge: 63072000,
  includeSubDomains: true,
  preload: true,
}));`,
      nginx: `# nginx.conf
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;`,
      apache: `# .htaccess
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"`,
      cloudflare: `// Cloudflare Worker
response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');`,
    },
    validate: (v) => {
      if (!v) return { grade: "F" };
      const maxAge = parseInt(v.match(/max-age=(\d+)/)?.[1] || "0");
      if (maxAge >= 31536000 && v.includes("includeSubDomains")) return { grade: "A" };
      if (maxAge >= 31536000) return { grade: "B" };
      if (maxAge >= 86400) return { grade: "C" };
      return { grade: "D" };
    },
  },
  {
    name: "Content-Security-Policy",
    key: "content-security-policy",
    weight: 15,
    severity: "critical",
    description: "Prevents XSS, clickjacking, and code injection by whitelisting trusted content sources.",
    recommendation: "Add a strict CSP. Start with: Content-Security-Policy: default-src 'self'; script-src 'self'",
    fixSnippets: {
      nextjs: `// next.config.ts — headers()
{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';",
}`,
      express: `// Express — npm install helmet
const helmet = require('helmet');
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'"],
    connectSrc: ["'self'"],
    frameAncestors: ["'none'"],
  },
}));`,
      nginx: `# nginx.conf
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';" always;`,
      apache: `# .htaccess
Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';"`,
      cloudflare: `// Cloudflare Worker
response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-ancestors 'none';");`,
    },
    validate: (v) => {
      if (!v) return { grade: "F" };
      if (v.includes("default-src") && !v.includes("'unsafe-inline'") && !v.includes("'unsafe-eval'")) return { grade: "A" };
      if (v.includes("default-src")) return { grade: "B" };
      return { grade: "C" };
    },
  },
  {
    name: "X-Content-Type-Options",
    key: "x-content-type-options",
    weight: 10,
    severity: "high",
    description: "Prevents MIME-type sniffing which can lead to XSS attacks.",
    recommendation: "Add: X-Content-Type-Options: nosniff",
    fixSnippets: {
      nextjs: `// next.config.ts — headers()
{
  key: 'X-Content-Type-Options',
  value: 'nosniff',
}`,
      express: `// Express — npm install helmet
const helmet = require('helmet');
app.use(helmet.noSniff());`,
      nginx: `# nginx.conf
add_header X-Content-Type-Options "nosniff" always;`,
      apache: `# .htaccess
Header always set X-Content-Type-Options "nosniff"`,
      cloudflare: `// Cloudflare Worker
response.headers.set('X-Content-Type-Options', 'nosniff');`,
    },
    validate: (v) => {
      if (!v) return { grade: "F" };
      return v.toLowerCase() === "nosniff" ? { grade: "A" } : { grade: "D" };
    },
  },
  {
    name: "X-Frame-Options",
    key: "x-frame-options",
    weight: 10,
    severity: "high",
    description: "Prevents clickjacking by controlling whether the page can be embedded in iframes.",
    recommendation: "Add: X-Frame-Options: DENY (or SAMEORIGIN if iframes are needed)",
    fixSnippets: {
      nextjs: `// next.config.ts — headers()
{
  key: 'X-Frame-Options',
  value: 'DENY',
}`,
      express: `// Express — npm install helmet
const helmet = require('helmet');
app.use(helmet.frameguard({ action: 'deny' }));`,
      nginx: `# nginx.conf
add_header X-Frame-Options "DENY" always;`,
      apache: `# .htaccess
Header always set X-Frame-Options "DENY"`,
      cloudflare: `// Cloudflare Worker
response.headers.set('X-Frame-Options', 'DENY');`,
    },
    validate: (v) => {
      if (!v) return { grade: "F" };
      const val = v.toUpperCase();
      if (val === "DENY") return { grade: "A" };
      if (val === "SAMEORIGIN") return { grade: "B" };
      return { grade: "D" };
    },
  },
  {
    name: "Referrer-Policy",
    key: "referrer-policy",
    weight: 10,
    severity: "medium",
    description: "Controls how much referrer information is sent with requests to protect user privacy.",
    recommendation: "Add: Referrer-Policy: strict-origin-when-cross-origin",
    fixSnippets: {
      nextjs: `// next.config.ts — headers()
{
  key: 'Referrer-Policy',
  value: 'strict-origin-when-cross-origin',
}`,
      express: `// Express — npm install helmet
const helmet = require('helmet');
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));`,
      nginx: `# nginx.conf
add_header Referrer-Policy "strict-origin-when-cross-origin" always;`,
      apache: `# .htaccess
Header always set Referrer-Policy "strict-origin-when-cross-origin"`,
      cloudflare: `// Cloudflare Worker
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');`,
    },
    validate: (v) => {
      if (!v) return { grade: "F" };
      const strict = ["no-referrer", "strict-origin", "strict-origin-when-cross-origin"];
      if (strict.includes(v.toLowerCase())) return { grade: "A" };
      if (v.toLowerCase() === "origin") return { grade: "B" };
      return { grade: "C" };
    },
  },
  {
    name: "Permissions-Policy",
    key: "permissions-policy",
    weight: 10,
    severity: "medium",
    description: "Controls which browser features and APIs can be used (camera, microphone, geolocation, etc.).",
    recommendation: "Add: Permissions-Policy: camera=(), microphone=(), geolocation=()",
    fixSnippets: {
      nextjs: `// next.config.ts — headers()
{
  key: 'Permissions-Policy',
  value: 'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=()',
}`,
      express: `// Express
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=()'
  );
  next();
});`,
      nginx: `# nginx.conf
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=()" always;`,
      apache: `# .htaccess
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=()"`,
      cloudflare: `// Cloudflare Worker
response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=()');`,
    },
    validate: (v) => {
      if (!v) return { grade: "F" };
      const restrictions = v.split(",").length;
      if (restrictions >= 5) return { grade: "A" };
      if (restrictions >= 3) return { grade: "B" };
      return { grade: "C" };
    },
  },
  {
    name: "X-XSS-Protection",
    key: "x-xss-protection",
    weight: 5,
    severity: "low",
    description: "Legacy XSS filter. Modern browsers use CSP instead, but still useful for older browsers.",
    recommendation: "Add: X-XSS-Protection: 0 (disable legacy filter, rely on CSP instead)",
    fixSnippets: {
      nextjs: `// next.config.ts — headers()
{
  key: 'X-XSS-Protection',
  value: '0',
}`,
      express: `// Express — npm install helmet
const helmet = require('helmet');
app.use(helmet.xssFilter()); // Sets X-XSS-Protection: 0 (disabled in favour of CSP)`,
      nginx: `# nginx.conf
add_header X-XSS-Protection "0" always;`,
      apache: `# .htaccess
Header always set X-XSS-Protection "0"`,
      cloudflare: `// Cloudflare Worker
response.headers.set('X-XSS-Protection', '0');`,
    },
    validate: (v) => {
      if (!v) return { grade: "D" };
      if (v === "0") return { grade: "A", note: "Correctly disabled in favor of CSP" };
      if (v.includes("mode=block")) return { grade: "B" };
      return { grade: "C" };
    },
  },
  {
    name: "Cross-Origin-Opener-Policy",
    key: "cross-origin-opener-policy",
    weight: 8,
    severity: "medium",
    description: "Isolates the browsing context to prevent Spectre-like side-channel attacks.",
    recommendation: "Add: Cross-Origin-Opener-Policy: same-origin",
    fixSnippets: {
      nextjs: `// next.config.ts — headers()
{
  key: 'Cross-Origin-Opener-Policy',
  value: 'same-origin',
}`,
      express: `// Express — npm install helmet
const helmet = require('helmet');
app.use(helmet.crossOriginOpenerPolicy({ policy: 'same-origin' }));`,
      nginx: `# nginx.conf
add_header Cross-Origin-Opener-Policy "same-origin" always;`,
      apache: `# .htaccess
Header always set Cross-Origin-Opener-Policy "same-origin"`,
      cloudflare: `// Cloudflare Worker
response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');`,
    },
    validate: (v) => {
      if (!v) return { grade: "F" };
      if (v.toLowerCase() === "same-origin") return { grade: "A" };
      if (v.toLowerCase() === "same-origin-allow-popups") return { grade: "B" };
      return { grade: "C" };
    },
  },
  {
    name: "Cross-Origin-Resource-Policy",
    key: "cross-origin-resource-policy",
    weight: 8,
    severity: "medium",
    description: "Prevents other origins from loading your resources, blocking data leaks.",
    recommendation: "Add: Cross-Origin-Resource-Policy: same-origin",
    fixSnippets: {
      nextjs: `// next.config.ts — headers()
{
  key: 'Cross-Origin-Resource-Policy',
  value: 'same-origin',
}`,
      express: `// Express — npm install helmet
const helmet = require('helmet');
app.use(helmet.crossOriginResourcePolicy({ policy: 'same-origin' }));`,
      nginx: `# nginx.conf
add_header Cross-Origin-Resource-Policy "same-origin" always;`,
      apache: `# .htaccess
Header always set Cross-Origin-Resource-Policy "same-origin"`,
      cloudflare: `// Cloudflare Worker
response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');`,
    },
    validate: (v) => {
      if (!v) return { grade: "F" };
      if (v.toLowerCase() === "same-origin") return { grade: "A" };
      if (v.toLowerCase() === "same-site") return { grade: "B" };
      return { grade: "C" };
    },
  },
  {
    name: "Cross-Origin-Embedder-Policy",
    key: "cross-origin-embedder-policy",
    weight: 9,
    severity: "medium",
    description: "Ensures all sub-resources are loaded with proper CORS or CORP headers for cross-origin isolation.",
    recommendation: "Add: Cross-Origin-Embedder-Policy: require-corp",
    fixSnippets: {
      nextjs: `// next.config.ts — headers()
{
  key: 'Cross-Origin-Embedder-Policy',
  value: 'require-corp',
}`,
      express: `// Express — npm install helmet
const helmet = require('helmet');
app.use(helmet.crossOriginEmbedderPolicy({ policy: 'require-corp' }));`,
      nginx: `# nginx.conf
add_header Cross-Origin-Embedder-Policy "require-corp" always;`,
      apache: `# .htaccess
Header always set Cross-Origin-Embedder-Policy "require-corp"`,
      cloudflare: `// Cloudflare Worker
response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');`,
    },
    validate: (v) => {
      if (!v) return { grade: "F" };
      if (v.toLowerCase() === "require-corp") return { grade: "A" };
      if (v.toLowerCase() === "credentialless") return { grade: "B" };
      return { grade: "C" };
    },
  },
];

const GRADE_SCORES: Record<Grade, number> = { A: 100, B: 75, C: 50, D: 25, F: 0 };

function calculateOverallGrade(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  if (score >= 30) return "D";
  return "F";
}

const MAX_REDIRECTS = 5;

/**
 * Fetches `url` with SSRF protection: the hostname is resolved and checked
 * against private/reserved IP ranges before the request, and again before
 * every redirect hop is followed (redirects are handled manually rather than
 * via `redirect: "follow"` so a public URL can't 302 into an internal
 * address or a cloud metadata endpoint).
 */
async function fetchWithGuard(startUrl: string, signal: AbortSignal): Promise<Response> {
  let currentUrl = startUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const target = new URL(currentUrl);
    await assertPublicHostname(target.hostname);

    const response = await fetch(target.toString(), {
      method: "HEAD",
      signal,
      redirect: "manual",
      headers: { "User-Agent": "HeaderGuard/1.0 (Security Scanner)" },
    });

    const isRedirect = response.status >= 300 && response.status < 400;
    const location = response.headers.get("location");
    if (!isRedirect || !location) {
      return response;
    }
    if (hop === MAX_REDIRECTS) {
      throw new Error(`Too many redirects while scanning ${startUrl}`);
    }
    currentUrl = new URL(location, target).toString();
  }

  throw new Error(`Too many redirects while scanning ${startUrl}`);
}

export async function scanUrl(url: string): Promise<ScanResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let response: Response;
  try {
    response = await fetchWithGuard(url, controller.signal);
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`Timeout: ${url} did not respond within 10 seconds`);
    }
    if (err instanceof SsrfBlockedError) {
      throw err;
    }
    throw new Error(`Failed to reach ${url}: ${err instanceof Error ? err.message : "Network error"}`);
  } finally {
    clearTimeout(timeout);
  }

  const rawHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    rawHeaders[key] = value;
  });

  let totalWeight = 0;
  let weightedScore = 0;

  const headers: HeaderCheck[] = SECURITY_HEADERS.map((def) => {
    const value = response.headers.get(def.key);
    const { grade } = def.validate(value);
    totalWeight += def.weight;
    weightedScore += (GRADE_SCORES[grade] / 100) * def.weight;

    return {
      name: def.name,
      present: value !== null,
      value,
      severity: def.severity,
      grade,
      description: def.description,
      recommendation: def.recommendation,
      fixSnippets: def.fixSnippets,
    };
  });

  const score = Math.round((weightedScore / totalWeight) * 100);

  return {
    url,
    scannedAt: new Date().toISOString(),
    overallGrade: calculateOverallGrade(score),
    score,
    headers,
    rawHeaders,
  };
}
