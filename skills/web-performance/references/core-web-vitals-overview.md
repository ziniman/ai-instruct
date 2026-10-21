## Core Web Vitals Overview

Applies when: any public-facing page.

Core Web Vitals are Google's user-experience metrics, measured in the field via the Chrome User Experience Report (CrUX). They are ranking signals. A page passes when at least 75% of page visits (the 75th percentile) meet the "Good" threshold. The three metrics and thresholds as of 2026 (unchanged since INP arrived):

| Metric | Measures | Good | Needs improvement | Poor |
|---|---|---|---|---|
| **LCP** | Loading speed of the largest visible element | < 2.5 s | 2.5 - 4 s | > 4 s |
| **CLS** | Visual instability from layout shifts | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **INP** | Responsiveness of all interactions | < 200 ms | 200 - 500 ms | > 500 ms |

INP replaced FID (First Input Delay) in March 2024. FID only measured the first interaction; INP measures every interaction throughout the visit. A page that passes INP must remain responsive throughout the entire session, not just at initial load.

Field data appears in Google Search Console after a URL accumulates enough traffic. Until then, use PageSpeed Insights lab data (Lighthouse) as a proxy. Lighthouse cannot measure INP during a page-load test; it reports Total Blocking Time (TBT) as the lab stand-in for responsiveness.

**Which browsers count (as of 2026):** CrUX, and therefore Search Console and the ranking signal, uses data from eligible Chrome users only. Since Safari 26.2 (December 2025) the LCP and INP measurement APIs are Baseline Newly available in all major engines, so your own real-user monitoring (RUM) can now see Safari and Firefox users too. CLS is still measurable only in Chromium-based browsers.

**Single-page apps (SPAs):** CrUX traditionally counts only full page loads, so client-side route changes ("soft navigations") were invisible. In October 2026 CrUX began publishing experimental soft-navigation variants of LCP, INP, and CLS (built on the Soft Navigations API shipped in Chrome 151). Google's stable Core Web Vitals scores and Search Console are unchanged while these are experimental; graduation is targeted for May 2027. Heavy main-thread work during route transitions still shows up as poor INP.
