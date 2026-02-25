# Google Analytics 4 Implementation Guide

> Applies to: Any website or web app | Updated: February 2026

A practical guide for implementing Google Analytics 4 (GA4) — covering installation, critical first-time setup, event tracking, e-commerce, consent, and advanced topics. Written for AI coding assistants: skip sections that don't apply to the user's setup.

> **Note:** Universal Analytics (UA / GA3) was fully sunset in 2024. GA4 is the only current Google Analytics product.

---

## Section 0: Before You Start

Answer these questions before writing any code. They determine which sections apply.

**Q: Are any of your visitors in Europe (EU/EEA) or the UK?**
Default: no — if yes, Consent Mode v2 setup is required (see [Consent Mode v2](#consent-mode-v2))

**Q: Do you run Google Ads (search, display, YouTube, or Shopping)?**
Default: no — if yes, ad consent signals matter for conversion tracking and which events you mark as conversions

**Q: Is your site a single-page app (React, Vue, Angular, Next.js, etc.) where the URL changes without a full page reload?**
Default: check the project for `package.json`, `next.config.*`, `vite.config.*`, `angular.json`, or `nuxt.config.*` — if found, assume SPA and apply the [Single-Page Apps](#single-page-apps) section automatically

**Q: Do you need to track purchases or sales?**
Default: no — skip [E-commerce Tracking](#e-commerce-tracking) if no

**Q: Do you already have a GA4 property, or is this a fresh start?**
Default: fresh start — if fresh start, create a property at analytics.google.com before writing any code

**Q: Do you use Google Tag Manager, or add the tracking code directly?**
Default: direct gtag.js — recommend GTM only if the user has a marketing team managing multiple tags

> **AI assistant:** Use these answers to skip irrelevant sections. Do not implement Consent Mode unless the user confirms EU/EEA/UK users. Do not implement e-commerce unless confirmed. If a SPA framework is detected in the project, automatically apply the SPA page_view section. Do not add `anonymize_ip` — it is a no-op in GA4 (see [Common Pitfalls](#common-pitfalls)).

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

---

## Basic Configuration

Pass options as the third argument to `gtag('config', ...)`:

```javascript
gtag('config', 'G-XXXXXXXXXX', {
  // Disable automatic page_view — set to false when firing it manually (e.g. SPAs)
  send_page_view: false,

  // Cookie domain — 'auto' works for most cases
  cookie_domain: 'yourdomain.com',

  // Cookie expiry in seconds (default: 63072000 = 2 years)
  cookie_expires: 63072000,
});
```

Do not add `anonymize_ip` — it is silently ignored in GA4 (see [Common Pitfalls](#common-pitfalls)).

---

## Critical First-Time Setup

Complete these steps immediately after installing GA4, before any events are tracked in production. Some settings cannot be applied retroactively.

### 1. Set Data Retention to 14 Months

GA4 defaults to 2-month event data retention. After 2 months, event-level data is permanently deleted and cannot be recovered. Change this immediately.

Path: GA4 > Admin (gear icon) > Data Settings > Data Retention > Event data retention > **14 months** > Save

This does not affect aggregated data in standard reports — it affects Explorations and any query that touches raw event data.

### 2. Set Up an Internal Traffic Filter

Without this filter, your own visits (dev, QA, team) pollute production data permanently. GA4 does not retroactively remove filtered data.

Path: GA4 > Admin > Data Filters > Create filter > Internal Traffic

1. Set the filter name (e.g. "Internal - Office")
2. Add your office and home IP addresses
3. Set filter state to **Active**

This sets `traffic_type=internal` on matching hits and excludes them from reports.

### 3. Mark Key Events as Conversions

GA4 has no Goals. Conversions are events you promote manually. Without this step, conversions do not appear in the Conversions report or pass signals to Google Ads.

Path: GA4 > Admin > Events > find the event > toggle **Mark as conversion**

Events to mark:
- `purchase` (e-commerce)
- `generate_lead` (lead gen forms)
- Any other event representing a meaningful business outcome

If you run Google Ads, the events marked as conversions here are what Ads campaigns optimize against. Mark the wrong events and your campaigns optimize against the wrong signal.

### 4. Register Custom Dimensions

Custom event parameters are collected by GA4 but are invisible in all reports until registered. This step applies to any parameter you send beyond GA4's built-in ones.

Path: GA4 > Admin > Custom definitions > Custom dimensions > Create custom dimension

- Scope: Event (for parameters sent on individual events) or User (for user properties)
- Dimension name: human-readable label
- Event parameter: exact parameter name as used in your code (e.g. `button_label`)

GA4 allows up to 50 event-scoped and 25 user-scoped custom dimensions on the free tier. Register only what you actively use in reports.

---

## Common Pitfalls

Short list of mistakes that silently break GA4 implementations:

- **`anonymize_ip: true` does nothing in GA4.** IP anonymization is always on in GA4 and cannot be disabled — it is a Universal Analytics config key that GA4 silently ignores. Remove it if present. Do not add it to new implementations.
- **Custom event parameters are invisible until registered.** Parameters arrive in GA4 but do not appear in Explorations or standard reports until you register them as Custom Dimensions (Admin > Custom definitions). No error is shown.
- **Data retention defaults to 2 months.** Change it to 14 months immediately. Data already deleted cannot be recovered.
- **`purchase` event double-fires without a unique `transaction_id`.** GA4 deduplicates purchase events by `transaction_id`. Always pass a unique ID per transaction; without it, page refreshes on the confirmation page create duplicate revenue.
- **Enhanced Measurement events cannot have custom parameters injected.** If you need custom parameters on `file_download`, `video_start`, or other Enhanced Measurement events, fire those events manually and disable the corresponding Enhanced Measurement toggle for that event.

---

## Event Tracking

GA4 uses an events-only data model — everything is an event with optional parameters.

### Syntax

```javascript
gtag('event', 'event_name', {
  parameter_name: 'value',
  another_parameter: 123,
});
```

### Standard Events Worth Knowing

GA4 has [standard event names](https://developers.google.com/analytics/devguides/collection/ga4/reference/events) for common actions. Use them where they fit — they populate built-in reports automatically. The common ones (`login`, `sign_up`, `purchase`, `search`) are self-explanatory. The less obvious ones:

| Action | Event name | Key parameters |
|--------|-----------|---------------|
| Item list viewed (e.g. category page) | `view_item_list` | `item_list_name`, `items` |
| Item detail viewed | `view_item` | `currency`, `value`, `items` |
| Promotional banner viewed | `view_promotion` | `promotion_name`, `creative_name` |
| Share | `share` | `method`, `content_type`, `item_id` |
| Form submission / lead | `generate_lead` | `value`, `currency` |
| Tutorial / onboarding step | `tutorial_begin`, `tutorial_complete` | — |

### Custom Events

Use custom events for actions that don't match a standard name. Event naming rules: `snake_case`, max 40 characters, avoid reserved names (`click`, `error`, `first_visit`, `page_view`, `scroll`, `session_start`, `user_engagement`).

```javascript
gtag('event', 'cta_click', {
  button_label: 'Get Started',
  button_location: 'hero',
});
```

---

## Enhanced Measurement

GA4 auto-tracks several events when Enhanced Measurement is enabled (GA4 > Admin > Data Streams > your stream > Enhanced Measurement toggle):

| Event | What it tracks |
|-------|---------------|
| `page_view` | Page loads |
| `scroll` | User scrolls to 90% of page depth |
| `click` | Outbound link clicks |
| `view_search_results` | Site search (if URL contains `q=` or `s=` param) |
| `video_start` / `video_progress` / `video_complete` | YouTube embeds |
| `file_download` | Clicks on `.pdf`, `.csv`, `.docx`, etc. |
| `form_start` / `form_submit` | Form interactions |

Enhanced Measurement requires no code but gives no control over parameters. To attach custom parameters to any of these events, fire them manually and disable the matching Enhanced Measurement toggle to avoid duplicates.

---

## User Properties & Custom Dimensions

User properties describe the user and persist across sessions.

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
// Set after login — use your internal user ID, never PII (email, name, phone)
gtag('config', 'G-XXXXXXXXXX', {
  user_id: 'internal-user-id-123',
});
```

Register user properties as User-scoped Custom Dimensions in GA4 Admin before expecting to see them in reports (see [Critical First-Time Setup](#critical-first-time-setup)).

---

## E-commerce Tracking

Skip this section if the user has not confirmed they need purchase or sales tracking.

GA4 e-commerce uses standard event names and an `items` array. Fire events in sequence as the user moves through the funnel.

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
  transaction_id: 'TXN-20260101-001',  // Must be unique per transaction — GA4 deduplicates by this field
  currency: 'USD',
  value: 29.99,
  tax: 0,
  shipping: 0,
  items: [{
    item_id: 'PLAN_PRO',
    item_name: 'Pro Plan',
    item_category: 'Subscription',
    price: 29.99,
    quantity: 1,
  }],
});
```

Mark the `purchase` event as a Conversion in GA4 Admin (see [Critical First-Time Setup](#critical-first-time-setup)).

---

## Consent Mode v2

### No EU/EEA/UK Users

If you have no EU, EEA, or UK users, skip this section. If you later expand to EU markets, implement Consent Mode before launching there — it cannot be applied retroactively to historical data.

### EU/EEA/UK Users: Full Implementation Required

Consent Mode v2 is required for Google Ads and GA4 to function correctly in EEA/UK markets (mandatory as of March 2024). It allows GA4 to model data for users who decline cookies rather than dropping their data entirely.

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
    // firing events with the default denied state. 500ms is a starting point — increase
    // it (e.g. to 1000–2000ms) if your CMP loads slowly or on poor connections.
    // If this value is too low, events fire before consent is read and are attributed
    // to the denied state even when the user has previously consented.
  });
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
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

If you are not running Google Ads, `ad_storage`, `ad_user_data`, and `ad_personalization` can remain `denied` permanently — only `analytics_storage` is required for GA4 data collection.

---

## Single-Page Apps

In a SPA, the browser does not reload between routes. GA4 does not automatically fire `page_view` on navigation — fire it manually on every route change.

Disable the automatic `page_view` on initial load to avoid double-counting:

```javascript
gtag('config', 'G-XXXXXXXXXX', {
  send_page_view: false,  // Fire manually via trackPageView on every route change
});
```

Fire `page_view` on each route change:

```javascript
// Call this on every route change, including the initial load
function trackPageView(path, title) {
  gtag('event', 'page_view', {
    page_location: window.location.href,  // Full URL — primary dimension in GA4 standard reports
    page_path: path,                       // Path portion (e.g. '/pricing')
    page_title: title,
  });
}
```

`page_location` is the full URL including domain (e.g. `https://yoursite.com/pricing`). GA4's standard Pages report uses `page_location` as its primary dimension. Omitting it causes manual SPA `page_view` hits to show discrepancies between DebugView and standard reports.

### Framework Integration Examples

**React Router / Next.js App Router:**
```javascript
// React Router v6
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location]);
}
```

**Vue Router:**
```javascript
router.afterEach((to) => {
  trackPageView(to.path, to.meta.title || document.title);
});
```

Hook into your router's navigation events and call `trackPageView` with the new path, full URL, and page title.

---

## Debugging

### DebugView in GA4

Two ways to activate DebugView:

**Option 1 — Tag Assistant Companion (recommended):**
Install the [Tag Assistant Companion](https://chrome.google.com/webstore/detail/tag-assistant-companion/jmekfmbnaedfebfnmakmokmlfpblbfdm) Chrome extension. Open [tagassistant.google.com](https://tagassistant.google.com), connect your site, and events will stream into GA4 DebugView in real time.

**Option 2 — `debug_mode` config flag:**
```javascript
gtag('config', 'G-XXXXXXXXXX', {
  debug_mode: true,  // Sends hits to DebugView without a browser extension
});
```

Remove `debug_mode: true` before deploying to production — debug hits are excluded from standard reports.

Then open GA4 > Admin > DebugView to see events with all parameters in real time.

### Inspect Raw Network Requests

In browser DevTools > Network tab, filter by `google-analytics.com/g/collect` to inspect the raw payloads being sent.

### Log All gtag Calls (Temporary, Dev Only)

```javascript
// Override gtag to log all calls to the console — remove before deploying
window.gtag = function(command, ...args) {
  console.log('[GA]', command, ...args);
};
```

---

## Validation & Testing

| Tool | Purpose |
|------|---------|
| [GA4 DebugView](https://analytics.google.com/) | Real-time event stream during development |
| [Tag Assistant](https://tagassistant.google.com/) | Validates gtag.js and GTM setup |
| [GA4 Event Builder](https://ga-dev-tools.google.com/ga4/event-builder/) | Preview and test event payloads |
| Browser Network tab | Filter by `google-analytics.com/g/collect` to inspect raw hits |

### Pre-Launch Checklist

**Always:**
- [ ] Data retention set to 14 months (Admin > Data Settings > Data Retention)
- [ ] Internal traffic filter created and set to Active
- [ ] Key events marked as Conversions in Admin > Events
- [ ] Custom Dimensions registered for all custom parameters
- [ ] `page_view` fires on initial load and verified in DebugView
- [ ] Key events fire with correct parameters — verified in DebugView
- [ ] `debug_mode` and console overrides removed from production build
- [ ] User ID set after login and contains no PII (no email, name, or phone)

**If e-commerce:**
- [ ] `transaction_id` is unique per purchase
- [ ] `purchase` event is marked as a Conversion

**If EU/EEA/UK users:**
- [ ] Consent Mode default state fires before gtag.js loads
- [ ] Consent update fires correctly after user accepts or rejects
- [ ] `wait_for_update` value tuned for your CMP's load time

**If SPA:**
- [ ] `send_page_view: false` set in initial config
- [ ] `page_view` fires on every route change with `page_location`, `page_path`, and `page_title`
- [ ] No double `page_view` on first load

---

## Advanced: BigQuery Export & Sampling

### Sampling in Explorations

Exploration reports (Funnel, Path, Segment Overlap, etc.) are sampled at high data volumes — GA4 will process a subset of events and extrapolate. Standard reports (Acquisition, Engagement, Monetisation) are not sampled.

Indicators of sampling: a shield icon in the Exploration UI, or row counts that don't match standard reports.

### BigQuery Export

BigQuery export gives access to raw, unsampled event-level data. Use it for:
- Joining GA4 data with CRM, product, or ad spend data
- Running custom queries that GA4's UI doesn't support
- Escaping Exploration sampling limits
- Building custom dashboards in Looker Studio or similar tools

The daily export tier is free (you pay only for BigQuery storage and queries). Streaming export costs extra.

Path to enable: GA4 > Admin > BigQuery Links > Link

Once linked, GA4 exports a `events_YYYYMMDD` table per day to your BigQuery dataset. Historical backfill is available for up to 1 year after linking.

### Attribution Model

GA4's default attribution model is data-driven attribution (DDA), which uses machine learning to distribute conversion credit across touchpoints. DDA requires minimum traffic thresholds — below those thresholds, GA4 falls back to Last Click.

The Last Click non-direct and position-based models were removed from GA4 in 2023 and are no longer available. If you're comparing to older reports that used those models, results will differ.
