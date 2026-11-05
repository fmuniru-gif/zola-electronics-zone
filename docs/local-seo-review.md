# Tamale buying guides: verified local review

Production baseline: `ea236f187d600acc0e8784d76c538b13976c3285`.
Review branch: `feature/tamale-buying-guides-20261105`.

## Changes

- Four appliance buying guides with unique titles/descriptions, .com canonicals,
  connected WebPage schema, cross-links, phone and category-specific WhatsApp drafts.
- Homepage guide cards and five-URL sitemap. Current contacts and location retained.
- Approved logo and slogan on each guide; keyboard skip navigation, semantic headings,
  no-JavaScript support and responsive layout.
- The existing footer email caused overflow at 320px. Footer columns now permit
  shrinking and long contact details wrap, without removing the email.
- Test commands now run every source and browser suite, including new guide checks.
  The test server explicitly serves the four new guide pages.
- Outdated test assertions now match the .com canonical already in production.

## Verification on the actual production checkout

- `npm test`: 19 passed, 0 failed, 0 skipped.
- `npm run test:browser`: 13 passed, 0 failed, 0 skipped.
- Guide and homepage layouts checked at 320, 390, 768 and 1440px; assets loaded,
  no horizontal overflow, keyboard navigation and contact drafts tested.
- All browser destinations were intercepted outside the disposable loopback server.
  No WhatsApp message, enquiry, review or other external submission was sent.
- Desktop/mobile guide presentation and homepage cards visually inspected.
- `git diff --check` clean. The CI workflow is ready but has not run remotely.

The pages have no live prices, stock feed, new warranty promises, brand authorization
claims, analytics or TradeFlow integration. The physical business's Google category,
opening hours and Maps pin have not been inferred or changed.

## Publication blocker and continuation

The existing GitHub connection can read the website, but its attempt to create the
review branch returned HTTP 403: Resource not accessible by integration. A reported
user-level push permission does not establish installation-token write access.
No remote branch, pull request, merge or deployment was created for this review.

Use the current GitHub plugin connection's Configure on GitHub link. Check that the
installation covers `fmuniru-gif/zola-electronics-zone` and permits code writes, while
preserving its existing repository access. Reauthorize/reconnect that same connection
if needed. Do not share passwords or tokens in chat.

After write access is working: push the exact reviewed branch; run its read-only
CI; review the diff; merge and verify the custom-domain deployment. Check all five
sitemap URLs and their canonical tags, then submit the updated sitemap in Search
Console if needed. Indexing/ranking improvements are not guaranteed.

For Google Business Profile, sign in to the account managing Zola and inspect
Edit profile > Business information > About > Business category. Read the actual
Primary category before changing it. Keep categories accurate and do not invent
hours, reviews or services. Google profile changes and Search Console submission
have not been performed here.
