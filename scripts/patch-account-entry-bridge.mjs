import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

const cleanFn="function accountOpen(){signed()?workspace('profile'):auth(acc()?'signin':'create')}";
if(!html.includes(cleanFn)) throw new Error('clean accountOpen function not found');
html=html.replace(cleanFn,cleanFn+"\nwindow.movaCleanAccountOpen=accountOpen;");

const legacyDesktop="function openAccount(){if(innerWidth<=740)return;ensureAccountModal();getProfile()?profileAccount():guestAccount();accountModal.classList.add('open')}";
if(!html.includes(legacyDesktop)) throw new Error('legacy desktop openAccount not found');
html=html.replace(legacyDesktop,"function openAccount(){if(typeof window.movaCleanAccountOpen==='function'){window.movaCleanAccountOpen();return}if(innerWidth<=740)return;ensureAccountModal();getProfile()?profileAccount():guestAccount();accountModal.classList.add('open')}");

const legacyMobile="function openAccountAccess(){\n    if(!isMobileMova())return;\n    openMobileAccess();\n  }";
if(html.includes(legacyMobile)) html=html.replace(legacyMobile,"function openAccountAccess(){\n    if(typeof window.movaCleanAccountOpen==='function'){window.movaCleanAccountOpen();return;}\n    if(!isMobileMova())return;\n    openMobileAccess();\n  }");

writeFileSync(file,html);
console.log('MOVA clean account entry bridge complete.');
