You are acting as a top-tier frontend architect, motion designer, conversion-focused SaaS landing page designer, accessibility engineer, and performance engineer.

Your job is to fully initialise, configure, install, and build a production-grade marketing website for a SaaS technology product.

You must not ask unnecessary clarification questions.
If product specifics are missing, infer a credible premium B2B/B2C SaaS positioning and keep all editable content centralised in one content/config file so it can be replaced later.
Do not stall. Execute.

==================================================
PROJECT GOAL
==================================================

Build a visually exceptional, modern, premium marketing brand site for a SaaS tech product.

This is not a web app dashboard.
This is a high-conversion landing/marketing site whose job is to:
- explain the product clearly
- look world-class
- feel modern and animated
- build trust
- drive the user to one primary CTA

The site should feel comparable to the best modern SaaS / AI / devtool landing pages:
- premium typography
- clean layout
- strong visual hierarchy
- tasteful motion
- subtle depth
- crisp responsiveness
- excellent performance
- zero template feel

The result must look custom-designed, not generic.

==================================================
NON-NEGOTIABLE STACK
==================================================

Choose this stack unless there is an explicit technical blocker:

Core:
- Astro (current stable official version)
- TypeScript with strict mode
- Tailwind CSS (current stable)
- GSAP as the ONLY JavaScript animation library
- React ONLY for isolated interactive islands if needed
- ESLint + Prettier
- Playwright for browser and visual testing
- @axe-core/playwright for accessibility checks
- Lighthouse CI for performance regression checks

Default policy:
- No Next.js
- No Framer Motion
- No Chakra UI
- No MUI
- No full component library by default
- No shadcn/ui by default
- No smooth-scroll hijacking libraries
- No Locomotive Scroll
- No Lenis unless there is an exceptional reason, and assume the answer is “do not use it”
- No animation overlap
- No CMS unless explicitly required
- No 3D engine by default

Optional only if truly required:
- Use Radix primitives only for specific accessibility-heavy primitives like dialog, accordion, tabs, etc
- Use React islands only where Astro alone is not sufficient
- Use Three.js + @react-three/fiber + @react-three/drei ONLY if one signature section truly requires custom 3D
- If simple 3D model display is enough, prefer @google/model-viewer over a full custom WebGL scene

Do NOT install overlapping libraries “just in case”.
Keep the dependency graph disciplined.

==================================================
SOURCES OF TRUTH
==================================================

Before writing code, check the CURRENT official docs for:
- Astro setup, integrations, islands, and AI/build guidance
- Tailwind CSS setup
- GSAP docs, especially matchMedia and responsive motion patterns
- Playwright visual snapshot docs
- Lighthouse CI docs
- Astro React integration docs if React islands are needed
- Figma MCP only if a design source is actually available

Do not trust stale memory for CLI flags or package setup.
Use current official instructions.
Prefer official docs and official examples over third-party templates.

==================================================
PRODUCT INPUTS
==================================================

Use these variables. If values are missing, infer strong defaults and store them in a single editable config/data file.

PRODUCT_NAME = <replace or infer>
PRODUCT_CATEGORY = <AI SaaS / developer tool / automation platform / analytics SaaS / etc>
ONE_LINE_VALUE_PROP = <replace or infer>
PRIMARY_CTA = <Book a demo / Start free / Join waitlist / Get early access>
SECONDARY_CTA = <See how it works / Watch demo / Explore product>
TARGET_AUDIENCE = <replace or infer>
CORE_PAIN_POINTS = <replace or infer>
TRUST_SIGNALS = <replace or infer>
BRAND_TONE = premium, intelligent, modern, technical, credible
VISUAL_STYLE = cinematic but restrained, minimal but rich, modern SaaS, high-end motion design
THEME_MODE = dark-first unless the inferred brand clearly needs light-first

==================================================
EXECUTION PLAN
==================================================

Execute in this order:

