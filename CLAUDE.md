# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the `pello.co` marketing website — the parent brand that unifies the full Pello product suite. See [PELLO.md](PELLO.md) for a full description of the brand and all products.

The site's core mechanic: users enter their website URL → AI scrapes and researches their business → Pello shows tailored, personalised demos of each product in the suite.

## Documentation Invariance Rule

`CLAUDE.md` is the authoritative documentation for this repository's architecture, product context, infrastructure, and development conventions.

Any change that alters the structure, behaviour, or capabilities of the system MUST be reflected in this file in the same commit.

This rule is mandatory.

### Changes That REQUIRE Updating `CLAUDE.md`

If any of the following are modified, added, or removed, the relevant section of this document must be updated.

#### Product Layer
- New Pello products
- Renamed products
- Removed products
- Product capability changes
- Product domain changes
- Changes to cross-product architecture (auth, integrations, etc.)

#### Architecture
- Framework changes
- Rendering model changes
- Component architecture changes
- Build pipeline changes
- CI/CD changes
- Major structural refactors

#### Infrastructure
- Hosting changes
- CDN changes
- environment changes
- deployment pipeline changes
- new infrastructure services

#### Repository Structure
- New major directories
- Folder restructuring
- Changes to project layout
- New build tools or configuration files

#### Development Tooling
- Linting tools
- testing frameworks
- type systems
- formatting rules
- CI workflow changes

#### Animation / UI Systems
- Changes to the animation framework
- New motion systems
- Changes to the design system
- New global UI architecture

### Commit Policy

Any commit that introduces one of the above changes MUST also update `CLAUDE.md` in the same commit.

A change that modifies architecture, infrastructure, product structure, or repository layout without updating documentation is considered incomplete.

### Documentation Principle

`CLAUDE.md` must always accurately describe:
- how the system works
- how the repository is structured
- how developers are expected to work within it

If the repository and this document diverge, the document must be updated immediately.

### Development Rule

Do not:
- introduce architectural or infrastructure changes without updating `CLAUDE.md`
- leave this file outdated after structural changes

Do:
- update documentation in the same commit as the change

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

- **Repo:** https://github.com/Sinamun/PelloHQ
- **Account:** Sinamun (moved from Pello-Co)
- **Remote:** `https://github.com/Sinamun/PelloHQ.git`
- **Git author:** `Sina Yamani <syamani95@gmail.com>` (required by Vercel)

When pushing from this machine, use HTTPS remote (set above). The old SSH alias `github-pelloco` pointed to Pello-Co — no longer needed for this repo.

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

---

## Framework Deep Dive

### How Astro Works Here

Astro 5 runs in **static output mode** — every page is pre-rendered to HTML at build time. There is no server runtime.

- Pages live in `src/pages/`. `index.astro` is the homepage.
- Each page imports a `Layout` component that wraps content with the full HTML shell, `<head>`, fonts, meta tags, and the noise overlay.
- Astro components (`.astro` files) have a **frontmatter fence** (`---`/`---`) at the top for TypeScript imports and logic, followed by the HTML template below. This code runs only at build time.
- **`<script>` tags** inside `.astro` files run in the browser. Astro bundles and deduplicates them automatically via Vite. These are ES modules — you can import npm packages directly inside them.
- There are **no React islands** in this project. All interactivity (mobile menu, FAQ accordion, form handling) is implemented in typed `<script>` blocks within Astro components.
- Astro uses **`set:html`** to inject raw SVG/HTML strings (used for product icons in `Products.astro`).

### Tailwind CSS 4

This project uses **Tailwind CSS 4**, which differs significantly from Tailwind 3:

- **No `tailwind.config.js`** — configuration lives entirely in CSS via the `@theme {}` block.
- The entry point is `src/styles/global.css`, which starts with `@import "tailwindcss";`.
- Custom design tokens (brand colours, fonts, radius, shadows) are defined in the `@theme {}` block and automatically become Tailwind utility classes.
- The Vite plugin (`@tailwindcss/vite`) is registered in `astro.config.mjs` — no PostCSS config needed.
- Standard Tailwind utilities (`flex`, `grid`, `p-4`, `text-sm`, etc.) work exactly as in v3.

**Pattern:** For one-off values, use arbitrary values (`bg-[#0a0a0f]`, `text-[14px]`). For repeated brand values, define them in `@theme` and use the generated class (e.g. `text-brand-primary`).

