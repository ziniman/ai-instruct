## Third-Party JavaScript

Applies when: any page that loads scripts from external services (analytics, auth, chat, ads, video embeds).

Third-party scripts are one of the most common performance problems on real-world pages. A single third-party script can add hundreds of kilobytes and 50-100+ ms of main-thread work to every page load.

### Measure the impact first

Before optimizing, measure which third-party scripts are loading and what they cost:

- PageSpeed Insights "3rd parties" insight (it replaced the "Reduce the impact of third-party code" audit in Lighthouse 13) lists each third-party entity with its transfer size and main-thread time
- Chrome DevTools > Network tab filtered by "third-party" (enable the "domain" column)
- WebPageTest > "Third-party summary" view

### Load third-party scripts only where needed

The single highest-impact fix is to stop loading scripts on pages that don't need them. A chat widget on your pricing page does not need to load on every blog post. An auth script does not need to load on unauthenticated marketing pages.

Scope third-party script loading to the routes that require the functionality:

```html
<!-- Wrong: loaded on every page via a shared layout -->
<script src="https://third-party-service.com/widget.js" defer></script>
```

```html
<!-- Correct: loaded only in the template for pages that use it -->
<!-- e.g. add to checkout.html but not blog.html -->
<script src="https://third-party-service.com/widget.js" defer></script>
```

In component-based frameworks, import or mount the third-party component only in the routes that need it, not in the root layout.

> **Real-world example:** PageSpeed Insights measured 305 KiB of auth provider JavaScript loading on a public marketing page, with 185 KiB unused. The root cause was the auth provider's wrapper component placed in the root layout, wrapping all routes. Fix: moved the auth provider wrapper out of the root layout and into only the layout files that need auth (dashboard, auth sign-in/sign-up, onboarding). Public marketing pages then load zero auth JavaScript, and the 60 ms auth initialization main-thread task disappears entirely from those pages.

#### Clerk v6 (Next.js App Router)

Move `<ClerkProvider>` out of the root `layout.tsx` and into only the route groups that need auth:

```
src/app/
  layout.tsx                <- root layout: NO ClerkProvider
  (marketing)/
    layout.tsx              <- no ClerkProvider needed
    page.tsx
  (dashboard)/
    layout.tsx              <- ClerkProvider here
  (auth)/
    layout.tsx              <- ClerkProvider here
```

Clerk v6 changed `<ClerkProvider>` behavior: it no longer opts the entire application into dynamic rendering by default. Routes that don't use auth data can be statically rendered even when `<ClerkProvider>` is present in a parent layout. When auth data is needed during server rendering, use `<ClerkProvider dynamic>` on the specific layout that requires it.

### Script loading strategies

Analytics, tag managers, and chat widgets are the most common cause of unused JavaScript and long tasks on otherwise well-optimized pages. The correct strategy depends on when the script's functionality is first needed.

| Script type | Strategy | Rationale |
|---|---|---|
| Google Tag Manager | `defer` in `<head>` | Must fire before meaningful user events; does not block rendering |
| Google Analytics (gtag.js) | `defer` in `<head>` | Same as GTM |
| Error monitoring (Sentry, Datadog RUM) | `async` in `<head>` | Must start early; fully independent, no DOM dependency |
| A/B testing / feature flags | Synchronous or server-side | Affects above-the-fold layout; must run before first render |
| Chat widgets | Load on user interaction | Never needed until the user engages; heavy payload |
| Video player embeds | Load when in viewport | Heavy; not needed until content is visible |
| Session replay / heatmaps | `requestIdleCallback` | No urgency; load when the browser has nothing else to do |
| Social sharing buttons | `defer` | No rendering dependency; defer is the safe minimum |

**The three modes:**
- **Blocking (default, no attribute):** pauses HTML parsing until the script downloads and executes. Never use for third-party scripts.
- **`defer`:** downloads in parallel with HTML parsing; executes after parsing completes, in source order. Use for scripts that depend on the DOM or on each other.
- **`async`:** downloads in parallel; executes as soon as downloaded, interrupting HTML parsing. Use for fully independent scripts with no ordering dependency.

**Before/after: Google Tag Manager moved from injected async to declarative defer**

Google's install instructions place an inline snippet as high in `<head>` as possible. The inline part is tiny, and it injects `gtm.js` with `async`, so it does not block the download. The cost is that the preload scanner cannot see the injected URL, and an `async` script can execute in the middle of HTML parsing:

```html
<!-- Before: official snippet; gtm.js is injected by script, invisible to the preload scanner -->
<head>
  <script>
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-XXXXXXX');
  </script>
</head>
```

```html
<!-- After: declarative defer; keep the gtm.js push or Page View triggers never fire -->
<head>
  <script>
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  </script>
  <script defer src="https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX"></script>
</head>
```

