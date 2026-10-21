---
name: web-accessibility
description: 'Use this skill whenever the user is building or reviewing any web UI. Accessibility is a baseline requirement, not a niche concern. Covers WCAG 2.2 AA (including Focus Not Obscured, Target Size, Accessible Authentication), semantic HTML and native interactive elements (dialog, popover, details, invoker commands), ARIA patterns, keyboard navigation, focus management, color contrast, touch targets, forms, testing with axe / Lighthouse / screen readers, and legal context (ADA Title II and III, European Accessibility Act, EN 301 549). Trigger when generating any interactive component or page (forms, modals, menus, tooltips, tables, navigation, layouts), before any "launch" or "go live", during pre-launch checklists, when a user asks about accessibility overlays or compliance deadlines, and whenever producing new HTML/JSX markup, even if the user does not explicitly mention a11y or WCAG. Skip for backend-only changes, CLI tools, or non-UI code.'
---

# Web Accessibility Guide

> Applies to: Any website or web app | Updated: October 2026

A practical reference for building accessible websites  -  covering WCAG 2.2 criteria, semantic HTML, ARIA, forms, touch, and testing.

---

## Section 0: Before You Start

Answer these questions before generating accessibility code. Each answer changes which sections apply.

**Q: Where are your users?**
Default: worldwide  -  EU/UK requirements (EAA, PSBAR) will be flagged as applicable throughout this guide.
Options: US only | US state or local government | Europe/EU | UK | Worldwide

**Q: What kind of product is this?**
Default: company/marketing website
Options: Company/marketing website | Online shop/e-commerce | Web app/SaaS | Media/video site | Document tool

**Q: Will people use this on mobile phones or tablets as well as desktop?**
Default: yes  -  touch target sizing and pointer accessibility sections apply.

**Q: Are you building with a component library?**
Default: none
Options: Radix UI | shadcn/ui | MUI | Chakra UI | Other | None  -  if a library is detected in `package.json`, note which accessibility features it handles natively so you don't duplicate them.

**Q: Do you need to comply with a specific standard for legal or contract reasons?**
Default: WCAG 2.2 AA  -  current best-practice baseline.
Options: WCAG 2.1 AA | WCAG 2.2 AA | Section 508 | EN 301 549 | Not sure

> **AI assistant:** Use these answers to prioritize: apply EAA notes for EU products, ADA Title II notes for US state or local government (WCAG 2.1 AA is the legal floor; still build to 2.2 AA), and the touch target and pointer sections for mobile. If a known accessible component library is detected, note which patterns it handles so you don't duplicate effort.

---

## Contents

This guide is split into reference files. Use the Section 0 answers to decide which apply, then read only those; skip the rest.

- [Legal & Compliance](references/legal-compliance.md): The product serves EU users (European Accessibility Act, EN 301 549), US state or local government (ADA Title II), US businesses (ADA Title III), or US federal agencies (Section 508), or the user asks about legal deadlines or accessibility overlays.
- [WCAG Standards Overview](references/wcag-standards-overview.md): Choosing a conformance target (A, AA, AAA) or explaining why 2.2 AA is the default.
- [WCAG 2.2: What's New](references/wcag-2-2-whats-new.md): Checking against criteria added in WCAG 2.2: focus not obscured, dragging, target size, accessible authentication, redundant entry, consistent help.
- [Semantic HTML](references/semantic-html.md): Generating any markup: page landmarks, choosing the right element, and native interactive elements (dialog, popover, details, invoker commands).
- [Keyboard Navigation](references/keyboard-navigation.md): Building interactive components: skip links, focus order and tabindex, keyboard interactions for custom widgets.
- [ARIA](references/aria.md): Native HTML is not enough and ARIA attributes or roles are needed (labels, descriptions, expanded, hidden, live regions).
- [Images & Media](references/images-media.md): Adding images, SVG, video, or audio: alt text, captions, transcripts.
- [Forms](references/forms.md): Building forms: labels, autocomplete tokens, required fields, error messages, fieldsets, multi-step forms.
- [Touch & Pointer](references/touch-pointer.md): The UI targets touch or mobile, or has tooltips and content shown on hover or focus.
- [Color & Contrast](references/color-contrast.md): Choosing colors, design tokens, or a theme: contrast ratios, semi-transparent text, brand colors, Tailwind slate reference.
- [Focus Management](references/focus-management.md): Styling focus indicators, building dialogs and modals, or updating content dynamically.
- [Motion & Animation](references/motion-animation.md): Adding animations or transitions; respect prefers-reduced-motion.
- [Testing](references/testing.md): Auditing a page: automated scans, keyboard-only, screen readers, zoom, text spacing, color and vision checks.
- [Anti-Patterns to Flag](references/anti-patterns-to-flag.md): Reviewing code or generating UI; patterns to call out actively.
- [Checklist by Product Type](references/checklist-by-product-type.md): Before launch, for a baseline checklist plus additions for e-commerce, web apps, media sites, and mobile.
