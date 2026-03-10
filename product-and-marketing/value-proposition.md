# HeaderGuard — Value Proposition
Generated: 2026-03-10

---

## Core Value Proposition Statement

**HeaderGuard turns HTTP security header compliance from a confusing afternoon into a 15-minute deployment.**

Scan any URL, receive a weighted letter grade across 10 critical headers, and get copy-paste fix code for your exact framework — then deploy, rescan, and ship with confidence.

---

## Value Proposition Canvas

### Customer Jobs
1. **Functional:** Configure HTTP security headers correctly on production web applications
2. **Functional:** Monitor multiple domains to catch header regressions
3. **Functional:** Integrate security header validation into CI/CD pipelines
4. **Social:** Pass security audits, demonstrate compliance to clients or employers
5. **Emotional:** Feel confident that security headers are correct without being a security expert

### Customer Pains
1. CSP directives are complex and easy to misconfigure — most developers defer or skip
2. Security header regressions are silent — CDN migrations and upgrades can remove headers without warning
3. Free scanning tools grade but don't explain how to fix the specific framework in use
4. Enterprise monitoring tools are prohibitively expensive for solo developers and small teams
5. CI/CD pipelines don't validate security headers after deployment

### Customer Gains
1. Achieve A+ header grades quickly without deep security expertise
2. Sleep confidently knowing regressions trigger an alert before users notice
3. Show clients or security teams an embeddable badge proving header compliance
4. Use the API to automate compliance checks in deployment pipelines
5. Save hours of documentation reading with framework-specific fix code

---

## Key Benefits

### Benefit 1: Framework-Specific Fix Code
When we identify a missing or misconfigured header, we generate the exact code snippet to fix it in Next.js (`next.config.js` headers array), Express (`helmet()` configuration), Nginx (`add_header` directives), Apache (`.htaccess` or `httpd.conf`), or Caddy (`Caddyfile`). No generic advice — real code for your real stack.

### Benefit 2: Weighted Grade (A+ to F)
Not all headers are equal. Content-Security-Policy carries 30% of your score because it's the most impactful. HSTS carries 15%. Our weighted scoring gives you a prioritized action list — fix the biggest issues first, not alphabetically.

### Benefit 3: Daily Monitoring + Instant Alerts
The Pro plan adds daily automated scans of your configured domains. If a grade drops — even by one letter — you receive an email or Slack notification within 24 hours. Regressions from deployments, CDN migrations, or configuration changes are caught before they persist.

### Benefit 4: Embeddable SVG Badge
Add a real-time grade badge to your README or status page. The SVG fetches the latest scan grade and updates automatically. A visible signal to users and contributors that your site takes security seriously.

### Benefit 5: REST API for CI/CD Integration
Scan any URL via the API and receive structured JSON results including per-header scores, issues, severity, and overall grade. Use it to fail a deployment when header configuration drops below your target. Compatible with GitHub Actions, GitLab CI, CircleCI, and any HTTP-capable build system.

---

## Target Problems Solved

| Problem | HeaderGuard Solution |
|---------|---------------------|
| "I don't know how to write a CSP" | Copy-paste CSP directive generated for your specific framework |
| "We had A+ but now it's a C after our CDN migration" | Daily monitoring detected the regression within 24 hours |
| "The security team wants proof we have headers configured" | SVG badge + scan report URL + API endpoint for automated proof |
| "I want to fail CI if headers break" | REST API + JSON response with grade and per-header breakdown |
| "I manage 15 domains — I can't check manually" | Pro plan monitoring covers all configured domains automatically |

---

## Pricing Value Alignment

**Free tier:** Unlimited scans with full grading and fix code. Zero friction for trying and using HeaderGuard as a one-time tool.

**Pro ($9/month):** Daily monitoring + alerts + API + badges. The cost of one developer-hour for automated coverage of all your domains, forever.

For teams: $9/month is less than the cost of one undetected regression discovered during an external security audit.
