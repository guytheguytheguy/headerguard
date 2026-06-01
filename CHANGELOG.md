# HeaderGuard Changelog

## 2026-06-01 — d0a713d, 9e09cf0
**Daily: social share buttons + Vercel deploy fix**
- `scan-results.tsx`: Added `ShareResults` component — X/Twitter, LinkedIn, and copy-link buttons appear after every scan; share text includes URL, grade, and score for social proof
- `next.config.ts`: Removed `outputFileTracingRoot` (caused path-doubling error on direct Vercel CLI deploy); project has own node_modules so monorepo root tracing was unnecessary
- Vercel deploy: READY (`dpl_AETkMb2VT3qCproA37kG3jsenoXw`) · TypeScript: PASS · Unit tests: 19/19 PASS

## 2026-05-31 — 5db7762
**Daily: checkout success banner**
- `checkout-success-banner.tsx`: New client component — shows green "You're now on HeaderGuard Pro!" flash when user returns from Stripe with `?checkout=success`; cleans query param via `window.history.replaceState` without page reload
- `page.tsx`: Renders `<CheckoutSuccessBanner />` above the hero
- Uses `useEffect` + `window.location` instead of `useSearchParams()` to avoid Next.js prerender incompatibility
- TypeScript: PASS · Build: PASS

## 2026-05-28 — 5c013fc
**Daily: Pro upsell banner + FAQ section with JSON-LD**
- `scan-results.tsx`: Added Pro upsell CTA after scan results when site has failing headers — "Get alerted when headers regress" → /pricing
- `page.tsx`: Added 5-question FAQ section with `schema.org/FAQPage` JSON-LD structured data for Google rich snippet eligibility
- TypeScript: PASS · Unit tests: 19/19 PASS

## 2026-05-20 — 4851abf
**feat: copy-to-clipboard button on scan recommendations**
- Added CopyButton component in scan-results.tsx — one-click copy for each header recommendation snippet

## 2026-05-20 — 1e172cc
**feat: OG/Twitter metadata and canonical URL**
- Added full Open Graph + Twitter Card metadata to layout.tsx
- Set canonical URL to headerguard.veridux.ai

## 2026-05-20 — d7d4e52
**daily: add Pro pricing CTA to homepage hero**
- Added "See Pro plans →" link in hero subtitle

## 2026-05-20 — 246a4cb
**add vitest unit tests for header-scan logic (score 87→88)**
- 19 unit tests covering scoring, grading, all 10 headers

## 2026-05-20 — 9c04be7
**URL validation hardening + SEO files + marketing assets**
- Hardened URL parsing (protocol detection, hostname dot check)
- Added robots.ts, sitemap.ts
- Added marketing/ and product-and-marketing/ assets

## Earlier
- Stripe checkout API + upgrade button
- Auth error handling and scan error fallback
- CSP and security headers in next.config.ts
- E2E tests (13 tests, scan-flow.spec.ts)
- Initial implementation: scan engine, A-F grading, 10 headers
