'use strict';

const GUIDES = [
  {
    name: 'SEO, LLMO & Agent-Readiness',
    file: 'seo-llmo-guide.md',
    desc: 'Structured data, llms.txt, AI crawlers, Markdown for Agents, Content Signals, Link headers',
    topic: 'SEO/LLMO/agent-readiness practices',
    skillName: 'seo-llmo',
    skillDescription: 'Use this skill whenever the user is building, reviewing, or launching a public website or web app; SEO, LLMO, and agent-readiness are baseline for every public site. Covers meta tags, Open Graph, JSON-LD, robots.txt for AI search and training crawlers (OAI-SearchBot, GPTBot, Claude-SearchBot, ClaudeBot, PerplexityBot, Google-Extended) with Content-Signal, sitemap.xml, llms.txt, Markdown content negotiation, Link headers, A2A Agent Card, MCP Server Card and AI Catalog discovery, Agent Skills index, pricing.md, and the "explicit absence beats silence" rule. Trigger for marketing sites, landing pages, blogs, docs, and stores; before any launch or go-live; when the user mentions isitagentready.com, ORA, agent-readiness, AI Overviews, or wants ChatGPT, Claude, Perplexity, or browser agents to find and use the site; and when scaffolding a public site even if SEO is not mentioned. Skip for internal tools, admin panels, or auth-gated dashboards with no public surface.',
  },
  {
    name: 'Deploying a Static SPA on AWS',
    file: 'aws-spa-deployment-guide.md',
    desc: 'Amplify, CDK, Lambda, API Gateway, SES, CORS',
    topic: 'AWS SPA deployment',
    skillName: 'aws-spa-deploy',
    skillDescription: 'Use this skill whenever the user is deploying a React/Vite single-page app to AWS, or mentions Amplify Hosting, amplify.yml, CDK, Lambda function URLs, or wiring up Lambda + API Gateway for a frontend. Covers Amplify hosting (SPA rewrites, build cache, Node version, security headers), custom domains and certificates, CDK backend (Lambda Node.js 24 + HTTP API or function URLs), SES email, CORS configuration, and Vite environment variables. Skip for non-AWS hosts (Vercel, Netlify, Cloudflare Pages), pure backend services without an SPA, or server-rendered apps (Next.js SSR on Vercel).',
  },
  {
    name: 'Google Analytics 4',
    file: 'google-analytics-guide.md',
    desc: 'Events, e-commerce, Consent Mode v2, SPA tracking',
    topic: 'Google Analytics 4 implementation',
    skillName: 'google-analytics-4',
    skillDescription: 'Use this skill whenever the user installs, configures, or debugs Google Analytics 4, or mentions gtag.js, the Google tag, GTM, key events or conversion tracking, e-commerce events, DebugView or Tag Assistant, or a cookie/consent banner tied to analytics. Covers installation (including Google tag gateway first-party serving), first-time setup (data retention, internal and hostname filters, key events), event tracking, user properties, e-commerce, Consent Mode v2 for EEA/UK/Swiss visitors, SPA pageview tracking, and BigQuery export. Skip for other analytics products (Plausible, Mixpanel, PostHog, Segment), Universal Analytics (sunset 2024), or server-side-only tracking.',
  },
  {
    name: 'Web Accessibility',
    file: 'web-accessibility-guide.md',
    desc: 'WCAG 2.2 AA, ARIA, keyboard navigation, testing',
    topic: 'web accessibility (WCAG 2.2)',
    skillName: 'web-accessibility',
    skillDescription: 'Use this skill whenever the user is building or reviewing any web UI. Accessibility is a baseline requirement, not a niche concern. Covers WCAG 2.2 AA (including Focus Not Obscured, Target Size, Accessible Authentication), semantic HTML and native interactive elements (dialog, popover, details, invoker commands), ARIA patterns, keyboard navigation, focus management, color contrast, touch targets, forms, testing with axe / Lighthouse / screen readers, and legal context (ADA Title II and III, European Accessibility Act, EN 301 549). Trigger when generating any interactive component or page (forms, modals, menus, tooltips, tables, navigation, layouts), before any "launch" or "go live", during pre-launch checklists, when a user asks about accessibility overlays or compliance deadlines, and whenever producing new HTML/JSX markup, even if the user does not explicitly mention a11y or WCAG. Skip for backend-only changes, CLI tools, or non-UI code.',
  },
  {
    name: 'Web Performance',
    file: 'web-performance-guide.md',
    desc: 'Core Web Vitals, images, fonts, JS/CSS bundle size, CDN caching',
    topic: 'web performance and Core Web Vitals',
    skillName: 'web-performance',
    skillDescription: 'Use this skill whenever the user is improving Core Web Vitals or page load performance, or mentions slow pages, PageSpeed Insights / Lighthouse failures or insights, LCP/CLS/INP scores, bundle size, image/font optimization, or third-party script impact. Covers Core Web Vitals, LCP image priority (fetchpriority, preload, lazy loading), image formats (AVIF/WebP), font loading, JavaScript bundle size, legacy polyfills and browserslist, CSS build size, script loading (async/defer, tag managers), preconnect/dns-prefetch, critical CSS and CSP, CDN cache headers and compression, bfcache and Speculation Rules prerendering, and measurement tools (CrUX, web-vitals). Skip for backend latency tuning, database query optimization, or CI build speed.',
  },
];

function yamlSingleQuoted(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

function buildSkillFrontmatter(guide) {
  return `---\nname: ${guide.skillName}\ndescription: ${yamlSingleQuoted(guide.skillDescription)}\n---\n\n`;
}

module.exports = { GUIDES, yamlSingleQuoted, buildSkillFrontmatter };
