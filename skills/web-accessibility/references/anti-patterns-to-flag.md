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