1. Research current official setup docs
2. Scaffold the Astro project correctly
3. Install and configure the required dependencies
4. Set up linting, formatting, testing, accessibility, and CI
5. Design the site architecture and component system
6. Implement the full landing page with polished visuals and animation
7. Add performance and accessibility safeguards
8. Run build/tests and fix issues
9. Produce a final summary of what was built, what was installed, and how to run it

==================================================
SETUP TASKS
==================================================

1) Initialise project
- Create a new Astro project in the current directory or repo
- Use TypeScript strict mode
- Keep the starter minimal
- Install dependencies
- Configure Astro cleanly and idiomatically

2) Add integrations
- Add Tailwind CSS using the current official Astro/Tailwind path
- Add React integration only if needed for isolated islands
- Do not add unnecessary integrations

3) Install packages
Required runtime/dev packages should cover:
- astro
- tailwindcss
- gsap
- eslint
- prettier
- playwright
- @axe-core/playwright
- @lhci/cli

Only add:
- @astrojs/react if React islands are actually used
- react and react-dom if React islands are actually used
- @radix-ui/* only if a specific primitive is genuinely needed
- three / @react-three/fiber / @react-three/drei ONLY if one section truly needs custom 3D
- @google/model-viewer only if a simple model-viewer implementation is the better fit

4) Configure tooling
- ESLint
- Prettier
- Playwright
- Lighthouse CI
- GitHub Actions CI
- sensible scripts in package.json

==================================================
ARCHITECTURE RULES
==================================================

Use an architecture that is clean for future AI-agent modification.

Create a project structure similar to:

/
  src/
    components/
      layout/
      sections/
      ui/
      icons/
      motion/
      islands/
    content/
      site.ts
    layouts/
    pages/
    styles/
      global.css
      tokens.css
    lib/
      utils/
      seo/
      analytics/
  public/
    images/
    icons/
    og/
    models/           # only if needed
  tests/
  .github/workflows/
  README.md

Rules:
- Keep all editable marketing copy in one place, preferably src/content/site.ts
- Keep design tokens in CSS variables and map them into Tailwind where appropriate
- Keep components small and composable
- Make every section easy to move, remove, or restyle
- Keep animation logic modular
- Avoid giant files
- Prefer Astro components for static/presentational sections
- Use React islands only for genuinely interactive components

==================================================
DESIGN DIRECTION
==================================================

Create a premium art direction.

The site should feel:
- confident
- modern
- elegant
- technical
- high-end
- conversion-focused

Visual direction:
- dark-first, unless product inference strongly suggests otherwise
- layered gradients
- subtle glow accents
- restrained glass effects only if they add clarity
- gentle grid/noise/beam textures
- premium card surfaces
- strong typographic scale
- tight spacing rhythm
- product-led visual storytelling
- polished hover states
- crisp, minimal iconography
- no clutter
- no gimmicky neon overload
- no “template marketplace” feel

Use:
- a strong display heading style
- a clean readable body font
- a tokenised colour system
- accessible contrast
- good whitespace

Do not depend on stock art for the core experience.
Where real product screenshots are unavailable, create polished abstract product frames, code panels, dashboards, flows, or UI mock surfaces that feel believable and premium.

==================================================
PAGE / SECTION REQUIREMENTS
==================================================

Build a complete homepage/landing page with these sections:

1. Header / navigation
- sticky or semi-sticky
- brand mark / text logo placeholder
- nav links
- primary CTA button
- mobile menu
- polished mobile behaviour

2. Hero
- powerful headline
- subheading that clearly explains value
- strong CTA pair
- product visual / UI frame / motion composition
- credibility signals near the fold
- above-the-fold must render beautifully without requiring JS

3. Trust / proof strip
- customer logos / brand placeholders / metrics
- subtle motion only

4. Problem / pain section
- clarify the pain
- make the product feel necessary
- use strong information hierarchy

5. Solution / how it works
- 3-step or 4-step explanation
- visually rich cards or timeline
- make it immediately understandable

6. Feature spotlight section
- 3 to 6 premium feature cards
- each card with concise copy and visual cue
- cards should feel custom and tactile

7. Product walkthrough / showcase
- the most visually impressive section
- could use stacked panels, animated mock UI, progressive story cards, or a pinned scroll section
- must be elegant and not over-engineered

8. Integrations / compatibility section
- if relevant to inferred product
- use tasteful badges or cards
- avoid clutter

9. Use cases / personas
- show different audiences or workflows
- concise but persuasive

10. Testimonials / social proof
- use high-end card styling
- no cheesy fake review styling
- if no real testimonials exist, use clearly placeholder but plausible content

11. Stats / credibility
- concise measurable outcomes
- can use animated counters only if tasteful and accessible

12. FAQ
- SEO-friendly
- accessible accordion if used
- use Radix only if needed, otherwise build accessibly

13. Final CTA section
- decisive
- emotionally and logically strong
- clear action

14. Footer
- concise sitemap
- legal placeholder links
- social placeholder links if appropriate

==================================================
COPYWRITING RULES
==================================================

Write conversion-quality copy.

Rules:
- no lorem ipsum
- no vague buzzword soup
- no cliché “revolutionise your workflow” filler
- be specific, crisp, and believable
- sound premium and intelligent
- write like a top SaaS landing page copywriter
- make the product feel clear in under 5 seconds
- every section should either explain, prove, or convert

If actual product details are missing:
- infer a credible modern SaaS positioning
- keep the copy modular and easy to replace
- avoid over-claiming
- keep it realistic

==================================================
ANIMATION SYSTEM
==================================================

GSAP is the only JS animation library.

Animation philosophy:
- elegant, premium, restrained
- motion should support hierarchy and storytelling
- no motion spam
- no constant distracting movement
- no scroll hijacking
- no jank

Use animation in these ways:
- hero entrance timeline
- CTA/button microinteractions
- section reveal on scroll
- feature card stagger
- subtle parallax only if transform-based and very lightweight
- one signature motion moment for the whole page
- optional pinned storytelling section if it remains performant and readable

Animation rules:
- prefer opacity + transform
- avoid layout thrash
- avoid expensive filter and blur animations unless trivial in cost
- keep motion durations tasteful
- keep easing premium and consistent
- animation must work on mobile without hurting scroll performance
- all motion must respect prefers-reduced-motion
- if reduced motion is enabled, fall back to minimal fades or no animation
- the site must still feel excellent without animation

Create a reusable motion utility layer where helpful.
Use GSAP matchMedia/responsive logic cleanly.

==================================================
3D POLICY
==================================================

Default answer: do NOT add 3D.

Only add 3D if it materially improves the hero or one signature section and clearly supports the product narrative.

If 3D is not clearly necessary:
- create depth using layered UI, gradients, SVG, lighting, parallax, perspective transforms, and premium motion
- do not install Three.js

If 3D IS clearly justified:
- restrict it to one island/section
- lazy-load it
- do not block initial page render
- pause or reduce work when offscreen
- reduce DPR / complexity on mobile
- prefer a single scene with disciplined asset loading
- keep the rest of the page free of 3D runtime costs

If simple product model display is enough:
- prefer @google/model-viewer

If a custom scene is truly needed:
- install and use three + @react-three/fiber + @react-three/drei
- only inside a single React island
- no full-page canvas takeover
- no unnecessary shaders
- no gratuitous particles unless they are lightweight and genuinely elegant

==================================================
PERFORMANCE RULES
==================================================

Performance is a first-class requirement.

Mandatory:
- keep the homepage highly performant
- minimise client JS
- Astro components first, islands only where necessary
- above-the-fold content should not depend on JS
- lazy-load non-critical visuals
- optimise images
- use responsive image sizes
- use modern formats where appropriate
- prevent CLS
- self-host or carefully subset fonts
- avoid excessive font variants
- avoid huge videos
- if using video, use posters, lazy loading, mute, loop, and only when it adds clear value
- do not ship unnecessary client libraries

Target mindset:
- best-in-class perceived performance
- strong Core Web Vitals
- premium visuals without bloat

==================================================
ACCESSIBILITY RULES
==================================================

Accessibility is mandatory.

Requirements:
- semantic HTML
- keyboard navigable
- visible focus states
- good colour contrast
- meaningful landmarks
- correct heading structure
- reduced motion support
- alt text where needed
- buttons are buttons
- links are links
- mobile menu accessible
- accordions/dialogs accessible
- forms labelled correctly
- no hover-only meaning
- no animation that obscures content or interaction

==================================================
SEO / CONTENT / METADATA
==================================================

Implement solid technical SEO:

- proper title and meta description
- canonical
- Open Graph / Twitter metadata
- sitemap
- robots.txt
- favicons / app icons placeholder setup
- structured data where appropriate:
  - SoftwareApplication
  - Organization
  - FAQPage if FAQ exists
- clean semantic content structure
- good internal anchors / section ids
- performant markup

==================================================
CONVERSION / CTA STRATEGY
==================================================

Optimise for conversion.

- one primary CTA across the site
- one secondary CTA if useful
- repeat CTA intelligently
- build trust before asking too much
- reduce friction
- make the next step obvious
- use form capture only if it supports the inferred funnel

If a form is included:
- build an accessible form
- validate clearly
- handle success/error states
- if no backend is available, create a clean placeholder endpoint strategy and document where it should connect

==================================================
NO-BLOAT RULES
==================================================

Do not install or add:
- multiple animation libraries
- multiple UI frameworks
- random effect plugins
- scroll hijacking
- carousels unless they clearly improve the experience
- a CMS
- a database
- a backend
- auth
- analytics vendors
- chat widgets
- cookie banners
- third-party scripts
unless they are explicitly required for this landing page

Keep this a world-class marketing site, not an overbuilt platform.

==================================================
TESTING / QUALITY GATES
==================================================

Set up and run:

1. Build verification
- production build must pass cleanly

2. Playwright
- homepage test
- mobile navigation test
- CTA visibility test
- visual snapshot tests
- disable or neutralise animations for snapshots where necessary

3. Accessibility
- use @axe-core/playwright against key pages/sections

4. Lighthouse CI
- add a CI check or config for performance/accessibility/best-practices/SEO

5. Manual quality pass
- responsive pass at mobile, tablet, desktop, ultrawide
- ensure no awkward section spacing
- ensure animation timing feels premium

==================================================
CI / AUTOMATION
==================================================

Create GitHub Actions workflows for:
- install
- lint
- build
- Playwright tests
- Lighthouse CI

Use sensible dependency caching.
Keep the CI clean and easy to understand.

==================================================
DELIVERABLES
==================================================

At the end, provide:

1. A short summary of the chosen architecture
2. Exact packages installed and why each exists
3. File tree overview
4. What sections/components were created
5. What animations were implemented
6. Whether React islands were used and where
7. Whether 3D was used and why or why not
8. How performance was protected
9. Commands to run locally
10. Any remaining placeholders for brand/product content

==================================================
SUCCESS CRITERIA
==================================================

The project is successful only if:
- it looks genuinely premium
- it feels custom and modern
- it is highly performant
- it is accessible
- it is conversion-focused
- it is maintainable
- it avoids library overlap
- it avoids unnecessary JS
- it is clean enough for future AI agents to extend safely

==================================================
FINAL EXECUTION INSTRUCTION
==================================================

Now execute the full implementation.

Use Astro + Tailwind + GSAP as the foundation.
Use React islands only when necessary.
Do not add 3D unless one section truly benefits and the performance cost is justified.
Favour originality, restraint, polish, and clarity over gimmicks.

Build the best version of this site.