## Sitemap

Applies when: site has more than one page and you want search engine indexing.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2026-02-01</lastmod>
  </url>
  <url>
    <loc>https://yourdomain.com/about</loc>
    <lastmod>2026-01-15</lastmod>
  </url>
  <url>
    <loc>https://yourdomain.com/services</loc>
    <lastmod>2026-01-10</lastmod>
  </url>
</urlset>
```

`<changefreq>` and `<priority>` are largely ignored by Google  -  omit them to keep the sitemap clean. `<lastmod>` is used and should reflect when the page content actually changed.

After deploying, submit the sitemap URL in Google Search Console (Index > Sitemaps). For Bing and Yandex, use the **IndexNow** protocol for instant URL submission rather than waiting for crawl discovery:

```
POST https://api.indexnow.org/indexnow
Content-Type: application/json

{
  "host": "yourdomain.com",
  "key": "your-indexnow-key",
  "urlList": [
    "https://yourdomain.com/new-page",
    "https://yourdomain.com/updated-page"
  ]
}
```

Generate your IndexNow key at [indexnow.org](https://www.indexnow.org/). Host the key as a text file at `https://yourdomain.com/{key}.txt`.

Verify: Submit sitemap in Google Search Console and check for errors under Index > Sitemaps.
