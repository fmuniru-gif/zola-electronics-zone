# Zola Electronics Zone — public website

Standalone static website for **Zola Electronics Zone — “Buy the right one.”** This project is independent of TradeFlow and has no operational database, authentication, checkout or synchronization connection.

The existing navy/gold design, six category illustrations and supplied promotional photography are retained. The experience review adds a category finder, practical buying prompts, budget/upgrade enquiry messaging, clearer customer care, optional TV trade-in context, persistent mobile contact actions and more useful WhatsApp drafts.

## Current SEO review

The public canonical domain is `https://zolaelectronicszone.com/`.
This local review is on `feature/tamale-buying-guides-20261105`, based on production
`ea236f187d600acc0e8784d76c538b13976c3285`. Four crawlable appliance buying guides,
homepage links and a five-URL sitemap are prepared. The approved logo and navy/gold
branding are retained. All source and browser checks are included in `npm test`
and `npm run test:browser`.

**Not published:** the connected GitHub integration rejected review-branch creation
with HTTP 403. This review has not changed the published website. See
`docs/local-seo-review.md` for validation and remaining publication steps.

## Public-content rules

- Address: Aliu Mahama Road, Tamale, near Maccasio Fun Base. Phone/WhatsApp: 0553486788.
- Categories are a guide, not a live stock or price feed. No model-specific availability, prices, discounts, opening hours, delivery coverage or brand authorization is invented.
- Warranty terms must be confirmed for the specific product. No warranty duration or eligibility is promised.
- TV trade-in enquiries can include model, screen size, age and condition. Assessments, acceptance and value are not guaranteed; there is no photo upload or automated valuation.
- The form only prepares a WhatsApp draft on a user action. The visitor chooses whether to send it in WhatsApp. This site has no enquiry API, storage, analytics or cookies. Without JavaScript, the form is disabled and direct phone/WhatsApp links remain available.
- Promotional imagery is retained from the existing site. The Owner should confirm its continuing suitability before publishing changes.

## Local validation

Use Node.js 22 and an installed Chrome/Chromium browser:

```text
npm ci --ignore-scripts
npm test
npm run test:browser
npm run review:visuals
```

Set `CHROME_PATH` to the browser executable when it is not the default Windows Chrome path. Browser tests use disposable contexts and intercept every external destination, including WhatsApp, so they send no message or external request. `npm run review:visuals` saves baseline/candidate desktop/mobile screenshots under `test-results/website-review/`, or `WEBSITE_EVIDENCE_DIR` when provided. Baseline files come from the exact Git commit, so full Git history is needed.

The CI workflow runs the same source/browser checks and captures review screenshots with read-only repository permissions. Its artifact is review evidence, not a deployment.

See `docs/public-experience-review.md` for the changed-file report, evidence scope and limits. Real WhatsApp-app handoff and search-engine indexing remain Owner acceptance checks; no conversion-rate or ranking gain is claimed.
