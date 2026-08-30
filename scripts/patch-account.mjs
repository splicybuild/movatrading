import { readFileSync, writeFileSync } from 'node:fs';

const file = 'dist/index.html';
let html = readFileSync(file, 'utf8');

html = html.replace(
  /<div id="mobileProfileChip" class="mobile-profile-chip" onclick="showMobileProfile\(\)">[\s\S]*?<\/div>/,
  `<button id="mobileProfileChip" type="button" class="mobile-profile-chip" onclick="openAccountAccess()" aria-label="Sign in or create MOVA account" title="Account">
    <span id="mobileProfileAvatar" class="mobile-profile-avatar" aria-hidden="true"></span>
    <span id="mobileProfileName" class="profile-name">Account</span>
  </button>`
);

html = html.replace(
  /function updateMobileProfileChip\(\)\{[\s\S]*?mobileProfileName\.textContent=p\.firstName\|\|'Profile';\n\}/,
  `function updateMobileProfileChip(){
    const chip=document.getElementById('mobileProfileChip');
    if(!chip)return;
    chip.classList.add('show');
    const p=getMobileProfile();
    if(!p){
      chip.classList.remove('signed-in');
      mobileProfileAvatar.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.6"></circle><path d="M5.8 19c.8-3.3 3-5 6.2-5s5.4 1.7 6.2 5"></path></svg>';
      mobileProfileName.textContent='Account';
      chip.setAttribute('aria-label','Sign in or create MOVA account');
      return;
    }
    chip.classList.add('signed-in');
    const initial=(p.firstName||'M').trim().charAt(0).toUpperCase()||'M';
    mobileProfileAvatar.textContent=initial;
    mobileProfileName.textContent=p.firstName||'Profile';
    chip.setAttribute('aria-label',\`Open MOVA account for \${p.firstName||'profile'}\`);
  }
  function openAccountAccess(){
    if(!isMobileMova())return;
    openMobileAccess();
  }`
);

if (!html.includes('/* V2.4.4 persistent mobile account button */')) {
  const css = `
  /* V2.4.4 persistent mobile account button */
  .mobile-profile-chip{cursor:pointer;font-family:inherit}
  .mobile-profile-avatar svg{width:20px;height:20px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
  @media(max-width:740px){
    .mobile-profile-chip{display:flex!important;width:42px!important;height:42px!important;max-width:none!important;padding:0!important;align-items:center!important;justify-content:center!important;right:10px!important;border:1px solid rgba(66,187,255,.24)!important;background:rgba(7,19,29,.96)!important;box-shadow:0 7px 22px rgba(0,0,0,.28)!important}
    .mobile-profile-chip .mobile-profile-avatar{width:29px!important;height:29px!important;background:transparent!important;color:#d9e8f1!important;border:0!important;font-size:11px!important}
    .mobile-profile-chip.signed-in .mobile-profile-avatar{background:linear-gradient(135deg,#42bbff,#78ef31)!important;color:#041018!important}
  }
  `;
  html = html.replace('</style>', css + '</style>');
}

writeFileSync(file, html);
console.log('MOVA mobile account access patch complete.');
