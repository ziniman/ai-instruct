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
