# MOVA Trading v109

Replace only `index.html`.

## What was fixed

- Verified the actual glossary dataset contains **336 unique terms**.
- The Trading A–Z screen now displays the count dynamically from the dataset itself:
  - `336 TERMS LOADED`
  - `Showing 336 of 336 globally used terms`
- The glossary renderer does not slice or limit the list to the original 49 terms.
- Core terms such as Asset Allocation, Bull Market, Diversification, Fundamental Analysis, Portfolio, Stop-Loss, P/E, etc. explicitly use their curated term-specific decision guides.
- Added a visible `Build v109` marker to the A–Z intro so you can immediately tell whether Vercel is serving the new index rather than an older cached deployment.
- Strengthened company logo loading for Amazon, Marvell Technology, Mitsubishi UFJ Financial Group and other major/search-only companies.
- Proper vector/brand logo candidates are now tried before favicon or generic-letter fallbacks.
- Tiny favicon images are rejected as unsuitable company logos.

## Important

Do not replace:
- package.json
- api/
- assets/
- Vercel environment variables
- Vercel project settings

Only replace `index.html`.
