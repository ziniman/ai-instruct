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
