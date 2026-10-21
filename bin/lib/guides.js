'use strict';

const GUIDES = [
  {
    name: 'SEO, LLMO & Agent-Readiness',
    file: 'seo-llmo-guide.md',
    desc: 'Structured data, llms.txt, AI crawlers, Markdown for Agents, Content Signals, Link headers',
    topic: 'SEO/LLMO/agent-readiness practices',
    skillName: 'seo-llmo',
    skillDescription: 'Use this skill whenever the user is building, reviewing, or launching a public website or web app; SEO, LLMO, and agent-readiness are baseline for every public site. Covers meta tags, Open Graph, JSON-LD, robots.txt for AI search and training crawlers (OAI-SearchBot, GPTBot, Claude-SearchBot, ClaudeBot, PerplexityBot, Google-Extended) with Content-Signal, sitemap.xml, llms.txt, Markdown content negotiation, Link headers, A2A Agent Card, MCP Server Card and AI Catalog discovery, Agent Skills index, pricing.md, and the "explicit absence beats silence" rule. Trigger for marketing sites, landing pages, blogs, docs, and stores; before any launch or go-live; when the user mentions isitagentready.com, ORA, agent-readiness, AI Overviews, or wants ChatGPT, Claude, Perplexity, or browser agents to find and use the site; and when scaffolding a public site even if SEO is not mentioned. Skip for internal tools, admin panels, or auth-gated dashboards with no public surface.',
    sectionSummaries: {
      'Static Hosting Notes':
        'deploying to AWS Amplify, CloudFront + S3, Netlify, or Vercel and you need SPA rewrites, headers, or content negotiation configured on that host.',
      'Validation':
        'after deploying, to check structured data, social previews, crawl access, agent-readiness, cross-surface consistency, performance, and indexing.',
    },
  },
  {
    name: 'Deploying a Static SPA on AWS',
    file: 'aws-spa-deployment-guide.md',
    desc: 'Amplify, CDK, Lambda, API Gateway, SES, CORS',
    topic: 'AWS SPA deployment',
    skillName: 'aws-spa-deploy',
    skillDescription: 'Use this skill whenever the user is deploying a React/Vite single-page app to AWS, or mentions Amplify Hosting, amplify.yml, CDK, Lambda function URLs, or wiring up Lambda + API Gateway for a frontend. Covers Amplify hosting (SPA rewrites, build cache, Node version, security headers), custom domains and certificates, CDK backend (Lambda Node.js 24 + HTTP API or function URLs), SES email, CORS configuration, and Vite environment variables. Skip for non-AWS hosts (Vercel, Netlify, Cloudflare Pages), pure backend services without an SPA, or server-rendered apps (Next.js SSR on Vercel).',
    sectionSummaries: {
      'Architecture':
        'starting out, to see how Amplify Hosting, the separate CDK backend, and VITE_* variables fit together (and when an amplify/ directory means a different setup).',
      'Costs at a glance':
        'the user asks what the stack will cost or which free allowances apply.',
      'Amplify Hosting':
        'setting up or fixing Amplify Hosting: amplify.yml, SPA rewrites, custom domain and SSL, environment variables, build cache, Node.js version, or security headers.',
      'CDK Backend':
        'adding or changing the backend: API Gateway vs Lambda function URLs, Lambda runtime, project structure, bootstrapping, the minimal stack, CORS, and deploy order.',
      'SES Email':
        'the backend sends email: domain verification, IAM scoping, sending from Lambda, abuse controls, and leaving the SES sandbox.',
      'Common problems':
        'something is broken: symptom to fix table, Amplify build logs, CORS errors, and Lambda timeouts.',
    },
  },
  {
    name: 'Google Analytics 4',
    file: 'google-analytics-guide.md',
    desc: 'Events, e-commerce, Consent Mode v2, SPA tracking',
    topic: 'Google Analytics 4 implementation',
    skillName: 'google-analytics-4',
    skillDescription: 'Use this skill whenever the user installs, configures, or debugs Google Analytics 4, or mentions gtag.js, the Google tag, GTM, key events or conversion tracking, e-commerce events, DebugView or Tag Assistant, or a cookie/consent banner tied to analytics. Covers installation (including Google tag gateway first-party serving), first-time setup (data retention, internal and hostname filters, key events), event tracking, user properties, e-commerce, Consent Mode v2 for EEA/UK/Swiss visitors, SPA pageview tracking, and BigQuery export. Skip for other analytics products (Plausible, Mixpanel, PostHog, Segment), Universal Analytics (sunset 2024), or server-side-only tracking.',
    sectionSummaries: {
      'Installation':
        'adding GA4 to a site: gtag.js, Google Tag Manager, or Google tag gateway (first-party serving).',
      'Basic Configuration':
        'setting gtag config options such as debug mode, cookie settings, or disabling the automatic page_view.',
      'Critical First-Time Setup':
        'right after installing, before production traffic: data retention, internal and hostname filters, key events, custom dimensions.',
      'Common Pitfalls':
        'reviewing or debugging any GA4 setup; a short list of mistakes that silently break tracking.',
      'Event Tracking':
        'tracking user actions with gtag event syntax, standard events, or custom events.',
      'Enhanced Measurement':
        'deciding which events GA4 already tracks automatically before adding custom ones.',
      'User Properties & Custom Dimensions':
        'setting user properties or a User ID for cross-device tracking.',
      'E-commerce Tracking':
        'the user confirmed purchase or sales tracking: view_item, add_to_cart, begin_checkout, purchase.',
      'Consent Mode v2':
        'the site may have EEA, UK, or Swiss visitors, or uses a cookie or consent banner.',
      'Single-Page Apps':
        'the site is a SPA and route changes must produce page_view events (Enhanced Measurement history events, manual page_view, or GTM).',
      'Debugging':
        'events are missing or wrong: DebugView, raw network requests, logging gtag calls.',
      'Validation & Testing':
        'before launch, to verify the implementation with the pre-launch checklist.',
      'Advanced: BigQuery Export & Sampling':
        'reports are sampled, raw event data is needed in BigQuery, or attribution models come up.',
    },
  },
  {
    name: 'Web Accessibility',
    file: 'web-accessibility-guide.md',
    desc: 'WCAG 2.2 AA, ARIA, keyboard navigation, testing',
    topic: 'web accessibility (WCAG 2.2)',
    skillName: 'web-accessibility',
    skillDescription: 'Use this skill whenever the user is building or reviewing any web UI. Accessibility is a baseline requirement, not a niche concern. Covers WCAG 2.2 AA (including Focus Not Obscured, Target Size, Accessible Authentication), semantic HTML and native interactive elements (dialog, popover, details, invoker commands), ARIA patterns, keyboard navigation, focus management, color contrast, touch targets, forms, testing with axe / Lighthouse / screen readers, and legal context (ADA Title II and III, European Accessibility Act, EN 301 549). Trigger when generating any interactive component or page (forms, modals, menus, tooltips, tables, navigation, layouts), before any "launch" or "go live", during pre-launch checklists, when a user asks about accessibility overlays or compliance deadlines, and whenever producing new HTML/JSX markup, even if the user does not explicitly mention a11y or WCAG. Skip for backend-only changes, CLI tools, or non-UI code.',
    sectionSummaries: {
      'Legal & Compliance':
        'the user asks about legal obligations or deadlines (ADA Title II and III, European Accessibility Act, EN 301 549, Section 508) or accessibility overlays.',
      'WCAG Standards Overview':
        'choosing a conformance target (A, AA, AAA) or explaining why 2.2 AA is the default.',
      'WCAG 2.2: What\'s New':
        'checking against criteria added in WCAG 2.2: focus not obscured, dragging, target size, accessible authentication, redundant entry, consistent help.',
      'Semantic HTML':
        'generating any markup: page landmarks, choosing the right element, and native interactive elements (dialog, popover, details, invoker commands).',
      'Keyboard Navigation':
        'building interactive components: skip links, focus order and tabindex, keyboard interactions for custom widgets.',
      'ARIA':
        'native HTML is not enough and ARIA attributes or roles are needed (labels, descriptions, expanded, hidden, live regions).',
      'Images & Media':
        'adding images, SVG, video, or audio: alt text, captions, transcripts.',
      'Forms':
        'building forms: labels, autocomplete tokens, required fields, error messages, fieldsets, multi-step forms.',
      'Touch & Pointer':
        'the UI targets touch or mobile, or has tooltips and content shown on hover or focus.',
      'Color & Contrast':
        'choosing colors, design tokens, or a theme: contrast ratios, semi-transparent text, brand colors, Tailwind slate reference.',
      'Focus Management':
        'styling focus indicators, building dialogs and modals, or updating content dynamically.',
      'Motion & Animation':
        'adding animations or transitions; respect prefers-reduced-motion.',
      'Testing':
        'auditing a page: automated scans, keyboard-only, screen readers, zoom, text spacing, color and vision checks.',
      'Anti-Patterns to Flag':
        'reviewing code or generating UI; patterns to call out actively.',
      'Checklist by Product Type':
        'before launch, for a baseline checklist plus additions for e-commerce, web apps, media sites, and mobile.',
    },
  },
  {
    name: 'Web Performance',
    file: 'web-performance-guide.md',
    desc: 'Core Web Vitals, images, fonts, JS/CSS bundle size, CDN caching',
    topic: 'web performance and Core Web Vitals',
    skillName: 'web-performance',
    skillDescription: 'Use this skill whenever the user is improving Core Web Vitals or page load performance, or mentions slow pages, PageSpeed Insights / Lighthouse failures or insights, LCP/CLS/INP scores, bundle size, image/font optimization, or third-party script impact. Covers Core Web Vitals, LCP image priority (fetchpriority, preload, lazy loading), image formats (AVIF/WebP), font loading, JavaScript bundle size, legacy polyfills and browserslist, CSS build size, script loading (async/defer, tag managers), preconnect/dns-prefetch, critical CSS and CSP, CDN cache headers and compression, bfcache and Speculation Rules prerendering, and measurement tools (CrUX, web-vitals). Skip for backend latency tuning, database query optimization, or CI build speed.',
    sectionSummaries: {
      'Measurement and Validation':
        'measuring before and after changes: lab data, field data, network and runtime inspection, in-browser tools, continuous monitoring.',
      'Checklist':
        'before deploying a new page or feature, and after deploying to production.',
    },
  },
];

