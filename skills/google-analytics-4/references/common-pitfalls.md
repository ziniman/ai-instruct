## Common Pitfalls

Short list of mistakes that silently break GA4 implementations:

- **`anonymize_ip: true` does nothing in GA4.** IP anonymization is always on in GA4 and cannot be disabled  -  it is a Universal Analytics config key that GA4 silently ignores. Remove it if present. Do not add it to new implementations.
- **`send_page_view: false` does not stop SPA route-change page views.** Enhanced Measurement still sends `page_view` on browser history changes. Adding manual route-change `page_view` calls without turning off that setting double-counts every navigation (see [Single-Page Apps](single-page-apps.md)).
- **Custom event parameters are invisible until registered.** Parameters arrive in GA4 but do not appear in Explorations or standard reports until you register them as Custom Dimensions (Admin > Data display > Custom definitions). No error is shown.
- **Data retention defaults to 2 months.** Change it to 14 months immediately. Data already deleted cannot be recovered.
- **`purchase` event double-fires without a unique `transaction_id`.** GA4 uses `transaction_id` to deduplicate purchase events. Always pass a unique ID per transaction; without it, page refreshes on the confirmation page create duplicate revenue.
- **`debug_mode: false` does not turn debug mode off.** Remove the parameter entirely (see [Debugging](debugging.md)).
- **You cannot attach per-interaction custom parameters to Enhanced Measurement events from code.** Page-wide values passed to `gtag('config', ...)` or `gtag('set', ...)` ride along on later events, and Admin > Data display > Events > Modify event can add or rewrite parameters. If you need custom parameters per `file_download`, `video_start`, or similar interaction, fire those events manually and disable the corresponding Enhanced Measurement toggle.
