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
