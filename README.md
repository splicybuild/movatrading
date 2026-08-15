# MOVA Trading v116 — Company Logo Full-Tile Fit

This fixes the remaining white-space issue visible around company logos.

## Changes
- Removed the white logo-tile background.
- Logo tiles now use a dark neutral background that matches MOVA.
- Square company marks now occupy the full tile while remaining centred.
- No `cover` cropping is used, so wide/tall logos are still protected from being cut off.
- Added stronger per-company scaling for Apple, NVIDIA, Netflix, Palantir and other common assets.
- Mobile and desktop use the same corrected fitting logic.

## Deployment
Only `index.html` needs replacing for this release.
The full package is included for convenience.
