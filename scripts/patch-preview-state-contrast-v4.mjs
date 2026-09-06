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

// Make Watchlist filtering independent of the ticker card's exact internal markup.
// A market card is recognised by one visible price token plus normal card dimensions.
replaceBlock(
  '  function syncTopTicker(){',
  '\n  function syncCompanyButton',
`  function syncTopTicker(){
    var hit=tickerRoot();if(!hit)return;
    var list=watched(),active=watchMode(hit),empty=hit.root.querySelector('[data-mova-watch-empty="1"]');

    hit.root.querySelectorAll('[data-mova-watch-hidden="1"]').forEach(function(el){
      el.style.display=el.dataset.movaWatchPrevDisplay||'';
      delete el.dataset.movaWatchHidden;
      delete el.dataset.movaWatchPrevDisplay;
    });

    if(!active){if(empty)empty.remove();return}

    var priceOne=/[$£€]\\s*[0-9][0-9,]*(?:\\.[0-9]+)?/g;
    Array.from(hit.root.querySelectorAll('div,button,a,li')).forEach(function(el){
      if(el===hit.button||el===hit.trending||el===empty)return;
      var r=el.getBoundingClientRect(),t=String(el.innerText||'').trim();
      if(r.width<65||r.width>520||r.height<26||r.height>150)return;
      var prices=t.match(priceOne)||[];
      if(prices.length!==1)return;
      var s=cardSymbol(el);
      var shouldHide=!list.length||(s&&!list.includes(s));
      if(shouldHide){
        el.dataset.movaWatchPrevDisplay=el.style.display||'';
        el.dataset.movaWatchHidden='1';
        el.style.display='none';
      }
    });

    var status=Array.from(hit.root.querySelectorAll('span,small,div')).find(function(el){return /^\\s*\\d+\\s+saved\\b/i.test((el.textContent||'').trim())});
    if(status)status.textContent=list.length+' saved · your actual Watchlist';

    if(!list.length){
      if(!empty){
        empty=document.createElement('div');
        empty.dataset.movaWatchEmpty='1';
        empty.textContent='No saved markets';
        empty.style.cssText='padding:10px 14px;color:#8aa0af;font-size:11px;font-weight:800;white-space:nowrap';
        hit.root.appendChild(empty);
      }
    }else if(empty)empty.remove();
  }`,
  'syncTopTicker'
);

const css=`<style id="mova-preview-state-contrast-v4">
/* Keep the live market ticker intentionally dark in Light theme. */
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

/* Runtime-marked dark cards keep dark-theme contrast while the surrounding page is light. */
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
console.log('MOVA preview v4 applied: canonical Watch List ticker sync + dark-surface Light-theme contrast.');
