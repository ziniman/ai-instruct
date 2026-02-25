# Web Accessibility Guide

> Applies to: Any website or web app | Updated: February 2026

A practical guide for building accessible websites — covering WCAG standards, semantic HTML, keyboard navigation, ARIA, forms, color contrast, and testing.

> **Why it matters:** Accessibility is a legal requirement in many jurisdictions (ADA, EAA, EN 301 549) and improves usability for all users, not just those with disabilities. WCAG 2.2 is the current standard; WCAG 3.0 is in development but not yet adopted.

## Contents

1. [WCAG Standards Overview](#wcag-standards-overview)
2. [Semantic HTML](#semantic-html)
3. [Keyboard Navigation](#keyboard-navigation)
4. [ARIA](#aria)
5. [Images & Media](#images--media)
6. [Forms](#forms)
7. [Color & Contrast](#color--contrast)
8. [Focus Management](#focus-management)
9. [Motion & Animation](#motion--animation)
10. [Testing](#testing)
11. [Checklist](#checklist)

---

## WCAG Standards Overview

WCAG (Web Content Accessibility Guidelines) is organized around four principles — content must be:

| Principle | Meaning |
|-----------|---------|
| **Perceivable** | Information must be presentable in ways users can perceive (e.g. alt text for images) |
| **Operable** | UI must be operable without a mouse (e.g. keyboard access) |
| **Understandable** | Content and UI must be understandable (e.g. clear labels, predictable behavior) |
| **Robust** | Content must work with assistive technologies (e.g. valid HTML, correct ARIA) |

### Conformance levels

- **Level A** — minimum, must fix (e.g. images have alt text)
- **Level AA** — standard legal requirement in most jurisdictions (e.g. 4.5:1 color contrast)
- **Level AAA** — enhanced, not always achievable site-wide

Aim for **WCAG 2.2 Level AA** as your baseline.

---

## Semantic HTML

Semantic HTML is the highest-value accessibility improvement — it's free, requires no ARIA, and works with all assistive technologies.

### Page structure

```html
<html lang="en">  <!-- Always declare language -->
<head>
  <title>Page Title - Site Name</title>  <!-- Unique, descriptive title per page -->
</head>
<body>
  <header>
    <nav aria-label="Main">...</nav>
  </header>
  <main>          <!-- One <main> per page — screen readers jump here -->
    <h1>Page Heading</h1>
    <article>...</article>
    <section aria-labelledby="section-heading">
      <h2 id="section-heading">Section Title</h2>
    </section>
  </main>
  <aside aria-label="Related links">...</aside>
  <footer>...</footer>
</body>
```

### Heading hierarchy

Use headings to convey document structure, not visual size. Screen reader users navigate by headings.

```html
<!-- Correct: logical hierarchy -->
<h1>Main Topic</h1>
  <h2>Subtopic</h2>
    <h3>Detail</h3>
  <h2>Another Subtopic</h2>

<!-- Wrong: skipped levels or headings used for styling -->
<h1>Title</h1>
<h3>Jumped straight to h3</h3>  ✗
```

One `<h1>` per page. Don't skip heading levels.

### Use the right element

Native HTML elements come with built-in keyboard support, roles, and states — prefer them over custom implementations.

| Instead of | Use |
|------------|-----|
| `<div onclick>` | `<button>` |
| `<div>` for navigation | `<nav>` |
| `<span>` for links | `<a href>` |
| `<div>` for lists | `<ul>` / `<ol>` + `<li>` |
| `<b>` for emphasis | `<strong>` or `<em>` |
| `<div>` for data | `<table>` with `<th>` headers |

---

## Keyboard Navigation

All interactive elements must be reachable and operable with a keyboard alone. Users navigate with `Tab`, `Shift+Tab`, `Enter`, `Space`, and arrow keys.

### Focus order

Focus must follow a logical order — typically top-to-bottom, left-to-right, matching visual layout. Don't use `tabindex` values greater than 0 (they break natural tab order):

```html
<!-- Correct: use tabindex="0" to add non-interactive elements to tab order -->
<div tabindex="0" role="region" aria-label="Interactive area">...</div>

<!-- Wrong: positive tabindex overrides natural order -->
<button tabindex="3">First visually but third in tab order</button>  ✗
```

### Skip navigation link

Provide a "skip to main content" link as the first focusable element — lets keyboard users bypass repeated navigation:

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
<!-- ... nav, header ... -->
<main id="main-content">...</main>
```

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
}
.skip-link:focus {
  top: 0;  /* Visible when focused, hidden otherwise */
}
```

### Keyboard interactions for custom components

If you build custom interactive components, implement the expected keyboard behavior:

| Component | Expected keys |
|-----------|--------------|
| Button | `Enter`, `Space` to activate |
| Link | `Enter` to follow |
| Checkbox | `Space` to toggle |
| Radio group | Arrow keys to move between options |
| Dropdown/Select | Arrow keys to navigate, `Enter` to select, `Escape` to close |
| Dialog/Modal | `Escape` to close, focus trapped inside while open |
| Tabs | Arrow keys to switch tabs |
| Accordion | `Enter`/`Space` to expand/collapse |

---

## ARIA

ARIA (Accessible Rich Internet Applications) adds semantic meaning to HTML when native elements aren't sufficient. Use it as a last resort — correct semantic HTML is always better.

### The first rule of ARIA

> Don't use ARIA if a native HTML element or attribute already has the semantics you need.

### Common ARIA attributes

**`aria-label`** — names an element when there's no visible text label:

```html
<button aria-label="Close dialog">✕</button>
<nav aria-label="Breadcrumb">...</nav>
```

**`aria-labelledby`** — points to an element whose text names this element:

```html
<section aria-labelledby="billing-heading">
  <h2 id="billing-heading">Billing</h2>
</section>
```

**`aria-describedby`** — points to supplementary descriptive text:

```html
<input type="password" aria-describedby="pw-hint" />
<p id="pw-hint">Must be at least 8 characters.</p>
```

**`aria-expanded`** — indicates whether a collapsible element is open:

```html
<button aria-expanded="false" aria-controls="menu">Menu</button>
<ul id="menu" hidden>...</ul>
```

Update `aria-expanded` to `"true"` when the element opens.

**`aria-hidden`** — hides decorative elements from screen readers:

```html
<span aria-hidden="true">→</span>  <!-- Decorative arrow -->
```

Never apply `aria-hidden="true"` to focusable elements.

**`aria-live`** — announces dynamic content changes:

```html
<!-- Use 'polite' for non-urgent updates (announces after current speech) -->
<div aria-live="polite" aria-atomic="true">
  Form submitted successfully.
</div>

<!-- Use 'assertive' only for urgent errors that need immediate attention -->
<div aria-live="assertive">Payment failed.</div>
```

### Common ARIA roles

Use roles only when there's no native HTML element:

```html
<div role="alert">Error: email is required.</div>        <!-- Urgent message -->
<div role="status">3 results found.</div>                 <!-- Non-urgent update -->
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Delete</h2>
</div>
```

---

## Images & Media

### Alt text

Every `<img>` must have an `alt` attribute. The value depends on the image's purpose:

```html
<!-- Informative image: describe what it shows -->
<img src="chart.png" alt="Bar chart showing 40% increase in Q4 sales" />

<!-- Decorative image: empty alt so screen readers skip it -->
<img src="divider.png" alt="" />

<!-- Functional image (button/link): describe the action -->
<a href="/home"><img src="logo.svg" alt="Go to homepage" /></a>

<!-- Missing alt entirely: screen readers read the filename — never do this -->
<img src="hero-image-v2-final.jpg" />  ✗
```

### SVG

```html
<!-- Decorative SVG -->
<svg aria-hidden="true" focusable="false">...</svg>

<!-- Meaningful SVG -->
<svg role="img" aria-label="Upload file">...</svg>
```

### Video & audio

- Provide captions for all video with speech or meaningful audio (`<track kind="captions">`)
- Provide transcripts for audio-only content
- Don't autoplay audio or video with sound

```html
<video controls>
  <source src="video.mp4" type="video/mp4" />
  <track kind="captions" src="captions.vtt" srclang="en" label="English" default />
</video>
```

---

## Forms

Forms are one of the most common accessibility failure points.

### Always use `<label>`

Every input needs a visible, associated label — never use `placeholder` as a substitute (it disappears on input and has poor contrast):

```html
<!-- Correct: explicit association via for/id -->
<label for="email">Email address</label>
<input type="email" id="email" name="email" />

<!-- Correct: implicit association (label wraps input) -->
<label>
  Email address
  <input type="email" name="email" />
</label>

<!-- Wrong: placeholder is not a label -->
<input type="email" placeholder="Email address" />  ✗
```

### Required fields

```html
<label for="name">Full name <span aria-hidden="true">*</span></label>
<input type="text" id="name" required aria-required="true" />
<p>Fields marked <span aria-hidden="true">*</span> are required.</p>
```

### Error messages

Link errors directly to their input using `aria-describedby`:

```html
<label for="email">Email</label>
<input type="email" id="email" aria-describedby="email-error" aria-invalid="true" />
<p id="email-error" role="alert">Enter a valid email address.</p>
```

Set `aria-invalid="true"` on the input when it has an error; remove it when valid.

### Fieldsets for grouped inputs

Group related inputs (radio buttons, checkboxes) with `<fieldset>` and `<legend>`:

```html
<fieldset>
  <legend>Preferred contact method</legend>
  <label><input type="radio" name="contact" value="email" /> Email</label>
  <label><input type="radio" name="contact" value="phone" /> Phone</label>
</fieldset>
```

---

## Color & Contrast

Color alone must not be the only way to convey information — always pair color with text, icons, or patterns.

### Contrast ratios (WCAG 2.2 AA)

| Text type | Minimum contrast ratio |
|-----------|----------------------|
| Normal text (< 18pt / < 14pt bold) | 4.5:1 |
| Large text (≥ 18pt / ≥ 14pt bold) | 3:1 |
| UI components and graphics | 3:1 |
| Decorative text, disabled UI | No requirement |

### Don't rely on color alone

```html
<!-- Wrong: only color distinguishes the error -->
<input style="border-color: red" />

<!-- Correct: color + icon + text -->
<input style="border-color: red" aria-describedby="err" />
<p id="err">⚠ Email is required.</p>
```

### Check contrast

Use these tools to verify contrast ratios:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/) (desktop app, eyedropper tool)
- Browser DevTools — Chrome and Firefox both show contrast ratios in the color picker

---

## Focus Management

### Visible focus indicator

Never remove focus outlines without replacing them. Many users depend on the visible focus ring to navigate:

```css
/* Wrong: removes focus indicator for everyone */
* { outline: none; }  ✗
button:focus { outline: none; }  ✗

/* Correct: style focus to match your design */
:focus-visible {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
  border-radius: 2px;
}
```

Use `:focus-visible` instead of `:focus` — it only shows the indicator for keyboard users, not mouse clicks.

### Dialogs and modals

When a dialog opens, move focus into it. When it closes, return focus to the trigger:

```javascript
const trigger = document.getElementById('open-dialog-btn');
const dialog = document.getElementById('dialog');
const firstFocusable = dialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

// Opening
function openDialog() {
  dialog.removeAttribute('hidden');
  firstFocusable.focus();
}

// Closing
function closeDialog() {
  dialog.setAttribute('hidden', '');
  trigger.focus();  // Return focus to the element that opened the dialog
}
```

Trap focus inside the dialog while it's open — Tab should cycle through dialog elements only.

### Dynamic content

When content is dynamically inserted (search results, notifications, filtered lists), move focus or announce the update:

```javascript
// Option A: move focus to the new content
resultsContainer.focus();

// Option B: announce via live region (no focus move)
statusEl.textContent = `${results.length} results found.`;  // aria-live="polite" on statusEl
```

---

## Motion & Animation

Some users experience vestibular disorders triggered by motion. Respect the OS-level reduced motion preference:

```css
/* Apply animations by default */
.animated {
  transition: transform 0.3s ease;
}

/* Remove or reduce motion when user has requested it */
@media (prefers-reduced-motion: reduce) {
  .animated {
    transition: none;
  }
}
```

Never autoplay carousels or looping animations that users can't pause. Provide pause/stop controls for any animation lasting more than 5 seconds.

---

## Testing

No single tool catches everything. Use a combination of automated and manual testing.

### Automated tools (catch ~30-40% of issues)

| Tool | Type | What it catches |
|------|------|----------------|
| [axe DevTools](https://www.deque.com/axe/devtools/) | Browser extension | WCAG violations, ARIA errors |
| [Lighthouse](https://developer.chrome.com/docs/lighthouse/) | Built into Chrome DevTools | Accessibility score, common issues |
| [WAVE](https://wave.webaim.org/) | Browser extension / web | Visual overlay of errors and warnings |
| [IBM Equal Access](https://www.ibm.com/able/toolkit/tools/) | Browser extension | WCAG 2.2 coverage |

### Manual testing (required — automated tools miss most issues)

**Keyboard-only navigation:**
1. Unplug your mouse
2. Tab through the entire page — every interactive element must be reachable and operable
3. Verify focus is always visible
4. Test dialogs, dropdowns, and dynamic content

**Screen reader testing:**

| Screen reader | Platform | Free? |
|--------------|----------|-------|
| NVDA + Firefox | Windows | Yes |
| VoiceOver | macOS / iOS | Yes (built in) |
| TalkBack | Android | Yes (built in) |
| JAWS + Chrome | Windows | No (most common enterprise SR) |

Basic screen reader test: navigate the page by headings (H key in NVDA/JAWS), by landmarks (D key), and by form elements (F key). Verify announcements make sense without visual context.

**Zoom testing:**
- Zoom browser to 200% — no content should overflow or become inaccessible
- Zoom to 400% — content should reflow to single column (WCAG 1.4.10 Reflow)

**Color:**
- Test with grayscale filter (simulate color blindness): Chrome DevTools > Rendering > Emulate vision deficiencies
- Verify no information is conveyed by color alone

---

## Checklist

### Structure & Semantics
- [ ] `<html lang>` set to correct language code
- [ ] Unique, descriptive `<title>` on every page
- [ ] One `<h1>` per page, no skipped heading levels
- [ ] Landmarks used: `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>`
- [ ] Lists use `<ul>`/`<ol>`, data uses `<table>` with `<th>` headers

### Keyboard & Focus
- [ ] All interactive elements reachable by Tab
- [ ] Focus order is logical
- [ ] Focus indicator is always visible (never `outline: none` without replacement)
- [ ] Skip navigation link present
- [ ] Dialogs trap focus and return it on close

### Images & Media
- [ ] All `<img>` have `alt` (empty `alt=""` for decorative images)
- [ ] SVGs have `aria-label` or `aria-hidden`
- [ ] Videos have captions
- [ ] Audio content has transcripts

### Forms
- [ ] Every input has an associated `<label>`
- [ ] Required fields marked with `aria-required="true"`
- [ ] Error messages linked via `aria-describedby`, `aria-invalid` set on invalid inputs
- [ ] Related inputs grouped with `<fieldset>` and `<legend>`

### Color & Contrast
- [ ] Normal text meets 4.5:1 contrast ratio
- [ ] Large text meets 3:1 contrast ratio
- [ ] UI components meet 3:1 contrast ratio
- [ ] No information conveyed by color alone

### Motion
- [ ] `prefers-reduced-motion` respected in CSS
- [ ] No autoplaying animations without a pause control

### Testing
- [ ] Automated scan run (axe or Lighthouse) with no critical violations
- [ ] Full keyboard navigation tested manually
- [ ] Tested with at least one screen reader
- [ ] Tested at 200% zoom
