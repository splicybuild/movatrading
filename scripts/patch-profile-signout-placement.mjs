import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

const css=`<style id="mova-profile-signout-style">
#mnaSidebarSignOut{margin-top:6px!important;border-color:#3a2630!important;color:#ffb2ba!important}
#mnaSidebarSignOut:hover{background:#2a151b!important;border-color:#8b3a48!important;color:#fff!important}
body.mova-light-theme #mnaSidebarSignOut{background:#fff!important;border-color:#e0b4ba!important;color:#a12d3d!important}
body.mova-light-theme #mnaSidebarSignOut:hover{background:#fff1f3!important;border-color:#c96a78!important;color:#7a1f2d!important}
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
    const oldProfileWrap=document.getElementById('mnaProfileSignOutWrap');
    if(oldProfileWrap)oldProfileWrap.remove();
    const oldSettingsSignOut=document.getElementById('mnaSignOut');
    if(oldSettingsSignOut)oldSettingsSignOut.style.display='none';
    const settings=document.querySelector('.mna-side [data-mna="settings"]');
    if(!settings)return;
    let btn=document.getElementById('mnaSidebarSignOut');
    if(!btn){
      btn=document.createElement('button');
      btn.id='mnaSidebarSignOut';
      btn.type='button';
      btn.className='mna-nav';
      btn.textContent='Sign Out';
      btn.onclick=doSignOut;
      settings.insertAdjacentElement('afterend',btn);
    }
  }
  const mo=new MutationObserver(syncPlacement);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){mo.observe(document.body,{subtree:true,childList:true});syncPlacement()});
  else{mo.observe(document.body,{subtree:true,childList:true});syncPlacement()}
})();</script>`;
html=html.replace('</body>',runtime+'</body>');

writeFileSync(file,html);
console.log('MOVA Sign Out moved beneath Settings in account sidebar.');
