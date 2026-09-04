import { readFileSync, writeFileSync } from 'node:fs';

const path = 'dist/index.html';
let html = readFileSync(path, 'utf8');

const desktopOld = '<button class="brand" onclick="go(\'home\')"><img src="assets/MOVA-header-wordmark-text-only-transparent-FIXED.png" alt="MOVA TRADING"></button>';
const desktopNew = '<button class="brand mova-brand-v181" onclick="go(\'home\')" aria-label="MOVA Home"><img src="assets/MOVA-NEW-Iconword-W-logo.svg?v=181" alt="MOVA"></button>';

if (!html.includes(desktopOld)) {
  throw new Error('MOVA branding patch: desktop header logo markup not found');
}
html = html.replace(desktopOld, desktopNew);

const mobileOld = '<img class="mobile-access-logo" src="assets/mova-M-icon-logo.png" alt="MOVA icon">';
const mobileNew = '<img class="mobile-access-logo mova-mobile-logo-v181" src="assets/MOVA-QIcon-logo.svg?v=181" alt="MOVA icon">';

if (!html.includes(mobileOld)) {
  throw new Error('MOVA branding patch: mobile access logo markup not found');
}
html = html.replace(mobileOld, mobileNew);

const style = `\n<style id="mova-branding-v181">\n/* MOVA visible branding v181 */\n.brand.mova-brand-v181{display:flex;align-items:center;justify-content:flex-start;overflow:visible}\n.brand.mova-brand-v181 img{display:block;width:auto!important;height:42px!important;max-width:210px!important;object-fit:contain!important}\n.mobile-access-logo.mova-mobile-logo-v181{display:block;width:112px!important;height:104px!important;max-width:34vw!important;object-fit:contain!important;margin-left:auto!important;margin-right:auto!important}\n@media(max-width:740px){\n  header .brand.mova-brand-v181 img{height:34px!important;max-width:164px!important}\n  .mobile-access-logo.mova-mobile-logo-v181{width:104px!important;height:97px!important;max-width:32vw!important}\n}\n</style>\n`;

if (!html.includes('</head>')) throw new Error('MOVA branding patch: </head> not found');
html = html.replace('</head>', style + '</head>');

writeFileSync(path, html);
console.log('MOVA visible desktop/mobile branding v181 patch complete.');