The inline push is required, not optional: the `gtm.js` event it queues is the "Page View" event that fires tags on Page View and All Pages triggers. Loading `gtm.js` without it silently breaks those tags. Any events pushed before GTM finishes loading are queued in `dataLayer` and processed when it initializes. The declarative `defer` attribute is picked up by the preload scanner, so the file downloads in parallel with HTML parsing and only its execution waits until parsing finishes. Verify in GTM Preview mode that the `gtm.js` (Page View) event still appears after the change.

For scripts with no time requirement (heatmaps, session replay), delay loading until the browser is genuinely idle:

```js
function loadWhenIdle(src) {
  const load = () => {
    const script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(load, { timeout: 3000 });
  } else {
    setTimeout(load, 3000);
  }
}

loadWhenIdle('https://session-replay.example.com/tracker.js');
```

### Defer non-critical third-party scripts

Use `defer` or `async` on all third-party script tags. `defer` maintains execution order; `async` executes as soon as downloaded (use for independent scripts):

```html
<!-- Analytics: async is fine, order doesn't matter -->
<script src="https://analytics.example.com/script.js" async></script>

<!-- Scripts that depend on other scripts: defer preserves order -->
<script src="https://cdn.example.com/dependency.js" defer></script>
<script src="https://cdn.example.com/main.js" defer></script>
```

### Lazy-load third-party scripts on user interaction

For widgets that are only needed after a user action (chat, video player, share buttons), delay loading until the user interacts with the relevant element:

```js
document.getElementById('open-chat').addEventListener('click', () => {
  const script = document.createElement('script');
  script.src = 'https://chat-provider.example.com/widget.js';
  document.head.appendChild(script);
}, { once: true });
```

### Use the Partytown pattern for analytics

For analytics and tracking scripts that don't need DOM access, [Partytown](https://partytown.builder.io/) moves script execution to a Web Worker, removing it from the main thread entirely. This is most useful for Google Tag Manager, Google Analytics, and similar scripts.

### Self-host third-party scripts where possible

Self-hosting a third-party script (vendoring it into your own static assets) eliminates the external DNS lookup and connection. The tradeoff: you must update it manually. Appropriate for stable scripts (analytics libraries) but not for scripts that require a live connection to a third-party server.

### preconnect and dns-prefetch for third-party origins

When the browser first contacts a new origin, it must complete three steps before the first byte can arrive: DNS resolution (~20-120 ms), TCP handshake (~20-80 ms), and TLS negotiation (~40-160 ms). For origins contacted early in the page load, this full setup sequence adds directly to LCP.

Two resource hints reduce this cost:

- `preconnect` - opens the full DNS + TCP + TLS connection proactively, before the browser encounters the first request to that origin. Use for origins that load within the first 2 seconds of the page.
- `dns-prefetch` - resolves only DNS. Much lower resource cost. Use for origins that load after the initial render. (`preconnect` itself is Baseline Widely available, so a `dns-prefetch` fallback for it is no longer needed.)

**Decision rule:** origins that fire within the first 2 seconds (fonts, analytics, auth CDN, hero image CDN) get `preconnect`. Origins that load later (chat widget on scroll, video player on click) get `dns-prefetch`.

**Identifying retained third-party origins:** after scoping scripts to routes that need them and self-hosting what's feasible, list the external origins that still fire on the initial page load of your most important pages. Those are the candidates. Most pages have 2-5 retained origins.

```html
<!-- Origins needed within 2 seconds: full connection warm-up -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="https://cdn.analytics.example.com" />

<!-- Origins needed after initial render: DNS only -->
<link rel="dns-prefetch" href="https://chat.provider.com" />
<link rel="dns-prefetch" href="https://player.vimeo.com" />
```

**The `crossorigin` attribute** is required on `preconnect` hints for any origin serving fonts (which use CORS fetches). Without it the browser opens two separate connections: one from the preconnect hint (no CORS) and one for the actual font request (with CORS). The preconnect then saves nothing:

```html
<!-- Font origin: crossorigin required -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Script or API origin: crossorigin not needed -->
<link rel="preconnect" href="https://api.analytics.example.com" />
```

**The cost of over-hinting:** each `preconnect` opens a TCP + TLS handshake immediately. Chrome keeps the connection warm for 10 seconds before dropping it if unused. Preconnecting to 6+ origins simultaneously creates competing handshakes that can interfere with the connections that actually matter. Limit `preconnect` to your 2-4 most critical origins and use `dns-prefetch` for the rest. Lighthouse 13's "Network dependency tree" insight enforces the same rule: it warns when more than 4 preconnects are found, flags preconnects the page never uses (including ones broken by a wrong `crossorigin` value), and lists origins worth preconnecting.
