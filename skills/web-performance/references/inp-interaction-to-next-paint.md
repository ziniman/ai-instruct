## INP: Interaction to Next Paint

Applies when: any page with user interactions - especially dashboards, data-entry forms, and interactive app flows.

INP measures how quickly the browser responds to every tap, click, or key press. A 200 ms response budget is tight on slow devices.

### DOM size and INP

Larger DOM trees slow down style recalculation, layout, and paint operations that happen during every interaction. As of Lighthouse 13 the old fixed node-count audit is gone; the "Optimize DOM size" insight reports total elements, maximum depth, and most children, and flags the page only when a style recalculation touching more than 300 elements or a layout of more than 100 objects takes over 40 ms. Treat roughly 800 nodes in `<body>` (the old warning level) as a point to start watching, and around 1,400 as large.

For long pages with many off-screen sections (feeds, long articles, documentation), `content-visibility: auto` lets the browser skip rendering work for sections outside the viewport. Pair it with `contain-intrinsic-size` so the scrollbar and layout stay stable. It is Baseline Newly available as of 2026; browsers without support simply render normally:

```css
.feed-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px; /* placeholder height until first render */
}
```

> **Real-world example:** PageSpeed Insights measured 366 DOM nodes and a maximum depth of 13 on a marketing home page. At this scale the impact is minor, but it establishes a baseline to watch as the page grows. For pages with deeply nested component trees or large data tables, DOM size becomes a meaningful INP contributor.

### Long main-thread tasks

Any synchronous operation over 50 ms on the main thread will cause high INP for interactions that happen during or just after it. Long tasks appear in PageSpeed Insights under "Avoid long main-thread tasks" and in the Chrome DevTools Performance tab as red-marked task bars.

> **Real-world example:** PageSpeed Insights identified three long main-thread tasks on a marketing page: 80 ms and 64 ms from own JavaScript, and 60 ms from a third-party auth initialization script. The own-JS tasks should be profiled in Chrome DevTools Performance tab to identify the specific call stacks. The third-party task is addressed in [Third-Party JavaScript](third-party-javascript.md).

### Debounce expensive input handlers

Text inputs that trigger live validation, filtering, or search on every keystroke create large INP values. Use `useDeferredValue` (React) or `debounce` to defer expensive work:

```tsx
import { useDeferredValue, useState } from 'react';

function SearchFilter({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  // filteredItems uses the deferred value - won't block the input response
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(deferredQuery.toLowerCase())
  );

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ItemList items={filteredItems} />
    </>
  );
}
```

For non-React setups, use a debounce helper:

```js
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

input.addEventListener('input', debounce(handleSearch, 150));
```

### Break up long synchronous tasks

Use `scheduler.yield()` (or `setTimeout(fn, 0)` as a fallback) to yield control back to the browser between chunks of work. `scheduler.yield()` is not Baseline: as of 2026 it ships in Chromium 129+ and Firefox 142+ but not Safari, so always feature-detect as below:

```js
async function processInChunks(items) {
  const CHUNK_SIZE = 100;
  const results = [];

  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    results.push(...chunk.map(processItem));

    // Yield to the browser between chunks
    if ('scheduler' in window && 'yield' in window.scheduler) {
      await window.scheduler.yield();
    } else {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return results;
}
```

### Optimistic UI for slow server operations

Server requests that take more than 200 ms to return will cause the UI to appear frozen if button state is tied to the request's completion. Apply optimistic updates immediately and reconcile with the server response afterward:

```tsx
'use client';
import { useOptimistic, useTransition } from 'react';

function ToggleStatus({ item }: { item: Item }) {
  const [optimisticActive, setOptimisticActive] = useOptimistic(item.isActive);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      setOptimisticActive(!optimisticActive);
      await toggleItemAction(item.id);
    });
  }

  return (
    <button onClick={handleToggle} disabled={isPending}>
      {optimisticActive ? 'Active' : 'Inactive'}
    </button>
  );
}
```
