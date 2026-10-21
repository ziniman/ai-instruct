## Advanced: BigQuery Export & Sampling

### Sampling in Explorations

Explorations (Funnel, Path, Segment Overlap, etc.) are sampled when a query covers more events than the quota  -  10 million events per query on standard properties (as of 2026; GA4 360 starts at 100 million and can go up to 1 billion). GA4 then processes a subset and extrapolates. Standard reports are generally unsampled, though heavy filtering on large properties can trigger sampling there too.

Indicator of sampling: the data quality icon at the top of the report shows the percentage of data used; anything below 100% is sampled.

### BigQuery Export

BigQuery export gives access to raw, unsampled event-level data. Use it for:
- Joining GA4 data with CRM, product, or ad spend data
- Running custom queries that GA4's UI doesn't support
- Escaping Exploration sampling limits
- Building custom dashboards in Looker Studio or similar tools

Export options (as of 2026):
- **Daily** (free; you pay only for BigQuery storage and queries): one `events_YYYYMMDD` table per day. Standard properties are limited to 1 million events per day. If a property consistently exceeds that, Google pauses the daily export and does not reprocess skipped days  -  exclude low-value events during linking to stay under the limit.
- **Streaming**: near-real-time `events_intraday_YYYYMMDD` tables with no event limit, billed by BigQuery at $0.05 per GB (roughly 600,000 events per GB). Best-effort, so query the daily `events_` tables for final numbers.
- **Fresh Daily**: GA4 360 only.

Path to enable: GA4 > Admin > Product links > BigQuery links > Link (requires Editor on the GA4 property and Owner on the BigQuery project).

Data starts flowing within 24 hours of linking and covers only data from that point on  -  there is no backfill of raw events collected before the link. Link BigQuery early, even if you will not query it for months.

### Attribution Model

GA4's default attribution model is data-driven attribution (DDA), which uses machine learning to distribute key event credit across touchpoints. As of 2026, the other available models are Paid and organic last click (last non-direct click) and Google paid channels last click.

The first click, linear, time decay, and position-based models were removed from GA4 in November 2023. If you're comparing to older reports that used those models, results will differ.
