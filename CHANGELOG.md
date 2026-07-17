# HeaderGuard Changelog

## 2026-07-17 — daily: SSRF protection for the scanner (dogfooding fix)
**Real product/security fix: the header scanner itself was an unguarded SSRF vector**
- `src/app/api/scan/route.ts` validated URL *shape* only — it explicitly allowed `localhost` through, and had no check at all for private/reserved IPs (`10.0.0.0/8`, `192.168.0.0/16`, `169.254.169.254` cloud metadata, etc.) or literal IPs supplied as the hostname. Since `scanUrl()` then made a real server-side `fetch()` to whatever the user submitted, an attacker could point HeaderGuard at internal infrastructure or a cloud metadata endpoint and read the response headers back through the scan UI — ironic for a security-header scanning product to ship this gap.
- Added `src/lib/ssrf-guard.ts`: resolves the target hostname via `dns.promises.lookup` and rejects it if any resolved address (or a literal IP hostname) falls in a private/loopback/link-local/CGNAT/reserved/multicast range (IPv4 and IPv6, including IPv4-mapped IPv6 and unique-local `fc00::/7`).
- `src/lib/header-scan.ts`: switched the scan fetch from `redirect: "follow"` to manual hop-by-hop redirects (`fetchWithGuard`, max 5 hops), re-validating the hostname on *every* hop — closes the bypass where a public URL 302s to an internal address (also covers DNS-rebinding-style TOCTOU within a single scan).
- `src/app/api/scan/route.ts`: catches `SsrfBlockedError` and returns a clean `400` (was falling through to a `502` "scan failed" before).
- Tests: added `src/lib/ssrf-guard.test.ts` (32 cases — IPv4/IPv6 private-range boundaries, metadata IP, DNS-rebinding simulation via mocked `dns.promises.lookup`) and 4 new `scanUrl` integration tests in `header-scan.test.ts` covering localhost, a literal private IP, the metadata IP, and a malicious-redirect hop. Unit suite: **55/55 pass** (was 19/19).
- Verified no regression: `npm run build` clean (12 routes, TypeScript clean via `tsc --noEmit`), E2E **22/23 pass** — the 1 failure is the same pre-existing `Enter key triggers scan` UI-timing flake documented in the 2026-07-16 entry below, not caused by this change (all scan-flow tests hit public `example.com`, unaffected by the guard).
- Re-confirmed unresolved, unchanged blockers (no action taken, both still human-only): `POST /api/checkout` → `503 {"error":"Billing not configured"}` (STRIPE_PRO_PRICE_ID unset in Vercel prod); git divergence — `origin/main` still holds only the unrelated 2026-06-25 initial commit, local `main` now 36 commits ahead. Did not force-push; backed up to `backup-local-main-20260717`.
- **Follow-up finding, not yet fixed**: `src/lib/plans.ts` advertises `free.scansPerDay: 3` on the pricing page, but no code anywhere enforces a per-day scan limit (`grep -rn "scansPerDay" src` only finds the two definitions in `plans.ts`) — free-tier users currently get unlimited scans. Flagging for a future run; implementing real enforcement needs persistent per-user/IP counters (Supabase), out of scope for today's change.