### How Styling is Organised

`src/styles/global.css` contains everything in clearly labelled sections:

| Section | Purpose |
|---|---|
| `@theme` | Design tokens → Tailwind utility classes |
| Base reset | `box-sizing`, `font-smoothing`, `body` defaults |
| Typography scale | `.text-display`, `.text-headline`, `.text-title`, `.text-body-lg` — responsive with `clamp()` |
| Texture utilities | `.noise-overlay`, `.grid-texture` |
| Gradient backgrounds | `.hero-glow`, `.section-gradient` |
| Card surfaces | `.card`, `.card-premium` — reusable surface styles with hover states |
| Buttons | `.btn-primary`, `.btn-secondary` — full interactive states including focus-visible |
| Badge | `.badge`, `.badge-dot` with pulse animation |
| Focus states | Global `:focus-visible` rule |
| Section spacing | `.section`, `.section-sm`, `.container` |
| Product icon colours | `.icon-seo`, `.icon-reach`, etc. |
| Animation utilities | `.reveal`, `.is-visible` (CSS fallback without JS) |
| Gradient text | `.gradient-text` — indigo → purple → fuchsia |
| FAQ accordion | `.faq-item`, `.faq-trigger`, `.faq-icon`, `.faq-body` |
| Marquee | `.marquee-track` with reduced-motion override |
| Stat numbers | `.stat-number` — large gradient numerals |
| URL input | `.url-input-wrap`, `.url-input` — glassy form styling |

**Convention:** Use Tailwind utility classes for layout and spacing. Use CSS classes from `global.css` for design-system components (cards, buttons, badges) that appear across many sections.

### Project Structure

```
/
  src/
    components/
      layout/
        Header.astro        # Sticky nav, mobile menu, scroll backdrop
        Footer.astro        # 4-column footer, social links, legal
      hero/                 # Hero-specific sub-components
        HeroScene.astro     # "Growth Engine" intelligence panel (right column)
      sections/             # One file per page section (in page order)
        HeroPello.astro     # ACTIVE hero — editorial 2-col layout + intelligence panel
        Hero.astro          # Previous hero (not used in index.astro; kept for reference)
        HowItWorks.astro
        ProductSection.astro
        UseCases.astro
        Stats.astro
        FAQ.astro
        FinalCTA.astro
      ui/                   # (reserved for shared UI primitives if needed)
      icons/                # (reserved for SVG icon components if needed)
      motion/               # (reserved for motion component wrappers if needed)
      islands/              # (reserved for React islands if ever needed)
    content/
      site.ts               # ALL marketing copy and configuration
    layouts/
      Layout.astro          # HTML shell, head, fonts, meta, structured data
    pages/
      index.astro           # Homepage — imports and composes all sections
    styles/
      global.css            # Global CSS, Tailwind @theme, design system (@imports hero-pello.css)
      hero-pello.css        # Hero intelligence panel CSS — panel, nodes, connectors, ambience
    lib/
      motion/
        animations.ts       # GSAP animation utilities (server-importable)
        heroMotion.ts       # Hero-specific GSAP master timeline + interactions
      seo/
        meta.ts             # buildMeta() helper for page metadata
      utils/
        cn.ts               # Class name utility
  public/
    favicon.svg             # SVG favicon (inline, no raster dependency)
    robots.txt              # Allows all, points to sitemap
    og/                     # (placeholder) Add og-default.png here
    images/                 # (placeholder) Static images if needed
  tests/
    homepage.spec.ts        # Functional + visual Playwright tests
    accessibility.spec.ts   # axe-core accessibility checks
  .github/
    workflows/
      ci.yml                # GitHub Actions: install → check → lint → build → test
  astro.config.mjs          # Astro config (Tailwind Vite plugin, sitemap, site URL)
  tsconfig.json             # Extends astro/tsconfigs/strictest, path alias @/*
  playwright.config.ts      # Playwright: Chromium + Mobile Safari, preview server
  lighthouserc.json         # Lighthouse CI thresholds
  eslint.config.js          # ESLint 9 flat config with eslint-plugin-astro
  .prettierrc               # Prettier with prettier-plugin-astro
```

### Content Management

**Single source of truth:** `src/content/site.ts`

