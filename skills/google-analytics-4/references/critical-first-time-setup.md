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
