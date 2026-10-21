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

1. [Legal & Compliance](#legal--compliance)
2. [WCAG Standards Overview](#wcag-standards-overview)
3. [WCAG 2.2: What's New](#wcag-22-whats-new)
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

Accessibility is a legal requirement across most major markets. Non-compliance carries real risk  -  fines, market access restrictions, and litigation. This table summarizes obligations to help prioritize engineering work (as of October 2026); it is not legal advice, so have the user confirm their obligations with counsel.

| Jurisdiction | Law / Standard | Scope | Notes |
|---|---|---|---|
| **EU** | European Accessibility Act (EAA), Directive (EU) 2019/882 | Listed products and services, including e-commerce, consumer banking, e-books, passenger transport services, telephony, and audiovisual media access. National laws apply from June 28, 2025. | Microenterprises providing services (fewer than 10 staff and turnover or balance sheet of EUR 2 million or less) are exempt. Services may keep using products already in use before June 28, 2025 until June 28, 2030. The reference standard remains EN 301 549 v3.2.1 (WCAG 2.1 AA) until the European Commission cites v4.1.1 (published September 2026, incorporates WCAG 2.2) in the Official Journal. Build to WCAG 2.2 AA now. |
| **US** | ADA Title III | Websites and apps of businesses open to the public; US courts are split on whether website-only businesses are covered | The Department of Justice (DOJ) has no regulation setting a technical standard for businesses; its guidance names WCAG as helpful guidance. Thousands of website accessibility lawsuits are filed each year; e-commerce sites are frequent targets. |
| **US state and local government** | ADA Title II web rule (2024) | State and local government websites and mobile apps | Standard: WCAG 2.1 AA. Compliance dates, as extended by an April 2026 interim final rule: April 26, 2027 for entities serving a population of 50,000 or more; April 26, 2028 for smaller entities and special district governments. Check [ada.gov](https://www.ada.gov/resources/web-rule-first-steps/) for later changes. |
| **US Federal** | Section 508 | Federal agencies and contractors | References WCAG 2.0 AA. Agencies procuring software must meet this baseline. |
| **UK** | Public Sector Bodies Accessibility Regulations 2018 (PSBAR) + Equality Act 2010 | Public sector: WCAG 2.2 AA required. Private sector: Equality Act applies. | PSBAR requires a published accessibility statement. |

**Overlay warning:** Single-script accessibility overlays (accessiBe, UserWay, etc.) do not achieve WCAG conformance and have been directly challenged in ADA litigation. In April 2025 the US Federal Trade Commission (FTC) finalized an order requiring accessiBe to pay $1 million and barring it from claiming its automated product makes websites WCAG-compliant without evidence. Flag this clearly if a user asks about "automatic" or "one-line" accessibility fixes.

---

## WCAG Standards Overview

WCAG (Web Content Accessibility Guidelines) uses three conformance levels:

- **Level A**  -  minimum baseline; blocking failures (e.g. images with no `alt`)
- **Level AA**  -  standard legal requirement across most jurisdictions (e.g. 4.5:1 contrast)
- **Level AAA**  -  enhanced; not required site-wide but worth targeting for specific features

**Target WCAG 2.2 Level AA** as your default baseline. WCAG 2.2 is also an international standard (ISO/IEC 40500:2025, announced by W3C in October 2025), which makes it easier for governments to adopt. W3C intends that content conforming to WCAG 2.2 also conforms to 2.1 and 2.0, so building to 2.2 AA covers laws and contracts that cite the older versions.

**On WCAG 3.0 (as of October 2026):** It is still a Working Draft (latest: September 10, 2026). W3C states it is "inappropriate to cite this document as other than a work in progress" and that it has several years of work left. It does not deprecate WCAG 2. Do not use it as a compliance target or cite its requirements in audits.

---

## WCAG 2.2: What's New

WCAG 2.2 was published October 2023 (republished with corrections December 2024). Older checklists and AI training data often stop at WCAG 2.1, and many still mislabel these criteria, so use the numbers and levels below. The AA criteria are the highest-value additions to implement.

### 2.4.11 Focus Not Obscured (Minimum) (AA)

When an element receives keyboard focus, it must not be entirely hidden by author-created content. The usual failures are sticky headers and footers, cookie banners, and chat widgets that cover the focused element as the user tabs down the page.

```css
/* Reserve space for a 64px sticky header and a 48px sticky footer
   so focused elements scroll into view clear of them */
html {
  scroll-padding-top: 64px;    /* match your sticky header height */
  scroll-padding-bottom: 48px; /* match your sticky footer or banner height */
}
```

For cookie banners and non-modal overlays, either make them modal (focus moves into them and stays until dismissed) or close them when focus leaves. 2.4.12 Focus Not Obscured (Enhanced) is the AAA version: no part of the focused element may be hidden.

### 2.4.13 Focus Appearance (AAA, recommended)

Focus Appearance is **Level AAA**, even though many articles still list it as "2.4.11 (AA)". At AA, you need 2.4.7 Focus Visible (an indicator is visible) and 1.4.11 Non-text Contrast (visual information that identifies a focused state needs 3:1 against adjacent colors). 2.4.13 is still the best measurable target for a focus style:

1. **Area:** The focus indicator area must be at least as large as a 2 CSS pixel thick perimeter around the unfocused component.
2. **Contrast:** The change between focused and unfocused states must have a contrast ratio of at least 3:1.

A 1px dotted grey outline fails both.

```css
/* Fails 2.4.13  -  thin, low-contrast */
:focus {
  outline: 1px dotted #999;
}

/* Passes 2.4.13  -  thick, high-contrast */
:focus-visible {
  outline: 3px solid #005fcc;  /* 5.98:1 on white; check every background it appears on */
  outline-offset: 2px;
}
```

### 2.5.7 Dragging Movements (AA)

Any interaction that uses drag-and-drop, slider, or map pan must have a single-pointer (click/tap) alternative. Drag is not a safe assumption  -  users with motor disabilities cannot rely on it.

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

Interactive targets must be at least **24×24 CSS pixels**, unless an exception applies:

- **Spacing:** an undersized target passes if a 24px-diameter circle centered on it does not overlap another target or another undersized target's circle.
- **Inline:** links inside a sentence or paragraph are exempt.
- **Equivalent:** another control on the same page does the same thing and meets the size.
- **User agent control:** the browser draws the control and you have not restyled it (for example a default checkbox).
- **Essential:** the size is essential or legally required (for example pins on a map).

Do not flag inline text links for target size. Best practice: 44×44px (WCAG 2.5.5 Target Size (Enhanced), Level AAA, and the Apple Human Interface Guidelines (HIG)), 48×48px (Material Design).

```css
/* Minimum compliant  -  24×24px */
.icon-btn {
  min-width: 24px;
  min-height: 24px;
}

/* Best practice  -  44×44px tap target */
.icon-btn {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

### 3.3.8 Accessible Authentication (AA)

No step of a login or signup flow may require a cognitive function test (remembering a password, transcribing characters, solving a puzzle) unless the step offers an alternative method or a mechanism that helps. Ways to pass:

- **Let password managers work:** use `autocomplete="username"` and `autocomplete="current-password"`, and allow paste. Paste and password manager support count as an assisting mechanism.
- **Offer a non-cognitive method:** passkeys or other WebAuthn (Web Authentication API) sign-in (device biometrics or PIN), or an email magic link.
- **One-time codes:** allow paste, and add `autocomplete="one-time-code"` so the browser can fill SMS codes.
- **CAPTCHAs:** text transcription CAPTCHAs fail, and an audio CAPTCHA that requires typing what you hear is still transcription, so it does not count as the alternative. Object-recognition CAPTCHAs ("select the images with buses") are allowed at AA, but not at AAA (3.3.9). Prefer non-interactive bot detection.

Do not block clipboard paste in password or code fields  -  this breaks password managers and fails this criterion.

### 3.3.7 Redundant Entry (AA)

Multi-step forms must not ask for the same information twice unless it is essential to re-enter. Auto-populate or display previously entered data.

```html
<!-- Step 2: shipping address  -  if billing address was entered in step 1 -->
<label>
  <input type="checkbox" id="same-as-billing" />
  Same as billing address
</label>
```

### 3.2.6 Consistent Help (AA)

If a help mechanism (chat widget, phone number, help link, contact form) appears on more than one page, it must appear in the same relative location on every page.

### 4.1.1 Parsing  -  Removed in WCAG 2.2

WCAG 2.2 removed criterion 4.1.1 Parsing. Browsers handle malformed HTML in a standardized way and assistive technology no longer parses HTML directly, so it no longer represents an accessibility barrier. W3C also added a note to WCAG 2.1 that 4.1.1 "should be considered as always satisfied" for HTML or XML content, so this applies even when a law cites WCAG 2.1. Automated tools that still report 4.1.1 violations are reporting against an obsolete criterion; remove it from test baselines. Duplicate IDs still matter when they break `aria-labelledby`, `for`, or `aria-describedby` references, because a broken reference can fail 1.3.1 Info and Relationships or 4.1.2 Name, Role, Value.

---

## Semantic HTML

Semantic HTML is the highest-value accessibility improvement  -  it is free, requires no ARIA, and works with all assistive technologies.

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
  <main>          <!-- One <main> per page  -  screen readers jump here -->
    <h1>Page Heading</h1>
    <section aria-labelledby="section-heading">
      <h2 id="section-heading">Section Title</h2>
    </section>
  </main>
  <aside aria-label="Related links">...</aside>
  <footer>...</footer>
</body>
```

For inline content in a different language, add the `lang` attribute on the element  -  screen readers use this to switch pronunciation:

```html
<p>The French say <span lang="fr">bonjour</span> as a greeting.</p>
```

### Use the right element

Native HTML elements carry built-in keyboard support, roles, and states. Prefer them over custom implementations. Use `<button>` for anything that triggers an action, `<a href>` for navigation  -  never a `<div onclick>`.

One `<h1>` per page; don't skip heading levels. Use headings to convey document structure, not visual size.

### Native interactive elements (Baseline status as of October 2026)

Newer HTML features now handle focus, Escape, and state announcements that used to need custom JavaScript and ARIA. Baseline is the web-features project's cross-browser status: "widely available" means supported in all major browsers for 30+ months; "newly available" means supported in all of them now, so older browser versions may lack it.

| Feature | Use it for | Baseline | Recommendation |
|---|---|---|---|
| `<dialog>` + `showModal()` | Modal dialogs | Widely available | Default for modals. See [Dialogs and modals](#dialogs-and-modals). |
| `inert` attribute | Making background content unfocusable and hidden from assistive technology | Widely available | Use for custom overlays and off-screen panels. |
| `<details>` / `<summary>` | Disclosure widgets, accordions | Widely available | Default for show/hide content. |
| `<details name="group">` | Exclusive accordion (opening one closes the others) | Newly available (Sept 2024) | Use only when one-open-at-a-time helps; the HTML spec warns it can frustrate users who want to compare sections. |
| `popover` attribute + `popovertarget` | Non-modal menus, toggletips, pickers | Newly available (Jan 2025) | Use for non-modal overlays. The browser exposes `aria-expanded` on the invoking button and handles Escape and light dismiss. It adds no role, so add the semantics the content needs. Never use it for modals. |
| `command` / `commandfor` (invoker commands) | Opening a dialog or popover from a button without JavaScript | Newly available (Dec 2025) | Use with a small JavaScript fallback for older browsers. |
| `<dialog closedby>` | Light dismiss for dialogs | Not Baseline (no Safari) | Optional enhancement only. Escape already closes a modal opened with `showModal()`. |
| `interestfor` (interest invokers) | Hover/focus tooltips | Not Baseline (Chromium only) | Do not rely on it; use the pattern in [Touch & Pointer](#touch--pointer). |
| Customizable `<select>` (`appearance: base-select`) | Styling native selects | Not Baseline (no Firefox) | Progressive enhancement only; unsupported browsers show a normal `<select>`, which is still accessible. |

```html
<!-- Exclusive accordion: only one section open at a time -->
<details name="faq">
  <summary>How do I reset my password?</summary>
  <p>YOUR_ANSWER</p>
</details>
<details name="faq">
  <summary>Can I change my email address?</summary>
  <p>YOUR_ANSWER</p>
</details>
```

---

## Keyboard Navigation

All interactive elements must be reachable and operable with a keyboard alone. Users navigate with Tab, Shift+Tab, Enter, Space, and arrow keys.

### Skip navigation link

Provide a "skip to main content" link as the first focusable element  -  lets keyboard users bypass repeated navigation:

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

Focus must follow a logical order  -  top-to-bottom, left-to-right, matching visual layout. Never use `tabindex` values greater than 0; they override the natural tab order and are nearly impossible to maintain.

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
| Dialog/Modal | Escape to close; focus stays inside while open (native `<dialog>` opened with `showModal()` does both) |
| Tabs | Arrow keys to switch tabs |
| Accordion | Enter/Space to expand/collapse (native `<details>`/`<summary>` does this) |

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

When a control has visible text, its accessible name must contain that text, and should start with it (WCAG 2.5.3 Label in Name)  -  otherwise voice control users who say "click Close" cannot activate it. As of axe-core 4.14 (October 2026), the `label-content-name-mismatch` rule that checks this is enabled by default, so expect new findings after upgrading.

Use `aria-labelledby` to reference existing visible text, which avoids duplication:

```html
<section aria-labelledby="billing-heading">
  <h2 id="billing-heading">Billing</h2>
</section>
```

### aria-describedby

Points to supplementary description  -  announced after the element's name and role:

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

Hides decorative elements from screen readers. Never apply to focusable elements  -  a hidden-but-focusable element creates an invisible, unannounced interactive target:

```html
<span aria-hidden="true">→</span>  <!-- Decorative arrow -->
```

### aria-live

Announces dynamic content updates. Use `polite` for the vast majority of cases  -  it waits until the screen reader finishes the current sentence before reading the update. Reserve `assertive` for genuine, time-critical errors that require interrupting the user immediately:

```html
<!-- Polite: search results count, cart updates, status messages -->
<div aria-live="polite" aria-atomic="true" id="status"></div>

<!-- Assertive: session timeout warnings, payment failures  -  use sparingly -->
<div aria-live="assertive" id="critical-error"></div>
```

`aria-atomic="true"` re-reads the entire region when any part changes, rather than just the changed portion. Use it when partial announcements would be confusing (e.g. "3 results" vs "Showing 3 results for 'shoes'").

### Common roles

```html
<div role="alert">Error: email is required.</div>      <!-- Implies aria-live="assertive" -->
<div role="status">3 results found.</div>              <!-- Implies aria-live="polite" -->
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

<!-- Never omit alt  -  screen readers fall back to the filename -->
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

Every input needs a visible, associated label. Never use `placeholder` as a label  -  it disappears on input and typically fails contrast requirements:

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

### autocomplete tokens (WCAG 1.3.5  -  Identify Input Purpose)

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

For native `<input>` elements, the `required` attribute is sufficient  -  it is announced by screen readers and triggers native validation. Add `aria-required="true"` only for custom components that don't use native form elements:

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

Group related inputs (radio buttons, checkboxes) with `<fieldset>` and `<legend>`  -  the legend is announced before each option, providing essential context:

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

1. **Dismissible**  -  the user can dismiss the tooltip without moving pointer or focus (Escape key closes it)
2. **Hoverable**  -  the mouse can move from the trigger into the tooltip without it disappearing
3. **Persistent**  -  the tooltip stays visible until the user dismisses it, moves focus, or removes the pointer

```html
<!-- aria-describedby makes screen readers announce the tooltip text with the button -->
<span class="tooltip-wrap">
  <button type="button" aria-describedby="save-tip">Save</button>
  <span id="save-tip" role="tooltip" class="tooltip">Saves a draft without publishing</span>
</span>
```

```css
.tooltip-wrap {
  position: relative;
}
.tooltip {
  display: none;      /* hidden by default */
  position: absolute; /* place it directly against the trigger, with no gap */
}

/* Wrong: tooltip is a sibling of the trigger, so it closes as soon as the
   pointer leaves the trigger, and keyboard users never see it */
.trigger:hover + .tooltip { display: block; }

/* Correct: a shared wrapper keeps the tooltip open while the pointer is over
   the trigger or the tooltip, and also shows it on keyboard focus */
.tooltip-wrap:hover .tooltip,
.tooltip-wrap:focus-within .tooltip {
  display: block;
}
.tooltip-wrap.is-dismissed .tooltip {
  display: none; /* set by the Escape handler below. Same specificity as the
                   show rule above, so it wins only because it comes later */
}
```

```javascript
// Escape hides the tooltip without moving focus or the pointer
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll('.tooltip-wrap').forEach((wrap) => wrap.classList.add('is-dismissed'));
});
// Re-arm the tooltip the next time the user hovers or focuses the trigger
document.querySelectorAll('.tooltip-wrap').forEach((wrap) => {
  wrap.addEventListener('pointerenter', () => wrap.classList.remove('is-dismissed'));
  wrap.addEventListener('focusin', () => wrap.classList.remove('is-dismissed'));
});
```

Keep the tooltip adjacent to its trigger with no gap, so the pointer can cross into it. The `interestfor` attribute will eventually handle this natively, but it is Chromium-only as of October 2026.

---

## Color & Contrast

Color alone must never be the only way to convey information  -  always pair color with text, icons, or patterns.

### Contrast ratios (WCAG 2.2 AA)

| Text type | Minimum ratio |
|---|---|
| Normal text (< 18pt / < 14pt bold) | 4.5:1 |
| Large text (≥ 18pt / ≥ 14pt bold) | 3:1 |
| UI components and graphics | 3:1 |
| Decorative text, disabled UI | No requirement |

```html
<!-- Wrong: color alone marks the error -->
<label for="email-1">Email</label>
<input type="email" id="email-1" style="border-color: red" />

<!-- Correct: color + icon + text -->
<label for="email-2">Email</label>
<input type="email" id="email-2" style="border-color: red" aria-invalid="true" aria-describedby="err" />
<p id="err"><span aria-hidden="true">⚠</span> Email is required.</p>
```

### Warning: semi-transparent rgba() text

Semi-transparent colors for text are unreliable for contrast compliance. The effective contrast of `rgba(R,G,B,0.5)` depends on every background layer beneath it, including parent elements, stacked components, and page backgrounds. You cannot evaluate the contrast of a semi-transparent color in isolation.

**The problem:** `rgba(16,185,129,0.5)` (50% emerald-500) on white resolves to approximately `#88DCC0`, which has a contrast ratio of about 1.6:1 against white. On a dark background the same token may pass. The color looks "present" visually but fails silently.

**Rule:** Never use semi-transparent rgba() values for text content. Use fully opaque color tokens instead. If you need a "muted" appearance, pick a specific opaque value and measure its contrast directly.

```css
/* Wrong: contrast is unpredictable across backgrounds */
color: rgba(16, 185, 129, 0.5);
color: rgba(239, 68, 68, 0.5);

/* Correct: fully opaque, measurable value */
color: #047857;   /* emerald-700, 5.48:1 on white */
color: #dc2626;   /* red-600, 4.83:1 on white */
```

### Context-dependent contrast: the same color token can pass or fail

A color that passes contrast on one background will fail on another. This is the most common real-world failure pattern in multi-section layouts where sections use different background colors.

**Example:** `slate-500` (#64748B)
- On white (#FFFFFF): 4.76:1  -  passes AA
- On slate-50 (#F8FAFC): 4.55:1  -  passes AA (barely)
- On slate-100 (#F1F5F9): 4.34:1  -  fails AA for normal text

**Rule:** When a color token is used in more than one context, verify contrast against each background it appears on. Do not assume a token that passes on white will pass on tinted section backgrounds.

### Tailwind slate palette contrast reference

Contrast ratios for slate shades against common backgrounds, calculated with the WCAG 2 relative luminance formula. AA requires 4.5:1 for normal text, 3:1 for large text and UI components. Hex values are Tailwind v3; Tailwind v4 defines the palette in OKLCH, and its rendered values give ratios within about 0.1 of these.

| Slate shade | Hex value | On white #FFFFFF | On slate-50 #F8FAFC | On slate-100 #F1F5F9 |
|---|---|---|---|---|
| slate-400 | #94A3B8 | 2.56:1  -  FAIL | 2.45:1  -  FAIL | 2.34:1  -  FAIL |
| slate-500 | #64748B | 4.76:1  -  PASS | 4.55:1  -  PASS (barely) | 4.34:1  -  FAIL |
| slate-600 | #475569 | 7.58:1  -  PASS | 7.24:1  -  PASS | 6.92:1  -  PASS |
| slate-700 | #334155 | 10.35:1  -  PASS | 9.90:1  -  PASS | 9.45:1  -  PASS |
| slate-800 | #1E293B | 14.63:1  -  PASS | 13.98:1  -  PASS | 13.35:1  -  PASS |
| slate-900 | #0F172A | 17.85:1  -  PASS | 17.06:1  -  PASS | 16.30:1  -  PASS |

**Key takeaways:**
- `slate-400` fails AA for normal text on every common background, and even fails the 3:1 large-text threshold. Use it only for decorative, non-informational content.
- `slate-500` passes on white but has almost no margin: it fails on slate-100, and any tinted or semi-transparent background can push it under 4.5:1. Treat it as "verify every use".
- `slate-600` is the safe default for secondary text on white and light tinted backgrounds.
- Each step from white to slate-50 to slate-100 costs about 5% of contrast, which is enough to flip a borderline color from pass to fail.

### Brand color accessibility: decorative vs. text tokens

Bright brand colors are optimized for visual identity, not readability. Saturated greens, teals, and ambers that look bold and confident often fail AA contrast for normal-sized text, particularly on light backgrounds.

**Example:** `emerald-500` (#10B981)
- On white: 2.54:1  -  FAIL for normal text, large text, and UI components
- On slate-100: 2.32:1  -  FAIL
- Even `emerald-600` (#059669) is only 3.77:1 on white: fine for large text and UI components, not for normal text. `emerald-700` (#047857, 5.48:1) is the first shade that passes for body text.

**Pattern: two tokens for one brand color**

Define separate tokens for text use and decorative use. Never use the decorative/icon token on body-size text without checking contrast.

```css
/* Token pair for a brand green */
--color-brand-decorative: #10B981;  /* emerald-500: decorative fills and illustrations only (2.54:1 on white) */
--color-brand-text:       #047857;  /* emerald-700: inline text, small labels  -  5.48:1 on white */
```

```tsx
// Wrong: brand green on small text
<span className="text-emerald-500">Status: Active</span>   {/* 2.54:1 on white  -  FAIL */}

// Correct: darker shade for text use
<span className="text-emerald-700">Status: Active</span>   {/* 5.48:1 on white  -  PASS */}

// Badge: white text on emerald-500 is only 2.54:1, so use a darker fill
<span className="bg-emerald-700 text-white rounded px-2">Active</span>   {/* 5.48:1  -  PASS */}
```

Check every brand color at the size and background where it actually appears. "It looks bold" is not a contrast measurement.

### Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/) (desktop, eyedropper tool)
- Chrome/Firefox DevTools color picker  -  shows contrast ratio inline

---

## Focus Management

### Visible focus indicator

Never remove focus outlines without a replacement. WCAG 2.4.7 Focus Visible (AA) requires a visible indicator, 1.4.11 Non-text Contrast (AA) requires a custom indicator to reach 3:1 against adjacent colors, and 2.4.11 Focus Not Obscured (AA) requires that sticky content never covers it completely. Aim for 2.4.13 Focus Appearance (AAA): a 2px-thick perimeter with 3:1 contrast between focused and unfocused states.

```css
/* Wrong: removes indicator for everyone */
* { outline: none; }

/* Correct: styled focus that meets 2.4.7 and 1.4.11, and the 2.4.13 target */
:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
  border-radius: 2px;
}
```

Use `:focus-visible` rather than `:focus`  -  it shows the indicator for keyboard users but suppresses it for mouse clicks, matching user expectations.

### Dialogs and modals

A modal dialog must move focus into itself when it opens, keep focus and the screen reader inside while open, close on Escape, and return focus to the trigger when it closes. Use the native `<dialog>` element opened with `showModal()` (Baseline widely available): the browser makes the rest of the page inert, closes on Escape, exposes `aria-modal="true"`, and the HTML spec restores focus to the previously focused element on close.

```html
<button type="button" id="delete-btn" commandfor="confirm-dialog" command="show-modal">
  Delete project
</button>

<dialog id="confirm-dialog" aria-labelledby="confirm-title">
  <h2 id="confirm-title">Delete this project?</h2>
  <p>This cannot be undone.</p>
  <form method="dialog">
    <!-- autofocus sets initial focus; put it on the least destructive action -->
    <button value="cancel" autofocus>Cancel</button>
    <button value="delete">Delete</button>
  </form>
</dialog>
```

```javascript
const trigger = document.getElementById('delete-btn');
const dialog = document.getElementById('confirm-dialog');

// Invoker commands (command/commandfor) became Baseline in December 2025.
// Fall back to showModal() for older browsers.
if (!('command' in HTMLButtonElement.prototype)) {
  trigger.addEventListener('click', () => dialog.showModal());
}

dialog.addEventListener('close', () => {
  const result = dialog.returnValue;
  // showModal() does not reset returnValue and Escape leaves it unchanged,
  // so reset it or a later Escape would repeat the last action
  dialog.returnValue = '';
  // Safari does not focus buttons on click, so the browser may have nothing
  // to restore focus to; send it back to the trigger
  if (document.activeElement === document.body) trigger.focus();
  if (result === 'delete') {
    // YOUR_DELETE_ACTION
  }
});
```

Always include a visible close or cancel button; do not rely on Escape alone. Opening a `<dialog>` with `show()` or the `open` attribute makes it non-modal, with no inert background.

If you cannot use `<dialog>` (for example, a legacy component library), replicate the behavior: `role="dialog"`, `aria-modal="true"`, an accessible name, `inert` on the rest of the page, an Escape handler, and focus returned to the trigger on close.

### Dynamic content

When content updates dynamically (search results, filtered lists, notifications), announce it or move focus:

```javascript
// Option A: announce via live region (no focus move  -  least disruptive)
statusEl.textContent = `${results.length} results found.`;  // aria-live="polite" on statusEl

// Option B: move focus to the new content region
resultsContainer.setAttribute('tabindex', '-1');
resultsContainer.focus();
```

---

## Motion & Animation

Some users experience vestibular disorders triggered by motion. Always respect the OS-level reduced-motion preference.

Two different criteria apply:

- **2.2.2 Pause, Stop, Hide (A):** moving, blinking, or scrolling content that starts automatically, lasts more than 5 seconds, and runs in parallel with other content (carousels, looping animations, auto-advancing banners) needs a pause, stop, or hide control. Short CSS transitions (button hover states, accordion expand) are not subject to this 5-second rule.
- **2.3.3 Animation from Interactions (AAA):** motion triggered by user interaction (parallax, zoom-in page transitions, scroll-linked effects) can be disabled. Honoring `prefers-reduced-motion` is the standard way to meet it, and it costs a few lines of CSS, so do it on every project.

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

No single tool catches everything. Use this order  -  each layer catches what the previous misses.

### 1. Automated scan

Run first  -  fast and catches obvious violations. Automated tools catch approximately 30 - 40% of WCAG issues.

- **axe DevTools** (browser extension)  -  WCAG violations, ARIA errors
- **Lighthouse** (Chrome DevTools > Lighthouse tab)  -  accessibility score from a subset of axe-core rules. A score of 100 does not mean the page conforms to WCAG; Lighthouse itself says automatic detection finds only a subset of issues.
- **WAVE** (browser extension)  -  visual overlay showing errors, warnings, and structural info
- **IBM Equal Access** (browser extension)  -  WCAG 2.2 coverage

**Accessibility tree inspection:** Chrome DevTools > Elements panel > Accessibility tab shows the computed accessible name, role, and state for any element. Firefox has a dedicated Accessibility Inspector panel. Use these to debug unexpected announcements  -  more diagnostic than running axe alone.

### 2. Keyboard-only

Tab through every interactive flow without a mouse:
- Every interactive element must be reachable and operable
- Focus indicator must always be visible
- Test dialogs, dropdowns, date pickers, and all dynamic content
- Verify Escape closes modals and dropdowns

### 3. Screen reader

Pairings to test, based on the WebAIM Screen Reader User Survey #11 (published September 2026). The most common combinations were JAWS with Chrome (31%), NVDA with Chrome (17%), JAWS with Edge (17%), and NVDA with Firefox (9%). On mobile, VoiceOver on iOS dominates (about 73% of respondents' primary mobile platform is Apple).

| Screen reader | Platform | Browser | Free? |
|---|---|---|---|
| NVDA | Windows | Chrome (primary), Firefox | Yes |
| JAWS | Windows | Chrome, Edge | No  -  most common primary desktop screen reader |
| VoiceOver | iOS / iPadOS | Safari | Yes (built-in)  -  most important mobile test |
| VoiceOver | macOS | Safari | Yes (built-in) |
| TalkBack | Android | Chrome | Yes (built-in) |
| Narrator | Windows | Edge | Yes (built-in)  -  rarely a primary screen reader; optional |

Minimum for most projects: NVDA + Chrome on Windows and VoiceOver + Safari on iOS. Add JAWS for enterprise or government audiences.

Basic test: navigate by headings (H in NVDA/JAWS), by landmarks (D), and by form elements (F). Verify every announcement makes sense without visual context.

### 4. Zoom

- 200%  -  no content should overflow or become inaccessible
- 400%  -  content must reflow to a single column without horizontal scrolling (WCAG 1.4.10 Reflow)

### 5. Text spacing

Apply the WCAG 1.4.12 text spacing bookmarklet (sets `line-height: 1.5`, `letter-spacing: 0.12em`, `word-spacing: 0.16em`, and spacing after paragraphs of 2 times the font size). No content should overlap or be clipped.

Bookmarklet source: [stevefaulkner's text spacing bookmarklet](https://www.html5accessibility.com/tests/tsbookmarklet.html)

### 6. Color and vision

- Grayscale filter: Chrome DevTools > Rendering > Emulate vision deficiencies > Achromatopsia  -  verify no information is lost
- Also test: Deuteranopia (red/green), Protanopia
- Verify no information relies on color alone

---

## Anti-Patterns to Flag

Flag these actively when encountered in code review or generation:

- **Accessibility overlay scripts as sole compliance strategy**  -  overlays do not achieve WCAG conformance and have been challenged in ADA litigation. Mention this explicitly.
- **`aria-label` that doesn't match visible button text**  -  breaks voice control (WCAG 2.5.3). The accessible name must contain the visible text, ideally at the start, so "click Submit" works.
- **`aria-hidden="true"` on focusable elements**  -  the element still receives keyboard focus but is invisible to screen readers, so users land on a silent, unnamed stop. Remove `aria-hidden`, or make the content unfocusable (`inert` does both for a whole region).
- **`tabindex` values greater than 0**  -  overrides the natural tab order and becomes unmanageable.
- **Hover-only content with no keyboard/focus equivalent**  -  fails WCAG 2.1.1 and 1.4.13.
- **Infinite scroll with no keyboard access to footer content**  -  users cannot reach content below the scroll boundary. Provide a "Load more" button or pagination.
- **Custom date pickers with no keyboard support**  -  implement full arrow-key navigation or use a native `<input type="date">`.
- **`aria-required="true"` on native `<input required>`**  -  redundant in modern browsers; keep only `required`.
- **Placeholder text as the only label**  -  disappears when the user types; fails 1.3.1 and 2.4.6.
- **Blocking clipboard paste in password fields**  -  breaks password managers and fails WCAG 3.3.8.
- **Semi-transparent rgba() colors for text**  -  the effective contrast depends on all stacked backgrounds and cannot be measured from the color value alone. Use fully opaque tokens for any text content and measure the resulting rendered color against its background.
- **Mid-gray palette values (slate-400, slate-500) on light section backgrounds**  -  slate-400 (#94A3B8) fails everywhere at 2.56:1 on white. slate-500 (#64748B) passes on white (4.76:1) and barely on slate-50 (4.55:1), but fails on slate-100 (4.34:1). Use slate-600 or darker for normal text on any light background. Flag all uses of slate-400 and slate-500 on text content for contrast verification.
- **Bright brand colors on small text or as badge fills behind white text**  -  emerald-500 is 2.54:1 against white either way. Check the darker shade (emerald-700 for Tailwind greens) before shipping.

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
- [ ] Focus indicator always visible (2.4.7) with 3:1 contrast (1.4.11); 2px+ outline recommended (2.4.13)
- [ ] Focused elements never fully hidden by sticky headers, footers, or banners (2.4.11)
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
- [ ] Login and checkout allow paste and password managers; no transcription CAPTCHA without a non-cognitive alternative (WCAG 3.3.8)
- [ ] Touch targets on product cards and CTAs are at least 44×44px (best practice; 24×24 is the AA minimum)
- [ ] Error recovery: clear error messages linked to specific fields

### Web app / SaaS (add)

- [ ] Modals use `<dialog>` with `showModal()` (or replicate it): focus moves in, background inert, Escape closes, focus returns on close
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

- [ ] All touch targets at least 44×44px (best practice; 24×24 is the AA minimum)
- [ ] `@media (pointer: coarse)` rules for touchscreen spacing
- [ ] Hover-dependent content has keyboard/focus equivalent
- [ ] Tested with TalkBack (Android) and VoiceOver (iOS)
- [ ] Tested at 200% OS text size
