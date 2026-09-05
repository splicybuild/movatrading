import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

const cleanFn="function accountOpen(){signed()?workspace('profile'):auth(acc()?'signin':'create')}";
if(!html.includes(cleanFn)) throw new Error('clean accountOpen function not found');
html=html.replace(cleanFn,cleanFn+"\nwindow.movaCleanAccountOpen=accountOpen;");

const newsFn="function news(){const g=$('newsGrid');if(!g)return;";
if(!html.includes(newsFn)) throw new Error('clean news function not found');
html=html.replace(newsFn,newsFn);
html=html.replace("document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.mova-desktop-account-btn,#mobileProfileChip');if(!b)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();accountOpen()},true);",
"window.movaCleanRenderNews=news;\ndocument.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.mova-desktop-account-btn,#mobileProfileChip');if(!b)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();accountOpen()},true);");

const legacyDesktop="function openAccount(){if(innerWidth<=740)return;ensureAccountModal();getProfile()?profileAccount():guestAccount();accountModal.classList.add('open')}";
if(!html.includes(legacyDesktop)) throw new Error('legacy desktop openAccount not found');
html=html.replace(legacyDesktop,"function openAccount(){if(typeof window.movaCleanAccountOpen==='function'){window.movaCleanAccountOpen();return}if(innerWidth<=740)return;ensureAccountModal();getProfile()?profileAccount():guestAccount();accountModal.classList.add('open')}");

const legacyMobile="function openAccountAccess(){\n    if(!isMobileMova())return;\n    openMobileAccess();\n  }";
if(html.includes(legacyMobile)) html=html.replace(legacyMobile,"function openAccountAccess(){\n    if(typeof window.movaCleanAccountOpen==='function'){window.movaCleanAccountOpen();return;}\n    if(!isMobileMova())return;\n    openMobileAccess();\n  }");

const guard=`<script id="mova-clean-entry-guard">(function(){
  function openClean(){if(typeof window.movaCleanAccountOpen==='function'){window.movaCleanAccountOpen();return true}return false}
  window.addEventListener('click',function(e){
    const b=e.target&&e.target.closest?e.target.closest('.mova-desktop-account-btn,#mobileProfileChip,#movaV2Training'):null;
    if(!b)return;
    if(openClean()){
      e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      const old=document.getElementById('movaDesktopAccountModal');if(old)old.classList.remove('open');
      const mobile=document.getElementById('mobileAccess');if(mobile)mobile.classList.remove('open');
    }
  },true);
  function renderNewsIfNeeded(){
    const grid=document.getElementById('newsGrid');if(!grid)return;
    const newsPage=document.getElementById('news');
    const visible=!!(newsPage&&newsPage.classList.contains('active'))||/Top 10 market stories/i.test(document.body.innerText||'');
    if(!visible)return;
    if(typeof window.movaCleanRenderNews==='function')window.movaCleanRenderNews();
  }
  document.addEventListener('click',function(e){
    const t=e.target&&e.target.closest?e.target.closest('button,a'):null;
    if(t&&/^News$/i.test((t.textContent||'').trim()))setTimeout(renderNewsIfNeeded,120);
  },true);
  const mo=new MutationObserver(function(){setTimeout(renderNewsIfNeeded,0)});
  mo.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',renderNewsIfNeeded);else renderNewsIfNeeded();
})();</script>`;
html=html.replace('</body>',guard+'</body>');

writeFileSync(file,html);
console.log('MOVA clean account entry + News guard complete.');