function yamlSingleQuoted(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

function buildSkillFrontmatter(guide) {
  return `---\nname: ${guide.skillName}\ndescription: ${yamlSingleQuoted(guide.skillDescription)}\n---\n\n`;
}

// Turns one guide into the files of a Claude Code skill.
//
// Short guides become a single SKILL.md (frontmatter + guide body). Guides whose
// single-file output would exceed MAX_SKILL_LINES use progressive disclosure:
// SKILL.md keeps the header, Section 0 and an index, and every other H2 section
// moves to references/<slug>.md. Intra-guide anchor links are rewritten so they
// keep pointing at the right file.
//
// Used by scripts/build-skills.js (strict) and by the CLI fallback when the
// package ships without prebuilt skills (lenient).

// Agent Skills guidance: keep SKILL.md under 500 lines.
const MAX_SKILL_LINES = 500;
const REFERENCES_DIR = 'references';

function lineCount(text) {
  return text.replace(/\n$/, '').split('\n').length;
}

// Returns [line, inFence] for every line, where inFence is true for fenced code
// lines including the fence markers themselves.
function scanLines(lines) {
  const out = [];
  let fence = null;
  for (const line of lines) {
    if (fence) {
      out.push([line, true]);
      const close = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) fence = null;
      continue;
    }
    const open = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (open) {
      fence = open[1];
      out.push([line, true]);
      continue;
    }
    out.push([line, false]);
  }
  return out;
}

