# MOVA Trading v112 — Full Package

## Changes in v112

### Desktop navigation
The desktop Home / Pulse / Tools / Portfolio / News & Alerts menu remains directly under the MOVA brand at the top of the document, but it no longer follows you as you scroll. The existing floating Top button is the way back to it.

The mobile bottom navigation is unchanged and remains fixed across the full width.

### News images
The flaky web-page screenshot fallback that could display blank nginx pages has been removed.

News cards now use:
1. the story/feed image when valid,
2. the article's own hero/featured image when available,
3. a rotating topic-related market photograph,
4. a guaranteed story-specific MOVA visual based on the headline/topic if external images fail.

This means a card should no longer end up as a blank white nginx screenshot.

### Why It's Moving
Current headlines shown under a company's `Why It's Moving` / `Live market drivers` panel are now clickable. Clicking the headline card opens the source story in a new tab.

### Deployment
This is a full package. Upload/replace:
- index.html
- api/
- assets/
- README.md
- package.json

Keep your existing Vercel environment variables.
