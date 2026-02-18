# Google Analytics 4 Implementation Guide

> Applies to: Any website or web app | Updated: February 2026

A practical guide for implementing Google Analytics 4 (GA4) — covering installation, event tracking, user properties, e-commerce, consent, and advanced topics.

> **Note:** Universal Analytics (UA / GA3) was fully sunset in 2024. GA4 is the only current Google Analytics product.

## Contents

1. [Installation](#installation)
2. [Basic Configuration](#basic-configuration)
3. [Event Tracking](#event-tracking)
4. [Enhanced Measurement](#enhanced-measurement)
5. [User Properties & Custom Dimensions](#user-properties--custom-dimensions)
6. [E-commerce Tracking](#e-commerce-tracking)
7. [Consent Mode v2](#consent-mode-v2)
8. [Single-Page Apps](#single-page-apps)
9. [Debugging](#debugging)
10. [Validation & Testing](#validation--testing)

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

### Option B: Google Tag Manager (recommended for teams)

GTM lets non-developers add and update tags without code changes. Add to `<head>` and `<body>`:

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

**When to use which:**
- Use **gtag.js** for simple setups, full code control, or when marketing team access isn't needed
- Use **GTM** when marketing/analytics teams need to add tags independently, or when you manage multiple tags (ads, heatmaps, etc.)

---

## Basic Configuration

### gtag config options

```javascript
gtag('config', 'G-XXXXXXXXXX', {
  // Anonymize IP (good practice for privacy compliance)
  anonymize_ip: true,

  // Disable automatic page_view — useful when you fire it manually
  send_page_view: false,

  // Cookie domain (default 'auto' works for most cases)
  cookie_domain: 'yourdomain.com',

  // Cookie expiry in seconds (default: 63072000 = 2 years)
  cookie_expires: 63072000,
});
```

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

### Recommended events

GA4 has [standard event names](https://developers.google.com/analytics/devguides/collection/ga4/reference/events) for common actions. Use them where possible — they enable built-in reports automatically.

| Action | Event name | Key parameters |
|--------|-----------|---------------|
| Button / link click | `select_content` | `content_type`, `item_id` |
| Form submission | `generate_lead` | `value`, `currency` |
| File download | `file_download` | `file_name`, `file_extension` |
| Video play | `video_start` | `video_title`, `video_url` |
| Share | `share` | `method`, `content_type`, `item_id` |
| Sign up | `sign_up` | `method` |
| Login | `login` | `method` |
| Search | `search` | `search_term` |
| Purchase | `purchase` | See [E-commerce](#e-commerce-tracking) |

### Custom events

Use custom events for actions that don't fit a standard name:

```javascript
// CTA button click
gtag('event', 'cta_click', {
  button_label: 'Get Started',
  button_location: 'hero',
});

// Contact form submitted
gtag('event', 'contact_form_submit', {
  form_type: 'contact',
  subject: 'pricing_inquiry',
});

// Feature used
gtag('event', 'feature_used', {
  feature_name: 'dark_mode',
});
```

### Event naming rules

- Use `snake_case` for event names and parameter names
- Max 40 characters for event names, 100 for parameter values
- Avoid reserved names: `click`, `error`, `first_visit`, `page_view`, `scroll`, `session_start`, `user_engagement`

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

Enhanced Measurement requires no code changes but gives limited parameter control. For custom parameters on these events, fire them manually instead.

---

## User Properties & Custom Dimensions

User properties describe the user and persist across sessions.

### Set user properties

```javascript
// Call after user authenticates or their profile is known
gtag('set', 'user_properties', {
  plan_type: 'pro',           // e.g. free / pro / enterprise
  user_role: 'admin',
  account_age_days: 42,
});
```

### Register custom dimensions in GA4

Parameters sent with events are not automatically visible in reports. Register them first:

1. GA4 > Admin > Custom definitions > Create custom dimension
2. Set scope (Event or User), name, and the exact parameter name used in your code

Without this step, parameters are collected but won't appear in explorations or standard reports.

### Set user ID (for cross-device tracking)

```javascript
// Set after login — use your internal user ID, never PII like email or name
gtag('config', 'G-XXXXXXXXXX', {
  user_id: 'internal-user-id-123',
});
```

---

## E-commerce Tracking

GA4 e-commerce uses standard event names and an `items` array.

### Product viewed

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

### Add to cart / begin checkout

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

### Purchase (fire on confirmation page)

```javascript
gtag('event', 'purchase', {
  transaction_id: 'TXN-20260101-001',  // Unique per transaction — prevents duplicates
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

Always pass a unique `transaction_id` — GA4 deduplicates purchases based on it.

---

## Consent Mode v2

Consent Mode v2 is required for Google Ads and GA4 to work correctly in EEA/UK markets (as of March 2024). It lets GA4 model data for users who decline cookies rather than dropping their data entirely.

### Set default state before gtag loads

```html
<script>
  <!-- Must run BEFORE the gtag.js script tag -->
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,  // ms to wait for consent banner to update
  });
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### Update after user consents

```javascript
// Call this after user accepts cookies in your consent banner
function onUserConsent({ analytics, ads }) {
  gtag('consent', 'update', {
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: ads ? 'granted' : 'denied',
    ad_user_data: ads ? 'granted' : 'denied',
    ad_personalization: ads ? 'granted' : 'denied',
  });
}
```

If you're not running Google Ads, `ad_storage`, `ad_user_data`, and `ad_personalization` can stay `denied` permanently — only `analytics_storage` matters for GA4.

---

## Single-Page Apps

In a SPA, the browser never fully reloads between routes. GA4 won't automatically fire `page_view` on navigation — you must fire it manually on each route change:

```javascript
// Call this whenever the route changes in your app
function trackPageView(path, title) {
  gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
  });
}
```

How you detect route changes depends on your framework — hook into your router's navigation events and call `trackPageView` with the new path and page title.

Also disable the automatic `page_view` in the initial config to avoid double-counting the first load:

```javascript
gtag('config', 'G-XXXXXXXXXX', {
  send_page_view: false,  // Fire manually via trackPageView instead
});
```

---

## Debugging

### DebugView in GA4

1. Install the [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) Chrome extension
2. Enable it — events are sent to DebugView instead of live reports
3. Open GA4 > Admin > DebugView to see events in real time with all parameters

### Manual debug mode

```javascript
gtag('config', 'G-XXXXXXXXXX', {
  debug_mode: true,  // Sends to DebugView without the browser extension
});
```

Remove `debug_mode: true` before going to production — debug hits don't count in standard reports.

### Inspect raw network requests

In browser DevTools > Network tab, filter by `google-analytics.com/g/collect` to inspect the raw payloads being sent.

### Verify events are firing (temporary, dev only)

```javascript
// Override gtag to log all calls to the console
window.gtag = function(command, ...args) {
  console.log('[GA]', command, ...args);
};
```

Remove this before deploying to production.

---

## Validation & Testing

| Tool | Purpose |
|------|---------|
| [GA4 DebugView](https://analytics.google.com/) | Real-time event stream during development |
| [Tag Assistant](https://tagassistant.google.com/) | Validates gtag.js and GTM setup |
| [GA4 Event Builder](https://ga-dev-tools.google.com/ga4/event-builder/) | Preview and test event payloads |
| [Google Rich Results Test](https://search.google.com/test/rich-results) | Not GA-specific but useful alongside structured data |
| Browser Network tab | Filter by `google-analytics.com/g/collect` to inspect raw hits |

### Checklist before going live

- [ ] `page_view` fires on initial load (and on every route change for SPAs)
- [ ] Key events fire with correct parameters — verify in DebugView
- [ ] `debug_mode` and console overrides removed from production build
- [ ] Consent Mode defaults are set before gtag loads (if serving EEA/UK users)
- [ ] `transaction_id` is unique per purchase
- [ ] Custom dimensions registered in GA4 Admin for any custom event parameters
- [ ] User ID is set after login and contains no PII
