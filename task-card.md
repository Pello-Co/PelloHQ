# Task: Rebuild Pello.co HQ Website — Product Showcase

## Context
Pello.co is the headquarters website for the Pello product suite — a tech & AI-heavy full-stack growth agency. This site showcases all 8 products and acts as the entry point for potential clients. The framework is already set up (Astro 5, Tailwind CSS 4, GSAP 3, TypeScript). You need to rebuild all page content, components, and animations from scratch using the existing framework infrastructure.

Read `CLAUDE.md` for the full technical reference of the framework. Read `PELLO.md` for brand context.

## Objective
Build an incredibly polished, heavily animated, modern dark-theme marketing website that:
1. Opens with a dramatic hero section showcasing all 8 products
2. Scrolls through a dedicated section for each product
3. Feels premium, fast, and visually striking — not a template, not generic

## Design Direction

### Overall Vibe
- **Dark theme** — deep navy/black backgrounds, not pure black
- **Premium and bold** — think Linear, Vercel, Stripe-level polish
- **Color system** — each product has its own accent color. Use it subtly in that product's section (glows, gradients, borders)
- **Typography** — large, confident headlines. Clean body text. Generous whitespace.
- **Depth** — layered elements, subtle glass effects, glows, gradients that feel dimensional

### Animation Philosophy
- Every section should animate on scroll — staggered reveals, fade+slide, scale transitions
- Hero should be the most animated — products should feel alive (floating, orbiting, or dynamically arranged)
- Use GSAP ScrollTrigger for scroll-driven animations
- Respect `prefers-reduced-motion` — always provide accessible fallbacks
- No scroll hijacking. Animations enhance, never obstruct.
- Smooth, ease-out curves. Nothing janky.

## Website Structure & Full Content

All content below should go into `src/content/site.ts` as the single source of truth. Components import from there.

---

### Section 1: Hero

**Badge:** "Now in Early Access"

**Headline:** "Every growth channel. One AI-powered platform."

**Subheadline:** "Pello unifies SEO, outreach, content, social, ads, and automation into a single growth engine. Enter your website — our AI shows you exactly how each channel drives your growth."

**URL Input:** placeholder "https://yoursite.com" | button "See Your Growth Plan"

**Visual concept:** The 8 product cards/logos should be visible in the hero — arranged in a constellation, grid, or orbital pattern around the headline. Each card shows the product name and icon with its accent color. They should float with subtle movement and animate in on page load. As the user scrolls past the hero, these cards transition out smoothly.

---

### Section 2: How It Works

**Label:** "How It Works"
**Headline:** "Personalised for your business in 60 seconds."
**Subheadline:** "No generic demos. No sales calls. Pello researches you first."

**Steps:**
1. **"Enter your website URL"** — "Drop your URL into Pello. Our AI immediately starts researching your business, industry, audience, and competitive landscape."
2. **"AI builds your growth profile"** — "We analyse your content, SEO posture, social presence, and ad footprint. In seconds, we have a complete picture of where you can grow."
3. **"See your personalised demos"** — "Each product shows a live, tailored demo using your actual business data. Real keyword opportunities. Real lead segments. Real growth potential."

---

### Sections 3–10: Individual Product Sections

Each product gets its own full-width section. Alternate the layout (e.g., info left / visual right, then flip). Each section should subtly use the product's accent color in gradients, glows, or borders.

