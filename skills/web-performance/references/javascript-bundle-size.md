## JavaScript Bundle Size

Applies when: any site with a JavaScript build step.

### Measure before optimizing

Use your bundler's analysis tools to identify what is in each bundle before making changes.

#### Next.js App Router

Next.js 16 builds with Turbopack by default. On Next.js 16.1+ use the built-in Turbopack analyzer, which shows client and server modules with full import chains:

```bash
npx next analyze            # interactive treemap in the browser
npx next analyze --output   # write to .next/diagnostics/analyze for before/after diffs
```

For webpack builds (Next.js 15, or 16 with webpack), use `@next/bundle-analyzer`:

```bash
npm install --save-dev @next/bundle-analyzer
```

```ts
// next.config.ts
import withBundleAnalyzer from '@next/bundle-analyzer';

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);
```

```bash
ANALYZE=true npm run build
```

#### Vite / SPA

Use `rollup-plugin-visualizer`:

```bash
npm install --save-dev rollup-plugin-visualizer
```

```js
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [visualizer({ open: true })],
};
```

### Code-split heavy components

Avoid loading code that is not needed for the initial render:

```js
// Vanilla JS / any bundler
const { heavyFunction } = await import('./heavy-module.js');
```

```tsx
// React with Next.js: ssr: false is only allowed inside a Client Component
'use client';
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 rounded" />,
  ssr: false,
});
```

```tsx
// React without Next.js
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));

<Suspense fallback={<div>Loading...</div>}>
  <HeavyChart />
</Suspense>
```

### Avoid importing entire libraries

Importing a full library to use one function includes the entire library in the bundle:

```js
// Wrong: imports all of lodash (~70 KB gzipped)
import _ from 'lodash';
const result = _.groupBy(items, 'category');

// Correct: imports only groupBy (~1 KB gzipped)
import groupBy from 'lodash/groupBy';
const result = groupBy(items, 'category');
```

Prefer libraries that support tree-shaking (ES module exports with named exports). Verify tree-shaking is working by checking the bundle output after import.

### Next.js App Router: Server Components reduce client bundle

In Next.js App Router, every component defaults to a Server Component. Server Components run only on the server - their code is never sent to the browser. This is the single most impactful bundle size optimization in the App Router.

Common mistake: adding `'use client'` to components that don't need it (no event handlers, no hooks, no browser APIs). Audit `'use client'` directives and remove them where not required.
