## CSS Build Size

Applies when: any site using a CSS framework or build-time CSS processing.

Modern CSS frameworks eliminate unused styles at build time. The key is to avoid patterns that defeat purging.

### Avoid dynamic class name assembly

CSS purging tools scan source files statically. They cannot detect class names assembled at runtime from string concatenation:

```tsx
// Wrong: the tool cannot statically detect 'bg-red-500' or 'bg-green-500'
const color = isActive ? 'red' : 'green';
<div className={`bg-${color}-500`} />

// Correct: full class names must appear as literals in the source
const colorClass = isActive ? 'bg-red-500' : 'bg-green-500';
<div className={colorClass} />
```

This applies to any utility-first CSS framework (Tailwind, UnoCSS, Windi CSS).

### Tailwind CSS

#### Tailwind v3

Tailwind v3 uses a `content` array in `tailwind.config.js` to specify which files to scan for class names. Ensure all files that use Tailwind classes are included:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx}',
    './public/**/*.html',
  ],
};
```

#### Tailwind v4

Tailwind CSS 4 scans all project files automatically - there is no `content` array to configure. The output for a typical project includes approximately 21 KiB of CSS at baseline (CSS variables, keyframes, `@property` rules, resets), plus only the utilities actually used. After minification and gzip, the final CSS is typically under 10 KiB even for large projects.

**`@layer components` vs. `@utility` in Tailwind 4.** In Tailwind 3, `@layer components` was the recommended way to define custom component classes and they were purged when unused. In Tailwind 4, `@layer components` behaves as a CSS cascade layer - its contents are always included in the output whether used or not. Use `@utility` instead for purgeable custom classes:

```css
/* globals.css */
@import "tailwindcss";

/* Wrong in v4: always included regardless of usage */
@layer components {
  .btn-primary {
    @apply bg-blue-600 text-white px-4 py-2 rounded-md;
  }
}

/* Correct in v4: purged when unused. Use theme CSS variables; theme() is deprecated in v4 */
@utility btn-primary {
  background-color: var(--color-blue-600);
  color: var(--color-white);
  padding: --spacing(2) --spacing(4);
  border-radius: var(--radius-md);
}
```

### CSS Modules and scoped styles

CSS Modules (used in Next.js, Vite, and most modern bundlers) scope styles to the component they belong to. Unused component CSS is tree-shaken automatically when the component is not imported.

### Avoid `@apply` in component files

`@apply` in component CSS files extracts utility classes into a selector, duplicating styles in the output and defeating tree-shaking. Prefer utility classes directly in your HTML/JSX.

`@apply` is acceptable in global CSS files for base styles applied globally (e.g. `body`, heading elements, `:focus-visible`).
