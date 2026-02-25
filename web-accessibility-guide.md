# Web Accessibility Guide

> Applies to: Any website or web app | Updated: February 2026

A practical reference for building accessible websites — covering WCAG 2.2 criteria, semantic HTML, ARIA, forms, touch, and testing.

---

## Section 0: Before You Start

Answer these questions before generating accessibility code. Each answer changes which sections apply.

**Q: Where are your users?**
Default: worldwide — EU/UK requirements (EAA, PSBAR) will be flagged as applicable throughout this guide.
Options: US only | Europe/EU | UK | Worldwide

**Q: What kind of product is this?**
Default: company/marketing website
Options: Company/marketing website | Online shop/e-commerce | Web app/SaaS | Media/video site | Document tool

**Q: Will people use this on mobile phones or tablets as well as desktop?**
Default: yes — touch target sizing and pointer accessibility sections apply.

**Q: Are you building with a component library?**
Default: none
Options: Radix UI | shadcn/ui | MUI | Chakra UI | Other | None — if a library is detected in `package.json`, note which accessibility features it handles natively so you don't duplicate them.

**Q: Do you need to comply with a specific standard for legal or contract reasons?**
Default: WCAG 2.2 AA — current best-practice baseline.
Options: WCAG 2.1 AA | WCAG 2.2 AA | Section 508 | EN 301 549 | Not sure

> **AI assistant:** Use these answers to prioritize. For EU products: apply EAA compliance notes. For mobile: apply touch target and pointer sections. If a known accessible component library is detected, note which patterns it handles so you don't duplicate effort.

---

## Contents