This is a plain TypeScript object (`export const site = { ... } as const`) with no CMS dependency. It is imported directly into Astro components at build time.

Structure of `site.ts`:
- `site.name`, `site.domain`, `site.url`, `site.tagline`, `site.description`, `site.email`
- `site.social` — Twitter/X and LinkedIn URLs
- `site.nav` — navigation links array
- `site.cta` — primary and secondary CTA labels + hrefs
- `site.hero` — headline, subheadline, input placeholder, badge text
- `site.trustStrip.metrics` — 4 key metrics shown below the hero
- `site.problem` — headline, subheadline, 3 pain point objects
- `site.howItWorks` — headline, subheadline, 3 step objects
- `site.products` — array of 8 product objects (name, url, tagline, description, icon key, color, features[])
- `site.useCases` — 3 persona objects (persona, headline, description, tags[])
- `site.testimonials` — 3 testimonial objects (quote, author, role, company)
- `site.stats` — 4 stat objects (value, label, description)
- `site.faq` — 6 FAQ objects (question, answer)
- `site.finalCta` — final CTA section copy
- `site.footer` — products, company, legal link arrays

To update any text on the site, edit `src/content/site.ts` only.

### Animation System

All animations use **GSAP 3 + ScrollTrigger**. Shared scroll-triggered utilities live in `src/lib/motion/animations.ts`. Hero-specific cinematic timeline lives in `src/lib/motion/heroMotion.ts`.

**`heroMotion.ts`** exports:
- `initHeroMotion()` — master 0–7s timeline: panel entrance → left-col reveal → source activation → scan → analysis core → connector draw → channel nodes → ready state → ambient loop. Wrapped in `gsap.matchMedia()`.
- `initHeroInteractions()` — node hover accent, input focus → energise source node, mouse parallax (max ±8px, desktop only).
- `triggerActivation()` — condensed replay fired on form submit.

**Key principle:** Every animation is wrapped in `gsap.matchMedia()` with separate handlers for `(prefers-reduced-motion: no-preference)` and `(prefers-reduced-motion: reduce)`. This means animations are fully accessible by default — reduced-motion users get either a minimal fade or no animation at all.

**Exported utilities in `animations.ts`:**

| Function | Purpose |
|---|---|
| `revealOnScroll(elements, opts)` | Fade + slide-up triggered by ScrollTrigger. Accepts a CSS selector, Element, or NodeList. Options: `stagger`, `delay`, `start`. |
| `heroEntrance(targets)` | One-shot entrance timeline for the hero. Pass an object with selector strings for `badge`, `headline`, `sub`, `ctas`, `visual`. |
| `staggerCards(selector, triggerEl?)` | Grid card stagger — fade + scale-up with 80ms stagger per card. |
| `parallaxX(selector, amount)` | Scrub-based horizontal parallax for decorative elements. |
| `animateCounter(el, endValue, suffix, prefix)` | Counts from 0 to a number on scroll. Used for stat sections. |

**Usage pattern in components:**
```astro
<script>
  import { staggerCards } from '../../lib/motion/animations';
  staggerCards('.product-card', '.product-card');
</script>
```

GSAP and ScrollTrigger are imported once per script block. Astro/Vite deduplicates the GSAP bundle across all script blocks automatically — it is not loaded multiple times.

**No scroll hijacking.** All animations use `scrub` or `once: true` on ScrollTrigger. The user retains full control of scroll.

### Component Conventions

Each section component follows this structure:

1. **Frontmatter** — imports from `../../content/site` (relative path, not alias)
2. **Section element** — always has an `id` matching the nav anchor (e.g. `id="products"`) and `aria-labelledby` pointing to the section's `<h2>`
3. **`.container` div** — constrains content to max-width with responsive padding
4. **Intro block** — `<p>` label (uppercase, indigo, small) + `<h2>` + optional subheadline. This block gets a class like `.products-intro` for the animation hook.
5. **Content grid** — cards/panels with animation hook classes (e.g. `.product-card`)
6. **`<script>` block** — imports animation utilities and calls them

**Section heading structure:** Every section has exactly one `<h2>` with an `id`. The hero has the only `<h1>`. This maintains correct heading hierarchy throughout the page.

**SVG icons:** Product icons are defined as inline SVG path strings in a `Record<string, string>` at the top of `Products.astro`, injected via `set:html`. This keeps icons co-located with usage and avoids a separate icon component tree.

