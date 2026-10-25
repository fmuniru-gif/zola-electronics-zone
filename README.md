# Zola Electronics Zone — public website release 1

**Launch-ready but NOT deployed.** This website is standalone and must never be uploaded to the operational `tradeflow-zola` repository.

## Planned location

- Separate repository: `fmuniru-gif/zola-electronics-zone`
- GitHub Pages: `https://fmuniru-gif.github.io/zola-electronics-zone/`
- Source: branch `main`, folder `/(root)`
- Release: `20261025-public-website-v1`

**The URL is a proposed destination, not a live website.** If you choose a different repository name, update the absolute canonical and Open Graph/Twitter links, the JSON-LD `url`, `robots.txt`, and `sitemap.xml` **before publishing**. Do not modify TradeFlow's existing GitHub Pages configuration.

## How to publish independently

1. In GitHub, create a **new public repository named `zola-electronics-zone`** under `fmuniru-gif`. Do not initialize it from the TradeFlow repository or copy any TradeFlow files.
2. Upload **all the contents of this folder into the new repository root**, including `index.html`, `styles.css`, `script.js`, `robots.txt`, `sitemap.xml`, `.nojekyll`, and the `assets/` folder. GitHub's browser upload requires extracting this ZIP first; GitHub does not unpack a ZIP as a website automatically. If uploading by browser, make sure the `assets/` relative folder path is preserved.
3. Open the **new repository** Settings → Pages. Choose `Deploy from a branch`, `main`, `/(root)`, Save.
4. When the Pages workflow completes, visit `https://fmuniru-gif.github.io/zola-electronics-zone/` and verify the desktop/mobile layout, menu, Contact links, WhatsApp enquiry form, and images. Check that `index.html` contains site-release marker `20261025-public-website-v1`.
5. Only publicise the link after verifying it. If the repository owner, repo name or hosting platform differs, regenerate the canonical/share/sitemap URLs first.

## Safety boundaries

- No Supabase credentials, business data, TradeFlow code or M4/3 sync connections.
- No login, checkout, database writes, customer data capture, cookies or third-party analytics.
- WhatsApp messages are created from user-initiated form submission and open in WhatsApp for review.
- Product listings intentionally do not claim current stock, prices, brand authorisation or guaranteed warranties.
- TV trade-in availability and terms are not guaranteed; ask the business to confirm.

## Owner's final editorial checklist

- Approve the storefront/promotional visuals (they are supplied promotional imagery; verify how accurately they represent the current shop).
- Verify phone +233 55 348 6788, Aliu Mahama Road address and map-search accuracy.
- Check all product categories offered and any service/warranty claims.
- Check actual WhatsApp opening on desktop and mobile before making the site public.

## Local preview

Open `index.html`, or run `python -m http.server 8080` from this folder and visit http://localhost:8080.
