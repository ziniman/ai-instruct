# Google Analytics 4 Implementation Guide

> Applies to: Any website or web app | Updated: October 2026

A practical guide for implementing Google Analytics 4 (GA4)  -  covering installation, critical first-time setup, event tracking, e-commerce, consent, and advanced topics. Written for AI coding assistants: skip sections that don't apply to the user's setup.

> **Note:** Universal Analytics (UA / GA3) was fully sunset in 2024. GA4 is the only current Google Analytics product.

---

## Section 0: Before You Start

Answer these questions before writing any code. They determine which sections apply.

**Q: Are any of your visitors in the EU/EEA (European Economic Area), the UK, or Switzerland?**
Default: no  -  if yes, Consent Mode v2 setup is required (see [Consent Mode v2](#consent-mode-v2))

**Q: Do you run Google Ads (search, display, YouTube, or Shopping)?**
Default: no  -  if yes, ad consent signals matter for conversion tracking and which events you mark as key events and use as Ads conversions

**Q: Is your site a single-page app (React, Vue, Angular, Next.js, etc.) where the URL changes without a full page reload?**
Default: check `package.json` for a client-side router (`react-router-dom`, `vue-router`, `@angular/router`, `next`, `nuxt`, `@sveltejs/kit`)  -  if found, assume SPA and apply the [Single-Page Apps](#single-page-apps) section automatically

**Q: Do you need to track purchases or sales?**
Default: no  -  skip [E-commerce Tracking](#e-commerce-tracking) if no

**Q: Do you already have a GA4 property, or is this a fresh start?**
Default: fresh start  -  if fresh start, create a property at analytics.google.com before writing any code

**Q: Do you use Google Tag Manager, or add the tracking code directly?**
Default: direct gtag.js  -  recommend GTM only if the user has a marketing team managing multiple tags

> **AI assistant:** Use these answers to skip irrelevant sections. Do not implement Consent Mode unless the user confirms EEA, UK, or Swiss users, and do not implement e-commerce unless confirmed. If a SPA framework is detected, apply the SPA section and pick exactly one page_view approach (never manual `page_view` calls while the Enhanced Measurement history setting is still on); do not add `anonymize_ip`, which is a no-op in GA4 (see [Common Pitfalls](#common-pitfalls)).

---

## Contents

1. [Installation](#installation)
2. [Basic Configuration](#basic-configuration)
3. [Critical First-Time Setup](#critical-first-time-setup)
4. [Common Pitfalls](#common-pitfalls)
5. [Event Tracking](#event-tracking)
6. [Enhanced Measurement](#enhanced-measurement)
7. [User Properties & Custom Dimensions](#user-properties--custom-dimensions)
8. [E-commerce Tracking](#e-commerce-tracking)
9. [Consent Mode v2](#consent-mode-v2)
10. [Single-Page Apps](#single-page-apps)
11. [Debugging](#debugging)
12. [Validation & Testing](#validation--testing)
13. [Advanced: BigQuery Export & Sampling](#advanced-bigquery-export--sampling)

---

## Installation

### Option A: gtag.js (direct)

Add to `<head>` on every page. Replace `G-XXXXXXXXXX` with your Measurement ID (found in GA4 > Admin > Data Streams):

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Option B: Google Tag Manager

GTM lets non-developers add and update tags without code changes. Add to `<head>` and immediately after `<body>`:

```html
<!-- In <head> -->
<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXXX');
</script>

<!-- First thing in <body> (fallback for no-JS environments) -->
<noscript>
  <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
    height="0" width="0" style="display:none;visibility:hidden"></iframe>
</noscript>
```

**gtag.js vs GTM:** Use gtag.js for simple setups or full code control. Use GTM when a marketing or analytics team needs to add tags independently, or when you manage more than two or three tags across different vendors.

**If a page has both GTM and `gtag('config')` calls:** as of October 2026, `gtag('config', ...)` commands appear in the dataLayer as `gtag.config` events. GTM Custom Event triggers that match every event with a wildcard regex (e.g. `.*`) can now fire on them  -  narrow those triggers.

### Option C: Google tag gateway (first-party serving)

Google tag gateway for advertisers loads the Google tag from your own domain and sends measurement requests to your domain first, using your CDN (content delivery network) or load balancer, instead of loading directly from `googletagmanager.com`. It works with both gtag.js and GTM. Skip it unless the user asks for first-party tag serving.

- As of 2026, Google offers automated setups for Cloudflare, Akamai, Fastly, Google Cloud load balancers, and Amazon CloudFront, plus a self-service option for any CDN or server that can forward requests.
- Start from the Google tag settings: GA4 > Admin > Data streams > your web stream > Configure tag settings > Admin > **Google tag gateway**.
- With a self-service setup, replace every `googletagmanager.com` script `src` on every page with your new measurement path. Any page you miss keeps loading the tag from Google.
- It does not change your consent obligations. Keep Consent Mode in place; Google's Cloudflare setup guide says to turn off automated script setup if you use Consent Mode.

---

## Basic Configuration

Pass options as the third argument to `gtag('config', ...)`:

```javascript
gtag('config', 'G-XXXXXXXXXX', {
  // Disables the automatic page_view on load. Leave commented out unless you fire page_view manually.
  // send_page_view: false,  // ONLY with SPA Option 2 (manual page_view)

  // Cookie domain  -  'auto' (the default) works for most sites, including subdomains
  cookie_domain: 'auto',

  // Cookie expiry in seconds (default: 63072000 = 2 years)
  cookie_expires: 63072000,
});
```

Do not add `anonymize_ip`  -  it is silently ignored in GA4 (see [Common Pitfalls](#common-pitfalls)).

---

## Critical First-Time Setup

Complete these steps immediately after installing GA4, before any events are tracked in production. Some settings cannot be applied retroactively.

### 1. Set Data Retention to 14 Months

GA4 defaults to 2-month event data retention. After 2 months, event-level data is permanently deleted and cannot be recovered. Change this immediately.

Path: GA4 > Admin (gear icon) > Data Settings > Data Retention > Event data retention > **14 months** > Save

This does not affect aggregated data in standard reports  -  it affects Explorations, funnel reports, and any query that touches raw event data. Standard properties offer only 2 or 14 months (GA4 360 adds 26, 38, and 50 months for event data). If a standard property exceeds its event collection limits and becomes a "Large" property, Google automatically cuts event retention back to 2 months.

### 2. Filter Out Internal and Non-Production Traffic

Without filters, your own visits (dev, QA, team) and test deploys pollute production data permanently. Data filters only apply to new data, and an Active filter's exclusion is permanent.

Internal traffic is a two-step setup:

1. **Define the IPs** (this tags matching hits with `traffic_type=internal`): GA4 > Admin > Data streams > your web stream > Configure tag settings > Show more > **Define internal traffic** > Create. Add your office and VPN IP addresses or ranges (IPv4, IPv6, CIDR (Classless Inter-Domain Routing) notation such as `203.0.113.0/24`, or regex).
2. **Exclude them**: GA4 > Admin > Data filters > Create filter > **Internal Traffic** > Exclude. Start in **Testing** state, confirm in an Exploration (using the "Test data filter name" dimension) after 24 - 36 hours, then switch to **Active**.

Also add a **Web hostname traffic** filter (Admin > Data filters > Create filter, added in 2026) set to **Include only** your production hostname(s). This keeps `localhost`, staging, and preview deploys that reuse the production Measurement ID out of your reports. Include-only hostname filters also drop events with no hostname; they do not apply to Measurement Protocol events. A property can have up to 10 data filters.

### 3. Mark Key Events

GA4 has no Goals. The events you promote to measure business outcomes are called **key events** (formerly "conversions" in GA4). A **conversion** is now a Google Ads object created from a key event. Without this step, outcomes do not appear as key events in GA4 reports and nothing is available to import into Google Ads.

Path: GA4 > Admin > Data display > Events > find the event in Recent events > click the **star** icon

Events to mark:
- `purchase` (e-commerce)
- `generate_lead` (lead gen forms)
- Any other event representing a meaningful business outcome

Standard properties allow up to 30 key events (50 on GA4 360). Marking applies from that moment on; it does not change historical data. If you run Google Ads, create Ads conversions from these key events  -  that is what campaigns optimize against. Pick the wrong events and your campaigns optimize against the wrong signal.

### 4. Register Custom Dimensions

Custom event parameters are collected by GA4 but are invisible in all reports until registered. This step applies to any parameter you send beyond GA4's built-in ones.

Path: GA4 > Admin > Data display > Custom definitions > Custom dimensions > Create custom dimension

- Scope: Event (for parameters sent on individual events), User (for user properties), or Item (for custom parameters inside the e-commerce `items` array)
- Dimension name: human-readable label
- Event parameter: exact parameter name as used in your code (e.g. `button_label`)

Standard properties allow up to 50 event-scoped, 25 user-scoped, and 10 item-scoped custom dimensions. Register only what you actively use in reports.

---

## Common Pitfalls

Short list of mistakes that silently break GA4 implementations:

- **`anonymize_ip: true` does nothing in GA4.** IP anonymization is always on in GA4 and cannot be disabled  -  it is a Universal Analytics config key that GA4 silently ignores. Remove it if present. Do not add it to new implementations.
- **`send_page_view: false` does not stop SPA route-change page views.** Enhanced Measurement still sends `page_view` on browser history changes. Adding manual route-change `page_view` calls without turning off that setting double-counts every navigation (see [Single-Page Apps](#single-page-apps)).
- **Custom event parameters are invisible until registered.** Parameters arrive in GA4 but do not appear in Explorations or standard reports until you register them as Custom Dimensions (Admin > Data display > Custom definitions). No error is shown.
- **Data retention defaults to 2 months.** Change it to 14 months immediately. Data already deleted cannot be recovered.
- **`purchase` event double-fires without a unique `transaction_id`.** GA4 uses `transaction_id` to deduplicate purchase events. Always pass a unique ID per transaction; without it, page refreshes on the confirmation page create duplicate revenue.
- **`debug_mode: false` does not turn debug mode off.** Remove the parameter entirely (see [Debugging](#debugging)).
- **You cannot attach per-interaction custom parameters to Enhanced Measurement events from code.** Page-wide values passed to `gtag('config', ...)` or `gtag('set', ...)` ride along on later events, and Admin > Data display > Events > Modify event can add or rewrite parameters. If you need custom parameters per `file_download`, `video_start`, or similar interaction, fire those events manually and disable the corresponding Enhanced Measurement toggle.

---

## Event Tracking

GA4 uses an events-only data model  -  everything is an event with optional parameters.

### Syntax

```javascript
gtag('event', 'event_name', {
  parameter_name: 'value',
  another_parameter: 123,
});
```

### Standard Events Worth Knowing

GA4 has [standard event names](https://developers.google.com/analytics/devguides/collection/ga4/reference/events) for common actions. Use them where they fit  -  they populate built-in reports automatically. The common ones (`login`, `sign_up`, `purchase`, `search`) are self-explanatory. The less obvious ones:

| Action | Event name | Key parameters |
|--------|-----------|---------------|
| Item list viewed (e.g. category page) | `view_item_list` | `item_list_name`, `items` |
| Item detail viewed | `view_item` | `currency`, `value`, `items` |
| Promotional banner viewed | `view_promotion` | `promotion_name`, `creative_name` |
| Share | `share` | `method`, `content_type`, `item_id` |
| Form submission / lead | `generate_lead` | `value`, `currency` |
| Tutorial / onboarding step | `tutorial_begin`, `tutorial_complete` |  -  |

### Custom Events

Use custom events for actions that don't match a standard name.

```javascript
gtag('event', 'cta_click', {
  button_label: 'Get Started',
  button_location: 'hero',
});
```

Naming rules and limits (as of 2026):
- Event names: `snake_case`, start with a letter, only letters, numbers, and underscores, max 40 characters. Names are case-sensitive (`cta_click` and `CTA_Click` are two different events). A key event whose name exceeds 40 characters is not reported as a key event.
- Reserved event names for web  -  do not reuse them for custom events: `click`, `error`, `file_download`, `first_visit`, `form_start`, `form_submit`, `page_view`, `scroll`, `session_start`, `user_engagement`, `video_progress`, `video_start`, `view_search_results` (full list in Google's event naming rules).
- Parameters: up to 25 per event; names max 40 characters and must not start with `_`, `firebase_`, `ga_`, `google_`, or `gtag.`; values max 100 characters (except `page_title` 300, `page_referrer` 420, `page_location` 1,000).

---

## Enhanced Measurement

GA4 auto-tracks several events when Enhanced Measurement is enabled (GA4 > Admin > Data Streams > your stream > Enhanced Measurement toggle):

| Event | What it tracks |
|-------|---------------|
| `page_view` | Page loads, plus browser history changes (`pushState` / `replaceState` / `popstate`, i.e. SPA route changes) unless you turn off "Page changes based on browser history events" |
| `scroll` | User scrolls to 90% of page depth (once per page) |
| `click` | Outbound link clicks (not links to domains configured for cross-domain measurement) |
| `view_search_results` | Site search, detected from a URL query parameter (`q`, `s`, `search`, `query`, or `keyword` by default; add more in the settings) |
| `video_start` / `video_progress` / `video_complete` | YouTube embeds with JS API support enabled |
| `file_download` | Clicks on `.pdf`, `.csv`, `.docx`, etc. |
| `form_start` / `form_submit` | Form interactions |

Enhanced Measurement requires no code but gives little control over parameters. To attach custom parameters to any of these events, fire them manually and disable the matching Enhanced Measurement toggle to avoid duplicates. Form parameters (`form_id`, `form_name`, `form_destination`) appear in reports only after you register them as custom dimensions.

---

## User Properties & Custom Dimensions

User properties describe the user and persist across sessions. Limits: 25 user properties per property, names max 24 characters, values max 36 characters.

### Set User Properties

```javascript
// Call after the user authenticates or their profile is known
gtag('set', 'user_properties', {
  plan_type: 'pro',       // e.g. free / pro / enterprise
  user_role: 'admin',
  account_age_days: 42,
});
```

### Set User ID for Cross-Device Tracking

```javascript
// After login: applies to all subsequent events on the page.
// Use your internal user ID, never PII (personally identifiable information: email, name, phone). Max 256 characters.
gtag('set', { user_id: 'internal-user-id-123' });

// On logout: clear it with null (not '', 'null', or undefined)
gtag('set', { user_id: null });
```

If the user ID is already known when the page loads, pass it in the config instead: `gtag('config', 'G-XXXXXXXXXX', { user_id: 'internal-user-id-123' })`. Never send `user_id` for users who have not signed in, and do not also send it as a user property or custom dimension  -  it is a reserved field.

Register user properties as User-scoped Custom Dimensions in GA4 Admin before expecting to see them in reports (see [Critical First-Time Setup](#critical-first-time-setup)).

---

## E-commerce Tracking

Skip this section if the user has not confirmed they need purchase or sales tracking.

GA4 e-commerce uses standard event names and an `items` array. Fire events in sequence as the user moves through the funnel. Each item needs `item_id` or `item_name`, and you can add up to 27 custom item-level parameters. Set `value` to the sum of `price * quantity` across items (excluding tax and shipping), and always send `currency` with `value`.

### Product Viewed

```javascript
gtag('event', 'view_item', {
  currency: 'USD',
  value: 29.99,
  items: [{
    item_id: 'PLAN_PRO',
    item_name: 'Pro Plan',
    item_category: 'Subscription',
    price: 29.99,
    quantity: 1,
  }],
});
```

### Add to Cart / Begin Checkout

```javascript
gtag('event', 'add_to_cart', {
  currency: 'USD',
  value: 29.99,
  items: [{ item_id: 'PLAN_PRO', item_name: 'Pro Plan', price: 29.99, quantity: 1 }],
});

gtag('event', 'begin_checkout', {
  currency: 'USD',
  value: 29.99,
  items: [{ item_id: 'PLAN_PRO', item_name: 'Pro Plan', price: 29.99, quantity: 1 }],
});
```

### Purchase (fire on confirmation page or after payment confirmed)

```javascript
gtag('event', 'purchase', {
  transaction_id: 'TXN-20260101-001',  // Must be unique per transaction  -  GA4 deduplicates by this field
  currency: 'USD',
  value: 29.99,
  tax: 0,
  shipping: 0,
  customer_type: 'new',  // Optional: 'new' or 'returning'. Omit if unknown (e.g. guest checkout)
  items: [{
    item_id: 'PLAN_PRO',
    item_name: 'Pro Plan',
    item_category: 'Subscription',
    price: 29.99,
    quantity: 1,
  }],
});
```

Mark the `purchase` event as a key event in GA4 Admin (see [Critical First-Time Setup](#critical-first-time-setup)).

---

## Consent Mode v2

### No EEA, UK, or Swiss Users

If you have no visitors from the EU/EEA, the UK, or Switzerland, skip this section. If you later expand there, implement Consent Mode before launching  -  it cannot be applied retroactively to historical data.

### EEA, UK, or Swiss Users: Full Implementation Required

Google's EU user consent policy covers end users in the EEA, the UK, and Switzerland (Switzerland was added in July 2024). If you measure EEA users with Google tags or use Google Ads audiences or personalization, you must pass their consent choices to Google through Consent Mode (or the IAB (Interactive Advertising Bureau) Europe Transparency and Consent Framework, TCF); this has been mandatory for Consent Mode v2 signals since March 2024. Google says it does not expect verified consent signals for UK or Swiss traffic, but consent is still legally required there, so send the same signals for those visitors.

#### Advanced vs Basic Consent Mode

- **Advanced (the code below):** the Google tag loads before the consent banner and sends cookieless pings while consent is denied. This is the only mode that lets GA4 model data for users who decline. Behavioral modeling also needs, as of 2026, at least 1,000 events per day with `analytics_storage: 'denied'` for at least 7 days, and at least 1,000 daily users with `analytics_storage: 'granted'` on at least 7 of the previous 28 days.
- **Basic:** do not load the Google tag at all until the user consents. Simpler, but GA4 receives nothing (and models nothing) for users who decline.

Follow the user's legal guidance on which mode to use.

#### Set Default State Before gtag Loads

This block must execute before the gtag.js `<script>` tag. Place it immediately before the gtag snippet:

```html
<script>
  // Must run BEFORE the gtag.js script tag
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
    // wait_for_update: how long (ms) to wait for the consent banner to respond before
    // firing events with the default denied state. 500ms is a starting point  -  increase
    // it (e.g. to 1000 - 2000ms) if your CMP (consent management platform, the
    // cookie banner tool) loads slowly or on poor connections.
    // If this value is too low, events fire before consent is read and are attributed
    // to the denied state even when the user has previously consented.
  });
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

**Region-specific defaults (optional):** a default without `region` applies to every visitor, which drops full measurement everywhere. To deny by default only where consent is required, add a `region` list (ISO 3166-2 codes) and a second, region-less default for everyone else. When defaults overlap, the more specific region wins. These two calls replace the single `gtag('consent', 'default', ...)` call in the block above; keep them in that same `<script>`, before the gtag.js script tag.

```javascript
// Denied by default in the EEA, UK, and Switzerland
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500,
  region: ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
           'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES',
           'SE', 'IS', 'LI', 'NO', 'GB', 'CH'],
});

// Everyone else  -  only grant if no other privacy law applies to these visitors
gtag('consent', 'default', {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
});
```

#### Update After User Consents

```javascript
// Call this after the user accepts or rejects cookies in your consent banner
function onUserConsent({ analytics, ads }) {
  gtag('consent', 'update', {
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: ads ? 'granted' : 'denied',
    ad_user_data: ads ? 'granted' : 'denied',
    ad_personalization: ads ? 'granted' : 'denied',
  });
}
```

If you are not running Google Ads, `ad_storage`, `ad_user_data`, and `ad_personalization` can remain `denied` permanently  -  only `analytics_storage` is required for GA4 data collection.

#### GA4 Properties Linked to Google Ads (Change on June 15, 2026)

Per Google's [Updates to Google Analytics Data Controls](https://support.google.com/analytics/answer/17016975) announcement, since June 15, 2026, Consent Mode is the single control for whether Google Ads cookies and IDs collected by the GA4 tag are used in Google Ads. The Google Signals setting in GA4 now only controls linking GA4 data to signed-in users for GA4 behavioral reporting. Turning Google Signals off no longer keeps ad data out of a linked Ads account, so make sure the ad consent types default to `denied` wherever consent is required. Google has also announced (dates not yet set as of October 2026) that `ad_personalization` will become the sole control for ads personalization of GA4 data, and that GA4-collected IP addresses will be shared, encrypted, with linked Google Ads accounts.

---

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
// Call this on every route change, including the initial load
function trackPageView(title) {
  gtag('event', 'page_view', {
    page_location: window.location.href,  // Full URL; GA4 derives page path and other page dimensions from it
    page_title: title,
  });
}
```

Always send `page_location` (the full URL including domain, e.g. `https://yoursite.com/pricing`) and `page_title`  -  those are the parameters Google documents for manual page views. The Universal Analytics-era `page_path` parameter is not needed.

#### Framework Integration Examples

**React Router:**
```javascript
// React Router v6
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(document.title);
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
    trackPageView(document.title);
  }, [pathname, query]);
  return null;
}
```

**Vue Router:**
```javascript
router.afterEach((to) => {
  trackPageView(to.meta.title || document.title);
});
```

Hook into your router's navigation events and call `trackPageView` after the new URL and page title are in place.

### Google Tag Manager

If GA4 is deployed through GTM, turn off "Page changes based on browser history events" in GA4 (it double-counts alongside GTM tags) and follow Google's [Measure single-page applications with Tag Manager](https://developers.google.com/analytics/devguides/collection/ga4/measure-spa-gtm) guide, which uses a History Change trigger to send the virtual `page_view`.

---

## Debugging

### DebugView in GA4

Two ways to activate DebugView:

**Option 1  -  Tag Assistant (recommended):**
Open [tagassistant.google.com](https://tagassistant.google.com), connect your site, and events will stream into GA4 DebugView in real time. Tag Assistant enables debug mode by adding a parameter to your site's URL. Optionally install the [Tag Assistant](https://chromewebstore.google.com/detail/tag-assistant/kejbdjndbnbjgmefkgdddjlbokphdefk) Chrome extension, which shows the Google tags on the current page in a side panel and starts debugging from its **Troubleshoot tag** button. The older Tag Assistant Companion extension is merged into it and being retired (as of 2026).

**Option 2  -  `debug_mode` config flag:**
```javascript
gtag('config', 'G-XXXXXXXXXX', {
  debug_mode: true,  // Sends hits to DebugView without a browser extension
});
```

To turn debug mode off, delete the `debug_mode` line before deploying to production. Setting it to `false` does not disable debug mode. Debug hits are not automatically removed from standard reports; create a **Developer Traffic** data filter (Admin > Data filters > Create filter > Developer Traffic > Exclude) to keep them out.

Then open GA4 > Admin > Data display > DebugView to see events with all parameters in real time.

### Inspect Raw Network Requests

In browser DevTools > Network tab, filter by `/g/collect` to inspect the raw payloads being sent. Filter on the path rather than a hostname: the host can vary (for example `region1.google-analytics.com`, or your own domain when using Google tag gateway).

### Log All gtag Calls (Temporary, Dev Only)

```javascript
// Wrap gtag to log every call to the console while still sending it  -  remove before deploying
const originalGtag = window.gtag;
if (typeof originalGtag !== 'function') throw new Error('Load after the gtag snippet');
window.gtag = function(...args) {
  console.log('[GA]', ...args);
  originalGtag.apply(this, args);
};
```

---

## Validation & Testing

| Tool | Purpose |
|------|---------|
| [GA4 DebugView](https://analytics.google.com/) | Real-time event stream during development |
| [Tag Assistant](https://tagassistant.google.com/) | Validates gtag.js and GTM setup, including consent state |
| [GA4 Event Builder](https://ga-dev-tools.google/ga4/event-builder/) | Build and validate Measurement Protocol (server-side) event payloads |
| Browser Network tab | Filter by `/g/collect` to inspect raw hits |

### Pre-Launch Checklist

**Always:**
- [ ] Data retention set to 14 months (Admin > Data Settings > Data Retention)
- [ ] Internal traffic defined in tag settings and the Internal Traffic filter set to Active
- [ ] Hostname filter limits data to production hostname(s), or staging/local builds use a separate Measurement ID
- [ ] Key events marked (star icon) in Admin > Data display > Events
- [ ] Custom Dimensions registered for all custom parameters
- [ ] `page_view` fires on initial load and verified in DebugView
- [ ] Key events fire with correct parameters  -  verified in DebugView
- [ ] `debug_mode` line and console overrides removed from production build
- [ ] User ID set after login, cleared with `null` on logout, and contains no PII (no email, name, or phone)

**If e-commerce:**
- [ ] `transaction_id` is unique per purchase
- [ ] `purchase` event is marked as a key event

**If EEA, UK, or Swiss users:**
- [ ] Consent Mode default state fires before gtag.js loads
- [ ] Consent update fires correctly after user accepts or rejects
- [ ] `wait_for_update` value tuned for your CMP's load time
- [ ] If linked to Google Ads: ad consent types default to `denied` where consent is required

**If SPA:**
- [ ] Exactly one approach in use: Enhanced Measurement history events, or history setting off plus manual `page_view`
- [ ] Each route change produces exactly one `page_view` in DebugView with the correct `page_location` and `page_title`
- [ ] No double `page_view` on first load

---

## Advanced: BigQuery Export & Sampling

### Sampling in Explorations

Explorations (Funnel, Path, Segment Overlap, etc.) are sampled when a query covers more events than the quota  -  10 million events per query on standard properties (as of 2026; GA4 360 starts at 100 million and can go up to 1 billion). GA4 then processes a subset and extrapolates. Standard reports are generally unsampled, though heavy filtering on large properties can trigger sampling there too.

Indicator of sampling: the data quality icon at the top of the report shows the percentage of data used; anything below 100% is sampled.

### BigQuery Export

BigQuery export gives access to raw, unsampled event-level data. Use it for:
- Joining GA4 data with CRM, product, or ad spend data
- Running custom queries that GA4's UI doesn't support
- Escaping Exploration sampling limits
- Building custom dashboards in Looker Studio or similar tools

Export options (as of 2026):
- **Daily** (free; you pay only for BigQuery storage and queries): one `events_YYYYMMDD` table per day. Standard properties are limited to 1 million events per day. If a property consistently exceeds that, Google pauses the daily export and does not reprocess skipped days  -  exclude low-value events during linking to stay under the limit.
- **Streaming**: near-real-time `events_intraday_YYYYMMDD` tables with no event limit, billed by BigQuery at $0.05 per GB (roughly 600,000 events per GB). Best-effort, so query the daily `events_` tables for final numbers.
- **Fresh Daily**: GA4 360 only.

Path to enable: GA4 > Admin > Product links > BigQuery links > Link (requires Editor on the GA4 property and Owner on the BigQuery project).

Data starts flowing within 24 hours of linking and covers only data from that point on  -  there is no backfill of raw events collected before the link. Link BigQuery early, even if you will not query it for months.

### Attribution Model

GA4's default attribution model is data-driven attribution (DDA), which uses machine learning to distribute key event credit across touchpoints. As of 2026, the other available models are Paid and organic last click (last non-direct click) and Google paid channels last click.

The first click, linear, time decay, and position-based models were removed from GA4 in November 2023. If you're comparing to older reports that used those models, results will differ.
