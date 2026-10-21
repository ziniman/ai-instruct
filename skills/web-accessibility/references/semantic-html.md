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
| `<dialog>` + `showModal()` | Modal dialogs | Widely available | Default for modals. See [Dialogs and modals](focus-management.md#dialogs-and-modals). |
| `inert` attribute | Making background content unfocusable and hidden from assistive technology | Widely available | Use for custom overlays and off-screen panels. |
| `<details>` / `<summary>` | Disclosure widgets, accordions | Widely available | Default for show/hide content. |
| `<details name="group">` | Exclusive accordion (opening one closes the others) | Newly available (Sept 2024) | Use only when one-open-at-a-time helps; the HTML spec warns it can frustrate users who want to compare sections. |
| `popover` attribute + `popovertarget` | Non-modal menus, toggletips, pickers | Newly available (Jan 2025) | Use for non-modal overlays. The browser exposes `aria-expanded` on the invoking button and handles Escape and light dismiss. It adds no role, so add the semantics the content needs. Never use it for modals. |
| `command` / `commandfor` (invoker commands) | Opening a dialog or popover from a button without JavaScript | Newly available (Dec 2025) | Use with a small JavaScript fallback for older browsers. |
| `<dialog closedby>` | Light dismiss for dialogs | Not Baseline (no Safari) | Optional enhancement only. Escape already closes a modal opened with `showModal()`. |
| `interestfor` (interest invokers) | Hover/focus tooltips | Not Baseline (Chromium only) | Do not rely on it; use the pattern in [Touch & Pointer](touch-pointer.md). |
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