#### 3. PelloSEO
- **Accent:** #6366f1 (Indigo)
- **Tagline:** "Programmatic SEO at scale"
- **Headline:** "10,000 pages. Zero manual effort."
- **Description:** "Most businesses have a few hundred SEO pages. Your competitors have tens of thousands. PelloSEO closes that gap — AI generates optimised page templates that automatically produce thousands of pages across languages, locations, and topics. Your team approves the strategy. PelloSEO does everything else."
- **Features:** AI-generated page templates · Multi-language & multi-location · Auto-publishing to your CMS · Ongoing SEO monitoring
- **CTA:** "Explore PelloSEO →" (href: https://pelloseo.com)

#### 4. PelloReach
- **Accent:** #8b5cf6 (Violet)
- **Tagline:** "Email outreach at massive scale"
- **Headline:** "Land in the inbox. Not spam."
- **Description:** "Cold outreach fails because of deliverability. PelloReach solves that with 500+ warmed domains, intelligent lead finding, and AI-personalised sequences that actually get replies. No blacklists. No spam folders. Just conversations with the right people."
- **Features:** 500+ pre-warmed domains · AI-personalised sequences · Inbox placement technology · Automated lead discovery
- **CTA:** "Explore PelloReach →" (href: https://pelloreach.com)

#### 5. PelloPublish
- **Accent:** #a855f7 (Purple)
- **Tagline:** "Content that creates itself"
- **Headline:** "Every format. Your voice. Zero effort."
- **Description:** "PelloPublish learns your brand's voice, tone, and style — then produces content across every format at scale. Blog posts, social carousels, short-form video, long-form articles, UGC-style content. Scheduled, published, and optimised automatically."
- **Features:** Blog posts & long-form articles · Video, reels & shorts · Social carousels & UGC · Auto-scheduling across platforms
- **CTA:** "Explore PelloPublish →" (href: https://pellopublish.com)

#### 6. PelloSocial
- **Accent:** #c026d3 (Fuchsia)
- **Tagline:** "Social growth infrastructure"
- **Headline:** "Growth at server-farm scale."
- **Description:** "PelloSocial is social media growth infrastructure that most agencies don't know exists. AI-powered personas, geo-targeted accounts, and automated engagement — running on dedicated hardware across target markets. Platform-native content, real engagement patterns, measurable growth."
- **Features:** AI persona network · Geo-targeted placement · Platform-native content · Automated engagement at scale
- **CTA:** "Learn More →" (href: #contact)

#### 7. PelloPitch
- **Accent:** #d946ef (Pink)
- **Tagline:** "Landing pages that know your visitor"
- **Headline:** "Every visitor gets their own page."
- **Description:** "Generic landing pages convert at 2-3%. PelloPitch pages convert at 8-12%. The difference: AI builds a unique page for every visitor based on their source, industry, and intent. The copy adapts. The layout shifts. The offer changes. Every visit is personalised."
- **Features:** Per-visitor personalisation · AI-written conversion copy · Real-time A/B testing · Conversion optimisation engine
- **CTA:** "Explore PelloPitch →" (href: https://pellopitch.co)

#### 8. PelloAds
- **Accent:** #7c3aed (Deep Violet)
- **Tagline:** "Test thousands. Scale the winners."
- **Headline:** "Thousands of ads. One click."
- **Description:** "Most ad teams test 10-20 variants per campaign. PelloAds tests thousands — different creatives, copy, audiences, and placements — simultaneously. Losers get killed automatically. Winners get budget. Every dollar goes further."
- **Features:** Thousands of variants tested · Automated budget reallocation · Multi-platform campaigns · Real-time ROI optimisation
- **CTA:** "Learn More →" (href: #contact)

#### 9. PelloFlow
- **Accent:** #4f46e5 (Deep Indigo)
- **Tagline:** "Your business. Fully automated."
- **Headline:** "Any process. Any complexity. Automated."
- **Description:** "PelloFlow builds custom automation workflows and AI agents designed specifically for your business. From lead routing to data processing to customer onboarding — if it's a process, PelloFlow automates it. Custom-built, maintained, and evolved as your business grows."
- **Features:** Custom AI agents · End-to-end process automation · API & webhook integration · Ongoing maintenance
- **CTA:** "Learn More →" (href: #contact)

#### 10. PelloBuild
- **Accent:** #6366f1 (Indigo)
- **Tagline:** "Engineering for growth teams"
- **Headline:** "When growth needs custom code."
- **Description:** "Sometimes growth requires software that doesn't exist yet. Internal tools, data pipelines, integrations, or full applications — PelloBuild is a dedicated engineering team that ships exactly what you need. Fast, reliable, and built to scale."
- **Features:** Full-stack development · Data infrastructure · Internal tooling · Systems integration
- **CTA:** "Learn More →" (href: #contact)

---

### Section 11: Use Cases

**Label:** "Who It's For"
**Headline:** "Built for teams that move fast."

**Personas:**
1. **Founders** — "Enterprise-grade growth without the enterprise headcount." — "Access the same growth infrastructure that was previously reserved for companies with 20-person marketing teams. Pello gives you SEO, outreach, content, and social — all automated, all from day one." — Tags: SEO, Outreach, Content
2. **Marketing Teams** — "Your team sets the strategy. Pello executes at scale." — "Stop spending 80% of your time on production. Connect your playbooks to Pello and watch output multiply — without growing headcount." — Tags: Content, Social, Ads
3. **Agencies** — "Deliver more. Margin more. Hire less." — "White-label Pello's infrastructure to deliver programmatic SEO, automated content, and outreach campaigns to your clients at 10x the speed." — Tags: All Products, White-label, Scale

---

### Section 12: Stats

- **10,000+** — "SEO pages per client" — "Generated automatically across languages and locations"
- **3.4x** — "Average traffic lift" — "Across clients using PelloSEO within 90 days"
- **500+** — "Warmed outreach domains" — "For high-deliverability email at scale"
- **8** — "Growth channels" — "All unified under one account and dashboard"

Use animated counters on scroll.

---

### Section 13: FAQ

Keep the existing 6 FAQ items from the current `site.ts`. Use an accessible accordion pattern (aria-expanded, keyboard nav).

---

### Section 14: Final CTA

**Headline:** "See what Pello can do for your business."
**Subheadline:** "Enter your URL. Get a personalised analysis in under 60 seconds."
**CTA button:** "Get Early Access"
**Note:** "Free personalised demo. No credit card required."

---

### Header & Footer

**Header:** Sticky, transparent on hero, gains backdrop-blur on scroll. Logo left, nav center, CTA right. Mobile hamburger menu.

**Footer:** 4-column layout — Products (all 8 with links), Company (About, Careers, Blog, Contact), Legal (Privacy, Terms, Cookies), and social links (X, LinkedIn). Tagline: "One platform. Every growth channel."

---

## Technical Constraints

- **Use the existing framework** — Astro 5, Tailwind CSS 4 (Vite plugin, @theme in CSS), GSAP 3 + ScrollTrigger
- **All content in `src/content/site.ts`** — components import from there, no hardcoded copy
- **TypeScript strict mode** — zero errors
- **Accessibility** — semantic HTML, aria attributes, keyboard navigation, reduced-motion support
- **Performance** — static output, optimised assets, no unnecessary JS
- **Keep existing conventions** from CLAUDE.md — section IDs, aria-labelledby, .container widths, animation utility patterns
- **Keep existing CI, testing, and config files** — only rewrite the components, content, and styles
- **Commit and push when done** — use `git@github-pelloco:Pello-Co/PelloHQ.git` remote

## When Done

- [ ] `npm run build` passes with zero errors
- [ ] `npm run check` passes (TypeScript)
- [ ] All 14 sections render correctly
- [ ] Every product section has its own accent color theming
- [ ] Hero animation works — products are visually present and animated
- [ ] Scroll animations fire on every section
- [ ] Reduced motion fallback works
- [ ] Mobile responsive
- [ ] Committed and pushed to GitHub
