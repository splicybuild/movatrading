import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

if(!html.includes('mova-preview-followup-fixes-v3')) throw new Error('Preview state/contrast v4: watchlist v3 runtime missing');
if(!html.includes('mova-light-theme')) throw new Error('Preview state/contrast v4: light-theme hook missing');

function replaceBlock(startMarker,endMarker,replacement,label){
  const start=html.indexOf(startMarker);
  const end=start>=0?html.indexOf(endMarker,start):-1;
  if(start<0||end<0) throw new Error('Preview state/contrast v4: '+label+' block missing');
  html=html.slice(0,start)+replacement+html.slice(end);
}

// The visible selected tab must win over a stale sessionStorage mode.
replaceBlock(
  '  function watchMode(hit){',
  '\n  function cardSymbol',
`  function watchMode(hit){
    if(selected(hit&&hit.button))return true;
    if(selected(hit&&hit.trending))return false;
    try{var m=sessionStorage.getItem(MODE_KEY);if(m==='watchlist'||m==='trending')return m==='watchlist'}catch(e){}
    return false;
  }`,
  'watchMode'
);

// Never promote the ticker's default/fallback cards into a newly-created account.
// Canonical storage (including an intentionally empty array) is authoritative.
replaceBlock(
  '  function bootstrapWatch(){',
  '\n  function watched(){',
`  function bootstrapWatch(){
    var c=readCanonical();
    if(c!==null)return writeWatch(c);
    try{var legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');if(Array.isArray(legacy))return writeWatch(legacy)}catch(e){}
    return writeWatch([]);
  }`,
  'bootstrapWatch'
);

