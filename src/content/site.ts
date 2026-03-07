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
    headline: 'Your entire growth stack,\nrun by AI.',
    subheadline:
      'Enter your website URL. Pello researches your business and shows you exactly how each product drives your growth — personalised, automated, and at scale.',
    inputPlaceholder: 'https://yoursite.com',
    inputCta: 'Analyse My Site',
    badge: 'Now in early access',
  },

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
          'To generate thousands of SEO pages or run outreach at volume, you need teams. Most companies can\'t afford that.',
      },
      {
        title: 'Agencies charge for process, not outcomes',
        description:
          'Traditional agencies bill for hours. Pello bills for results. The difference is the entire model.',
      },
    ],
  },

  howItWorks: {
    headline: 'Personalised for your business\nin three steps.',
    subheadline:
      'No generic demos. No long onboarding calls. Pello researches you first, then shows you exactly what\'s possible.',
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
          'We analyse your content, SEO posture, social presence, and ad footprint. In seconds, we have a complete picture of your growth gaps.',
      },
      {
        number: '03',
        title: 'See your personalised demos',
        description:
          'Each Pello product shows a live, tailored demo using your actual business data. PelloSEO shows your real keyword opportunities. PelloReach shows your ideal lead segments.',
      },
    ],
  },

  products: [
    {
      name: 'PelloSEO',
      url: 'https://pelloseo.com',
      tagline: 'Programmatic SEO at scale',
      description:
        'Generates 10,000+ SEO-optimised pages across every language and location. One template, thousands of pages, zero manual effort.',
      icon: 'seo',
      color: '#6366f1',
      features: ['10k+ pages per client', 'Multi-language support', 'AI page templates', 'Auto-publishing'],
    },
    {
      name: 'PelloReach',
      url: 'https://pelloreach.com',
      tagline: 'Email outreach at massive scale',
      description:
        'Hundreds of warmed domains, intelligent lead finding, and personalised email sequences that land in the inbox, not spam.',
      icon: 'reach',
      color: '#8b5cf6',
      features: ['500+ warmed domains', 'AI personalisation', 'Inbox placement tech', 'Automated sequences'],
    },
    {
      name: 'PelloPublish',
      url: 'https://pellopublish.com',
      tagline: 'Automated content at every format',
      description:
        'Blog posts, images, reels, shorts, carousels, UGC — all generated in your brand voice and published automatically.',
      icon: 'publish',
      color: '#a855f7',
      features: ['Blog & long-form', 'Video & reels', 'Carousels & UGC', 'Auto-scheduling'],
    },
    {
      name: 'PelloSocial',
      url: null,
      tagline: 'Social growth at server-farm scale',
      description:
        'AI-powered personas, geo-targeted accounts, and automated engagement — social growth infrastructure most agencies don\'t know exists.',
      icon: 'social',
      color: '#c026d3',
      features: ['AI persona network', 'Geo-targeted growth', 'Platform-native posting', 'Engagement automation'],
    },
    {
      name: 'PelloPitch',
      url: 'https://pellopitch.co',
      tagline: 'Bespoke landing pages per client',
      description:
        'AI-built, conversion-optimised landing pages and onboarding flows tailored to each visitor\'s context and intent.',
      icon: 'pitch',
      color: '#d946ef',
      features: ['Per-visitor personalisation', 'AI copywriting', 'Conversion optimisation', 'A/B testing built-in'],
    },
    {
      name: 'PelloAds',
      url: null,
      tagline: 'Mass ad variant testing at scale',
      description:
        'Tests thousands of ad creatives, copy variants, and audience segments simultaneously. Kills losers, scales winners automatically.',
      icon: 'ads',
      color: '#7c3aed',
      features: ['1000s of variants tested', 'Automated budget shifting', 'Multi-platform campaigns', 'ROI optimisation'],
    },
    {
      name: 'PelloFlow',
      url: null,
      tagline: 'Custom automations and AI agents',
      description:
        'Bespoke automation workflows and AI agents built specifically for your business. Any process. Any complexity. Fully custom.',
      icon: 'flow',
      color: '#4f46e5',
      features: ['Custom agent builds', 'Any process automated', 'API & webhook support', 'Ongoing maintenance'],
    },
    {
      name: 'PelloBuild',
      url: null,
      tagline: 'Engineering for growth teams',
      description:
        'When growth needs custom software — internal tools, data pipelines, integrations, or full applications — PelloBuild ships it.',
      icon: 'build',
      color: '#6366f1',
      features: ['Full-stack development', 'Data infrastructure', 'Internal tooling', 'Systems integration'],
    },
  ],

  useCases: [
    {
      persona: 'Founders',
      headline: 'Enterprise-grade growth without the enterprise headcount',
      description:
        'Pello gives early-stage founders access to the same growth infrastructure that was previously reserved for companies with 20-person marketing teams.',
      tags: ['SEO', 'Outreach', 'Content'],
    },
    {
      persona: 'Marketing Teams',
      headline: 'Your team sets the strategy. Pello executes it at scale.',
      description:
        'Stop spending 80% of your time on production. Connect your playbooks to Pello and watch output multiply — without growing headcount.',
      tags: ['Content', 'Social', 'Ads'],
    },
    {
      persona: 'Agencies',
      headline: 'Deliver more, margin more, with less manual work',
      description:
        'White-label Pello\'s infrastructure to deliver programmatic SEO, automated content, and outreach campaigns to your clients at 10x the speed.',
      tags: ['All Products', 'White-label', 'Scale'],
    },
  ],

  testimonials: [
    {
      quote:
        'We went from 200 indexed pages to over 14,000 in three months. Organic traffic is up 340%. PelloSEO is the most significant growth lever we\'ve ever pulled.',
      author: 'Marcus Chen',
      role: 'Head of Growth',
      company: 'Ventis Labs',
    },
    {
      quote:
        'Our outreach reply rate doubled when we switched to PelloReach. The inbox placement is unlike anything we\'d seen — and the AI personalisation at scale is genuinely impressive.',
      author: 'Sophie Andersen',
      role: 'Co-founder',
      company: 'Arclight Analytics',
    },
    {
      quote:
        'We replaced three separate agencies with Pello. The output is better, the reporting is cleaner, and we\'re saving $40k a month.',
      author: 'Jared Williams',
      role: 'CMO',
      company: 'Forefront Commerce',
    },
  ],

  stats: [
    { value: '10,000+', label: 'SEO pages per client', description: 'Generated automatically across languages and locations' },
    { value: '3.4x', label: 'Average traffic lift', description: 'Across clients using PelloSEO within 90 days' },
    { value: '500+', label: 'Warmed outreach domains', description: 'For high-deliverability email at scale' },
    { value: '8', label: 'Growth channels', description: 'All unified under one account and dashboard' },
  ],

  faq: [
    {
      question: 'How does the personalised demo work?',
      answer:
        'You enter your website URL. Pello\'s AI scrapes and analyses your business — your industry, content, keywords, competitors, and audience. It then generates a tailored demo for each product showing exactly how Pello would drive growth for your specific business. No generic slides. No sales call required.',
    },
    {
      question: 'Do I need to sign up for all products?',
      answer:
        'No. Each Pello product is available independently. You can start with PelloSEO and add PelloReach later. One account, one login, across the entire suite.',
    },
    {
      question: 'How long does it take to get started?',
      answer:
        'The personalised analysis takes under 60 seconds. Onboarding to any product is designed to be fast — most clients see first output within 24-48 hours.',
    },
    {
      question: 'Is there a free trial?',
      answer:
        'We offer a personalised demo at no cost. Pricing is tailored to your growth goals and the products you need. Request early access and we\'ll walk you through options.',
    },
    {
      question: 'What makes PelloSEO different from other programmatic SEO tools?',
      answer:
        'PelloSEO is built around intelligent page templates — not just bulk generation. Every template is designed to rank, convert, and maintain quality at scale. We handle the content, the publishing, and the ongoing optimisation.',
    },
    {
      question: 'Who is Pello best suited for?',
      answer:
        'Growth-focused founders, in-house marketing teams, and agencies who need to scale output without scaling headcount. If you\'re spending too much on fragmented tools or expensive agencies, Pello is built for you.',
    },
  ],

  finalCta: {
    headline: 'See what Pello can\ndo for your business.',
    subheadline:
      'Enter your URL. Get a personalised analysis and demo in under 60 seconds. No sales call required.',
    cta: 'Get Early Access',
    note: 'Free personalised demo. No credit card required.',
  },

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
      { label: 'Contact', href: '#' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
} as const;
