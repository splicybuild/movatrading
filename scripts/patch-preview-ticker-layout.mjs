import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

const css=`
<style id="mova-preview-ticker-layout-v190">
:root{--mova-ticker-clearance:0px}
html{scroll-padding-top:var(--mova-ticker-clearance)}
body{scroll-padding-top:var(--mova-ticker-clearance)}
.mova-ticker-spacer{display:none;width:100%;height:var(--mova-ticker-clearance);pointer-events:none}
body.mova-fixed-ticker .mova-ticker-spacer{display:block}
body.mova-fixed-ticker main,
body.mova-fixed-ticker .page,
body.mova-fixed-ticker [id="companyResearchView"]{scroll-margin-top:var(--mova-ticker-clearance)}
</style>
`;

const js=`
<script id="mova-preview-ticker-layout-runtime-v190">
(function(){
  let spacer=null;
  function isTickerCandidate(el){
    if(!el||el===document.body||el===document.documentElement)return false;
    const txt=(el.innerText||'').replace(/\\s+/g,' ').trim();
    if(!txt)return false;
    const hasControls=/\\bLIVE\\b/.test(txt)&&/Trending/.test(txt)&&/Watchlist/.test(txt);
    const hasManyPrices=(txt.match(/\\$[0-9]/g)||[]).length>=3;
    return hasControls||hasManyPrices;
  }
  function findTicker(){
    const all=[...document.querySelectorAll('body *')];
    const hits=all.filter(isTickerCandidate);
    if(!hits.length)return null;
    hits.sort((a,b)=>{
      const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();
      const as=(ar.width*ar.height),bs=(br.width*br.height);
      return as-bs;
    });
    let el=hits[0];
    while(el.parentElement&&el.parentElement!==document.body){
      const p=el.parentElement;
      const t=(p.innerText||'').replace(/\\s+/g,' ').trim();
      const r=p.getBoundingClientRect();
      if(r.width>=window.innerWidth*.8 && r.height<=180 && /Trending/.test(t)){el=p;break}
      el=p;
    }
    return el;
  }
  function apply(){
    const ticker=findTicker();
    if(!ticker)return;
    const cs=getComputedStyle(ticker);
    const rect=ticker.getBoundingClientRect();
    const fixed=cs.position==='fixed';
    const sticky=cs.position==='sticky';
    const clearance=Math.ceil(rect.height + Math.max(0,rect.top) + 8);
    document.documentElement.style.setProperty('--mova-ticker-clearance',clearance+'px');
    ticker.style.zIndex='50';
    if(fixed){
      document.body.classList.add('mova-fixed-ticker');
      if(!spacer){
        spacer=document.createElement('div');
        spacer.className='mova-ticker-spacer';
        ticker.insertAdjacentElement('afterend',spacer);
      }
    }else{
      document.body.classList.remove('mova-fixed-ticker');
      if(spacer){spacer.remove();spacer=null}
      if(sticky){
        ticker.style.top='0px';
        ticker.style.backgroundColor=cs.backgroundColor==='rgba(0, 0, 0, 0)'?'#020810':cs.backgroundColor;
      }
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  window.addEventListener('load',apply);
  window.addEventListener('resize',()=>requestAnimationFrame(apply));
  setTimeout(apply,300);setTimeout(apply,1000);
})();
</script>
`;

if(!html.includes('</head>'))throw new Error('Ticker layout patch: </head> missing');
if(!html.includes('</body>'))throw new Error('Ticker layout patch: </body> missing');
html=html.replace('</head>',css+'</head>');
html=html.replace('</body>',js+'</body>');
writeFileSync(file,html);
console.log('MOVA preview ticker layout safety v190 complete.');
