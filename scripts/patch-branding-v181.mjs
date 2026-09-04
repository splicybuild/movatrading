import { readFileSync, writeFileSync } from 'node:fs';

const path = 'dist/index.html';
let html = readFileSync(path, 'utf8');

const desktopOld = '<button class="brand" onclick="go(\'home\')"><img src="assets/MOVA-header-wordmark-text-only-transparent-FIXED.png" alt="MOVA TRADING"></button>';
const desktopNew = '<button class="brand mova-brand-v182" onclick="go(\'home\')" aria-label="MOVA Home"><img src="assets/MOVA-NEW-Iconword-W-logo.svg?v=182" alt="MOVA"></button>';

if (!html.includes(desktopOld)) {
  throw new Error('MOVA branding patch: desktop header logo markup not found');
}
html = html.replace(desktopOld, desktopNew);

const mobileOld = '<img class="mobile-access-logo" src="assets/mova-M-icon-logo.png" alt="MOVA icon">';
const mobileNew = '<img class="mobile-access-logo mova-mobile-logo-v182" src="assets/MOVA-QIcon-logo.svg?v=182" alt="MOVA icon">';

if (!html.includes(mobileOld)) {
  throw new Error('MOVA branding patch: mobile access logo markup not found');
}
html = html.replace(mobileOld, mobileNew);

const mobileNavPattern = /<div class="mobile-nav" aria-label="Mobile navigation">[\s\S]*?<\/div>/;
if (!mobileNavPattern.test(html)) {
  throw new Error('MOVA branding patch: mobile navigation markup not found');
}

const mobileNav = `<div class="mobile-nav mova-mobile-nav-v182" aria-label="Mobile navigation">
  <button data-mob="pulse" onclick="go('pulse')" aria-label="Pulse">
    <svg viewBox="0 0 24 24"><path d="M3 12h4l2.1-5 4 10 2.2-5H21"/></svg>
    <span class="nav-label">Pulse</span>
  </button>
  <button data-mob="learn" onclick="go('learn')" aria-label="Learn">
    <svg viewBox="0 0 24 24"><path d="M4 5.5c3.4-.9 5.9-.3 8 1.6V20c-2.1-1.9-4.6-2.5-8-1.6z"/><path d="M20 5.5c-3.4-.9-5.9-.3-8 1.6V20c2.1-1.9 4.6-2.5 8-1.6z"/></svg>
    <span class="nav-label">Learn</span>
  </button>
  <button data-mob="home" class="active mova-home-nav" onclick="go('home')" aria-label="Home">
    <img class="mova-home-nav-icon" src="assets/MOVA-QIcon-logo.svg?v=182" alt="" aria-hidden="true">
    <span class="nav-label">Home</span>
  </button>
  <button data-mob="portfolio" onclick="go('portfolio')" aria-label="Portfolio">
    <svg viewBox="0 0 24 24"><path d="M12 3v9h9"/><path d="M20.2 15.9A9 9 0 1 1 8.1 3.8"/></svg>
    <span class="nav-label">Portfolio</span>
  </button>
  <button data-mob="news" onclick="go('news')" aria-label="News">
    <svg viewBox="0 0 24 24"><path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>
    <span class="nav-label">News</span>
  </button>
</div>`;
html = html.replace(mobileNavPattern, mobileNav);

const style = `
<style id="mova-branding-v182">
/* MOVA visible branding + mobile navigation v182 */
.brand.mova-brand-v182{display:flex;align-items:center;justify-content:flex-start;overflow:visible}
.brand.mova-brand-v182 img{display:block;width:auto!important;height:54px!important;max-width:270px!important;object-fit:contain!important}
.mobile-access-logo.mova-mobile-logo-v182{display:block;width:132px!important;height:123px!important;max-width:38vw!important;object-fit:contain!important;margin-left:auto!important;margin-right:auto!important}
@media(max-width:740px){
  header .brand.mova-brand-v182 img{height:36px!important;max-width:174px!important}
  .mobile-access-logo.mova-mobile-logo-v182{width:132px!important;height:123px!important;max-width:38vw!important}
  .mobile-nav.mova-mobile-nav-v182{grid-template-columns:repeat(5,minmax(0,1fr))!important}
  .mobile-nav.mova-mobile-nav-v182 .mova-home-nav-icon{display:block;width:27px!important;height:27px!important;object-fit:contain!important;margin:0 auto 2px!important}
  .mobile-nav.mova-mobile-nav-v182 .mova-home-nav svg{display:none!important}
  .mobile-nav.mova-mobile-nav-v182 .mova-home-nav.active .mova-home-nav-icon{filter:none!important}
}
</style>
`;

if (!html.includes('</head>')) throw new Error('MOVA branding patch: </head> not found');
html = html.replace('</head>', style + '</head>');

writeFileSync(path, html);
console.log('MOVA desktop/mobile branding and centered Home navigation v182 patch complete.');
