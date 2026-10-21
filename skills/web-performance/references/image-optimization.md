## Image Optimization

Applies when: any page with images.

### Use an image component or build-time processing

Framework image components and build-time tools handle format conversion, responsive sizing, and lazy loading automatically. Use them instead of plain `<img>` tags for content images.

| Approach | Tools |
|---|---|
| Next.js | `next/image` - converts to WebP by default (add AVIF via `images.formats`), lazy loads, generates `srcset` |
| Vite / SPA | `vite-imagetools`, `@unpic/react`, or manual pre-conversion |
| Astro | `<Image>` component built into Astro core |
| Plain HTML | Pre-convert images to WebP/AVIF using `sharp`, `squoosh`, or `sips` |

#### Next.js App Router

```tsx
import Image from 'next/image';

<Image
  src="/images/hero.png"
  alt="Hero image"
  width={800}
  height={450}
  // sizes tells the browser which image to fetch at which viewport width
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
  placeholder="blur"
  blurDataURL="data:image/png;base64,..."
/>
```

The `sizes` attribute is the most commonly missed configuration. Without it, the image is generated at full width for every viewport, wasting bandwidth on mobile.

For images loaded from external sources (S3, a CDN, a third-party service), configure allowed domains:

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-bucket.s3.amazonaws.com',
        pathname: '/uploads/**',
      },
    ],
  },
};
```

### Source format recommendations

| Source material | Recommended format | Notes |
|---|---|---|
| Photographs | AVIF with WebP fallback, or WebP | AVIF is often more than 50% smaller than JPEG; it encodes more slowly than WebP |
| Logos, icons | SVG | Inline SVG or `<img src="*.svg">` - bypass image processing for SVG |
| Screenshots | WebP | PNG source is fine; let the image tool convert |
| Animated content | WebP or AVIF (animated) | Avoid GIF; file sizes are 5-10x larger than equivalent WebP |

Keep the highest-quality source and let the image tool handle conversion. Pre-converting lossy-to-lossy degrades quality unnecessarily.

**Browser support (as of October 2026):** WebP and AVIF are both Baseline Widely available (AVIF reached that status in July 2026), so they are safe defaults. JPEG XL is not Baseline: Chrome 155 (October 2026), Firefox 158 (October 2026), and Safari 17+ support it, but Edge does not, so serve it only inside `<picture>` with an AVIF or WebP fallback, and only if you have measured a win over AVIF.

```html
<picture>
  <source srcset="/images/hero.jxl" type="image/jxl" />
  <source srcset="/images/hero.avif" type="image/avif" />
  <img src="/images/hero.webp" alt="..." width="1200" height="630" fetchpriority="high" />
</picture>
```

### Lazy loading and above-the-fold images

Lazy load all images below the fold. Never lazy-load images visible in the initial viewport, and give the LCP image `fetchpriority="high"` (see [LCP](lcp-largest-contentful-paint.md) for when a preload hint is also needed):

```html
<!-- Above-the-fold LCP image: not lazy, high priority -->
<img src="/images/hero.webp" alt="..." fetchpriority="high" width="1200" height="630" />

<!-- Below-the-fold images: opt in to lazy loading (the default is eager) -->
<img src="/images/product.webp" alt="..." loading="lazy" width="400" height="300" />
```

Native `loading="lazy"` on images is Baseline Widely available as of 2026, so a JavaScript lazy-loading library is no longer needed for images.
