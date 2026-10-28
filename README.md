# Zola Electronics Zone — public website

Standalone static website for **Zola Electronics Zone — “Buy the right one.”** This project is independent of TradeFlow and has no operational database, authentication, checkout or synchronization connection.

The existing navy/gold design, six category illustrations and supplied promotional photography are retained. The experience review adds a category finder, practical buying prompts, budget/upgrade enquiry messaging, clearer customer care, optional TV trade-in context, persistent mobile contact actions and more useful WhatsApp drafts.

## Review boundary

This change is on `review/public-website-experience-r1`, based on `812a139808b85f0fad650208d18b5883bbfe7300`. It must be reviewed through its draft PR. It has **not been merged or deployed by this work**. The review workflow only tests and saves screenshots; it cannot publish the site.

The canonical URL configured in source is `https://fmuniru-gif.github.io/zola-electronics-zone/`. If the eventual hostname changes, update canonical/share/schema URLs, `robots.txt` and `sitemap.xml` together before a separately approved publication.

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
