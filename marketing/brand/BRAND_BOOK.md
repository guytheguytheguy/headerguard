# HeaderGuard Brand Book
<!-- Kynvo Marketing Artifact | Veridux Labs | https://headerguard.veridux.ai | Generated: 2026-04-14 -->

**Product:** HeaderGuard
**URL:** https://headerguard.veridux.ai
**Portfolio:** Veridux Labs — https://veridux.ai
**Date:** 2026-04-14

---

## Brand Identity Overview

HeaderGuard is a precision security tool. The brand communicates authority, technical depth, and reliability — without the fear-mongering tone that plagues most security products. The visual language draws from terminal aesthetics and security dashboards: dark, focused, signal-forward.

---

## Color Palette

### Primary Colors

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Background | Shield Black | `#0D1117` | Primary page background (GitHub dark base) |
| Surface | Guard Dark | `#161B22` | Cards, modals, panels |
| Surface Alt | Deep Slate | `#1C2128` | Hover states, sidebar backgrounds |
| Primary Accent | Alert Red | `#E84040` | Fail states, critical header warnings, CTAs |
| Secondary Accent | Caution Amber | `#F5A623` | Warning states, partial pass indicators |
| Success | Safe Green | `#3FB950` | Pass states, A-grade headers |
| Text Primary | Ghost White | `#E6EDF3` | Body text on dark backgrounds |
| Text Muted | Steel Gray | `#8B949E` | Secondary text, metadata, timestamps |
| Border | Wire Gray | `#30363D` | Card borders, dividers |

### Accent Gradient (for hero sections and score rings)
- Gradient: `linear-gradient(135deg, #E84040 0%, #F5A623 100%)`
- Usage: Score ring fill for failing grades (D/F), hero section accents, feature callout borders

### Light Mode (for reports and PDF exports)
- Background: `#FFFFFF`
- Surface: `#F6F8FA`
- Text: `#1C2128`
- Border: `#D0D7DE`
- Accent: `#E84040` (unchanged)

---

## Typography

### Headings
- **Font:** Inter (700 Bold)
- **Use:** H1–H3 headings, score grades, feature titles
- **Letter spacing:** -0.02em for large sizes, 0 for body headings

### Body
- **Font:** Inter (400 Regular, 500 Medium)
- **Use:** Body copy, UI labels, tooltips

### Code / Monospace
- **Font:** JetBrains Mono (400/600)
- **Use:** Header names, cURL commands, code snippets, remediation examples
- **Color:** `#79C0FF` (blue-tinted on dark background) — signals "this is code"

### Score Display
- **Font:** Inter (800 ExtraBold)
- **Size:** 80–120px for the primary grade letter, 48px for numeric score
- **Color:** Dynamic based on grade (green A, yellow B, amber C, red D/F)

---

## Logo Concept

**Icon:** A stylized shield with a horizontal rule inside it — a reference to HTTP headers (key: value structure). The shield is slightly angular (not rounded), suggesting precision and technical rigor rather than soft consumer-brand security.

**Wordmark:** "Header**Guard**" — "Header" in Inter Regular weight, "Guard" in Inter Bold. The word "Guard" carries the brand authority.

**Icon-only version:** The shield mark alone for favicons, app icons, and small-format placements. The shield uses the Alert Red (`#E84040`) fill on dark backgrounds.

**Clearspace:** Minimum clearspace equal to the cap-height of the "H" on all sides.

**Don't:** Stretch, rotate, recolor the shield, or place the logo on mid-gray backgrounds where contrast is insufficient.

---

## Tagline Options

1. **"Know your headers. Own your security."**
   - *Tone:* Empowering, developer-direct. Speaks to ownership and responsibility.
   - *Best for:* Homepage hero, Product Hunt tagline, social bio.

2. **"Your headers have gaps. Find them before attackers do."**
   - *Tone:* Urgency without fear-mongering. Positions HeaderGuard as proactive defense.
   - *Best for:* Ad copy, email subject lines, Hacker News launch headline.

3. **"HTTP security headers: scan, monitor, fix."**
   - *Tone:* Functional, no-fluff, action-oriented. Appeals to developers who hate marketing.
   - *Best for:* README, GitHub description, SEO meta description, developer newsletter ads.

---

## Brand Voice Guidelines

### Tone Pillars

**1. Expert, not arrogant.**
HeaderGuard speaks to developers as peers. We know headers, we assume you're smart, we skip the condescension. We explain what's wrong and how to fix it without treating users like they've never heard of a CSP before.

*Do:* "Your Content-Security-Policy is missing the `default-src` directive. Add this to your next.config.js headers block."
*Don't:* "WARNING: Your site is VULNERABLE! Fix your headers NOW to protect your users!!!"

**2. Signal, not noise.**
Security tooling is full of alerts, warnings, and severity levels that paralyze more than they guide. HeaderGuard surfaces the 3 things that matter most, in order of impact. We do not enumerate 47 findings to look thorough.

*Do:* "Top priority: Add `Strict-Transport-Security`. This single header eliminates the largest class of HTTPS downgrade attacks."
*Don't:* "17 headers detected. 9 passed. 5 warnings. 3 critical. 2 informational. 1 best practice. See full report for details."

**3. Remediation-focused.**
The job isn't done when we tell you something's broken. Every finding comes with a fix. HeaderGuard earns trust by closing the loop — from detection to resolution.

*Do:* "Missing header. Here's the exact line to add to your Nginx config."
*Don't:* "This header is missing. Refer to MDN documentation for configuration details."

**4. Brief and technical.**
Our users read documentation for fun. Short sentences. No filler. Precise technical language used correctly.

*Do:* "HSTS max-age below recommended 31536000 (1 year)."
*Don't:* "It appears that the duration specified for your HTTP Strict Transport Security header may not be set to the ideal recommended value."

---

## Photography and Imagery Style

- **Code screenshots:** Dark theme (matching Shield Black background). Real code, never Lorem Ipsum snippets.
- **Browser DevTools:** Use real header inspection screenshots from Chrome DevTools Network tab.
- **Illustrations:** Flat, geometric. Shield motifs, network diagrams, server/browser diagrams. Avoid stock "hacker in hoodie" imagery.
- **Social graphics:** Dark background with one accent color. Score grades rendered large. Real scan results from popular open-source projects make compelling content.

---

## Brand Alignment with Veridux Labs

HeaderGuard inherits the Veridux Labs developer-tool brand DNA:
- Technical authority without corporate stiffness
- Built by developers, for developers
- Part of a portfolio that includes CyberOS, AgenticNode, Kynvo, EndOfCoding, and LLMHire

Co-branding usage: "HeaderGuard by Veridux Labs" is acceptable in press mentions and partnership materials. The primary brand in the product UI is always "HeaderGuard."
