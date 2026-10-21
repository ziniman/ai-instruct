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
