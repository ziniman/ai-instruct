## Legacy JavaScript and Browser Targets

Applies when: any site with a JavaScript build step.

Without a defined browser target, most transpilers and bundlers default to a conservative target and ship polyfills for JavaScript features that modern browsers have natively supported since 2020-2021. These add roughly 10-20 KiB of dead weight to every page.

> **Real-world example:** PageSpeed Insights flagged 13 KiB of legacy polyfills on a marketing page: `Array.prototype.at`, `.flat`, `.flatMap`, `Object.fromEntries`, `Object.hasOwn`, and `String.prototype.trimEnd`/`trimStart`. The root cause was no `browserslist` config in `package.json` - the bundler defaulted to a conservative target. Fix: add a `browserslist` entry targeting Chrome 109+, Firefox 115+, Safari 15.6+. The bundler then skips polyfills for features those browsers support natively, eliminating all 13 KiB.

`browserslist` is a shared config format supported by most tools (Babel, SWC, PostCSS, ESLint). Add it to `package.json`:

```json
{
  "browserslist": [
    "Chrome >= 109",
    "Firefox >= 115",
    "Safari >= 15.6",
    "Edge >= 109"
  ]
}
```

Choose targets that match your actual user base. The targets above cover browsers released in late 2022 and later. Check your analytics data before tightening further.

### Next.js / SWC

SWC respects `browserslist` in Next.js 15 without any additional configuration. The old `experimental.browsersListForSwc` and `experimental.legacyBrowsers` flags have been removed - `browserslist` in `package.json` is the current mechanism.

**Important caveat:** A correct `browserslist` entry is necessary but not always sufficient in Next.js. Next.js maintains its own internal polyfill layer (`@next/polyfill-nomodule`) that may inject polyfills independently of your `browserslist` config. If PageSpeed Insights continues to flag legacy polyfills after setting `browserslist`, verify which bundle they originate from using the bundle analyzer.

Common polyfills that appear unnecessarily in Next.js output even with a modern `browserslist`:

- `Array.prototype.at`, `Array.prototype.flat`, `Array.prototype.flatMap`
- `Object.fromEntries`, `Object.hasOwn`
- `String.prototype.trimEnd`, `String.prototype.trimStart`

These are Baseline Widely Available features with full support in Chrome 109+, Firefox 115+, and Safari 15.6+. No polyfill is needed when targeting those versions. If the bundle analyzer shows these polyfills sourcing from `@next/polyfill-nomodule` rather than your own code, open an issue against the Next.js repo or pin a version that resolves it.

### Vite / esbuild

Vite's `build.target` option sets the JavaScript transpile target directly; it does not read `browserslist`. Current Vite (v8 as of 2026) defaults to `'baseline-widely-available'`, which resolves to the browsers that were Baseline Widely available on a date fixed per major version (for Vite 8: Chrome/Edge 111, Firefox 114, Safari 16.4). That default already avoids most legacy output, so only set `build.target` if your analytics justify a different range:

```ts
// vite.config.ts
export default {
  build: {
    // Default: 'baseline-widely-available'. Custom targets are ES versions
    // or browser versions, e.g. 'es2022' or ['chrome111', 'safari16.4'].
    target: 'es2022',
  },
};
```

Keep `browserslist` in `package.json` anyway: PostCSS/Autoprefixer, Babel, and ESLint plugins in the same project still read it.

### Babel

Babel reads `browserslist` automatically when `@babel/preset-env` is configured with `useBuiltIns: 'usage'`:

```json
{
  "presets": [
    ["@babel/preset-env", {
      "useBuiltIns": "usage",
      "corejs": 3
    }]
  ]
}
```
