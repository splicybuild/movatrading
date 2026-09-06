import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

if(!html.includes('mova-preview-followup-fixes-v3')) throw new Error('Company watch v5: canonical Watch List runtime missing');
if(!html.includes('companyResearchView')) throw new Error('Company watch v5: company research view hook missing');

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
  var WATCH_KEY='movaUnifiedWatchlistV2';
  var LEGACY_KEY='movaUnifiedWatchlistV1';
  var INIT_KEY='movaUnifiedWatchlistV2Initialised';
  var queued=false;

  function sym(v){v=String(v||'').trim().toUpperCase();return /^[A-Z0-9.\\-]{1,16}$/.test(v)?v:''}
  function readWatch(){
    try{var v=JSON.parse(localStorage.getItem(WATCH_KEY)||'[]');return Array.isArray(v)?Array.from(new Set(v.map(sym).filter(Boolean))):[]}catch(e){return[]}
  }
  function writeWatch(list){
    var clean=Array.from(new Set((list||[]).map(sym).filter(Boolean)));
    try{
      localStorage.setItem(WATCH_KEY,JSON.stringify(clean));
      localStorage.setItem(LEGACY_KEY,JSON.stringify(clean));
      localStorage.setItem(INIT_KEY,'1');
    }catch(e){}
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

  // Own every legacy company-page watch label (Watch / Add to Watchlist / starred variants)
  // so the canonical Watch List is the only source of truth.
  document.addEventListener('click',function(e){
    var btn=e.target.closest&&e.target.closest('button');if(!btn)return;
    var view=companyView();if(!view||!view.classList.contains('open')||!view.contains(btn))return;
    var text=String(btn.textContent||'').trim();if(!isWatchText(text))return;
    var ticker=currentTicker();if(!ticker)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    toggle(ticker);
  },true);

  window.addEventListener('storage',function(e){if(e.key===WATCH_KEY)queue()});
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
console.log('MOVA preview company watch v5 applied: unsaved company buttons now say Add to Watchlist consistently.');
