import {readFileSync,writeFileSync} from'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');
if(!html.includes('mova-preview-followup-fixes-v3'))throw new Error('v5: Watch List runtime missing');
if(!html.includes('companyResearchView'))throw new Error('v5: company research hook missing');

function req(oldText,newText,label){
  if(!html.includes(oldText))throw new Error('v5: '+label+' hook missing');
  html=html.replace(oldText,newText);
}

const assets=`  function assetsList(){try{return Array.isArray(assets)?assets:[]}catch(e){return[]}}\n`;
const scope=`  var watchScopeSig='';
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
req(assets,assets+scope,'assets/scope');

req(
`  function readCanonical(){try{var v=JSON.parse(localStorage.getItem(WATCH_KEY)||'null');return Array.isArray(v)?Array.from(new Set(v.map(sym).filter(Boolean))):null}catch(e){return null}}
  function isInitialised(){try{return localStorage.getItem(INIT_KEY)==='1'}catch(e){return false}}
`,
`  function readCanonical(){try{var v=JSON.parse(localStorage.getItem(watchKey())||'null');return Array.isArray(v)?Array.from(new Set(v.map(sym).filter(Boolean))):null}catch(e){return null}}
  function isInitialised(){try{return localStorage.getItem(watchInitKey())==='1'}catch(e){return false}}
`,'canonical read');

req(
`  function writeWatch(list){
    var clean=Array.from(new Set((list||[]).map(sym).filter(Boolean)));
    try{localStorage.setItem(WATCH_KEY,JSON.stringify(clean));localStorage.setItem(LEGACY_KEY,JSON.stringify(clean));localStorage.setItem(INIT_KEY,'1')}catch(e){}
    mirrorNative(clean);return clean;
  }
`,
`  function writeWatch(list){
    var clean=Array.from(new Set((list||[]).map(sym).filter(Boolean)));
    try{localStorage.setItem(watchKey(),JSON.stringify(clean));localStorage.setItem(watchInitKey(),'1')}catch(e){}
    mirrorNative(clean);return clean;
  }