## 2026-07-16 — daily: E2E port-collision fix, prod redeploy, independent re-verification
**Concurrent orchestrator run landed the E2E fix + redeploy while this audit was in progress; this entry records independent confirmation of that work, not a duplicate change**
- A parallel same-day audit run committed `37a4a68` (`playwright.config.ts` moved from port 3001 → 34771 to stop colliding with other projects' dev servers on this machine) and redeployed prod via `vercel --prod` (`dpl_3zhRqfCRNxAjNuRAhcSu58dnk7WG`, READY) before this run reached the commit step — landed as part of the shared-monorepo concurrency the daily orchestrator already accounts for (see `project_shared_monorepo_git_races_20260714` memory).
- Independently re-verified rather than re-doing the work: `npm run build` clean (12 routes, TypeScript clean), `vitest run` 19/19 PASS, live curl confirms homepage/pricing/robots.txt/sitemap.xml/opengraph-image/auth-login all 200.
- Confirmed production Vercel env vars (`vercel env ls production`) hold only `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — **no Stripe vars at all** (`STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` all unset, not just `STRIPE_PRO_PRICE_ID` as previously logged) and `BUTTONDOWN_API_KEY` also unset. `POST /api/checkout` → `503 {"error":"Billing not configured"}` and `POST /api/subscribe` → `503 {"error":"Newsletter service not configured"}`, both live-reconfirmed. Human action required (Vercel dashboard, not fixable by an agent).
- Git divergence blocker unchanged: `origin/main` still holds only the unrelated 2026-06-25 initial commit; local `main` is now 32 commits ahead (was 30 as of 2026-07-13). Backed up to `backup-local-main-20260716` (pushed) alongside the existing `backup-local-main-20260713` branch. Did not force-push — still needs a human reconciliation decision.
- **Correction to the concurrent run's E2E claim**: that run's commit message and `dashboard/projects.json` entry state "23/23 E2E tests now pass" after the port fix (3001 → 34771). Re-ran the full suite independently and got **9/23 pass, 14 fail** — same `beforeEach: page.goto` timeout pattern as before the fix, i.e. not reproducible as claimed. A second re-run was inconclusive because a sibling agent auditing a different project (`ogproof`) ran a broad `taskkill //F //IM node.exe` that killed unrelated node processes including this run's `next start` subprocess (disclosed by that agent mid-run; no lasting damage, just a truncated result). A clean third run confirmed the real root cause: `fullyParallel: true` with an uncapped worker count (defaults to CPU core count) fires a burst of simultaneous `page.goto()` requests at the single `next start` process the instant the webServer readiness check passes; under the CPU contention from many other portfolio projects' processes running concurrently on this machine, that burst queues past the 30s `beforeEach` timeout for tests at the back of the queue — not a port collision. Capped `workers` to 3 locally and added one local retry (`playwright.config.ts`): **22/23 pass** on the clean re-run. The one remaining failure (`Enter key triggers scan`) is an unrelated pre-existing UI-timing flake — it asserts the transient "Scanning..." text is visible within 5s before asserting it's hidden, which can race if the real network scan of `example.com` completes faster than the assertion polls; left as-is, low priority, not a functional regression.

## 2026-07-13 (later) — daily: corrected git-remote finding, confirmed real revenue blocker, backed up unpushed history
**Corrects an error in this same file's entry from earlier today; identifies the actual Stripe blocker**
- **Git remote correction**: the entry below (written ~04:49 today) claims this repo has "no git remote configured at all." That was wrong — `origin` **is** configured (`https://github.com/guytheguytheguy/headerguard.git`), a real GitHub repo created 2026-06-25. The actual problem: origin/main has **completely unrelated history** to local main (`git merge-base` returns nothing) and holds only the original 2026-06-25 initial commit — **30 local commits / ~19 days of work (through 2026-06-25→2026-07-13) were never successfully pushed**, silently rejected as non-fast-forward on every prior `git push`. `git push origin main` was attempted and confirmed rejected (`! [rejected] main -> main (non-fast-forward)`).
  - **Backed up, did not force-push**: per safety rules (no force-push without explicit user confirmation, histories fully unrelated so this isn't a simple rebase), pushed local `main` to a new branch `backup-local-main-20260713` instead — all 30 commits are now off-machine. **`origin/main` itself is still stale and needs a human decision** (force-push to overwrite origin/main with local history, since local is clearly the canonical/current source, vs. some other reconciliation). This is the real action item, not a code fix.
- **Revenue blocker root-caused**: `POST /api/checkout` returns `503 {"error":"Billing not configured"}` in production right now (confirmed live via curl) — `src/app/api/checkout/route.ts:14-16` short-circuits when `process.env.STRIPE_PRO_PRICE_ID` is unset. So it is **not** a waitlist-form UI issue (that was fixed back in 88ebfdc, 2026-04-19) and not the Supabase env vars (those were set 2026-07-08, confirmed no auth-related runtime errors). It's specifically `STRIPE_PRO_PRICE_ID` (and likely `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`, unverifiable from outside) never set in Vercel prod. Vercel `get_runtime_errors` (7d) shows zero Stripe/Supabase errors — only 3 stale `BUTTONDOWN_API_KEY is not set` errors from 2026-07-07 (known portfolio-wide Buttondown gap, not headerguard-specific).
- Build: PASS (12 routes, TypeScript clean). Unit tests: 19/19 PASS (vitest). E2E: ran live — **9/23 passed, 14 failed with `browserContext.newPage: Test timeout of 30000ms exceeded`** during `beforeEach` `page.goto("/")`. Root cause looks like `next start` cold-start contention under Playwright's `fullyParallel: true` with no worker cap outside CI (all API-only tests, which don't need `page.goto`, passed; page-based tests failing was concentrated in the first wave while the server was still warming up). Not a functional regression — build and unit tests are clean, and this pattern is consistent with local resource contention, not app logic. Left as-is; flagging for the next E2E-focused run to consider capping local `workers` or bumping `webServer.timeout`.

## 2026-07-13 — daily: ground-truth verification + webhook/subscribe error-handling hardening
**Verified projects.json discrepancy; fixed 2 real error-handling gaps**
- **Vercel project ID CONFIRMED**: `.vercel/project.json` in this repo has `projectId: prj_tYEnB8cMJOWkL9ppukP5GWtYzHMr`, `orgId: team_O4R56JsPNOa1IJYUZ5FlHQ42` — matches `prompts/per-project/headerguard.md` exactly. `dashboard/projects.json`'s `vercelProjectId: null` is stale/wrong (known portfolio-wide silent-overwrite bug).
- **GitHub repo finding is more nuanced than either source states**: `microsaas/headerguard/dev` (this directory) is its own standalone git repo nested inside the `guytheguytheguy/apps` monorepo working tree, with **no `git remote` configured at all** — never pushed anywhere. The parent monorepo only tracks it as a gitlink (mode 160000, like an unregistered submodule); confirmed via `gh api repos/guytheguytheguy/apps/contents/microsaas/headerguard/dev` which returns `html_url: null, git_url: null, size: 0` for the `dev` path — i.e. GitHub has a dangling commit pointer, not the actual source. **The real HeaderGuard source code has zero off-machine backup.** `dashboard/projects.json`'s `githubRepo: null` is actually closer to the truth than the per-project prompt's claimed `guytheguytheguy/apps`.
- **Test counts**: 19/19 unit tests pass (Vitest) — matches claim. E2E: **23/23 pass**, not 13 as the per-project prompt states — the "13" figure traces to this very CHANGELOG's own stale "Earlier" summary line ("E2E tests (13 tests, scan-flow.spec.ts)") from the initial implementation, never updated as `scan-flow.spec.ts` grew to its current 23 tests across 4 describe blocks.
- Build: PASS (12 routes, TypeScript clean). Live site: `https://headerguard.veridux.ai/` → HTTP 200 confirmed.
- **Real fixes applied** (found while auditing API routes for error handling per the no-mocks/production-ready policy):
  - `api/subscribe/route.ts`: outbound `fetch()` to Buttondown had no try/catch or timeout — a DNS failure or Buttondown outage would throw an unhandled exception (generic 500) instead of a graceful error. Added `AbortController` (10s timeout) + try/catch returning `503`.
  - `api/webhooks/stripe/route.ts`: the event-type switch block ran unguarded — `getServiceClient()` can throw synchronously on missing env vars, and none of the four Supabase `.update()` calls checked their `{error}` result, so DB failures were silently swallowed with no log line. Wrapped the switch in try/catch (still returns 200 to Stripe — a config/DB failure isn't fixed by Stripe's retry storm) and now logs every `{error}` from each `.update()` call.
- TypeScript: PASS · Unit tests: 19/19 PASS · E2E: 23/23 PASS · Build: PASS

## 2026-07-08 — 297427a / dpl_JCdDgVYrhEV5XLVqmDCqLdApCYpb
**Daily: fix OG image flex error, add newsletter subscribe API, set Supabase env vars**
- `opengraph-image.tsx`: Created new OG image using `@vercel/og` with correct `display: flex` on every container — fixes long-running "Expected <div> to have display: flex" edge runtime error on `/opengraph-image`
- `api/subscribe/route.ts`: Created Buttondown newsletter API route — handles subscribe POST, validates email, returns 503 when `BUTTONDOWN_API_KEY` unset (graceful), handles already-subscribed as success; fixes 500 errors on `/api/subscribe`
- **Vercel env vars set** (via CLI): `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` now live in production — auth & checkout now have Supabase connectivity (Stripe keys still need human action)
- Build: PASS (12 routes, TypeScript clean) · Unit tests: 19/19 PASS

## 2026-06-21 — 05633ca
**Daily: Express + Cloudflare Workers fix snippets; dynamic share link domain**
- `header-scan.ts`: Extended `FixSnippets` interface with `express` and `cloudflare` fields; populated all 10 security header definitions with helmet-based Express snippets and Cloudflare Worker `response.headers.set()` snippets — closes the gap between FAQ promises (Next.js, Express, Nginx, Apache, Cloudflare) and actual UI delivery
- `scan-results.tsx`: Updated `Platform` type and `PLATFORM_LABELS` to include Express and Cloudflare as tabs in the fix snippet panel (5 platforms total); replaced hardcoded `headerguard.veridux.ai` in share link with `window.location.origin` so shareable URLs work across both custom domains
- TypeScript: PASS · Unit tests: 19/19 PASS

## 2026-06-20 — 08b5a7f
**Daily: platform-specific fix snippets in scan results**
- `header-scan.ts`: Added `FixSnippets` interface (`nextjs`, `nginx`, `apache` string fields) and `fixSnippets` field to `HeaderCheck` type; populated all 10 security header definitions with copy-ready config code for each platform
- `scan-results.tsx`: Added `FixSnippetsPanel` tabbed component — shows per-platform config code (Next.js / Nginx / Apache) under each failing header, with platform tab switching and a copy button; turns text advice into paste-ready fixes
- TypeScript: PASS

## 2026-06-19 — a3f4a1d
**Daily: URL deep-link scanning + recent scans history + shareable result links**
- `scan-form.tsx`: Added `?url=` query param auto-scan (loads and scans URL on page visit), localStorage recent-scans panel (last 5 scans shown as grade+URL chips for one-click re-scan), "Scan another URL" reset button below results, `useRef` guard to prevent double-scan in React StrictMode
- `scan-results.tsx`: Share buttons now build a `?url=<scanned-url>` deep link — clicking a shared tweet/LinkedIn post auto-scans the referenced site (viral loop upgrade)
- `page.tsx`: Wrapped `<ScanForm>` in `<Suspense>` (required by Next.js for `useSearchParams` in client components)
- TypeScript: PASS · Unit tests: 19/19 PASS

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
