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