### SEO and Metadata

**`src/lib/seo/meta.ts`** exports `buildMeta(options)` which merges page-specific overrides with site defaults. Returns `{ title, description, image, noIndex }`.

**`src/layouts/Layout.astro`** uses `buildMeta` to populate:
- `<title>`, `<meta name="description">`, `<link rel="canonical">`
- Full Open Graph tags (`og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `og:site_name`)
- Twitter Card tags
- `robots` meta if `noIndex: true`

**Structured data** (JSON-LD) is embedded as `<script type="application/ld+json" is:inline>` in `Layout.astro`:
- `Organization` schema
- `SoftwareApplication` schema

**FAQ structured data** (`FAQPage` schema) is in `FAQ.astro` as an inline script. Note: the `mainEntity` array is currently empty — populate it if the FAQ answers need to appear in Google rich results.

**Sitemap** is auto-generated by `@astrojs/sitemap` at build time → `dist/sitemap-index.xml`. The `robots.txt` references it.

### CI Pipeline

**`.github/workflows/ci.yml`** runs on push to `main`/`dev` and on PRs to `main`:

1. Checkout + Node 20 setup with npm cache
2. `npm ci` — clean install from lockfile
3. `npm run check` — TypeScript check via `astro check`
4. `npm run lint` — ESLint + Prettier check
5. `npm run build` — production build
6. Install Playwright browsers (Chromium only in CI)
7. `npm test` — full Playwright suite
8. Upload Playwright HTML report as artifact (30-day retention)

### Testing Setup

**`tests/homepage.spec.ts`** — functional tests:
- Page title includes "Pello"
- Hero section and headline visible
- All 8 product names visible
- URL input functional
- Navigation visible
- FAQ accordion toggle (aria-expanded state)
- Footer and legal links present
- Skip link present
- Mobile menu open/close/Escape
- Visual snapshot of hero section

**`tests/accessibility.spec.ts`** — accessibility tests:
- Full axe WCAG 2.0/2.1 AA scan via `@axe-core/playwright`
- All images have alt text
- All buttons have accessible names
- Exactly one `<h1>` on the page
- Tab order starts with skip link (`#skip-link`)
- Colour contrast: no critical violations (warnings are logged but don't fail)

**Animation suppression in tests:** Every test that does visual inspection or needs stable DOM state injects a `<style>` that zeroes all `animation-duration` and `transition-duration` values via `page.addInitScript()`.

**Playwright config:**
- Base URL: `http://localhost:4321`
- Uses `npm run preview` as the web server (runs against the built `dist/`)
- Two projects: Desktop Chromium + Mobile Safari (iPhone 13)
- Snapshots use `maxDiffPixelRatio: 0.05`

### Patterns and Conventions Established

**Do not:**
- Add React components unless Astro genuinely cannot handle the interactivity
- Import from `node_modules` directly in `.astro` frontmatter for runtime values (it runs at build time only)
- Use animation libraries other than GSAP
- Add backend, auth, CMS, or database dependencies
- Create new design tokens outside `@theme {}` in `global.css`
- Hardcode copy in components — always update `src/content/site.ts`

**Do:**
- Keep every section independently movable/removable
- Add animation hook classes (e.g. `.my-section-card`) to elements and call animation utilities in the component's `<script>` block
- Use `aria-labelledby` on every `<section>` pointing to its `<h2>`
- Use `role="list"` + `list-none` on styled `<ul>` elements (Tailwind removes list semantics, this restores them)
- Use `is:inline` on `<script type="application/ld+json">` tags
- Use `.container` for all content width constraints
- Keep `src/content/site.ts` as the only place copy is edited

## Design Reference

A curated list of design inspiration and tooling websites:

- **Designspells.com** — design inspiration
- **Shadergradient.co** — animated gradient backgrounds
- **Pageflows.com** — UI flow references
- **Uigoodies.com** — UI resources and components
- **Gsap.com** — animation library (also our animation framework)
- **Reactbits.dev** — React animation components
- **Spline.design** — 3D design and interactive scenes
- **Dark.design** — dark UI inspiration
- **21st.dev** — component inspiration
- **Motionsites.ai** — motion design inspiration

Full list also maintained at: `workspace-root/design-websites.md`
