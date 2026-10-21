---
name: google-analytics-4
description: 'Use this skill whenever the user installs, configures, or debugs Google Analytics 4, or mentions gtag.js, the Google tag, GTM, key events or conversion tracking, e-commerce events, DebugView or Tag Assistant, or a cookie/consent banner tied to analytics. Covers installation (including Google tag gateway first-party serving), first-time setup (data retention, internal and hostname filters, key events), event tracking, user properties, e-commerce, Consent Mode v2 for EEA/UK/Swiss visitors, SPA pageview tracking, and BigQuery export. Skip for other analytics products (Plausible, Mixpanel, PostHog, Segment), Universal Analytics (sunset 2024), or server-side-only tracking.'
---

# Google Analytics 4 Implementation Guide

> Applies to: Any website or web app | Updated: October 2026

A practical guide for implementing Google Analytics 4 (GA4)  -  covering installation, critical first-time setup, event tracking, e-commerce, consent, and advanced topics. Written for AI coding assistants: skip sections that don't apply to the user's setup.

> **Note:** Universal Analytics (UA / GA3) was fully sunset in 2024. GA4 is the only current Google Analytics product.

---

## Section 0: Before You Start

Answer these questions before writing any code. They determine which sections apply.

**Q: Are any of your visitors in the EU/EEA (European Economic Area), the UK, or Switzerland?**
Default: no  -  if yes, Consent Mode v2 setup is required (see [Consent Mode v2](references/consent-mode-v2.md))

**Q: Do you run Google Ads (search, display, YouTube, or Shopping)?**
Default: no  -  if yes, ad consent signals matter for conversion tracking and which events you mark as key events and use as Ads conversions

**Q: Is your site a single-page app (React, Vue, Angular, Next.js, etc.) where the URL changes without a full page reload?**
Default: check `package.json` for a client-side router (`react-router-dom`, `vue-router`, `@angular/router`, `next`, `nuxt`, `@sveltejs/kit`)  -  if found, assume SPA and apply the [Single-Page Apps](references/single-page-apps.md) section automatically

**Q: Do you need to track purchases or sales?**
Default: no  -  skip [E-commerce Tracking](references/e-commerce-tracking.md) if no

**Q: Do you already have a GA4 property, or is this a fresh start?**
Default: fresh start  -  if fresh start, create a property at analytics.google.com before writing any code

**Q: Do you use Google Tag Manager, or add the tracking code directly?**
Default: direct gtag.js  -  recommend GTM only if the user has a marketing team managing multiple tags

> **AI assistant:** Use these answers to skip irrelevant sections. Do not implement Consent Mode unless the user confirms EEA, UK, or Swiss users, and do not implement e-commerce unless confirmed. If a SPA framework is detected, apply the SPA section and pick exactly one page_view approach (never manual `page_view` calls while the Enhanced Measurement history setting is still on); do not add `anonymize_ip`, which is a no-op in GA4 (see [Common Pitfalls](references/common-pitfalls.md)).

---

## Contents

This guide is split into reference files. Use the Section 0 answers to decide which apply, then read only those; skip the rest.

- [Installation](references/installation.md): Adding GA4 to a site: gtag.js, Google Tag Manager, or Google tag gateway (first-party serving).
- [Basic Configuration](references/basic-configuration.md): Setting gtag config options such as debug mode, cookie settings, or disabling the automatic page_view.
- [Critical First-Time Setup](references/critical-first-time-setup.md): Right after installing, before production traffic: data retention, internal and hostname filters, key events, custom dimensions.
- [Common Pitfalls](references/common-pitfalls.md): Reviewing or debugging any GA4 setup; a short list of mistakes that silently break tracking.
- [Event Tracking](references/event-tracking.md): Tracking user actions with gtag event syntax, standard events, or custom events.
- [Enhanced Measurement](references/enhanced-measurement.md): Deciding which events GA4 already tracks automatically before adding custom ones.
- [User Properties & Custom Dimensions](references/user-properties-custom-dimensions.md): Setting user properties or a User ID for cross-device tracking.
- [E-commerce Tracking](references/e-commerce-tracking.md): The user confirmed purchase or sales tracking: view_item, add_to_cart, begin_checkout, purchase.
- [Consent Mode v2](references/consent-mode-v2.md): The site may have EEA, UK, or Swiss visitors, or uses a cookie or consent banner.
- [Single-Page Apps](references/single-page-apps.md): The site is a SPA and route changes must produce page_view events (Enhanced Measurement history events, manual page_view, or GTM).
- [Debugging](references/debugging.md): Events are missing or wrong: DebugView, raw network requests, logging gtag calls.
- [Validation & Testing](references/validation-testing.md): Before launch, to verify the implementation with the pre-launch checklist.
- [Advanced: BigQuery Export & Sampling](references/advanced-bigquery-export-sampling.md): Reports are sampled, raw event data is needed in BigQuery, or attribution models come up.
