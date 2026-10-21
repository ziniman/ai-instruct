## Event Tracking

GA4 uses an events-only data model  -  everything is an event with optional parameters.

### Syntax

```javascript
gtag('event', 'event_name', {
  parameter_name: 'value',
  another_parameter: 123,
});
```

### Standard Events Worth Knowing

GA4 has [standard event names](https://developers.google.com/analytics/devguides/collection/ga4/reference/events) for common actions. Use them where they fit  -  they populate built-in reports automatically. The common ones (`login`, `sign_up`, `purchase`, `search`) are self-explanatory. The less obvious ones:

| Action | Event name | Key parameters |
|--------|-----------|---------------|
| Item list viewed (e.g. category page) | `view_item_list` | `item_list_name`, `items` |
| Item detail viewed | `view_item` | `currency`, `value`, `items` |
| Promotional banner viewed | `view_promotion` | `promotion_name`, `creative_name` |
| Share | `share` | `method`, `content_type`, `item_id` |
| Form submission / lead | `generate_lead` | `value`, `currency` |
| Tutorial / onboarding step | `tutorial_begin`, `tutorial_complete` |  -  |

### Custom Events

Use custom events for actions that don't match a standard name.

```javascript
gtag('event', 'cta_click', {
  button_label: 'Get Started',
  button_location: 'hero',
});
```

Naming rules and limits (as of 2026):
- Event names: `snake_case`, start with a letter, only letters, numbers, and underscores, max 40 characters. Names are case-sensitive (`cta_click` and `CTA_Click` are two different events). A key event whose name exceeds 40 characters is not reported as a key event.
- Reserved event names for web  -  do not reuse them for custom events: `click`, `error`, `file_download`, `first_visit`, `form_start`, `form_submit`, `page_view`, `scroll`, `session_start`, `user_engagement`, `video_progress`, `video_start`, `view_search_results` (full list in Google's event naming rules).
- Parameters: up to 25 per event; names max 40 characters and must not start with `_`, `firebase_`, `ga_`, `google_`, or `gtag.`; values max 100 characters (except `page_title` 300, `page_referrer` 420, `page_location` 1,000).
