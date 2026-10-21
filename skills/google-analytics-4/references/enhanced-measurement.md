## Enhanced Measurement

GA4 auto-tracks several events when Enhanced Measurement is enabled (GA4 > Admin > Data Streams > your stream > Enhanced Measurement toggle):

| Event | What it tracks |
|-------|---------------|
| `page_view` | Page loads, plus browser history changes (`pushState` / `replaceState` / `popstate`, i.e. SPA route changes) unless you turn off "Page changes based on browser history events" |
| `scroll` | User scrolls to 90% of page depth (once per page) |
| `click` | Outbound link clicks (not links to domains configured for cross-domain measurement) |
| `view_search_results` | Site search, detected from a URL query parameter (`q`, `s`, `search`, `query`, or `keyword` by default; add more in the settings) |
| `video_start` / `video_progress` / `video_complete` | YouTube embeds with JS API support enabled |
| `file_download` | Clicks on `.pdf`, `.csv`, `.docx`, etc. |
| `form_start` / `form_submit` | Form interactions |

Enhanced Measurement requires no code but gives little control over parameters. To attach custom parameters to any of these events, fire them manually and disable the matching Enhanced Measurement toggle to avoid duplicates. Form parameters (`form_id`, `form_name`, `form_destination`) appear in reports only after you register them as custom dimensions.