`,'canonical write');

req(
`  function bootstrapWatch(){
    var c=readCanonical();
    if(c!==null)return writeWatch(c);
    try{var legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');if(Array.isArray(legacy))return writeWatch(legacy)}catch(e){}
    return writeWatch([]);
  }
`,
`  function bootstrapWatch(){
    var c=readCanonical();
    if(c!==null)return writeWatch(c);
    return writeWatch([]);
  }
`,'bootstrap');

req(
`  function refreshWatch(force){var list=watched();mirrorNative(list);var sig=list.slice().sort().join('|');if(force||sig!==watchSig){watchSig=sig;var b=document.querySelector('#movaNativeAccount [data-mna="watchlist"]');if(b&&b.classList.contains('active'))renderAccountWatch()}ensureAccountWatch();fillHomeWatch();syncTopTicker();syncCompanyButton()}\n`,
`  function refreshWatch(force){var scope=watchScope();if(scope!==watchScopeSig){watchScopeSig=scope;watchSig='';force=true}var list=watched();mirrorNative(list);var sig=list.slice().sort().join('|');if(force||sig!==watchSig){watchSig=sig;var b=document.querySelector('#movaNativeAccount [data-mna="watchlist"]');if(b&&b.classList.contains('active'))renderAccountWatch()}ensureAccountWatch();fillHomeWatch();syncTopTicker();syncCompanyButton()}\n`,'refresh');

req(
`  window.addEventListener('storage',function(e){if(e.key===WATCH_KEY)refreshWatch(true)});\n`,
`  window.addEventListener('storage',function(e){if(e.key===watchKey()||e.key==='movaNativeSessionV2'||e.key==='movaNativeAccountV2'){watchSig='';refreshWatch(true)}});\n`,'storage');

const css=`<style id="mova-preview-company-watch-v5-style">
#companyResearchView button[data-mova-canonical-watch="0"]{background:#0b1821!important;color:#a9bbc6!important;border-color:#26414f!important;box-shadow:none!important}
#companyResearchView button[data-mova-canonical-watch="1"]{background:rgba(79,255,52,.11)!important;color:#9cff72!important;border-color:#2e8d25!important}
body.mova-light-theme #companyResearchView button[data-mova-canonical-watch="0"]{background:#eef4f7!important;color:#294351!important;border-color:#aac1cc!important}
body.mova-light-theme #companyResearchView button[data-mova-canonical-watch="1"]{background:#e9f8e8!important;color:#237a2b!important;border-color:#79bd72!important}

/* Canonical Watchlist keeps the native ticker feel: seamless marquee + clickable cards. */
.mova-canonical-watch-strip{display:block!important;width:100%!important;overflow:hidden!important;overflow-x:hidden!important;padding:8px 0 7px!important;box-sizing:border-box!important;position:relative!important;scrollbar-width:none!important}
.mova-canonical-watch-strip::-webkit-scrollbar{display:none!important}
.mova-canonical-watch-track{display:flex!important;width:max-content!important;max-width:none!important;align-items:stretch!important;will-change:transform!important;animation:movaCanonicalWatchMarquee var(--mova-watch-duration,28s) linear infinite!important;transform:translate3d(0,0,0)}
.mova-canonical-watch-group{display:flex!important;flex:0 0 auto!important;gap:8px!important;align-items:stretch!important;padding-right:8px!important;box-sizing:border-box!important}
.mova-canonical-watch-strip:hover .mova-canonical-watch-track,.mova-canonical-watch-strip:focus-within .mova-canonical-watch-track{animation-play-state:paused!important}
.mova-canonical-watch-card{pointer-events:auto!important;touch-action:manipulation!important;user-select:none!important}
@keyframes movaCanonicalWatchMarquee{from{transform:translate3d(0,0,0)}to{transform:translate3d(var(--mova-watch-shift,-900px),0,0)}}
@media(prefers-reduced-motion:reduce){.mova-canonical-watch-track{animation:none!important;transform:none!important}}
</style>`;

const runtime=`<script id="mova-preview-company-watch-v5">(function(){
  var queued=false;
  function sym(v){v=String(v||'').trim().toUpperCase();return /^[A-Z0-9.\\-]{1,16}$/.test(v)?v:''}
  function scope(){try{var a=JSON.parse(localStorage.getItem('movaNativeAccountV2')||'null'),s=JSON.parse(localStorage.getItem('movaNativeSessionV2')||'null'),ae=String(a&&a.email||'').trim().toLowerCase(),se=String(s&&s.email||'').trim().toLowerCase();if(ae&&se&&ae===se)return encodeURIComponent(ae)}catch(e){}return'guest'}
  function key(){return'movaUnifiedWatchlistV3:'+scope()}
  function initKey(){return'movaUnifiedWatchlistV3Init:'+scope()}
  function read(){try{var v=JSON.parse(localStorage.getItem(key())||'[]');return Array.isArray(v)?Array.from(new Set(v.map(sym).filter(Boolean))):[]}catch(e){return[]}}
  function write(list){var clean=Array.from(new Set((list||[]).map(sym).filter(Boolean)));try{localStorage.setItem(key(),JSON.stringify(clean));localStorage.setItem(initKey(),'1')}catch(e){}try{window.movaWatchlistRefresh&&window.movaWatchlistRefresh()}catch(e){}return clean}
  function ticker(){try{if(typeof activeResearchTicker!=='undefined'&&sym(activeResearchTicker))return sym(activeResearchTicker)}catch(e){}try{var s=sym(sessionStorage.getItem('movaCurrentCompanyV1'));if(s)return s}catch(e){}var m=String(location.hash||'').match(/#company=([A-Z0-9.\\-]+)/i);if(m)return sym(m[1]);var x=document.getElementById('crEyebrow');if(x){var q=String(x.textContent||'').match(/·\\s*([A-Z0-9.\\-]+)\\s*$/i);if(q)return sym(q[1])}return''}
  function view(){return document.getElementById('companyResearchView')}
  function watchText(t){return/^(?:[★☆]\\s*)?(?:(?:Watching|Watch)|(?:Add to|Remove from)\\s+Watch\\s*List)$/i.test(t)}
  function button(){var v=view();if(!v||!v.classList.contains('open'))return null;return Array.from(v.querySelectorAll('button')).find(function(b){return watchText(String(b.textContent||'').trim())})||null}
  function apply(){queued=false;var v=view(),t=ticker(),b=button();if(!v||!v.classList.contains('open')||!t||!b)return;var on=read().includes(t);b.dataset.movaCanonicalWatch=on?'1':'0';b.setAttribute('aria-pressed',on?'true':'false');b.textContent=on?'★ Watching':'☆ Add to Watchlist'}
  function queue(){if(queued)return;queued=true;requestAnimationFrame(apply)}
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button'),v=view();if(!b||!v||!v.classList.contains('open')||!v.contains(b)||!watchText(String(b.textContent||'').trim()))return;var t=ticker();if(!t)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();var list=read(),on=!list.includes(t);list=list.filter(function(x){return x!==t});if(on)list.push(t);write(list);queue()},true);
  window.addEventListener('storage',function(e){if(e.key===key()||e.key==='movaNativeSessionV2'||e.key==='movaNativeAccountV2')queue()});
  new MutationObserver(queue).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue);else queue();
  [80,250,700,1500].forEach(function(ms){setTimeout(queue,ms)});
})();</script>`;

const guard=`<script id="mova-preview-watch-native-guard-v6">(function(){
  var queued=false,MODE='movaTickerModeV1';
  function selected(b){if(!b)return false;var c=' '+String(b.className||'')+' ';return /\\b(active|selected|current|on|is-active|is-selected)\\b/i.test(c)||b.getAttribute('aria-selected')==='true'||b.getAttribute('aria-pressed')==='true'||b.dataset.active==='true'||b.dataset.selected==='true'}
  function ticker(){var bs=Array.from(document.querySelectorAll('button')).filter(function(b){return /^(Watchlist|Trending)$/i.test((b.textContent||'').trim())&&b.offsetParent!==null});var w=bs.find(function(b){return /^Watchlist$/i.test((b.textContent||'').trim())}),t=bs.find(function(b){return /^Trending$/i.test((b.textContent||'').trim())});if(!w)return null;var root=w.parentElement,p=w.parentElement;for(var i=0;p&&p!==document.body&&i<9;p=p.parentElement,i++){var r=p.getBoundingClientRect(),x=p.innerText||'';if(r.width>=window.innerWidth*.7&&r.height>35&&r.height<280&&/Trending/i.test(x)&&/Watchlist/i.test(x))root=p}return{root:root,w:w,t:t}}
  function active(h){if(selected(h&&h.w))return true;if(selected(h&&h.t))return false;try{return sessionStorage.getItem(MODE)==='watchlist'}catch(e){return false}}
  function prices(el){return(String(el&&el.innerText||'').match(/[$£€]\\s*[0-9][0-9,]*(?:\\.[0-9]+)?/g)||[]).length}
  function restore(root){if(!root)return;root.querySelectorAll('[data-mova-native-card-guard="1"]').forEach(function(el){var d=el.dataset.movaGuardDisplay||'',p=el.dataset.movaGuardPriority||'';el.style.removeProperty('display');if(d)el.style.setProperty('display',d,p);delete el.dataset.movaGuardDisplay;delete el.dataset.movaGuardPriority;delete el.dataset.movaNativeCardGuard})}
  function hide(el){if(el.dataset.movaNativeCardGuard==='1')return;el.dataset.movaGuardDisplay=el.style.getPropertyValue('display')||'';el.dataset.movaGuardPriority=el.style.getPropertyPriority('display')||'';el.dataset.movaNativeCardGuard='1';el.style.setProperty('display','none','important')}
  function protectedNode(el,h){return !el||el===h.root||el===h.w||el===h.t||el.closest('[data-mova-canonical-watch-strip="1"]')||el.closest('[data-mova-watch-empty="1"]')||el.contains(h.w)||el.contains(h.t)}
  function apply(){queued=false;var h=ticker();if(!h)return;if(!active(h)){restore(h.root);return}Array.from(h.root.querySelectorAll('*')).forEach(function(el){if(!protectedNode(el,h)&&prices(el)>0)hide(el)})}
  function queue(){if(queued)return;queued=true;requestAnimationFrame(apply)}
  document.addEventListener('click',function(){setTimeout(queue,0);setTimeout(queue,60);setTimeout(queue,180)},true);
  window.addEventListener('load',queue);window.addEventListener('resize',queue);
  new MutationObserver(queue).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','aria-selected','aria-pressed']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue);else queue();
  [250,900,1800].forEach(function(ms){setTimeout(queue,ms)});
  setInterval(queue,1200);
})();</script>`;

const marquee=`<script id="mova-preview-watch-marquee-v7">(function(){
  var queued=false;
  function sym(v){v=String(v||'').trim().toUpperCase();return /^[A-Z0-9.\\-]{1,16}$/.test(v)?v:''}
  function makeClone(group){var c=group.cloneNode(true);c.setAttribute('aria-hidden','true');c.querySelectorAll('button').forEach(function(b){b.tabIndex=-1;b.onclick=null});return c}
  function size(strip,track,group){
    requestAnimationFrame(function(){
      if(!strip.isConnected||!track.isConnected||!group.isConnected)return;
      var width=Math.ceil(group.getBoundingClientRect().width);if(width<1)return;
      var needed=Math.max(2,Math.ceil(strip.clientWidth/width)+2);
      while(track.children.length<needed)track.appendChild(makeClone(group));
      while(track.children.length>needed)track.lastElementChild.remove();
      track.style.setProperty('--mova-watch-shift','-'+width+'px');
      track.style.setProperty('--mova-watch-duration',Math.max(18,Math.min(44,width/32)).toFixed(1)+'s');
    });
  }
  function enhance(strip){
    var track=strip.querySelector(':scope > .mova-canonical-watch-track');
    if(track){var g=track.querySelector(':scope > .mova-canonical-watch-group');if(g)size(strip,track,g);return}
    var cards=Array.from(strip.children).filter(function(el){return el.classList&&el.classList.contains('mova-canonical-watch-card')});
    if(!cards.length)return;
    var group=document.createElement('div');group.className='mova-canonical-watch-group';
    cards.forEach(function(b){b.onclick=null;group.appendChild(b)});
    track=document.createElement('div');track.className='mova-canonical-watch-track';track.appendChild(group);track.appendChild(makeClone(group));
    strip.innerHTML='';strip.appendChild(track);size(strip,track,group);
  }
  function apply(){queued=false;document.querySelectorAll('[data-mova-canonical-watch-strip="1"]').forEach(enhance)}
  function queue(){if(queued)return;queued=true;requestAnimationFrame(apply)}
  function openCompany(symbol){
    symbol=sym(symbol);if(!symbol)return;
    try{sessionStorage.setItem('movaCurrentCompanyV1',symbol)}catch(e){}
    try{
      if(typeof window.openCompanyResearch==='function'){window.openCompanyResearch(symbol);return}
    }catch(e){}
    try{location.hash='#company='+encodeURIComponent(symbol)}catch(e){}
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('.mova-canonical-watch-card[data-mova-watch-open]');
    if(!b||!b.closest('[data-mova-canonical-watch-strip="1"]'))return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    openCompany(b.dataset.movaWatchOpen);
  },true);
  new MutationObserver(queue).observe(document.body,{subtree:true,childList:true});
  window.addEventListener('load',queue);window.addEventListener('resize',queue);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue);else queue();
  [80,250,700,1500].forEach(function(ms){setTimeout(queue,ms)});
})();</script>`;

html=html.replace('</head>',css+'</head>');
html=html.replace('</body>',runtime+guard+marquee+'</body>');
writeFileSync(file,html);
console.log('MOVA v7: account-scoped Watch List + strict native suppression + scrolling clickable canonical ticker.');