function headingOf(line) {
  const m = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
  return m ? { level: m[1].length, text: m[2] } : null;
}

// GitHub-style anchor slug (what `#anchor` links in the guides are written against).
function githubSlug(text) {
  return text
    .replace(/`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, '')
    .replace(/ /g, '-');
}

// File-name slug for a reference file: lowercase ASCII words joined by hyphens.
function fileSlug(text) {
  return text
    .replace(/`/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function trimSection(lines) {
  const out = lines.slice();
  for (;;) {
    while (out.length && out[0].trim() === '') out.shift();
    while (out.length && out[out.length - 1].trim() === '') out.pop();
    if (out.length && out[out.length - 1].trim() === '---') {
      out.pop();
      continue;
    }
    return out;
  }
}

// Splits the guide body into its preamble (before the first H2) and H2 sections.
function splitSections(body) {
  const scanned = scanLines(body.split('\n'));
  const preamble = [];
  const sections = [];
  let current = null;
  for (const [line, inFence] of scanned) {
    const h = inFence ? null : headingOf(line);
    if (h && h.level === 2) {
      current = { title: h.text, lines: [line] };
      sections.push(current);
    } else if (current) {
      current.lines.push(line);
    } else {
      preamble.push(line);
    }
  }
  return { preamble, sections };
}

function summaryFor(guide, section) {
  const override = (guide.sectionSummaries || {})[section.title];
  if (override) return override;
  for (const [line, inFence] of scanLines(section.lines.slice(1))) {
    if (inFence || line.trim() === '') continue;
    const m = line.match(/^Applies when:\s*(.+)$/);
    return m ? m[1].trim() : null;
  }
  return null;
}

// Rewrites `](#anchor)` links outside code so they resolve from `fromFile`.
function rewriteLinks(lines, fromFile, anchors, problems) {
  return scanLines(lines).map(([line, inFence]) => {
    if (inFence) return line;
    return line
      .split(/(`+[^`]*`+)/)
      .map((part, i) => {
        if (i % 2 === 1) return part;
        return part.replace(/\]\(#([^)\s]+)\)/g, (whole, anchor) => {
          const target = anchors.get(anchor);
          if (!target) {
            problems.push(`${fromFile}: link to unknown anchor #${anchor}`);
            return whole;
          }
          if (target.file === fromFile) return `](#${target.slug})`;
          const fromDir = fromFile.includes('/') ? fromFile.slice(0, fromFile.lastIndexOf('/') + 1) : '';
          let rel;
          if (fromDir && target.file.startsWith(fromDir)) rel = target.file.slice(fromDir.length);
          else if (fromDir) rel = `../${target.file}`;
          else rel = target.file;
          return target.isFileTop ? `](${rel})` : `](${rel}#${target.slug})`;
        });
      })
      .join('');
  });
}