// The Watchlist tab is its own renderer. It must not merely filter whichever
// Trending cards happen to be in the native ticker at that moment.
replaceBlock(
  '  function syncTopTicker(){',
  '\n  function syncCompanyButton',
`  var watchTickerSig='',watchTickerSeq=0,watchTickerLastFetch=0;

  function nativeTickerCards(hit){
    if(!hit||!hit.root)return [];
    var price=/[$£€]\\s*[0-9][0-9,]*(?:\\.[0-9]+)?/g;
    return Array.from(hit.root.querySelectorAll('div,button,a,li')).filter(function(el){
      if(el===hit.button||el===hit.trending||el.closest('[data-mova-canonical-watch-strip="1"]'))return false;
      var r=el.getBoundingClientRect(),t=String(el.innerText||'').trim(),matches=t.match(price)||[];
      if(matches.length!==1||r.width<60||r.width>540||r.height<24||r.height>155)return false;
      return !Array.from(el.children).some(function(c){return ((String(c.innerText||'').match(price)||[]).length===1)&&c.getBoundingClientRect().width>=55});
    });
  }

  function hideNativeTickerTrack(hit){
    var cards=nativeTickerCards(hit);if(!cards.length)return null;
    var counts=new Map();
    cards.forEach(function(card){var p=card.parentElement;if(p&&hit.root.contains(p))counts.set(p,(counts.get(p)||0)+1)});
    var track=Array.from(counts.entries()).sort(function(a,b){return b[1]-a[1]})[0];
    track=track&&track[0];
    if(!track||track===hit.root)return null;
    if(!track.dataset.movaWatchPrevDisplay)track.dataset.movaWatchPrevDisplay=track.style.display||'';
    track.dataset.movaNativeWatchTrack='1';
    track.style.display='none';
    return track;
  }

  function restoreNativeTickerTrack(hit){
    if(!hit||!hit.root)return;
    hit.root.querySelectorAll('[data-mova-native-watch-track="1"]').forEach(function(track){
      track.style.display=track.dataset.movaWatchPrevDisplay||'';
      delete track.dataset.movaWatchPrevDisplay;
      delete track.dataset.movaNativeWatchTrack;
    });
  }

  function ensureWatchStrip(hit){
    var strip=hit.root.querySelector('[data-mova-canonical-watch-strip="1"]');
    if(strip)return strip;
    strip=document.createElement('div');
    strip.className='mova-canonical-watch-strip';
    strip.dataset.movaCanonicalWatchStrip='1';
    var track=hit.root.querySelector('[data-mova-native-watch-track="1"]');
    if(track&&track.parentNode)track.parentNode.insertBefore(strip,track.nextSibling);
    else hit.root.appendChild(strip);
    return strip;
  }

  function openWatchTicker(symbol){
    try{
      if(typeof openAsset==='function')openAsset(symbol);
      else if(typeof openCompanyResearch==='function')openCompanyResearch(symbol);
    }catch(e){}
  }

  function staticAsset(symbol){
    return assetsList().find(function(a){return sym(a.k)===symbol})||null;
  }

  function priceText(q,a){
    if(q&&q.priceText)return String(q.priceText);
    if(q&&Number.isFinite(Number(q.priceNative)))return '$'+Number(q.priceNative).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
    return a&&a.p?String(a.p):'—';
  }

  function moveInfo(q,a){
    var pct=q?Number(q.changePct):NaN;
    if(Number.isFinite(pct))return {text:(pct>0?'+':'')+pct.toFixed(2)+'%',cls:pct>0?'up':pct<0?'down':'flat'};
    var text=a&&a.m?String(a.m):'—',n=Number.parseFloat(text.replace('%',''));
    return {text:text,cls:Number.isFinite(n)?(n>0?'up':n<0?'down':'flat'):(a&&a.c||'flat')};
  }

  function renderWatchCards(strip,list,quotes){
    var bySymbol=new Map((quotes||[]).map(function(q){return [sym(q.ticker||q.symbol),q]}));
    strip.innerHTML=list.map(function(s){
      var q=bySymbol.get(s)||null,a=staticAsset(s),move=moveInfo(q,a),name=(q&&q.name)||(a&&a.n)||s;
      return '<button type="button" class="mova-canonical-watch-card" data-mova-watch-open="'+esc(s)+'">'+
        '<span class="mova-canonical-watch-symbol">'+esc(s)+'</span>'+ 
        '<span class="mova-canonical-watch-price">'+esc(priceText(q,a))+' <b class="'+esc(move.cls)+'">'+esc(move.text)+'</b></span>'+ 
        '<span class="mova-canonical-watch-name">'+esc(name)+'</span>'+ 
      '</button>';
    }).join('');
    strip.querySelectorAll('[data-mova-watch-open]').forEach(function(btn){
      btn.onclick=function(){openWatchTicker(sym(btn.dataset.movaWatchOpen))};
    });
  }

  function loadWatchTicker(hit,list,strip){
    var sig=list.join('|'),now=Date.now();
    if(sig===watchTickerSig&&strip.dataset.movaLoaded==='1'&&now-watchTickerLastFetch<45000)return;
    watchTickerSig=sig;watchTickerLastFetch=now;
    renderWatchCards(strip,list,[]);
    strip.dataset.movaLoaded='0';
    var seq=++watchTickerSeq;
    fetch('/api/market?symbols='+encodeURIComponent(list.join(','))+'&ts='+now,{cache:'no-store'})
      .then(function(r){if(!r.ok)throw new Error('market');return r.json()})
      .then(function(d){
        if(seq!==watchTickerSeq)return;
        var current=watched();
        if(current.join('|')!==sig)return;
        renderWatchCards(strip,current,Array.isArray(d.assets)?d.assets:[]);
        strip.dataset.movaLoaded='1';
      })
      .catch(function(){
        if(seq===watchTickerSeq)strip.dataset.movaLoaded='1';
      });
  }

  function syncTopTicker(){
    var hit=tickerRoot();if(!hit)return;
    var list=watched(),active=watchMode(hit);
    var strip=hit.root.querySelector('[data-mova-canonical-watch-strip="1"]');
    var empty=hit.root.querySelector('[data-mova-watch-empty="1"]');

    var status=Array.from(hit.root.querySelectorAll('span,small,div')).find(function(el){
      return /^\\s*\\d+\\s+saved\\b/i.test((el.textContent||'').trim());
    });
    if(status)status.textContent=list.length+' saved · your actual Watchlist';

    if(!active){
      restoreNativeTickerTrack(hit);
      if(strip)strip.remove();
      if(empty)empty.remove();
      return;
    }

    hideNativeTickerTrack(hit);

    if(!list.length){
      if(strip)strip.remove();
      if(!empty){
        empty=document.createElement('div');
        empty.dataset.movaWatchEmpty='1';
        empty.textContent='No saved markets';
        empty.style.cssText='padding:12px 14px;color:#8aa0af;font-size:11px;font-weight:800;white-space:nowrap';
        hit.root.appendChild(empty);
      }
      watchTickerSig='';watchTickerSeq++;
      return;
    }

    if(empty)empty.remove();
    strip=ensureWatchStrip(hit);
    loadWatchTicker(hit,list,strip);
  }`,
  'syncTopTicker'
);

