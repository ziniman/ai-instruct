## Single-Page Apps

In a SPA, the browser does not reload between routes, so route changes must still produce a `page_view`. Use exactly one of the two approaches below. Running both counts every navigation twice.

### Option 1 (default): Enhanced Measurement History Events

By default, Enhanced Measurement sends a `page_view` on every browser history change (`pushState`, `replaceState`, `popstate`), which is how React Router, Vue Router, the Next.js router, and Angular Router navigate. Google recommends this for SPAs that use the History API.

1. Confirm GA4 > Admin > Data streams > your web stream > Enhanced measurement > Page views (gear icon) > **Page changes based on browser history events** is on.
2. Keep the standard gtag snippet with its normal `config` call. Add no route-change code.
3. Verify in DebugView that each navigation produces exactly one `page_view` with the new `page_location` and the right `page_title`. If `page_title` shows the previous page's title, your app updates `document.title` after the URL changes; switch to Option 2 so you control the timing.

After each virtual navigation, reset the scroll position (`window.scrollTo(0, 0)`) so the new screen starts at the top, as it would on a full page load.

### Option 2: Manual page_view on Route Change

Use this when you need control over when `page_view` fires or what it contains.

First, turn **off** "Page changes based on browser history events" in Enhanced Measurement (same path as above). `send_page_view: false` only suppresses the page-load `page_view`; it does not stop history-based ones.

Then disable the automatic `page_view` on initial load:

```javascript
gtag('config', 'G-XXXXXXXXXX', {
  send_page_view: false,  // Fire manually via trackPageView, including the initial load
});
```

Fire `page_view` on each route change:

```javascript
// Call this on every route change, including the initial load.
// Pass an explicit title when you have one; otherwise wait a frame so
// frameworks that set document.title in an effect have updated it.
// Hidden tabs pause animation frames, so send at once there.
function trackPageView(title) {
  const send = () => gtag('event', 'page_view', {
    page_location: window.location.href,  // Full URL; GA4 derives page path and other page dimensions from it
    page_title: title || document.title,
  });
  if (title || document.hidden) send();
  else requestAnimationFrame(send);
}
```

Always send `page_location` (the full URL including domain, e.g. `https://yoursite.com/pricing`) and `page_title`  -  those are the parameters Google documents for manual page views. The Universal Analytics-era `page_path` parameter is not needed.

Router hooks often fire before the new page has set `document.title`, which is why Option 1 can report the previous title. The one-frame wait covers titles set synchronously during render or in an effect. If a page sets its title only after data loads, pass the title explicitly (from route metadata or the page component) instead of relying on `document.title`.

#### Framework Integration Examples

**React Router:**
```javascript
// React Router v6
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    trackPageView();
  }, [location]);
}
```

**Next.js App Router:**
```javascript
'use client';
// Render once in app/layout.js, wrapped in Suspense (required for useSearchParams
// on static pages, or the production build fails):
//   <Suspense fallback={null}><PageTracker /></Suspense>
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function PageTracker() {
  const pathname = usePathname();
  const query = useSearchParams().toString();  // Track query-only navigations too
  useEffect(() => {
    trackPageView();
  }, [pathname, query]);
  return null;
}
```

**Vue Router:**
```javascript
router.afterEach((to) => {
  trackPageView(to.meta.title);  // Falls back to document.title after a frame
});
```

Hook into your router's navigation events and call `trackPageView` after the new URL and page title are in place.

### Google Tag Manager

If GA4 is deployed through GTM, turn off "Page changes based on browser history events" in GA4 (it double-counts alongside GTM tags) and follow Google's [Measure single-page applications with Tag Manager](https://developers.google.com/analytics/devguides/collection/ga4/measure-spa-gtm) guide, which uses a History Change trigger to send the virtual `page_view`.
