# MOVA Trading v110

Replace only `index.html`.

## 336-term A–Z bug fixed

The file contained 336 unique terms, but 287 of the added entries had the wrong A–Z key.

Example:
- Broken: `["ACCUMULATION","Accumulation",...]`
- Correct: `["A","Accumulation",...]`

Because MOVA filters the glossary using the first field, those 287 entries existed in the source but were effectively hidden from the A–Z filters. This is why the UI still looked like the original ~49 terms.

v110 corrects all 336 rows so each one uses its real first letter.

The A–Z buttons now also display the actual number of terms under each letter, with `All 336`.

## Company logo fix

The company profile logo loader now tries the explicit brand-logo source before Wikimedia redirect URLs. Amazon therefore tries the dedicated Amazon brand icon first rather than failing through the Wikimedia route and falling back to `A`.

Extra fallback sources were strengthened for Amazon, Marvell Technology, Mitsubishi UFJ Financial Group, Chevron, Micron, Vertex and PDD Holdings.

## Replace only

Do not change:
- package.json
- api/
- assets/
- Vercel settings
- environment variables
