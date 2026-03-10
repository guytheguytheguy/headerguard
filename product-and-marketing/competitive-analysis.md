# HeaderGuard — Competitive Analysis
Generated: 2026-03-10

---

## Market Overview

The security header scanning market is served by free tools (SecurityHeaders.com, Mozilla Observatory), general vulnerability scanners with header checks (Snyk, Detectify, Probely), and developer security platforms (OWASP ZAP, Burp Suite). No existing product combines specialized header-only focus, framework-specific fix code, monitoring, and indie-developer pricing.

---

## Competitor Profiles

### 1. SecurityHeaders.com
**Type:** Free web tool
**URL:** securityheaders.com
**Pricing:** Free
**Market Position:** Most widely referenced header scanner among developers

**Strengths:**
- Extremely well-known — used by millions of developers
- Instant scan with grade (A+ to F)
- Per-header breakdown with explanation
- No account required

**Weaknesses:**
- No framework-specific fix code — tells you what's wrong, not how to fix it
- No monitoring or alerting capabilities
- No API for programmatic access
- No scan history
- UI has not significantly improved in years

**HeaderGuard Advantage:** Fix code generation + monitoring + API

---

### 2. Mozilla Observatory
**Type:** Free web tool (Mozilla Foundation)
**URL:** observatory.mozilla.org
**Pricing:** Free
**Market Position:** Authoritative tool with broad security checks

**Strengths:**
- Includes headers + cookies + TLS checks
- Detailed educational explanations per finding
- Mozilla brand trust
- Grade letter + numeric score

**Weaknesses:**
- No implementation guidance for specific frameworks
- No monitoring
- No alerting
- No API (read-only scan results)
- Broader scope dilutes header analysis depth

**HeaderGuard Advantage:** Deeper header specialization, fix code, continuous monitoring

---

### 3. Snyk
**Type:** Developer security platform
**URL:** snyk.io
**Pricing:** Free (limited) | Team $25/dev/mo | Enterprise custom
**Market Position:** Leading developer-first security platform

**Strengths:**
- Comprehensive vulnerability scanning (dependencies, code, containers, IaC)
- Deep IDE and CI/CD integrations
- Strong brand recognition
- Fixes for dependency vulnerabilities

**Weaknesses:**
- Security headers are a minor check within a much larger platform
- Minimum paid tier is expensive for solo developers
- Header analysis is not the focus — fix code is not header-specific
- Learning curve to set up

**HeaderGuard Advantage:** Header specialization, lower price point, simpler onboarding

---

### 4. Detectify
**Type:** External attack surface management
**URL:** detectify.com
**Pricing:** Surface Monitoring from ~$89/mo | Deep Scan ~$359/mo
**Market Position:** Enterprise external security scanner

**Strengths:**
- Crowdsourced vulnerability checks from security researchers
- Broad attack surface coverage
- Ongoing monitoring and alerting
- Detailed finding reports

**Weaknesses:**
- Enterprise pricing excludes solo developers and small teams
- Security headers are one of hundreds of checks — not a focus
- Complex onboarding for header-only use case
- No framework-specific fix code

**HeaderGuard Advantage:** Price (free + $9/mo vs $89+/mo), header focus, fix code

---

### 5. Probely
**Type:** Web application vulnerability scanner
**URL:** probely.com
**Pricing:** Starts at $50/target/mo
**Market Position:** Mid-market web app scanner

**Strengths:**
- OWASP-aligned scanning
- API-first design
- Slack integration
- CI/CD connectors

**Weaknesses:**
- Priced per scan target — expensive for multi-domain use
- Full-scope scanner where headers are a small component
- No developer-friendly fix code for headers

**HeaderGuard Advantage:** Affordability, header-specific depth, fix code

---

## Feature Matrix

| Feature | HeaderGuard | SecurityHeaders.com | Mozilla Observatory | Snyk | Detectify |
|---------|------------|---------------------|---------------------|------|-----------|
| Free tier | ✓ | ✓ | ✓ | ✓ | ✗ |
| Header scan | ✓ Deep | ✓ | ✓ | ✓ Basic | ✓ Basic |
| Letter grade | ✓ (A+ to F) | ✓ | ✓ | ✗ | ✗ |
| Fix code | ✓ Framework-specific | ✗ | ✗ | Partial | ✗ |
| Monitoring | ✓ (Pro) | ✗ | ✗ | ✗ | ✓ ($$) |
| Email alerts | ✓ (Pro) | ✗ | ✗ | ✗ | ✓ ($$) |
| Slack alerts | ✓ (Pro) | ✗ | ✗ | ✗ | ✓ ($$) |
| API access | ✓ (Pro) | ✗ | ✗ | ✓ | ✓ ($$) |
| CI/CD integration | ✓ (via API) | ✗ | ✗ | ✓ | ✓ ($$) |
| Badge generation | ✓ (Pro) | ✗ | ✗ | ✗ | ✗ |
| Pricing | Free + $9/mo | Free | Free | $25+/dev | $89+/mo |

---

## SWOT Analysis

### Strengths
- Fix code generation is a genuine gap in the market — no competitor does this well
- Deep header specialization vs. broad tools that treat headers as footnotes
- Developer-first pricing: free + $9/month vs enterprise minimums
- 10-header weighted grading is more granular than competitors

### Weaknesses
- Unknown brand vs. established tools (SecurityHeaders.com, Mozilla)
- No vulnerability checks beyond headers — intentionally narrow scope
- Reliance on external HTTP fetching may cause issues with internal/staging environments

### Opportunities
- No competitor owns the "headers + fix code" positioning — clear market gap
- Developer communities (Reddit, Twitter/X, Hacker News) respond to practical security tools
- CDN and hosting platform integrations (Vercel, Cloudflare, Netlify) could be a distribution channel
- Growing regulatory pressure on web security (HIPAA, PCI-DSS, GDPR) increases header compliance demand

### Threats
- SecurityHeaders.com could add fix code generation
- Vercel/Netlify/Cloudflare building native header scanning into their dashboards
- GitHub Actions marketplace saturated with security tools
- Developer budget contraction during economic cycles

---

## Positioning vs. Competitors

**Against free tools (SecurityHeaders.com, Mozilla Observatory):** "They tell you what's broken. We show you how to fix it. And we watch your site so you don't have to."

**Against enterprise scanners (Detectify, Probely):** "Same header monitoring for 1% of the price. Built for developers, not procurement."

**Against general platforms (Snyk):** "Snyk protects your code. We protect your HTTP response headers — and we do it better."
