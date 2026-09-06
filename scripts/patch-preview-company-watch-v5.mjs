import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

if(!html.includes('mova-preview-followup-fixes-v3')) throw new Error('Company watch v5: canonical Watch List runtime missing');
if(!html.includes('companyResearchView')) throw new Error('Company watch v5: company research view hook missing');

// Account-scope the authoritative v3 Watch List controller after v4 has installed
// its ticker renderer. The signed-in account email becomes the storage namespace.
const scopeHelpers=`  var watchScopeSig='';
  function watchScope(){
    try{
      var a=JSON.parse(localStorage.getItem('movaNativeAccountV2')||'null');
      var s=JSON.parse(localStorage.getItem('movaNativeSessionV2')||'null');
      var ae=String(a&&a.email||'').trim().toLowerCase(),se=String(s&&s.email||'').trim().toLowerCase();
      if(ae&&se&&ae===se)return encodeURIComponent(ae);
    }catch(e){}
    return 'guest';
  }
  function watchKey(){return 'movaUnifiedWatchlistV3:'+watchScope()}
  function watchInitKey(){return 'movaUnifiedWatchlistV3Init:'+watchScope()}
`;

const assetsNeedle=`  function assetsList(){try{return Array.isArray(assets)?assets:[]}catch(e){return[]}}
`;
if(!html.includes(assetsNeedle)) throw new Error('Company watch v5: v3 assetsList hook missing');
html=html.replace(assetsNeedle,assetsNeedle+scopeHelpers);

const readOld=`  function readCanonical(){try{var v=JSON.parse(localStorage.getItem(WATCH_KEY)||'null');return Array.isArray(v)?Array.from(new Set(v.map(sym).filter(Boolean))):null}catch(e){return null}}
  function isInitialised(){try{return localStorage.getItem(INIT_KEY)==='1'}catch(e){return false}}
`;
const readNew=`  function readCanonical(){try{var v=JSON.parse(localStorage.getItem(watchKey())||'null');return Array.isArray(v)?Array.from(new Set(v.map(sym).filter(Boolean))):null}catch(e){return null}}
  function isInitialised(){try{return localStorage.getItem(watchInitKey())==='1'}catch(e){return false}}
`;
if(!html.includes(readOld)) throw new Error('Company watch v5: v3 canonical read hooks missing');
html=html.replace(readOld,readNew);

const writeOld=`  function writeWatch(list){
    var clean=Array.from(new Set((list||[]).map(sym).filter(Boolean)));
    try{localStorage.setItem(WATCH_KEY,JSON.stringify(clean));localStorage.setItem(LEGACY_KEY,JSON.stringify(clean));localStorage.setItem(INIT_KEY,'1')}catch(e){}
    mirrorNative(clean);return clean;
  }
`;
const writeNew=`  function writeWatch(list){
    var clean=Array.from(new Set((list||[]).map(sym).filter(Boolean)));
    try{localStorage.setItem(watchKey(),JSON.stringify(clean));localStorage.setItem(watchInitKey(),'1')}catch(e){}
    mirrorNative(clean);return clean;
  }
`;
if(!html.includes(writeOld)) throw new Error('Company watch v5: v3 canonical write hook missing');
html=html.replace(writeOld,writeNew);

const bootOld=`  function bootstrapWatch(){
    var c=readCanonical();
    if(c!==null)return writeWatch(c);
    try{var legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');if(Array.isArray(legacy))return writeWatch(legacy)}catch(e){}
    return writeWatch([]);
  }
`;
const bootNew=`  function bootstrapWatch(){
    var c=readCanonical();
    if(c!==null)return writeWatch(c);
    return writeWatch([]);
  }
`;
if(!html.includes(bootOld)) throw new Error('Company watch v5: v4 bootstrap hook missing');
html=html.replace(bootOld,bootNew);

const refreshOld=`  function refreshWatch(force){var list=watched();mirrorNative(list);var sig=list.slice().sort().join('|');if(force||sig!==watchSig){watchSig=sig;var b=document.querySelector('#movaNativeAccount [data-mna="watchlist"]');if(b&&b.classList.contains('active'))renderAccountWatch()}ensureAccountWatch();fillHomeWatch();syncTopTicker();syncCompanyButton()}
`;
const refreshNew=`  function refreshWatch(force){var scope=watchScope();if(scope!==watchScopeSig){watchScopeSig=scope;watchSig='';force=true}var list=watched();mirrorNative(list);var sig=list.slice().sort().join('|');if(force||sig!==watchSig){watchSig=sig;var b=document.querySelector('#movaNativeAccount [data-mna="watchlist"]');if(b&&b.classList.contains('active'))renderAccountWatch()}ensureAccountWatch();fillHomeWatch();syncTopTicker();syncCompanyButton()}
`;
if(!html.includes(refreshOld)) throw new Error('Company watch v5: v3 refresh hook missing');
html=html.replace(refreshOld,refreshNew);

const storageOld=`  window.addEventListener('storage',function(e){if(e.key===WATCH_KEY)refreshWatch(true)});
`;
const storageNew=`  window.addEventListener('storage',function(e){if(e.key===watchKey()||e.key==='movaNativeSessionV2'||e.key==='movaNativeAccountV2'){watchSig='';refreshWatch(true)}});
`;
if(!html.includes(storageOld)) throw new Error('Company watch v5: v3 storage listener missing');
html=html.replace(storageOld,storageNew);

