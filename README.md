# MOVA Trading v115 — Company Logo Alignment & Fit

This release fine-tunes the company-logo presentation introduced in v114.

## What changed
- Removed the 122% `cover` treatment that could crop logos.
- Logos now use `object-fit: contain` and are centred both horizontally and vertically.
- Added brand-specific scale tuning for common companies so square icons, tall marks and wordmarks sit consistently in the same tile.
- Added full wordmark sources for Palantir, Arm and Netflix rather than relying only on square/glyph versions.
- The fitting system also applies an automatic aspect-ratio rule to companies without a manual override.
- v114 Search Company News spacing improvements remain intact.

## Deployment
For this release, replacing `index.html` is sufficient.
The full package is included for convenience.
