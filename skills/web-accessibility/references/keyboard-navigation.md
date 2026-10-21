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
