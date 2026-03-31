# HeaderGuard

> HTTP security headers analyzer and monitoring tool.

**Live:** https://headerguard.veridux.ai

Scan any website for HTTP security headers. Get an A–F grade, detailed analysis per header, and copy-paste fix code for your framework. Free tier (3 scans/day) and Pro tier ($9/mo, unlimited scans + monitoring).

---

## Features

- **10 security headers checked:** HSTS, CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-XSS-Protection, COEP, COOP, CORP
- **A–F grading** with weighted scoring per header severity
- **Framework fix code:** Next.js, Express, Nginx, Apache, Cloudflare Workers
- **Freemium:** 3 free scans/day — no sign-up required
- **Pro tier:** Unlimited scans, daily monitoring, Slack/email alerts, CI/CD API, bulk sitemap scanning, 90-day trends, PDF/JSON export

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Language:** TypeScript 5 (strict)
- **Auth:** Supabase (magic link + GitHub OAuth)
- **Payments:** Stripe (subscriptions, webhooks, billing portal)
- **Styling:** Tailwind CSS 4
- **Testing:** Playwright (E2E, 13 tests)
- **CI/CD:** GitHub Actions → Vercel

## Project Structure

```
src/
  app/
    page.tsx            # Home – scan form
    pricing/            # Pricing page
    auth/login/         # Magic link + OAuth login
    api/
      scan/             # POST /api/scan – core scanner
      auth/callback/    # Supabase OAuth callback
      webhooks/stripe/  # Stripe subscription events
  components/
    scan-form.tsx       # URL input + submit
    scan-results.tsx    # Grade display + header breakdown
  lib/
    header-scan.ts      # Core scanning engine (10 headers, weighted scoring)
    supabase.ts         # Supabase client (anon + service role)
    stripe.ts           # Stripe client
    plans.ts            # Free/Pro plan definitions
tests/
  e2e/
    scan-flow.spec.ts   # 13 Playwright E2E tests
```

## Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_PRO_PRICE_ID

# Start dev server
npm run dev
# → http://localhost:3000
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_live_...`) |
| `STRIPE_PRO_PRICE_ID` | Stripe Price ID for Pro plan |
| `NEXT_PUBLIC_APP_URL` | App base URL (e.g. `https://headerguard.veridux.ai`) |

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type check
npm run test:e2e     # Playwright E2E tests
```

## API

### `POST /api/scan`

Scan a URL for security headers.

**Request:**
```json
{ "url": "https://example.com" }
```

**Response:**
```json
{
  "url": "https://example.com",
  "scannedAt": "2026-03-31T04:00:00.000Z",
  "overallGrade": "C",
  "score": 55,
  "headers": [
    {
      "name": "Strict-Transport-Security",
      "present": true,
      "value": "max-age=86400",
      "severity": "critical",
      "grade": "C",
      "description": "...",
      "recommendation": "..."
    }
  ],
  "rawHeaders": {}
}
```

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):
1. Type check (`tsc --noEmit`)
2. Lint (`eslint`)
3. Build (`next build`)
4. E2E tests (`playwright test`)

Automatic deploys to Vercel on push to `main`.

## Deployment

Deployed on Vercel at https://headerguard.veridux.ai. Environment variables are set in the Vercel dashboard.

## License

Private — © Veridux Labs
