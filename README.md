# HeaderGuard

Free HTTP security header scanner. Enter a URL and HeaderGuard checks the headers that matter most — including HSTS, CSP, and X-Frame-Options — and grades each one from A+ to F.

This repository is public. A Vercel project named `headerguard` exists on the team; a custom production domain is not set on the GitHub repo yet.

## What it does

- On-demand scan of a URL through `/api/scan`
- Per-header A–F grades plus an overall score
- Pricing page at `/pricing` (free on-demand scanning, with paid Pro and team tiers listed there)
- Built with Next.js (App Router), React, TypeScript, Tailwind CSS, and lucide-react

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm start
```

## License

See the repository for license details if a license file is added later.