const css=`<style id="mova-preview-state-contrast-v4">
body.mova-light-theme .ticker-shell,
body.mova-light-theme .ticker{
  background:#020810!important;
  background-color:#020810!important;
  color:#eaf3f8!important;
  border-color:#17303d!important;
}
body.mova-light-theme .ticker-shell [class*="ticker"],
body.mova-light-theme .ticker [class*="ticker"]{
  border-color:#17303d!important;
}
body.mova-light-theme .ticker-shell .ticker-item,
body.mova-light-theme .ticker .ticker-item{
  background:#07131c!important;
  color:#eaf3f8!important;
  border-color:#17303d!important;
  box-shadow:none!important;
}
body.mova-light-theme .ticker-shell strong,
body.mova-light-theme .ticker-shell b,
body.mova-light-theme .ticker strong,
body.mova-light-theme .ticker b{
  color:#eef6fb!important;
}
body.mova-light-theme .ticker-shell span:not(.up):not(.down),
body.mova-light-theme .ticker-shell small:not(.up):not(.down),
body.mova-light-theme .ticker span:not(.up):not(.down),
body.mova-light-theme .ticker small:not(.up):not(.down){
  color:#8fa5b4!important;
}
body.mova-light-theme .ticker-shell .up,
body.mova-light-theme .ticker .up{color:#42e778!important}
body.mova-light-theme .ticker-shell .down,
body.mova-light-theme .ticker .down{color:#ff657a!important}
body.mova-light-theme [data-mova-watch-empty="1"]{color:#8fa5b4!important}

.mova-canonical-watch-strip{
  display:flex!important;
  gap:8px!important;
  width:100%!important;
  overflow-x:auto!important;
  overscroll-behavior-x:contain!important;
  scrollbar-width:none!important;
  padding:8px 0 7px!important;
  box-sizing:border-box!important;
  align-items:stretch!important;
}
.mova-canonical-watch-strip::-webkit-scrollbar{display:none!important}
.mova-canonical-watch-card{
  flex:0 0 154px!important;
  min-width:154px!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:flex-start!important;
  gap:3px!important;
  padding:9px 12px!important;
  border:1px solid #17303d!important;
  border-radius:14px!important;
  background:#07131c!important;
  color:#eef6fb!important;
  text-align:left!important;
  cursor:pointer!important;
  box-shadow:none!important;
}
.mova-canonical-watch-card:hover,
.mova-canonical-watch-card:focus{border-color:#2f6a86!important;outline:none!important}
.mova-canonical-watch-symbol{
  color:#718999!important;
  font-size:8px!important;
  line-height:1.1!important;
  font-weight:900!important;
  letter-spacing:.12em!important;
  text-transform:uppercase!important;
}
.mova-canonical-watch-price{
  color:#eaf3f8!important;
  font-size:13px!important;
  line-height:1.2!important;
  font-weight:900!important;
  white-space:nowrap!important;
}
.mova-canonical-watch-price b{font-size:10px!important;margin-left:4px!important}
.mova-canonical-watch-name{
  max-width:100%!important;
  color:#718999!important;
  font-size:8px!important;
  line-height:1.2!important;
  font-weight:700!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
  white-space:nowrap!important;
}
.mova-canonical-watch-card .up{color:#42e778!important}
.mova-canonical-watch-card .down{color:#ff657a!important}
.mova-canonical-watch-card .flat{color:#8fa5b4!important}

body.mova-light-theme .mova-dark-contrast-surface{
  color:#dce9f0!important;
  border-color:#17303d!important;
}
body.mova-light-theme .mova-dark-contrast-surface h1,
body.mova-light-theme .mova-dark-contrast-surface h2,
body.mova-light-theme .mova-dark-contrast-surface h3,
body.mova-light-theme .mova-dark-contrast-surface strong,
body.mova-light-theme .mova-dark-contrast-surface b{
  color:#f2f8fb!important;
}
body.mova-light-theme .mova-dark-contrast-surface p{
  color:#c2d1da!important;
}
body.mova-light-theme .mova-dark-contrast-surface .eyebrow,
body.mova-light-theme .mova-dark-contrast-surface span:not(.up):not(.down):not(.mova-clean-up):not(.mova-clean-down),
body.mova-light-theme .mova-dark-contrast-surface small:not(.up):not(.down):not(.mova-clean-up):not(.mova-clean-down){
  color:#8fa5b4!important;
}
body.mova-light-theme .mova-dark-contrast-surface .up,
body.mova-light-theme .mova-dark-contrast-surface .mova-clean-up{color:#42e778!important}
body.mova-light-theme .mova-dark-contrast-surface .down,
body.mova-light-theme .mova-dark-contrast-surface .mova-clean-down{color:#ff657a!important}
</style>`;

