import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

const css=`<style id="mova-profile-signout-style">
#mnaProfileSignOutWrap{margin-top:28px;padding-top:18px;border-top:1px solid #153446}
#mnaProfileSignOutWrap .mna-profile-signout{min-width:140px}
body.mova-light-theme #mnaProfileSignOutWrap{border-top-color:#c8d7df}
</style>`;
html=html.replace('</head>',css+'</head>');

const runtime=`<script id="mova-profile-signout-runtime">(function(){
  function doSignOut(){
    try{localStorage.removeItem('movaNativeSessionV2');localStorage.removeItem('movaMobileProfileV1')}catch(e){}
    if(typeof window.movaNASyncProfile==='function')window.movaNASyncProfile();
    if(typeof window.movaNACloseWorkspace==='function')window.movaNACloseWorkspace();
    if(typeof window.movaNAOpenAuth==='function')window.movaNAOpenAuth('signin');
  }
  function syncPlacement(){
    const canvas=document.getElementById('mnaCanvas');
    if(!canvas)return;
    const settingsSignOut=document.getElementById('mnaSignOut');
    if(settingsSignOut)settingsSignOut.style.display='none';
    const isProfile=/Your MOVA profile/i.test(canvas.textContent||'');
    const existing=document.getElementById('mnaProfileSignOutWrap');
    if(!isProfile){if(existing)existing.remove();return}
    if(existing)return;
    const wrap=document.createElement('div');
    wrap.id='mnaProfileSignOutWrap';
    wrap.innerHTML='<button type="button" class="mna-btn secondary mna-profile-signout">Sign Out</button>';
    wrap.querySelector('button').onclick=doSignOut;
    canvas.appendChild(wrap);
  }
  const mo=new MutationObserver(syncPlacement);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){mo.observe(document.body,{subtree:true,childList:true});syncPlacement()});
  else{mo.observe(document.body,{subtree:true,childList:true});syncPlacement()}
})();</script>`;
html=html.replace('</body>',runtime+'</body>');

writeFileSync(file,html);
console.log('MOVA Sign Out moved to Profile page.');
