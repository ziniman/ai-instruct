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

Do not add `anonymize_ip`  -  it is silently ignored in GA4 (see [Common Pitfalls](common-pitfalls.md)).
