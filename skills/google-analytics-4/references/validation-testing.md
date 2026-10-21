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
