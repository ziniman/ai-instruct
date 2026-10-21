## Font Loading

Applies when: any page using custom web fonts.

### Prefer self-hosted fonts over Google Fonts CDN

Serving fonts from your own domain eliminates the external DNS lookup and connection to a third-party CDN. Self-hosted fonts load from the same origin as your HTML, which is almost always faster.

#### Next.js App Router

`next/font` self-hosts fonts automatically, eliminating the external network request to Google Fonts. It inlines the `@font-face` CSS and generates a preload hint:

```tsx
// src/app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

#### Vite / SPA

Use `fontsource` packages to bundle fonts with your build output:

```bash
npm install @fontsource/inter
```

```js
// main.js / main.ts
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
```

#### Plain HTML

Self-host font files in your static directory and reference them with `@font-face` in CSS. Add a `<link rel="preload">` hint in `<head>` for the most critical font weight:

```html
<link rel="preload" href="/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin />
```

### font-display strategy

| Value | Behavior | Use when |
|---|---|---|
| `swap` | Fallback text shows almost immediately; the web font swaps in whenever it loads | Branding-critical fonts; FOUT is acceptable |
| `fallback` | Fallback text almost immediately; swaps only if the font arrives within a short window | Compromise between `swap` and `optional` |
| `optional` | Fallback text almost immediately; no swap later, so the font is used only if it is ready almost at once (often from cache on repeat views) | Body text; eliminates font-swap CLS |
| `block` | Invisible text for a short block period, then fallback | Never, for performance (invisible text delays FCP and LCP) |

For body text that spans multiple lines, `optional` eliminates font-swap CLS but means the custom font may not render on a first visit over a slow connection. `swap` is the better choice for branding-critical fonts; pair it with a metric-matched fallback (below) to keep the swap from shifting layout.

### Match fallback font metrics to reduce swap CLS

When a web font swaps in, text reflows if the fallback font has different glyph widths and line heights. Define a fallback `@font-face` over a local system font and scale it with `size-adjust` (supported in all major engines since Safari 17, September 2023) so the swap barely moves anything:

```css
@font-face {
  font-family: 'Inter Fallback';
  src: local('Arial');
  size-adjust: 107%; /* tune per font until the swap stops shifting text */
}

body {
  font-family: 'Inter', 'Inter Fallback', sans-serif;
}
```

`ascent-override`, `descent-override`, and `line-gap-override` allow finer tuning but are not supported in Safari as of 2026. `next/font` generates a metric-matched fallback automatically (`adjustFontFallback` defaults to on), so Next.js projects using it need no manual fallback.

### Avoid @import in CSS

Never load fonts via `@import` inside a `.css` file or a `<style>` block rendered by JavaScript. The browser cannot discover the font URL until the CSS is parsed, which adds 300-500 ms to the critical path on slow connections:

```css
/* Wrong: delays font discovery */
@import url('https://fonts.googleapis.com/css2?family=Inter&display=swap');
```

If Google Fonts is required, load it from `<head>` with preconnect hints:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter&display=swap" />
```