1. [Legal & Compliance](#legal--compliance)
2. [WCAG Standards Overview](#wcag-standards-overview)
3. [WCAG 2.2 — What's New](#wcag-22--whats-new)
4. [Semantic HTML](#semantic-html)
5. [Keyboard Navigation](#keyboard-navigation)
6. [ARIA](#aria)
7. [Images & Media](#images--media)
8. [Forms](#forms)
9. [Touch & Pointer](#touch--pointer)
10. [Color & Contrast](#color--contrast)
11. [Focus Management](#focus-management)
12. [Motion & Animation](#motion--animation)
13. [Testing](#testing)
14. [Anti-Patterns to Flag](#anti-patterns-to-flag)
15. [Checklist by Product Type](#checklist-by-product-type)

---

## Legal & Compliance

Accessibility is a legal requirement across most major markets. Non-compliance carries real risk — fines, market access restrictions, and litigation.

| Jurisdiction | Law / Standard | Scope | Notes |
|---|---|---|---|
| **EU** | European Accessibility Act (EAA) | Private-sector e-commerce, banking, transport, streaming. Enforceable since June 28, 2025. | Standard: EN 301 549 v3.2.1, which references WCAG 2.1 AA; WCAG 2.2 strongly recommended. Non-compliance = market access restrictions. |
| **US** | ADA Title III | Private-sector websites and apps | ~4,000–4,500 lawsuits/year; e-commerce and hospitality are primary targets. Overlay-only solutions have been named in lawsuits as insufficient. |
| **US Federal** | Section 508 | Federal agencies and contractors | References WCAG 2.0 AA. Agencies procuring software must meet this baseline. |
| **UK** | Web Accessibility Regulations 2018 + Equality Act 2010 | Public sector: WCAG 2.2 AA required. Private sector: Equality Act applies. | PSBAR (Public Sector Bodies Accessibility Regulations) requires a published accessibility statement. |

**Overlay warning:** Single-script accessibility overlays (AccessiBe, UserWay, etc.) do not achieve WCAG conformance and have been directly challenged in ADA litigation. Flag this clearly if a user asks about "automatic" or "one-line" accessibility fixes.

---

## WCAG Standards Overview

WCAG (Web Content Accessibility Guidelines) uses three conformance levels:

- **Level A** — minimum baseline; blocking failures (e.g. images with no `alt`)
- **Level AA** — standard legal requirement across most jurisdictions (e.g. 4.5:1 contrast)
- **Level AAA** — enhanced; not required site-wide but worth targeting for specific features

**Target WCAG 2.2 Level AA** as your default baseline.

**On WCAG 3.0:** It is a research-stage Working Draft with no published adoption timeline. It uses a different scoring model and will not replace WCAG 2.x for the foreseeable future. Do not use it as a current compliance target.

---

## WCAG 2.2 — What's New

WCAG 2.2 was published October 2023. These criteria are not in most existing guides or tools. They represent the highest-value additions to implement.

### 2.4.11 Focus Appearance (AA)

The focus indicator must meet two conditions simultaneously:

1. **Area:** The focus indicator area must be at least as large as a 2px perimeter outline around the unfocused component.
2. **Contrast:** The color change between focused and unfocused states must have a contrast ratio of at least 3:1.

A 1px dotted border fails both. This goes beyond "don't remove `outline`."

```css
/* Fails 2.4.11 — thin, low-contrast */
:focus {
  outline: 1px dotted #999;
}

/* Passes 2.4.11 — thick, high-contrast */
:focus-visible {
  outline: 3px solid #005fcc;  /* Check #005fcc vs background meets 3:1 */
  outline-offset: 2px;
}
```

### 2.5.7 Dragging Movements (AA)

Any interaction that uses drag-and-drop, slider, or map pan must have a single-pointer (click/tap) alternative. Drag is not a safe assumption — users with motor disabilities cannot rely on it.

```html
<!-- Sortable list: provide up/down buttons alongside drag handles -->
<li>
  <span class="drag-handle" aria-hidden="true">⠿</span>
  Item label
  <button aria-label="Move item up">↑</button>
  <button aria-label="Move item down">↓</button>
</li>
```

### 2.5.8 Target Size Minimum (AA)

Interactive targets must be at least **24×24 CSS pixels**, or have spacing such that the total clickable zone (target + surrounding space) reaches 24×24.

Best practice: 44×44px (Apple HIG), 48×48px (Material Design).

```css
/* Minimum compliant — 24×24px */
.icon-btn {
  min-width: 24px;
  min-height: 24px;
}

/* Best practice — 44×44px tap target */
.icon-btn {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

### 3.3.8 Accessible Authentication (AA)

Login and signup flows cannot rely solely on a cognitive test (e.g. image CAPTCHA with no alternative). Acceptable alternatives: passkeys, magic link via email, CAPTCHA with an audio alternative, or copy-paste support in the password field.

Do not block clipboard paste in password fields — this breaks password managers and fails this criterion.

### 3.3.7 Redundant Entry (AA)

Multi-step forms must not ask for the same information twice unless it is essential to re-enter. Auto-populate or display previously entered data.

```html
<!-- Step 2: shipping address — if billing address was entered in step 1 -->
<label>
  <input type="checkbox" id="same-as-billing" />
  Same as billing address
</label>
```

### 3.2.6 Consistent Help (AA)

If a help mechanism (chat widget, phone number, help link, contact form) appears on more than one page, it must appear in the same relative location on every page.

### 4.1.1 Parsing — Removed in WCAG 2.2

WCAG 2.2 removed criterion 4.1.1 Parsing. Modern browsers reliably handle malformed HTML; it no longer represents an accessibility barrier. Automated tools that still report 4.1.1 violations are reporting against a deprecated criterion. Remove it from test baselines if you're targeting WCAG 2.2.

---

## Semantic HTML

Semantic HTML is the highest-value accessibility improvement — it is free, requires no ARIA, and works with all assistive technologies.

### Page structure

```html
<html lang="en">  <!-- Always declare language; use lang="fr" etc. for other languages -->
<head>
  <title>Page Title - Site Name</title>  <!-- Unique, descriptive title per page -->
</head>
<body>
  <header>
    <nav aria-label="Main">...</nav>
  </header>
  <main>          <!-- One <main> per page — screen readers jump here -->
    <h1>Page Heading</h1>
    <section aria-labelledby="section-heading">
      <h2 id="section-heading">Section Title</h2>
    </section>
  </main>
  <aside aria-label="Related links">...</aside>
  <footer>...</footer>
</body>
```

For inline content in a different language, add the `lang` attribute on the element — screen readers use this to switch pronunciation:

```html
<p>The French say <span lang="fr">bonjour</span> as a greeting.</p>
```

### Use the right element

Native HTML elements carry built-in keyboard support, roles, and states. Prefer them over custom implementations. Use `<button>` for anything that triggers an action, `<a href>` for navigation — never a `<div onclick>`.

One `<h1>` per page; don't skip heading levels. Use headings to convey document structure, not visual size.

---

## Keyboard Navigation

All interactive elements must be reachable and operable with a keyboard alone. Users navigate with Tab, Shift+Tab, Enter, Space, and arrow keys.

### Skip navigation link

Provide a "skip to main content" link as the first focusable element — lets keyboard users bypass repeated navigation:

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
<!-- nav, header -->
<main id="main-content">...</main>
```

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
}
.skip-link:focus {
  top: 0;  /* Visible on focus, hidden otherwise */
}
```

### Focus order and tabindex

Focus must follow a logical order — top-to-bottom, left-to-right, matching visual layout. Never use `tabindex` values greater than 0; they override the natural tab order and are nearly impossible to maintain.

```html
<!-- Correct: tabindex="0" adds non-interactive elements to tab order -->
<div tabindex="0" role="region" aria-label="Interactive map">...</div>

<!-- Wrong: breaks tab order across the page -->
<button tabindex="3">...</button>  <!-- Do not do this -->
```

### Keyboard interactions for custom components

| Component | Expected keys |
|---|---|
| Button | Enter, Space to activate |
| Link | Enter to follow |
| Checkbox | Space to toggle |
| Radio group | Arrow keys to move between options |
| Dropdown/Select | Arrow keys to navigate, Enter to select, Escape to close |
| Dialog/Modal | Escape to close; focus trapped inside while open |
| Tabs | Arrow keys to switch tabs |
| Accordion | Enter/Space to expand/collapse |

---

## ARIA

ARIA (Accessible Rich Internet Applications) adds semantic meaning when native HTML elements are insufficient. Use it as a last resort.

> Do not use ARIA if a native HTML element already has the semantics you need.

### aria-label and aria-labelledby

Use `aria-label` when there is no visible text label:

```html
<button aria-label="Close dialog">✕</button>

<!-- Multiple navs on the same page need distinguishing labels -->
<nav aria-label="Main">...</nav>
<nav aria-label="Breadcrumb">...</nav>
```

`aria-label` text must match or begin with the visible button text (WCAG 2.5.3 Label in Name) — otherwise voice control users who say "click Close" cannot activate it.

Use `aria-labelledby` to reference existing visible text, which avoids duplication:

```html
<section aria-labelledby="billing-heading">
  <h2 id="billing-heading">Billing</h2>
</section>
```

### aria-describedby

Points to supplementary description — announced after the element's name and role:

```html
<input type="password" id="pw" aria-describedby="pw-hint" />
<p id="pw-hint">Must be at least 8 characters with one number.</p>
```

### aria-expanded

Toggle between `"true"` and `"false"` as the element opens and closes:

```html
<button aria-expanded="false" aria-controls="menu">Menu</button>
<ul id="menu" hidden>...</ul>
```

### aria-hidden

Hides decorative elements from screen readers. Never apply to focusable elements — a hidden-but-focusable element creates an invisible, unannounced interactive target:

```html
<span aria-hidden="true">→</span>  <!-- Decorative arrow -->
```

### aria-live

Announces dynamic content updates. Use `polite` for the vast majority of cases — it waits until the screen reader finishes the current sentence before reading the update. Reserve `assertive` for genuine, time-critical errors that require interrupting the user immediately:

```html
<!-- Polite: search results count, cart updates, status messages -->
<div aria-live="polite" aria-atomic="true" id="status"></div>

<!-- Assertive: session timeout warnings, payment failures — use sparingly -->
<div aria-live="assertive" id="critical-error"></div>
```

`aria-atomic="true"` re-reads the entire region when any part changes, rather than just the changed portion. Use it when partial announcements would be confusing (e.g. "3 results" vs "Showing 3 results for 'shoes'").

### Common roles

```html
<div role="alert">Error: email is required.</div>      <!-- Implies aria-live="assertive" -->
<div role="status">3 results found.</div               <!-- Implies aria-live="polite" -->
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Delete</h2>
</div>
```

---

## Images & Media

### Alt text

Every `<img>` must have an `alt` attribute:

```html
<!-- Informative: describe what the image conveys -->
<img src="chart.png" alt="Bar chart showing 40% increase in Q4 sales" />

<!-- Decorative: empty alt so screen readers skip it -->
<img src="divider.png" alt="" />

<!-- Functional (inside a link or button): describe the action -->
<a href="/home"><img src="logo.svg" alt="Go to homepage" /></a>

<!-- Never omit alt — screen readers fall back to the filename -->
<img src="hero-image-v2-final.jpg" />  <!-- Wrong -->
```

### SVG

```html
<!-- Decorative -->
<svg aria-hidden="true" focusable="false">...</svg>

<!-- Meaningful -->
<svg role="img" aria-label="Upload file">...</svg>
```

### Video & audio

- Add captions to all video with speech or meaningful sound (`<track kind="captions">`)
- Provide transcripts for audio-only content
- Do not autoplay audio or video with sound

```html
<video controls>
  <source src="video.mp4" type="video/mp4" />
  <track kind="captions" src="captions.vtt" srclang="en" label="English" default />
</video>
```

---

## Forms

Forms are one of the most common accessibility failure points.

### Labels

Every input needs a visible, associated label. Never use `placeholder` as a label — it disappears on input and typically fails contrast requirements:

```html
<!-- Explicit association via for/id -->
<label for="email">Email address</label>
<input type="email" id="email" name="email" autocomplete="email" />

<!-- Implicit association (label wraps input) -->
<label>
  Email address
  <input type="email" name="email" autocomplete="email" />
</label>
```

### autocomplete tokens (WCAG 1.3.5 — Identify Input Purpose)

Add `autocomplete` tokens to personal data fields. This enables password managers, browser autofill, and assistive technology for users with cognitive disabilities:

```html
<input type="text"     name="fname"    autocomplete="given-name" />
<input type="text"     name="lname"    autocomplete="family-name" />
<input type="email"    name="email"    autocomplete="email" />
<input type="tel"      name="phone"    autocomplete="tel" />
<input type="password" name="password" autocomplete="current-password" />
<input type="password" name="new-pw"   autocomplete="new-password" />
```

### Required fields

For native `<input>` elements, the `required` attribute is sufficient — it is announced by screen readers and triggers native validation. Add `aria-required="true"` only for custom components that don't use native form elements:

```html
<!-- Native input: required alone is sufficient -->
<label for="name">Full name <span aria-hidden="true">*</span></label>
<input type="text" id="name" required />
<p>Fields marked <span aria-hidden="true">*</span> are required.</p>

<!-- Custom component (e.g. a styled combobox): aria-required needed -->
<div role="combobox" aria-required="true" ...>...</div>
```

### Error messages

Link errors to their input using `aria-describedby`. Set `aria-invalid="true"` when an error exists; remove it when the value becomes valid:

```html
<label for="email">Email</label>
<input type="email" id="email" aria-describedby="email-error" aria-invalid="true" />
<p id="email-error" role="alert">Enter a valid email address.</p>
```

### Fieldsets for grouped inputs

Group related inputs (radio buttons, checkboxes) with `<fieldset>` and `<legend>` — the legend is announced before each option, providing essential context:

```html
<fieldset>
  <legend>Preferred contact method</legend>
  <label><input type="radio" name="contact" value="email" /> Email</label>
  <label><input type="radio" name="contact" value="phone" /> Phone</label>
</fieldset>
```

### Multi-step forms (WCAG 3.3.7)

Don't ask for the same data twice. Pre-populate fields using previously entered values. Show a summary of entered data before the final submit step.

---

## Touch & Pointer

### Minimum touch target size (WCAG 2.5.8)

Interactive targets must be at least 24×24 CSS pixels. Best practice is 44×44px:

```css
/* Best practice: 44×44px tap target, even for small visual elements */
.btn-icon {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Touchscreen-specific adjustments */
@media (pointer: coarse) {
  .btn-icon {
    min-width: 48px;
    min-height: 48px;
  }
}
```

`pointer: coarse` targets touchscreens and devices where the pointing device has limited accuracy. Use it for any touch-specific spacing or sizing overrides.

### 1.4.13 Content on Hover or Focus

Tooltips, sub-menus, and dropdowns that appear on hover or focus must meet three conditions:

1. **Dismissable** — the user can dismiss the tooltip without moving pointer or focus (Escape key closes it)
2. **Hoverable** — the mouse can move from the trigger into the tooltip without it disappearing
3. **Persistent** — the tooltip stays visible until the user dismisses it, moves focus, or removes the pointer

```css
/* Wrong: tooltip disappears when pointer leaves trigger */
.trigger:hover .tooltip { display: block; }

/* Correct: tooltip stays open when pointer moves into it */
.trigger:hover .tooltip,
.tooltip:hover {
  display: block;
}
```

Also expose tooltip content via keyboard/focus — not hover alone.

---

## Color & Contrast

Color alone must never be the only way to convey information — always pair color with text, icons, or patterns.

### Contrast ratios (WCAG 2.2 AA)

| Text type | Minimum ratio |
|---|---|
| Normal text (< 18pt / < 14pt bold) | 4.5:1 |
| Large text (≥ 18pt / ≥ 14pt bold) | 3:1 |
| UI components and graphics | 3:1 |
| Decorative text, disabled UI | No requirement |

```html
<!-- Wrong: color alone marks the error -->
<input style="border-color: red" />

<!-- Correct: color + icon + text -->
<input style="border-color: red" aria-describedby="err" />
<p id="err">Email is required.</p>
```

### Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/) (desktop, eyedropper tool)
- Chrome/Firefox DevTools color picker — shows contrast ratio inline

---

## Focus Management

### Visible focus indicator

Never remove focus outlines without a replacement. WCAG 2.4.11 (new in 2.2) requires a minimum 2px perimeter area and 3:1 contrast between focused and unfocused states:

```css
/* Wrong: removes indicator for everyone */
* { outline: none; }

/* Correct: styled focus that meets 2.4.11 */
:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
  border-radius: 2px;
}
```

Use `:focus-visible` rather than `:focus` — it shows the indicator for keyboard users but suppresses it for mouse clicks, matching user expectations.

### Dialogs and modals

When a dialog opens, move focus into it. When it closes, return focus to the trigger element. Trap focus within the dialog while it is open:

```javascript
const trigger = document.getElementById('open-dialog-btn');
const dialog = document.getElementById('dialog');
const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function openDialog() {
  dialog.removeAttribute('hidden');
  dialog.querySelector(focusableSelectors).focus();
}

function closeDialog() {
  dialog.setAttribute('hidden', '');
  trigger.focus();  // Return focus to what opened the dialog
}
```

### Dynamic content

When content updates dynamically (search results, filtered lists, notifications), announce it or move focus:

```javascript
// Option A: announce via live region (no focus move — least disruptive)
statusEl.textContent = `${results.length} results found.`;  // aria-live="polite" on statusEl

// Option B: move focus to the new content region
resultsContainer.setAttribute('tabindex', '-1');
resultsContainer.focus();
```

---

## Motion & Animation

Some users experience vestibular disorders triggered by motion. Always respect the OS-level reduced-motion preference.

The `prefers-reduced-motion` media query and the 5-second animation threshold in WCAG 2.2.2 apply specifically to auto-playing, blinking, or scrolling content that runs in parallel with other content (carousels, looping animations, auto-advancing banners). Short CSS transitions (button hover states, accordion expand) are not subject to the 5-second rule.

```css
/* Apply animations by default */
.animated {
  transition: transform 0.3s ease;
}

/* Remove or reduce motion when the user has requested it */
@media (prefers-reduced-motion: reduce) {
  .animated {
    transition: none;
  }
}
```

Provide pause/stop controls for any auto-playing animation or carousel. Do not autoplay video or audio with sound.

---

## Testing

No single tool catches everything. Use this order — each layer catches what the previous misses.

### 1. Automated scan

Run first — fast and catches obvious violations. Automated tools catch approximately 30–40% of WCAG issues.

- **axe DevTools** (browser extension) — WCAG violations, ARIA errors
- **Lighthouse** (Chrome DevTools > Lighthouse tab) — accessibility score, summary of issues
- **WAVE** (browser extension) — visual overlay showing errors, warnings, and structural info
- **IBM Equal Access** (browser extension) — WCAG 2.2 coverage

**Accessibility tree inspection:** Chrome DevTools > Elements panel > Accessibility tab shows the computed accessible name, role, and state for any element. Firefox has a dedicated Accessibility Inspector panel. Use these to debug unexpected announcements — more diagnostic than running axe alone.

### 2. Keyboard-only

Tab through every interactive flow without a mouse:
- Every interactive element must be reachable and operable
- Focus indicator must always be visible
- Test dialogs, dropdowns, date pickers, and all dynamic content
- Verify Escape closes modals and dropdowns

### 3. Screen reader

Updated pairings (as of 2026):

| Screen reader | Platform | Browser | Free? |
|---|---|---|---|
| NVDA | Windows | Chrome (primary), Firefox | Yes |
| JAWS | Windows | Chrome | No — most common enterprise SR |
| Narrator | Windows | Edge | Yes (built-in) |
| VoiceOver | macOS / iOS | Safari | Yes (built-in) |
| TalkBack | Android | Chrome | Yes (built-in) |

Basic test: navigate by headings (H in NVDA/JAWS), by landmarks (D), and by form elements (F). Verify every announcement makes sense without visual context.

### 4. Zoom

- 200% — no content should overflow or become inaccessible
- 400% — content must reflow to a single column without horizontal scrolling (WCAG 1.4.10 Reflow)

### 5. Text spacing

Apply the WCAG 1.4.12 text spacing bookmarklet (sets `line-height: 1.5`, `letter-spacing: 0.12em`, `word-spacing: 0.16em`, `paragraph-spacing: 2em`). No content should overlap or be clipped.

Bookmarklet source: [stevefaulkner's text spacing bookmarklet](https://www.html5accessibility.com/tests/tsbookmarklet.html)

### 6. Color and vision

- Grayscale filter: Chrome DevTools > Rendering > Emulate vision deficiencies > Achromatopsia — verify no information is lost
- Also test: Deuteranopia (red/green), Protanopia
- Verify no information relies on color alone

---

## Anti-Patterns to Flag

Flag these actively when encountered in code review or generation:

- **Accessibility overlay scripts as sole compliance strategy** — overlays do not achieve WCAG conformance and have been challenged in ADA litigation. Mention this explicitly.
- **`aria-label` that doesn't match visible button text** — breaks voice control (WCAG 2.5.3). The label must match or begin with the visible text so "click Submit" works.
- **`aria-hidden="true"` on focusable elements** — creates a keyboard trap: the element receives focus but is invisible to screen readers.
- **`tabindex` values greater than 0** — overrides the natural tab order and becomes unmanageable.
- **Hover-only content with no keyboard/focus equivalent** — fails WCAG 2.1.1 and 1.4.13.
- **Infinite scroll with no keyboard access to footer content** — users cannot reach content below the scroll boundary. Provide a "Load more" button or pagination.
- **Custom date pickers with no keyboard support** — implement full arrow-key navigation or use a native `<input type="date">`.
- **`aria-required="true"` on native `<input required>`** — redundant in modern browsers; keep only `required`.
- **Placeholder text as the only label** — disappears when the user types; fails 1.3.1 and 2.4.6.
- **Blocking clipboard paste in password fields** — breaks password managers and fails WCAG 3.3.8.

---

## Checklist by Product Type

### All products (universal baseline)

- [ ] `<html lang>` set correctly; `lang` attribute on inline foreign-language content
- [ ] Unique, descriptive `<title>` on every page
- [ ] One `<h1>` per page; no skipped heading levels
- [ ] Landmarks used: `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>`
- [ ] All `<img>` have `alt` (empty for decorative)
- [ ] SVGs have `aria-label` or `aria-hidden`
- [ ] Skip navigation link present and functional
- [ ] All interactive elements reachable and operable by keyboard
- [ ] Focus indicator visible and meets WCAG 2.4.11 (3px+ stroke, 3:1 contrast)
- [ ] No `tabindex` values greater than 0
- [ ] `prefers-reduced-motion` respected
- [ ] Normal text 4.5:1 contrast; large text and UI components 3:1
- [ ] No information conveyed by color alone
- [ ] Automated scan (axe or Lighthouse) with no critical violations
- [ ] Full keyboard navigation tested manually
- [ ] Tested with at least one screen reader

### Online shop / e-commerce (add)

- [ ] All product images have descriptive alt text
- [ ] Form fields have `autocomplete` tokens (name, email, address, card details)
- [ ] Multi-step checkout does not ask for repeated information (WCAG 3.3.7)
- [ ] No CAPTCHA-only authentication — provide an accessible alternative (WCAG 3.3.8)
- [ ] Touch targets on product cards and CTAs are at least 44×44px
- [ ] Error recovery: clear error messages linked to specific fields

### Web app / SaaS (add)

- [ ] Dialogs trap focus and return it on close
- [ ] Dynamic content updates announced via `aria-live` or focus management
- [ ] Help/support link in consistent location across all pages (WCAG 3.2.6)
- [ ] Drag-and-drop interactions have a single-pointer alternative (WCAG 2.5.7)
- [ ] Session timeout warning announced with enough time to extend

### Media / video site (add)

- [ ] Captions on all video with speech or meaningful audio
- [ ] Transcripts for audio-only content
- [ ] Video player controls keyboard-operable
- [ ] No autoplay with sound
- [ ] Pause control for any looping animation or auto-advancing content

### Mobile / touch (add when mobile applies)

- [ ] All touch targets at least 44×44px
- [ ] `@media (pointer: coarse)` rules for touchscreen spacing
- [ ] Hover-dependent content has keyboard/focus equivalent
- [ ] Tested with TalkBack (Android) and VoiceOver (iOS)
- [ ] Tested at 200% OS text size
