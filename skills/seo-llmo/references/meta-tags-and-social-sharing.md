## Meta Tags and Social Sharing

Applies when: goal includes social sharing or Google click-through rates.

Every page needs these  -  they're table stakes, not differentiators:

```html
<title>Page Title - Brand Name</title>
<meta name="description" content="150-160 character description with primary keywords near the start." />
<link rel="canonical" href="https://yourdomain.com/page" />
```

The canonical tag prevents duplicate content penalties when the same page is reachable at multiple URLs (e.g. with/without trailing slash, HTTP vs HTTPS).

### Open Graph

The non-obvious parts of Open Graph tags:

```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://yourdomain.com/" />
<meta property="og:title" content="Page Title - Brand Name" />
<meta property="og:description" content="Description for social shares." />
<meta property="og:image" content="https://yourdomain.com/og-image.jpg" />
<!-- Width and height prevent the platform from fetching the image to determine dimensions -->
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

OG image: 1200x630px. Include `og:image:width` and `og:image:height`  -  without them, some platforms fetch the image before rendering the preview card, adding latency.

### Twitter/X Card

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@yourhandle" />
```

Twitter inherits `og:title`, `og:description`, and `og:image` if the corresponding `twitter:*` tags are absent  -  you don't need to duplicate them. The Twitter Card Validator at `cards-dev.twitter.com` is deprecated and unreliable; use [opengraph.xyz](https://www.opengraph.xyz/) or the LinkedIn Post Inspector for testing OG previews.

### Link text

Avoid generic link text like "Learn more", "Click here", or "Read more". Google uses anchor text as a relevance signal, and Lighthouse flags non-descriptive links as a failing SEO audit. Keep link text specific to the destination:

```html
<!-- avoid -->
<a href="/cookies">Learn more</a>

<!-- prefer -->
<a href="/cookies">View our Cookie Policy</a>
```

This also affects accessibility  -  screen readers present links out of context, so the text must make sense on its own.

Verify: [opengraph.xyz](https://www.opengraph.xyz/) for OG/Twitter preview, [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) for LinkedIn.