// Returns [{ path, content }] relative to the skill directory. With strict,
// throws on anything that would ship a broken or oversized skill; otherwise
// passes each problem to onProblem and returns the files anyway.
function buildSkillFiles(guide, body, { strict = true, onProblem = () => {} } = {}) {
  const frontmatter = buildSkillFrontmatter(guide);
  const single = frontmatter + body;
  if (lineCount(single) <= MAX_SKILL_LINES) {
    return [{ path: 'SKILL.md', content: single }];
  }

  const problems = [];
  const { preamble, sections } = splitSections(body);
  const section0 = sections.find(s => /^Section 0\b/.test(s.title));
  if (!section0) throw new Error(`${guide.file}: no "Section 0" H2 found`);

  // Every other H2 except the guide's own table of contents becomes a reference.
  const refs = sections
    .filter(s => s !== section0 && s.title !== 'Contents')
    .map(s => ({ src: s, title: s.title, lines: s.lines, file: `${REFERENCES_DIR}/${fileSlug(s.title)}.md`, summary: summaryFor(guide, s) }));

  const seenFiles = new Set();
  for (const r of refs) {
    if (seenFiles.has(r.file)) problems.push(`${guide.file}: two sections map to ${r.file}`);
    seenFiles.add(r.file);
    if (!r.summary) problems.push(`${guide.file}: section "${r.title}" needs an "Applies when:" line or a sectionSummaries entry in bin/lib/guides.js`);
  }
  const titles = new Set(sections.map(s => s.title));
  for (const key of Object.keys(guide.sectionSummaries || {})) {
    if (!titles.has(key)) problems.push(`${guide.file}: sectionSummaries has "${key}" but the guide has no such H2`);
  }

  // Map every guide-level anchor to the file and file-level anchor it lands in.
  const anchors = new Map();
  const guideCounts = new Map();
  const fileCounts = new Map();
  const place = (lines, file) => {
    for (const [line, inFence] of scanLines(lines)) {
      const h = inFence ? null : headingOf(line);
      if (!h) continue;
      const base = githubSlug(h.text);
      const g = guideCounts.get(base) || 0;
      guideCounts.set(base, g + 1);
      const key = `${file}\0${base}`;
      const f = fileCounts.get(key) || 0;
      fileCounts.set(key, f + 1);
      anchors.set(g ? `${base}-${g}` : base, {
        file,
        slug: f ? `${base}-${f}` : base,
        isFileTop: file !== 'SKILL.md' && h.level === 2,
      });
    }
  };
  place(preamble, 'SKILL.md');
  for (const s of sections) {
    const ref = refs.find(r => r.src === s);
    place(s.lines, ref ? ref.file : 'SKILL.md');
  }

  const index = [
    '## Contents',
    '',
    'This guide is split into reference files. Use the Section 0 answers to decide which apply, then read only those; skip the rest.',
    '',
    ...refs.map(r => `- [${r.title}](${r.file})${r.summary ? `: ${r.summary.replace(/^\w/, c => c.toUpperCase())}` : ''}`),
  ];

  const skillBody = [
    ...rewriteLinks(trimSection(preamble), 'SKILL.md', anchors, problems),
    '',
    '---',
    '',
    ...rewriteLinks(trimSection(section0.lines), 'SKILL.md', anchors, problems),
    '',
    '---',
    '',
    ...index,
    '',
  ].join('\n');

  const files = [{ path: 'SKILL.md', content: frontmatter + skillBody }];
  for (const r of refs) {
    files.push({ path: r.file, content: rewriteLinks(trimSection(r.lines), r.file, anchors, problems).join('\n') + '\n' });
  }

  const skillLines = lineCount(files[0].content);
  if (skillLines > MAX_SKILL_LINES) {
    problems.push(`${guide.file}: split SKILL.md is still ${skillLines} lines (max ${MAX_SKILL_LINES})`);
  }

  if (problems.length && strict) throw new Error(problems.join('\n'));
  problems.forEach(onProblem);
  return files;
}

module.exports = {
  GUIDES,
  yamlSingleQuoted,
  buildSkillFrontmatter,
  MAX_SKILL_LINES,
  REFERENCES_DIR,
  buildSkillFiles,
  githubSlug,
  fileSlug,
  scanLines,
};
