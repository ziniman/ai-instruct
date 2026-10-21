## Instant Navigations: bfcache and Speculation Rules

Applies when: any multi-page site (marketing sites, blogs, e-commerce, docs). SPAs that handle routing client-side benefit less from speculation rules.

The fastest page load is one that is already done before the user clicks. Two browser features get there: the back/forward cache restores pages instantly on Back/Forward, and the Speculation Rules API prefetches or prerenders the likely next page.

### Keep pages eligible for the back/forward cache (bfcache)

The bfcache keeps a full snapshot of the page in memory, so Back and Forward navigations render instantly with near-zero LCP and no layout shift. It works in all major browsers, but pages opt out without realizing it:

- **Never add an `unload` listener.** Use `pagehide` instead. `unload` makes pages ineligible in desktop Firefox, and Chrome has deprecated it. Third-party scripts are a common source; `Permissions-Policy: unload=()` blocks them in Chromium browsers.
- **Avoid `Cache-Control: no-store` on HTML** unless the page holds sensitive data (see [CDN and Caching](cdn-and-caching.md)). Chrome measured it as the largest single reason pages miss the bfcache. Chrome has been rolling out bfcache for some `no-store` pages under safeguards ([bfcache-ccns](https://developer.chrome.com/docs/web-platform/bfcache-ccns)), but web.dev still describes this as in progress and other browsers have historically excluded such pages, so do not rely on it.
- **Add `beforeunload` only while there are unsaved changes**, and remove it once they are saved.
- **Refresh stale data on restore** instead of opting out:

```js
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // Page was restored from bfcache: refresh cart count, auth state, etc.
    refreshUserSpecificData();
  }
});
```

Test with Chrome DevTools > Application > Back/forward cache, which lists the exact blocking reasons, or the Lighthouse `bf-cache` diagnostic.

### Prefetch or prerender likely next pages with Speculation Rules

The Speculation Rules API tells the browser which links to prefetch (download the HTML) or prerender (load and render the whole page in a hidden tab, so the navigation is near-instant). Support as of 2026: Chromium only. Basic URL-list rules work in Chrome and Edge 109+, but document rules (`where`) and `eagerness`, as used below, need Chrome and Edge 121+. It is not Baseline: Safari has it behind a flag and Firefox does not support it. Unsupporting browsers ignore the `<script type="speculationrules">` block, so it is a safe progressive enhancement.

A safe starting point prerenders same-site links when the user shows intent (on desktop, hovering a link for 200 ms; on mobile, viewport heuristics):

```html
<script type="speculationrules">
{
  "prerender": [{
    "where": {
      "and": [
        { "href_matches": "/*" },
        { "not": { "href_matches": "/logout" } },
        { "not": { "href_matches": "/cart/*" } },
        { "not": { "selector_matches": ".no-prerender" } }
      ]
    },
    "eagerness": "moderate"
  }]
}
</script>
```

- **Exclude links with side effects** (logout, add-to-cart, one-time tokens): a prerender runs the page's JavaScript before the user commits to the navigation.
- **Start with `moderate` or `conservative` eagerness.** Chrome holds at most 2 speculations at a time for those levels and discards the oldest, which caps wasted bandwidth. `immediate` speculates as soon as the rules are seen.
- **Prefer prefetch over prerender for low-confidence links**; prerender costs roughly as much as rendering an iframe.
- **Check analytics and ad scripts** before enabling prerender, so that a prerendered page is not counted as a page view until the user actually visits it. Chrome's prerender documentation covers how to detect prerendering.
