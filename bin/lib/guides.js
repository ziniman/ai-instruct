'use strict';

const GUIDES = [
  {
    name: 'SEO & LLMO Implementation',
    file: 'seo-llmo-guide.md',
    desc: 'Structured data, llms.txt, AI crawlers, Core Web Vitals',
    topic: 'SEO/LLMO practices',
    skillName: 'seo-llmo',
    skillDescription: 'Use this skill whenever the user is building, reviewing, or preparing to launch any public-facing website or web app. SEO and LLMO are baseline requirements for every public site, not optional add-ons. Covers meta tags, Open Graph, JSON-LD structured data, robots.txt, sitemap.xml, llms.txt, and AI crawler access (GPTBot, ClaudeBot, PerplexityBot). Trigger for marketing sites, landing pages, blogs, docs, and e-commerce stores; before any "launch" or "go live"; during pre-launch checklists; and when scaffolding a new public site, even if the user does not explicitly mention SEO. Skip for internal tools, admin panels, or auth-gated dashboards with no public surface.',
  },
  {
    name: 'Deploying a Static SPA on AWS',
    file: 'aws-spa-deployment-guide.md',
    desc: 'Amplify, CDK, Lambda, API Gateway, SES, CORS',
    topic: 'AWS SPA deployment',
    skillName: 'aws-spa-deploy',
    skillDescription: 'Use this skill whenever the user is deploying a React/Vite single-page app to AWS, or mentions Amplify, CDK, or wiring up Lambda + API Gateway for a frontend. Covers Amplify hosting, custom domains, CDK backend (Lambda + API Gateway), SES email, CORS configuration, and environment variables. Skip for non-AWS hosts (Vercel, Netlify, Cloudflare Pages), pure backend services without an SPA, or server-rendered apps (Next.js SSR on Vercel).',
  },
  {
    name: 'Google Analytics 4',
    file: 'google-analytics-guide.md',
    desc: 'Events, e-commerce, Consent Mode v2, SPA tracking',
    topic: 'Google Analytics 4 implementation',
    skillName: 'google-analytics-4',
    skillDescription: 'Use this skill whenever the user installs, configures, or debugs Google Analytics 4, or mentions gtag.js, GTM, conversion tracking, e-commerce events, or a cookie/consent banner tied to analytics. Covers installation, event tracking, user properties, e-commerce, Consent Mode v2 for EU/UK visitors, SPA pageview tracking, and BigQuery export. Skip for other analytics products (Plausible, Mixpanel, PostHog, Segment), Universal Analytics (sunset 2024), or server-side-only tracking.',
  },
  {
    name: 'Web Accessibility',
    file: 'web-accessibility-guide.md',
    desc: 'WCAG 2.2 AA, ARIA, keyboard navigation, testing',
    topic: 'web accessibility (WCAG 2.2)',
    skillName: 'web-accessibility',
    skillDescription: 'Use this skill whenever the user is building or reviewing any web UI. Accessibility is a baseline requirement, not a niche concern. Covers WCAG 2.2 AA, semantic HTML, ARIA patterns, keyboard navigation, focus management, color contrast, touch targets, forms, and testing with axe / screen readers. Trigger when generating any interactive component or page (forms, modals, menus, tables, navigation, layouts), before any "launch" or "go live", during pre-launch checklists, and whenever producing new HTML/JSX markup, even if the user does not explicitly mention a11y or WCAG. Skip for backend-only changes, CLI tools, or non-UI code.',
  },
  {
    name: 'Web Performance',
    file: 'web-performance-guide.md',
    desc: 'Core Web Vitals, images, fonts, JS/CSS bundle size, CDN caching',
    topic: 'web performance and Core Web Vitals',
    skillName: 'web-performance',
    skillDescription: 'Use this skill whenever the user is improving Core Web Vitals or page load performance, or mentions slow pages, PageSpeed Insights / Lighthouse failures, LCP/CLS/INP scores, bundle size, image/font optimization, or third-party script impact. Covers Core Web Vitals, image and font optimization, JavaScript bundle size, CSS build size, CDN caching, third-party JavaScript impact, and measurement tools. Skip for backend latency tuning, database query optimization, or CI build speed.',
  },
];

function yamlSingleQuoted(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

function buildSkillFrontmatter(guide) {
  return `---\nname: ${guide.skillName}\ndescription: ${yamlSingleQuoted(guide.skillDescription)}\n---\n\n`;
}

module.exports = { GUIDES, yamlSingleQuoted, buildSkillFrontmatter };