const css=`<style id="mova-preview-company-watch-v5-style">
#companyResearchView button[data-mova-canonical-watch="0"]{
  background:#0b1821!important;
  color:#a9bbc6!important;
  border-color:#26414f!important;
  box-shadow:none!important;
}
#companyResearchView button[data-mova-canonical-watch="1"]{
  background:rgba(79,255,52,.11)!important;
  color:#9cff72!important;
  border-color:#2e8d25!important;
  box-shadow:inset 0 0 0 1px rgba(79,255,52,.04)!important;
}
body.mova-light-theme #companyResearchView button[data-mova-canonical-watch="0"]{
  background:#eef4f7!important;
  color:#294351!important;
  border-color:#aac1cc!important;
}
body.mova-light-theme #companyResearchView button[data-mova-canonical-watch="1"]{
  background:#e9f8e8!important;
  color:#237a2b!important;
  border-color:#79bd72!important;
}
</style>`;

const runtime=`<script id="mova-preview-company-watch-v5">(function(){
  var queued=false;

  function sym(v){v=String(v||'').trim().toUpperCase();return /^[A-Z0-9.\\-]{1,16}$/.test(v)?v:''}
  function watchScope(){
    try{
      var a=JSON.parse(localStorage.getItem('movaNativeAccountV2')||'null');
      var s=JSON.parse(localStorage.getItem('movaNativeSessionV2')||'null');
      var ae=String(a&&a.email||'').trim().toLowerCase(),se=String(s&&s.email||'').trim().toLowerCase();
      if(ae&&se&&ae===se)return encodeURIComponent(ae);
    }catch(e){}
    return 'guest';
  }
  function watchKey(){return 'movaUnifiedWatchlistV3:'+watchScope()}
  function watchInitKey(){return 'movaUnifiedWatchlistV3Init:'+watchScope()}
  function readWatch(){
    try{var v=JSON.parse(localStorage.getItem(watchKey())||'[]');return Array.isArray(v)?Array.from(new Set(v.map(sym).filter(Boolean))):[]}catch(e){return[]}
  }
  function writeWatch(list){
    var clean=Array.from(new Set((list||[]).map(sym).filter(Boolean)));
    try{localStorage.setItem(watchKey(),JSON.stringify(clean));localStorage.setItem(watchInitKey(),'1')}catch(e){}
    try{if(typeof window.movaWatchlistRefresh==='function')window.movaWatchlistRefresh()}catch(e){}
    return clean;
  }
  function currentTicker(){
    try{if(typeof activeResearchTicker!=='undefined'&&sym(activeResearchTicker))return sym(activeResearchTicker)}catch(e){}
    try{var s=sym(sessionStorage.getItem('movaCurrentCompanyV1'));if(s)return s}catch(e){}
    var m=String(location.hash||'').match(/#company=([A-Z0-9.\\-]+)/i);if(m)return sym(m[1]);
    var e=document.getElementById('crEyebrow');if(e){var q=String(e.textContent||'').match(/·\\s*([A-Z0-9.\\-]+)\\s*$/i);if(q)return sym(q[1])}
    return '';
  }
  function companyView(){return document.getElementById('companyResearchView')}
  function isWatchText(text){return /^(?:[★☆]\\s*)?(?:(?:Watching|Watch)|(?:Add to|Remove from)\\s+Watch\\s*List)$/i.test(text)}
  function watchButton(){
    var view=companyView();if(!view||!view.classList.contains('open'))return null;
    return Array.from(view.querySelectorAll('button')).find(function(btn){return isWatchText(String(btn.textContent||'').trim())})||null;
  }
  function apply(){
    queued=false;
    var view=companyView();if(!view||!view.classList.contains('open'))return;
    var ticker=currentTicker(),btn=watchButton();if(!ticker||!btn)return;
    var on=readWatch().includes(ticker);
    btn.dataset.movaCanonicalWatch=on?'1':'0';
    btn.setAttribute('aria-pressed',on?'true':'false');
    btn.setAttribute('aria-label',(on?'Remove ':'Add ')+ticker+(on?' from':' to')+' Watch List');
    var wanted=on?'★ Watching':'☆ Add to Watchlist';
    if(String(btn.textContent||'').trim()!==wanted)btn.textContent=wanted;
  }
  function queue(){if(queued)return;queued=true;requestAnimationFrame(apply)}
  function toggle(ticker){
    var list=readWatch(),on=!list.includes(ticker);
    list=list.filter(function(x){return x!==ticker});if(on)list.push(ticker);
    writeWatch(list);queue();
  }

  document.addEventListener('click',function(e){
    var btn=e.target.closest&&e.target.closest('button');if(!btn)return;
    var view=companyView();if(!view||!view.classList.contains('open')||!view.contains(btn))return;
    var text=String(btn.textContent||'').trim();if(!isWatchText(text))return;
    var ticker=currentTicker();if(!ticker)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    toggle(ticker);
  },true);

  window.addEventListener('storage',function(e){if(e.key===watchKey()||e.key==='movaNativeSessionV2'||e.key==='movaNativeAccountV2')queue()});
  document.addEventListener('mova:watchlist-changed',queue);
  var mo=new MutationObserver(queue);
  function boot(){
    queue();
    mo.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
    [0,80,250,700,1500].forEach(function(ms){setTimeout(queue,ms)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();</script>`;

html=html.replace('</head>',css+'</head>');
html=html.replace('</body>',runtime+'</body>');
writeFileSync(file,html);
console.log('MOVA preview company watch v5 applied: account-scoped Watch Lists + consistent Add to Watchlist labels.');
