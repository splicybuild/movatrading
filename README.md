# MOVA Trading v111 — Full Vercel Package

This package is designed as a complete snapshot of the MOVA project files needed for the current Vercel version.

## v111 changes

### 1. Company logos
- Every company masthead now tries `/api/company-logo` first.
- The new endpoint uses the connected Finnhub company profile logo when available.
- If Finnhub does not provide a logo, it checks the company's own website for a brand/wordmark/icon.
- A high-resolution domain icon is used only as the last fallback.
- This applies to normal and search-only companies instead of relying on a small hard-coded logo list.

### 2. News article pictures
- MOVA now tracks pictures already used on the current news page.
- The same feed/article image is not intentionally reused across unrelated cards.
- If a publisher gives multiple stories the same generic hero image, MOVA uses that story's own article-page screenshot as the fallback.
- The news visual API also checks article hero/featured/content images rather than only the first metadata image.

### 3. Desktop navigation
- On desktop only, Home / Pulse / Tools / Portfolio / News & Alerts moves to the top, directly below the MOVA brand.
- It aligns with the 1180px main content body.
- It is text-only: no icon boxes and no tray background.
- The active page is indicated with text colour and a small underline.

### 4. Mobile navigation
- The mobile dock remains at the bottom.
- It is fixed/locked to the viewport.
- The background spans the full width of the screen.
- Extra bottom spacing is preserved in the page so the dock does not hide the final content.

### 5. Trading A-Z
- The verified 336-term dataset from v110 is retained unchanged.

## Environment variables required on Vercel
Keep your existing environment variables. The main ones used by the current APIs include:
- `TWELVE_DATA_API_KEY`
- `FINNHUB_API_KEY`

Do not paste API keys into `index.html`.

## GitHub structure
Upload/replace the package contents so your repository contains:

- `index.html`
- `package.json`
- `README.md`
- `api/`
- `assets/`

The package does not add a `vercel.json`, so it will not overwrite your current Vercel routing/configuration with an old recovery file.
