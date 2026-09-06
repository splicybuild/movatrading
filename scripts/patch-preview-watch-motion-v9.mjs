import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

if(!html.includes('mova-preview-watch-marquee-v8')) throw new Error('Watch motion v9: marquee v8 runtime missing');

const css=`<style id="mova-preview-watch-motion-v9-style">
/* v9 owns Watchlist motion only; v8 still owns rendering, de-duping and clicks. */
.mova-canonical-watch-track{animation:none!important;transform:none!important}
.mova-canonical-watch-strip{scroll-behavior:auto!important}
</style>`;

const runtime=`<script id="mova-preview-watch-motion-v9">(function(){
  var raf=0,last=0;

  function selected(b){
    if(!b)return false;
    var c=' '+String(b.className||'')+' ';
    return /\\b(active|selected|current|on|is-active|is-selected)\\b/i.test(c)||
      b.getAttribute('aria-selected')==='true'||
      b.getAttribute('aria-pressed')==='true'||
      b.dataset.active==='true'||b.dataset.selected==='true';
  }

  function watchActive(){
    var buttons=Array.from(document.querySelectorAll('button')).filter(function(b){
      return /^(Watchlist|Trending)$/i.test((b.textContent||'').trim())&&b.offsetParent!==null;
    });
    var w=buttons.find(function(b){return /^Watchlist$/i.test((b.textContent||'').trim())});
    var t=buttons.find(function(b){return /^Trending$/i.test((b.textContent||'').trim())});
    if(selected(w))return true;
    if(selected(t))return false;
    try{return sessionStorage.getItem('movaTickerModeV1')==='watchlist'}catch(e){return false}
  }

  function speedPxPerMs(){
    var mode='normal';
    try{mode=localStorage.getItem('movaTickerSpeedV1')||'normal'}catch(e){}
    if(mode==='slow')return 0.028;
    if(mode==='fast')return 0.075;
    return 0.05;
  }

  function frame(now){
    raf=requestAnimationFrame(frame);

    var strip=document.querySelector('[data-mova-canonical-watch-strip="1"]');
    var track=strip&&strip.querySelector(':scope > .mova-canonical-watch-track');
    var group=track&&track.querySelector(':scope > .mova-canonical-watch-group');

    if(!strip||!track||!group||!watchActive()){
      last=now;
      return;
    }

    var width=Math.ceil(group.getBoundingClientRect().width);
    if(width<1){last=now;return}

    if(!last)last=now;
    var dt=Math.min(64,Math.max(0,now-last));
    last=now;

    strip.scrollLeft += dt*speedPxPerMs();
    if(strip.scrollLeft>=width)strip.scrollLeft-=width;
  }

  function start(){
    if(raf)return;
    last=performance.now();
    raf=requestAnimationFrame(frame);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();</script>`;

html=html.replace('</head>',css+'</head>');
html=html.replace('</body>',runtime+'</body>');
writeFileSync(file,html);
console.log('MOVA Watchlist motion v9 applied: scrollLeft-driven continuous ticker with saved speed preference.');
