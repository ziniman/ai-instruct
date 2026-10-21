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
