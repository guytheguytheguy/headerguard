# HeaderGuard — Target Audience
Generated: 2026-03-10

---

## Primary Persona: Riley — The Security-Aware Developer

**Name:** Riley Chen
**Role:** Full-Stack Developer
**Experience:** 3-8 years
**Company Size:** Startup (2-20 people) or freelance

### Demographics
- Age: 26-38
- Located in tech hubs (US/EU/AU) or remote
- Uses Next.js, Express, or similar Node.js frameworks
- Deploys to Vercel, Netlify, AWS, or Fly.io
- Active on GitHub, reads Hacker News, follows security Twitter accounts

### Psychographics
- Cares about doing things right but has limited time
- Values documentation and copy-paste solutions over reading RFCs
- Slightly anxious about security — knows it matters, not expert enough to feel confident
- Respects tools built by developers for developers
- Dislikes enterprise software and sales calls

### Goals
- Ship production applications that pass client or employer security reviews
- Add security headers to existing projects without breaking anything
- Be able to say "yes, we have proper security headers" with evidence

### Pain Points
1. Spent 2 hours reading MDN CSP documentation and still confused about `script-src` vs `default-src`
2. Found out headers were removed after a Vercel deployment config change — discovered a week later
3. Free tools say "CSP missing" but not what CSP to write for their Next.js app
4. Security audit flagged missing headers; needs to fix all of them quickly

### Motivators
- A concrete fix code snippet they can paste and deploy
- Seeing the grade jump from D to A+ in real time
- Knowing they're covered without thinking about it again

### Where to Find Riley
- Hacker News "Show HN" posts
- r/webdev, r/netsec, r/nextjs
- Next.js Discord, Vercel Discord
- Dev.to, Hashnode developer blogs
- GitHub trending repositories

### Quote
> "I know I need security headers but every time I try to set up CSP it breaks something. I just need someone to tell me what to put in my `next.config.js`."

---

## Secondary Persona: Casey — The Multi-Domain DevOps Engineer

**Name:** Casey Nakamura
**Role:** DevOps Engineer / SRE
**Experience:** 5-12 years
**Company Size:** Mid-size (20-200 employees)

### Demographics
- Age: 30-45
- Works at a company with 5-30 production web properties
- Manages deployment pipelines (GitHub Actions, CircleCI, AWS CodePipeline)
- Responsible for infrastructure compliance and security posture
- Reports to engineering manager or CTO

### Psychographics
- Process-oriented and documentation-focused
- Automates everything that can be automated
- Needs to demonstrate compliance evidence to security team or clients
- Values programmatic tools over manual dashboards
- Evaluates tools on API quality and integration capability

### Goals
- Maintain consistent security header grades across all production domains
- Catch regressions within hours, not weeks
- Provide the security team with automated proof of header compliance
- Integrate header checks into existing CI/CD pipelines

### Pain Points
1. CDN migration removed `Strict-Transport-Security` from 12 domains — discovered during external audit
2. Security team requests quarterly evidence of header compliance — currently a manual process
3. No automated way to catch header regressions in deployment pipeline
4. Managing 15+ domains means manual checks are sporadic

### Motivators
- Monitoring dashboard covering all domains in one place
- Slack alerts so the team knows immediately when grades drop
- API integration for CI/CD gates that fail deploys on header regression
- SVG badges on internal status pages as proof of compliance

### Where to Find Casey
- DevOps subreddits (r/devops, r/sysadmin)
- HashiCorp, Kubernetes, and cloud provider communities
- InfoSec LinkedIn groups
- OWASP local chapters
- Infrastructure engineering newsletters (Last Week in AWS, The DevOps Newsletter)

### Quote
> "I need to know the moment a header grade drops across any of our 20 domains. The last time we missed it, it took 3 weeks to catch it."

---

## Acquisition Strategy by Persona

| Channel | Riley (Developer) | Casey (DevOps) |
|---------|------------------|----------------|
| Content | "Add security headers to Next.js in 5 minutes" blog posts | "Automate header compliance in GitHub Actions" tutorials |
| Community | Hacker News, Reddit r/webdev | r/devops, security newsletters |
| SEO | "next.js security headers", "express security headers" | "monitor security headers", "http header regression" |
| Tooling | GitHub Action integration, VSCode reminder | Slack bot integration, Terraform module |
| Pricing hook | Free unlimited scans, no account required | Pro trial: monitor 3 domains free for 30 days |
