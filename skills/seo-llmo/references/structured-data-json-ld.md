## Structured Data (JSON-LD)

Applies when: any site where you want Google rich results or AI citation.

JSON-LD (JavaScript Object Notation for Linked Data) is the highest-impact addition for both SEO and LLMO. Add it in `<head>`. Set expectations correctly: Google states that AI Overviews and AI Mode need no special schema.org markup (as of 2026), so the payoff is rich result eligibility in Google plus unambiguous entity data for other AI tools and agents that parse it. Keep every value consistent with the visible page text.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [ ... ]
}
</script>
```

**CSP interaction:** If your site uses a strict `Content-Security-Policy` with `script-src`, inline `<script type="application/ld+json">` blocks are treated as inline scripts and will be blocked unless you add `'unsafe-inline'` or a per-request nonce. Add the nonce to the JSON-LD script tag the same way you would for any other inline script.

### @graph with @id cross-referencing

Use `@graph` to put multiple schema objects in one block and wire them together with `@id` references. This lets Google and AI parsers understand the relationships between entities on your site:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://yourdomain.com/#org",
      "name": "Your Company Name",
      "url": "https://yourdomain.com",
      "logo": "https://yourdomain.com/logo.svg",
      "description": "What you do, in one sentence.",
      "email": "contact@yourdomain.com",
      "sameAs": [
        "https://linkedin.com/company/your-company",
        "https://x.com/yourhandle",
        "https://github.com/your-org",
        "https://www.wikidata.org/wiki/Q123456",
        "https://en.wikipedia.org/wiki/Your_Company"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "contact@yourdomain.com",
        "contactType": "customer support"
      },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "US"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://yourdomain.com/#website",
      "url": "https://yourdomain.com",
      "name": "Your Site Name",
      "publisher": { "@id": "https://yourdomain.com/#org" }
    }
  ]
}
```

The `"publisher": { "@id": "..." }` pattern replaces duplicating the full Organization object everywhere. Use the same `#id` fragment consistently across all pages.

### FAQPage schema

Use only on pages with a genuine, visible Q&A section. Google stopped showing FAQ rich results for all sites on May 7, 2026 and removed the documentation in June 2026, so FAQPage no longer changes how you appear in Google Search. The markup is still valid schema.org and harmless to keep; its remaining value is giving other AI tools and agent-readiness scanners a clean question/answer structure. Do not add it to pages just to chase a rich result:

```json
{
  "@type": "FAQPage",
  "@id": "https://yourdomain.com/faq#faqpage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What does your product do?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A specific, self-contained answer that makes sense without surrounding context."
      }
    }
  ]
}
```

Write answers that make sense in isolation  -  AI tools extract and quote them without the surrounding page.

### Service and Article schema

**For service pages:**
```json
{
  "@type": "Service",
  "@id": "https://yourdomain.com/services/your-service#service",
  "name": "Service Name",
  "description": "What this service provides.",
  "provider": { "@id": "https://yourdomain.com/#org" }
}
```

**For blog posts or articles:**
```json
{
  "@type": "Article",
  "@id": "https://yourdomain.com/blog/post-slug#article",
  "headline": "Article Title",
  "datePublished": "2026-01-15",
  "dateModified": "2026-02-01",
  "author": { "@id": "https://yourdomain.com/#org" },
  "publisher": { "@id": "https://yourdomain.com/#org" }
}
```

### Product schema

Applies when: site type is online shop.

`Product` schema is the highest-impact schema type for e-commerce. It surfaces pricing, availability, and ratings directly in Google Shopping results and is a primary signal AI tools use when answering product queries. Add one block per product page:

```json
{
  "@type": "Product",
  "@id": "https://yourdomain.com/products/product-slug#product",
  "name": "Product Name",
  "description": "What this product is and what problem it solves. Write for someone who has never seen your site.",
  "image": [
    "https://yourdomain.com/images/product-front.jpg",
    "https://yourdomain.com/images/product-side.jpg"
  ],
  "brand": {
    "@type": "Brand",
    "name": "Your Brand"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://yourdomain.com/products/product-slug",
    "priceCurrency": "USD",
    "price": "49.00",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "128"
  }
}
```

Key fields for AI visibility: `description` (write it to stand alone, without surrounding page context), `offers.availability` (keep it accurate and current - AI tools actively surface in-stock status), and `aggregateRating` (AI shopping results weight social proof heavily). Only mark up ratings that come from real reviews shown on the page: Google's review snippet guidelines (updated July 2026) explicitly cover fake and undisclosed incentivized reviews.

If the product has variants (sizes, colors), add a `hasVariant` array or use `variesBy` - see [schema.org/Product](https://schema.org/Product) for the full spec.

### SoftwareApplication schema

Applies when: site type is a web app, SaaS product, or developer tool.

`SoftwareApplication` is the right schema type when your product IS the software - as opposed to `Product` for physical goods or `Service` for professional services. Add it alongside `Organization` and `WebSite` in the `@graph` array. Without it, agents can identify that an organization exists but cannot programmatically identify your product type:

```json
{
  "@type": "SoftwareApplication",
  "@id": "https://yourdomain.com/#app",
  "name": "App Name",
  "description": "What the app does and who it's for. Write for someone who has never used it.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://yourdomain.com",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "provider": { "@id": "https://yourdomain.com/#org" }
}
```

`applicationCategory` describes what the app does, not where it runs. Common values from Google's supported list: `BusinessApplication`, `DeveloperApplication`, `EducationalApplication`, `FinanceApplication`, `UtilitiesApplication`. `WebApplication` is not a category; it is a schema.org subtype. To say "this runs in the browser", set `"@type": "WebApplication"` (or `MobileApplication`), which Google also supports.

For the `offers` block: set `"price": "0"` for free apps; use the actual price for paid tiers; if pricing is contact-based, omit `offers` and point to `/pricing.md` instead. Google's Software App rich result requires `offers.price` plus either `aggregateRating` or `review` (as of 2026). Without real ratings the markup still identifies your product to parsers and agents, but it will not earn a rich result. Never invent ratings to qualify.

### sameAs entity linking

`sameAs` in your Organization block is how AI models disambiguate your brand from similarly-named entities. Include every authoritative profile you have:

```json
"sameAs": [
  "https://linkedin.com/company/your-company",
  "https://x.com/yourhandle",
  "https://github.com/your-org",
  "https://www.youtube.com/@yourchannel",
  "https://www.wikidata.org/wiki/Q123456",
  "https://en.wikipedia.org/wiki/Your_Company"
]
```

Wikidata and Wikipedia are the highest-trust signals for AI disambiguation. Even a minimal Wikidata entry (a few lines, published via wikidata.org) is enough to anchor your brand identity in AI training data.

### Speakable schema

`Speakable` marks which sections of a page are suited to being read aloud. Keep expectations low: Google's support is still beta and limited to English-language news content read by Google Assistant on Google Home devices in the US (as of 2026). It is optional for everyone else; add it only if you publish news or it costs you nothing. Point it at your main heading and key summary:

```json
{
  "@type": "WebPage",
  "@id": "https://yourdomain.com/#webpage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", ".hero-description", ".value-prop"]
  },
  "url": "https://yourdomain.com"
}
```

**Other useful types:** `BreadcrumbList`, `Event`, `Review` / `AggregateRating`, `VideoObject`, `ProfilePage`. All of these still have Google rich result features as of October 2026. `FAQPage` and `HowTo` no longer produce Google rich results; check the [Search Gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery) for the current list before promising a rich result.

Verify: [Google Rich Results Test](https://search.google.com/test/rich-results) and [Schema.org Validator](https://validator.schema.org/)
