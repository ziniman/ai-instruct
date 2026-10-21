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
