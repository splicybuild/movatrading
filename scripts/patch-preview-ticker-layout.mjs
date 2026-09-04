import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

const css=`
<style id="mova-preview-ticker-layout-v191">
:root{--mova-ticker-clearance:0px}
html,body{scroll-padding-top:var(--mova-ticker-clearance)!important}
.mova-ticker-layout-spacer{display:block!important;width:100%!important;height:var(--mova-ticker-clearance)!important;min-height:var(--mova-ticker-clearance)!important;flex:0 0 var(--mova-ticker-clearance)!important;pointer-events:none!important;visibility:hidden!important}
.page,[id="companyResearchView"],section{scroll-margin-top:var(--mova-ticker-clearance)!important}
</style>
`;

const js=`
<script id="mova-preview-ticker-layout-runtime-v191">
(function(){
  let spacer=null;
  let spacerAnchor=null;

  function text(el){return (el?.innerText||'').replace(/\\s+/g,' ').trim()}

  function candidateScore(el){
    if(!el||el===document.body||el===document.documentElement)return -1;
    const t=text(el);
    if(!t)return -1;
    let score=0;
    if(/\\bLIVE\\b/.test(t))score+=6;
    if(/Trending/.test(t))score+=6;
    if(/Watchlist/.test(t))score+=6;
    score+=Math.min(8,(t.match(/\\$[0-9]/g)||[]).length);
    const r=el.getBoundingClientRect();
    if(r.width>=window.innerWidth*.75)score+=4;
    if(r.height>25&&r.height<190)score+=4;
    if(r.height>260)score-=8;
    return score;
  }

  function findTicker(){
    const hits=[...document.querySelectorAll('body *')]
      .map(el=>({el,score:candidateScore(el)}))
      .filter(x=>x.score>=12)
      .sort((a,b)=>b.score-a.score || a.el.getBoundingClientRect().height-b.el.getBoundingClientRect().height);
    if(!hits.length)return null;
    let el=hits[0].el;
    /* Prefer a full-width compact wrapper, but never climb into the whole page/header. */
    for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement){
      const r=p.getBoundingClientRect(),t=text(p);
      if(r.width>=window.innerWidth*.85 && r.height>30 && r.height<190 && /Trending/.test(t) && /Watchlist/.test(t)) el=p;
      if(r.height>=220)break;
    }
    return el;
  }

  function positionedAncestor(el){
    let best=el;
    for(let p=el;p&&p!==document.body;p=p.parentElement){
      const pos=getComputedStyle(p).position;
      if(pos==='fixed'||pos==='sticky')best=p;
      if(pos==='fixed')return p;
    }
    return best;
  }

  function clearOld(){
    if(spacer){spacer.remove();spacer=null;spacerAnchor=null}
  }

  function apply(){
    const ticker=findTicker();
    if(!ticker)return;
    const anchor=positionedAncestor(ticker);
    const cs=getComputedStyle(anchor);
    const rect=anchor.getBoundingClientRect();
    const clearance=Math.ceil(Math.max(48,rect.height)+8);
    document.documentElement.style.setProperty('--mova-ticker-clearance',clearance+'px');
    anchor.style.zIndex='60';

    if(cs.position==='fixed'){
      /* Fixed elements are removed from document flow. Put a real placeholder
         immediately before the fixed wrapper so the page begins below it. */
      if(!spacer || spacerAnchor!==anchor){
        clearOld();
        spacer=document.createElement('div');
        spacer.className='mova-ticker-layout-spacer';
        anchor.parentNode?.insertBefore(spacer,anchor);
        spacerAnchor=anchor;
      }
      spacer.style.height=clearance+'px';
      spacer.style.minHeight=clearance+'px';
    }else{
      clearOld();
      if(cs.position==='sticky'){
        anchor.style.top='0px';
        if(getComputedStyle(anchor).backgroundColor==='rgba(0, 0, 0, 0)')anchor.style.background='#020810';
      }
    }
  }

  const schedule=()=>requestAnimationFrame(()=>requestAnimationFrame(apply));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
  window.addEventListener('load',schedule);
  window.addEventListener('resize',schedule);
  window.addEventListener('hashchange',schedule);
  document.addEventListener('click',()=>setTimeout(schedule,40),true);
  setTimeout(schedule,250);setTimeout(schedule,900);setTimeout(schedule,1800);
})();
</script>
`;

if(!html.includes('</head>'))throw new Error('Ticker layout patch: </head> missing');
if(!html.includes('</body>'))throw new Error('Ticker layout patch: </body> missing');
html=html.replace('</head>',css+'</head>');
html=html.replace('</body>',js+'</body>');
writeFileSync(file,html);
console.log('MOVA preview fixed ticker layout reservation v191 complete.');
