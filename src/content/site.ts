/**
 * site.ts — Single source of truth for all marketing copy and configuration.
 * Edit this file to update any text, links, or product information on the site.
 */

export const site = {
  name: 'Pello',
  domain: 'pello.co',
  url: 'https://pello.co',
  tagline: 'One platform. Every growth channel.',
  description:
    'Pello is an AI-powered full-stack growth platform. Enter your URL — AI researches your business and shows you personalised demos across SEO, outreach, content, social, ads, and more.',
  email: 'hello@pello.co',

  social: {
    twitter: 'https://x.com/pelloco',
    linkedin: 'https://linkedin.com/company/pelloco',
  },

  nav: [
    { label: 'Products', href: '#products' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Use Cases', href: '#use-cases' },
    { label: 'FAQ', href: '#faq' },
  ],

  cta: {
    primary: 'Get Early Access',
    secondary: 'See How It Works',
    primaryHref: '#early-access',
    secondaryHref: '#how-it-works',
  },

  hero: {
    headline: 'Every growth channel.\nOne AI-powered platform.',
    subheadline:
      'Pello unifies SEO, outreach, content, social, ads, and automation into a single growth engine. Enter your website — our AI shows you exactly how each channel drives your growth.',
    inputPlaceholder: 'https://yoursite.com',
    inputCta: 'See Your Growth Plan',
    badge: 'Now in Early Access',
  },

  howItWorks: {
    label: 'How It Works',
    headline: 'Personalised for your business in 60 seconds.',
    subheadline: 'No generic demos. No sales calls. Pello researches you first.',
    steps: [
      {
        number: '01',
        title: 'Enter your website URL',
        description:
          'Drop your URL into Pello. Our AI immediately starts researching your business, industry, audience, and competitive landscape.',
      },
      {
        number: '02',
        title: 'AI builds your growth profile',
        description:
          'We analyse your content, SEO posture, social presence, and ad footprint. In seconds, we have a complete picture of where you can grow.',
      },
      {
        number: '03',
        title: 'See your personalised demos',
        description:
          'Each product shows a live, tailored demo using your actual business data. Real keyword opportunities. Real lead segments. Real growth potential.',
      },
    ],
  },

  products: [
    {
      name: 'PelloSEO',
      url: 'https://pelloseo.com',
      tagline: 'Programmatic SEO at scale',
      headline: '10,000 pages.\nZero manual effort.',
      description:
        'Most businesses have a few hundred SEO pages. Your competitors have tens of thousands. PelloSEO closes that gap — AI generates optimised page templates that automatically produce thousands of pages across languages, locations, and topics. Your team approves the strategy. PelloSEO does everything else.',
      icon: 'seo',
      color: '#6366f1',
      features: [
        'AI-generated page templates',
        'Multi-language & multi-location',
        'Auto-publishing to your CMS',
        'Ongoing SEO monitoring',
      ],
      cta: { label: 'Explore PelloSEO', href: 'https://pelloseo.com' },
    },
    {
      name: 'PelloReach',
      url: 'https://pelloreach.com',
      tagline: 'Email outreach at massive scale',
      headline: 'Land in the inbox.\nNot spam.',
      description:
        'Cold outreach fails because of deliverability. PelloReach solves that with 500+ warmed domains, intelligent lead finding, and AI-personalised sequences that actually get replies. No blacklists. No spam folders. Just conversations with the right people.',
      icon: 'reach',
      color: '#8b5cf6',
      features: [
        '500+ pre-warmed domains',
        'AI-personalised sequences',
        'Inbox placement technology',
        'Automated lead discovery',
      ],
      cta: { label: 'Explore PelloReach', href: 'https://pelloreach.com' },
    },
    {
      name: 'PelloPublish',
      url: 'https://pellopublish.com',
      tagline: 'Content that creates itself',
      headline: 'Every format. Your voice.\nZero effort.',
      description:
        "PelloPublish learns your brand's voice, tone, and style — then produces content across every format at scale. Blog posts, social carousels, short-form video, long-form articles, UGC-style content. Scheduled, published, and optimised automatically.",
      icon: 'publish',
      color: '#a855f7',
      features: [
        'Blog posts & long-form articles',
        'Video, reels & shorts',
        'Social carousels & UGC',
        'Auto-scheduling across platforms',
      ],
      cta: { label: 'Explore PelloPublish', href: 'https://pellopublish.com' },
    },
    {
      name: 'PelloSocial',
      url: null,
      tagline: 'Social growth infrastructure',
      headline: 'Growth at\nserver-farm scale.',
      description:
        "PelloSocial is social media growth infrastructure that most agencies don't know exists. AI-powered personas, geo-targeted accounts, and automated engagement — running on dedicated hardware across target markets. Platform-native content, real engagement patterns, measurable growth.",
      icon: 'social',
      color: '#c026d3',
      features: [
        'AI persona network',
        'Geo-targeted placement',
        'Platform-native content',
        'Automated engagement at scale',
      ],
      cta: { label: 'Learn More', href: '#contact' },
    },
    {
      name: 'PelloPitch',
      url: 'https://pellopitch.co',
      tagline: 'Landing pages that know your visitor',
      headline: 'Every visitor gets\ntheir own page.',
      description:
        'Generic landing pages convert at 2–3%. PelloPitch pages convert at 8–12%. The difference: AI builds a unique page for every visitor based on their source, industry, and intent. The copy adapts. The layout shifts. The offer changes. Every visit is personalised.',
      icon: 'pitch',
      color: '#d946ef',
      features: [
        'Per-visitor personalisation',
        'AI-written conversion copy',
        'Real-time A/B testing',
        'Conversion optimisation engine',
      ],
      cta: { label: 'Explore PelloPitch', href: 'https://pellopitch.co' },
    },
    {
      name: 'PelloAds',
      url: null,
      tagline: 'Test thousands. Scale the winners.',
      headline: 'Thousands of ads.\nOne click.',
      description:
        'Most ad teams test 10–20 variants per campaign. PelloAds tests thousands — different creatives, copy, audiences, and placements — simultaneously. Losers get killed automatically. Winners get budget. Every dollar goes further.',
      icon: 'ads',
      color: '#7c3aed',
      features: [
        'Thousands of variants tested',
        'Automated budget reallocation',
        'Multi-platform campaigns',
        'Real-time ROI optimisation',
      ],
      cta: { label: 'Learn More', href: '#contact' },
    },
    {
      name: 'PelloFlow',
      url: null,
      tagline: 'Your business. Fully automated.',
      headline: 'Any process. Any complexity.\nAutomated.',
      description:
        "PelloFlow builds custom automation workflows and AI agents designed specifically for your business. From lead routing to data processing to customer onboarding — if it's a process, PelloFlow automates it. Custom-built, maintained, and evolved as your business grows.",
      icon: 'flow',
      color: '#4f46e5',
      features: [
        'Custom AI agents',
        'End-to-end process automation',
        'API & webhook integration',
        'Ongoing maintenance',
      ],
      cta: { label: 'Learn More', href: '#contact' },
    },
    {
      name: 'PelloBuild',
      url: null,
      tagline: 'Engineering for growth teams',
      headline: 'When growth needs\ncustom code.',
      description:
        "Sometimes growth requires software that doesn't exist yet. Internal tools, data pipelines, integrations, or full applications — PelloBuild is a dedicated engineering team that ships exactly what you need. Fast, reliable, and built to scale.",
      icon: 'build',
      color: '#6366f1',
      features: [
        'Full-stack development',
        'Data infrastructure',
        'Internal tooling',
        'Systems integration',
      ],
      cta: { label: 'Learn More', href: '#contact' },
    },
  ],

  useCases: [
    {
      persona: 'Founders',
      headline: 'Enterprise-grade growth without the enterprise headcount.',
      description:
        'Access the same growth infrastructure that was previously reserved for companies with 20-person marketing teams. Pello gives you SEO, outreach, content, and social — all automated, all from day one.',
      tags: ['SEO', 'Outreach', 'Content'],
    },
    {
      persona: 'Marketing Teams',
      headline: 'Your team sets the strategy. Pello executes at scale.',
      description:
        'Stop spending 80% of your time on production. Connect your playbooks to Pello and watch output multiply — without growing headcount.',
      tags: ['Content', 'Social', 'Ads'],
    },
    {
      persona: 'Agencies',
      headline: 'Deliver more. Margin more. Hire less.',
      description:
        "White-label Pello's infrastructure to deliver programmatic SEO, automated content, and outreach campaigns to your clients at 10x the speed.",
      tags: ['All Products', 'White-label', 'Scale'],
    },
  ],

  stats: [
    {
      value: '10,000',
      suffix: '+',
      label: 'SEO pages per client',
      description: 'Generated automatically across languages and locations',
    },
    {
      value: '3.4',
      suffix: 'x',
      label: 'Average traffic lift',
      description: 'Across clients using PelloSEO within 90 days',
    },
    {
      value: '500',
      suffix: '+',
      label: 'Warmed outreach domains',
      description: 'For high-deliverability email at scale',
    },
    {
      value: '8',
      suffix: '',
      label: 'Growth channels',
      description: 'All unified under one account and dashboard',
    },
  ],

  faq: [
    {
      question: 'How does the personalised demo work?',
      answer:
        "You enter your website URL. Pello's AI scrapes and analyses your business — your industry, content, keywords, competitors, and audience. It then generates a tailored demo for each product showing exactly how Pello would drive growth for your specific business. No generic slides. No sales call required.",
    },
    {
      question: 'Do I need to sign up for all products?',
      answer:
        'No. Each Pello product is available independently. You can start with PelloSEO and add PelloReach later. One account, one login, across the entire suite.',
    },
    {
      question: 'How long does it take to get started?',
      answer:
        'The personalised analysis takes under 60 seconds. Onboarding to any product is designed to be fast — most clients see first output within 24–48 hours.',
    },
    {
      question: 'Is there a free trial?',
      answer:
        "We offer a personalised demo at no cost. Pricing is tailored to your growth goals and the products you need. Request early access and we'll walk you through options.",
    },
    {
      question: 'What makes PelloSEO different from other programmatic SEO tools?',
      answer:
        'PelloSEO is built around intelligent page templates — not just bulk generation. Every template is designed to rank, convert, and maintain quality at scale. We handle the content, the publishing, and the ongoing optimisation.',
    },
    {
      question: 'Who is Pello best suited for?',
      answer:
        "Growth-focused founders, in-house marketing teams, and agencies who need to scale output without scaling headcount. If you're spending too much on fragmented tools or expensive agencies, Pello is built for you.",
    },
  ],

  finalCta: {
    headline: 'See what Pello can do\nfor your business.',
    subheadline: 'Enter your URL. Get a personalised analysis in under 60 seconds.',
    cta: 'Get Early Access',
    note: 'Free personalised demo. No credit card required.',
  },

  // Legacy sections (kept for TypeScript compatibility with existing components)
  trustStrip: {
    label: 'Trusted by growth teams at',
    metrics: [
      { value: '10,000+', label: 'pages generated per client' },
      { value: '500+', label: 'warmed outreach domains' },
      { value: '8', label: 'growth channels unified' },
      { value: '100%', label: 'AI automated' },
    ],
  },

  problem: {
    headline: 'Growth tools are broken by design.',
    subheadline:
      "You're paying for 12 different platforms that don't talk to each other, managed by an overworked team chasing marginal gains.",
    pains: [
      {
        title: 'Fragmented tools, fragmented results',
        description:
          'SEO, outreach, content, ads, and social each run in isolation. No shared context. No compounding effect.',
      },
      {
        title: 'Scale is impossible without headcount',
        description:
          "To generate thousands of SEO pages or run outreach at volume, you need teams. Most companies can't afford that.",
      },
      {
        title: 'Agencies charge for process, not outcomes',
        description:
          'Traditional agencies bill for hours. Pello bills for results. The difference is the entire model.',
      },
    ],
  },

  testimonials: [
    {
      quote:
        "We went from 200 indexed pages to over 14,000 in three months. Organic traffic is up 340%. PelloSEO is the most significant growth lever we've ever pulled.",
      author: 'Marcus Chen',
      role: 'Head of Growth',
      company: 'Ventis Labs',
    },
    {
      quote:
        "Our outreach reply rate doubled when we switched to PelloReach. The inbox placement is unlike anything we'd seen — and the AI personalisation at scale is genuinely impressive.",
      author: 'Sophie Andersen',
      role: 'Co-founder',
      company: 'Arclight Analytics',
    },
    {
      quote:
        "We replaced three separate agencies with Pello. The output is better, the reporting is cleaner, and we're saving $40k a month.",
      author: 'Jared Williams',
      role: 'CMO',
      company: 'Forefront Commerce',
    },
  ],

  footer: {
    tagline: 'One platform. Every growth channel.',
    products: [
      { label: 'PelloSEO', href: 'https://pelloseo.com' },
      { label: 'PelloReach', href: 'https://pelloreach.com' },
      { label: 'PelloPublish', href: 'https://pellopublish.com' },
      { label: 'PelloSocial', href: '#products' },
      { label: 'PelloPitch', href: 'https://pellopitch.co' },
      { label: 'PelloAds', href: '#products' },
      { label: 'PelloFlow', href: '#products' },
      { label: 'PelloBuild', href: '#products' },
    ],
    company: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#contact' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
} as const;
