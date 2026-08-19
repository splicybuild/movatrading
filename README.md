# MOVA Trading — Amended Workflow Package

This package uses the amended `index.html` you provided as the base file.

Changes in this package:
- Desktop page tabs are now uppercase.
- Desktop page tabs use a larger font.
- Desktop page tabs are spaced further apart under the MOVA logo.
- Mobile bottom navigation behaviour is left unchanged.
- Added `MOVA-PROJECT-WORKFLOW.html` as a visual workflow chart.
- Added `MOVA-PROJECT-WORKFLOW.md` as a written resource/data-source map.

Deployment:
- Upload the whole package when possible.
- If replacing manually, replace `index.html` and keep the existing `/assets`, `/api`, `package.json` and environment variables.

# MOVA Trading v118 — Tesla Hero Background Fix

This update fixes Tesla's missing company hero image by packaging the Tesla background image directly inside the project.

What changed:
- Tesla now uses `assets/tesla-hero.jpg` as the first-choice company background.
- It no longer relies on a remote Tesla image URL or a website screenshot for Tesla.
- The image is bundled in the ZIP, so it will deploy with the site.
- All previous v117/v116 layout and logo fixes are retained.

Deployment:
For this version, replace BOTH:
1. `index.html`
2. `assets/tesla-hero.jpg`

The safest option is to upload the complete v118 package.
