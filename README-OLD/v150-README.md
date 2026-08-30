# MOVA v150 — Slim branding deployment fix

This build fixes the oversized v149 HTML file. The approved black/electric-blue horned M image is now loaded from `mova-icon-black-blue.png` instead of being embedded multiple times as base64 data inside `index.html`.

## Replace / upload
- Replace the repository-root `index.html` with this `index.html`.
- Keep/upload `mova-icon-black-blue.png` in the same directory as `index.html`.

## Branding behaviour
- Desktop: larger approved M icon + the original MOVA TRADING wordmark.
- The small duplicate MOVA TRADING copy beside the icon is removed.
- Mobile: approved icon only; original wordmark is hidden on screens <= 800px.
- Favicon / Apple touch icon: approved M icon.

## Verification
GitHub should now be able to render the HTML normally because it is under 1 MB rather than ~6.2 MB. Search the raw source for `MOVA BUILD v150 SLIM BRANDING` to confirm the new file is deployed.
