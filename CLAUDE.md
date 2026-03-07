# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the `pello.co` marketing website — the parent brand that unifies the full Pello product suite. See [PELLO.md](PELLO.md) for a full description of the brand and all products.

The site's core mechanic: users enter their website URL → AI scrapes and researches their business → Pello shows tailored, personalised demos of each product in the suite.

## Product Suite Context

All Pello products live on separate domains but share a single auth system (one account across the whole suite):

- **PelloSEO** (pelloseo.com) — Programmatic SEO at scale
- **PelloReach** (pelloreach.com) — Email outreach engine
- **PelloPublish** (pellopublish.com) — Automated social/blog content
- **PelloSocial** — Server farm-based social media growth
- **PelloPitch** (pellopitch.co) — AI bespoke landing pages
- **PelloAds** — Mass-scale ad testing
- **PelloFlow** — Custom automation and agent builds
- **PelloBuild** — Custom app development

## GitHub

- **Repo:** https://github.com/Pello-Co/PelloHQ
- **Account:** Pello-Co
- **SSH host alias:** `github-pelloco` (uses `~/.ssh/id_ed25519_pelloco`)
- **Remote:** `git@github-pelloco:Pello-Co/PelloHQ.git`

When pushing from this machine, always use the `github-pelloco` SSH host alias — the default `github.com` host is wired to a different key (GlobalPeptide).

## Stack

- **Framework:** Astro 5 (static output)
- **Styles:** Tailwind CSS 4 (via `@tailwindcss/vite` Vite plugin)
- **Animations:** GSAP 3 + ScrollTrigger
- **Language:** TypeScript (strict)
- **Testing:** Playwright + @axe-core/playwright
- **CI:** GitHub Actions (`.github/workflows/ci.yml`)
- **Performance:** Lighthouse CI (`lighthouserc.json`)

## Commands

```bash
npm run dev       # Start dev server at http://localhost:4321
npm run build     # Production build → dist/
npm run check     # TypeScript type check
npm run preview   # Preview production build
npm run lint      # ESLint + Prettier check
npm run format    # Auto-format with Prettier
npm run test      # Run Playwright tests (requires: npm run build first)
npm run lhci      # Run Lighthouse CI
```

## Content

All marketing copy lives in `src/content/site.ts` — edit this file to update any text, links, or product information without touching components.

## Status

Website fully built and live on GitHub. All 14 sections implemented, 0 TypeScript errors, production build clean.
