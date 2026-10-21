## CLS: Cumulative Layout Shift

Applies when: any page with images, dynamically loaded content, or web fonts.

CLS measures how much the page layout shifts after initial render. Shifts are jarring and cause accidental taps on mobile.

### Always set image dimensions

Every `<img>` must have explicit `width` and `height` attributes. Without these, the browser does not reserve space for the image, causing a layout shift when it loads:

```html
<!-- Correct: browser reserves space before image loads -->
<img src="/images/product.webp" alt="Product name" width="800" height="450" />

<!-- Wrong: no reserved space, layout shifts on load -->
<img src="/images/product.webp" alt="Product name" />
```

For images that fill their container (unknown intrinsic dimensions), use CSS `aspect-ratio` on the container:

```css
.image-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}
```

### Avoid injecting content above existing content

Elements that load after the initial render and push content down cause high CLS. Common causes:

- Auth user interface components (avatar, username) rendering after hydration - reserve space with a fixed-size skeleton
- Toast notifications that push content down instead of overlaying it - use an overlay-based notification library positioned at the screen edge
- Ad or analytics scripts that inject banners - avoid this; if unavoidable, reserve the space before the script loads

### Stabilize font loading

Web fonts that load after the initial render cause text to reflow (FOUT: Flash of Unstyled Text). Use `font-display: optional` for body fonts to avoid shifts, or `font-display: swap` if the FOUT is visually acceptable.