const runtime=`<script id="mova-preview-dark-surface-contrast-v4">(function(){
  var queued=false;
  function rgb(bg){
    var m=String(bg||'').match(/rgba?\\(\\s*([0-9.]+)[ ,]+([0-9.]+)[ ,]+([0-9.]+)(?:[ ,/]+([0-9.]+))?/i);
    return m?{r:Number(m[1]),g:Number(m[2]),b:Number(m[3]),a:m[4]==null?1:Number(m[4])}:null;
  }
  function mark(){
    queued=false;
    if(!document.body.classList.contains('mova-light-theme'))return;
    var roots=Array.from(document.querySelectorAll('#pulse,#home,#trade,#tradeLab,.ticker-shell,.ticker'));
    var seen=new Set();
    roots.forEach(function(root){
      [root].concat(Array.from(root.querySelectorAll('*'))).forEach(function(el){
        if(seen.has(el))return;seen.add(el);
        var r=el.getBoundingClientRect();
        if(r.width<48||r.height<22||r.width*r.height<1200)return;
        var c=rgb(getComputedStyle(el).backgroundColor);if(!c||c.a<.35)return;
        var lum=.2126*c.r+.7152*c.g+.0722*c.b;
        if(lum<72)el.classList.add('mova-dark-contrast-surface');
      });
    });
  }
  function queue(){if(queued)return;queued=true;requestAnimationFrame(mark)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue);else queue();
  window.addEventListener('load',queue);
  document.addEventListener('change',function(){setTimeout(queue,0)},true);
  document.addEventListener('click',function(){setTimeout(queue,30)},true);
  new MutationObserver(queue).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  setTimeout(queue,250);setTimeout(queue,900);setTimeout(queue,1800);
})();</script>`;

html=html.replace('</head>',css+'</head>');
html=html.replace('</body>',runtime+'</body>');
writeFileSync(file,html);
console.log('MOVA preview v4 applied: canonical Watch List ticker renderer + dark-surface Light-theme contrast.');
