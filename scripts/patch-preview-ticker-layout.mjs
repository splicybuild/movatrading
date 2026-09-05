import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

const css=`
<style id="mova-preview-ticker-layout-v193">
:root{--mova-ticker-clearance:0px}
html,body{scroll-padding-top:var(--mova-ticker-clearance)!important}
.mova-ticker-layout-spacer{display:block!important;width:100%!important;height:var(--mova-ticker-clearance)!important;min-height:var(--mova-ticker-clearance)!important;flex:0 0 var(--mova-ticker-clearance)!important;pointer-events:none!important;visibility:hidden!important}
.page,[id="companyResearchView"],section{scroll-margin-top:var(--mova-ticker-clearance)!important}
@media(max-width:740px){body.mova-mobile-fixed-ticker{padding-top:0!important}}
</style>
`;

const js=`
<script id="mova-preview-ticker-layout-runtime-v193">
(function(){
  let spacer=null;
  let spacerAnchor=null;
  let forcedMobileAnchor=null;
  let forcedMobilePrevious=null;

  function text(el){return (el?.innerText||'').replace(/\\s+/g,' ').trim()}

  function candidateScore(el){
    if(!el||el===document.body||el===document.documentElement)return -1;
    const t=text(el); if(!t)return -1;
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

  function mobileHeaderBottom(){
    const header=document.querySelector('header');
    if(!header)return 0;
    const r=header.getBoundingClientRect();
    return Math.max(0,Math.min(window.innerHeight,r.bottom));
  }

  function clearSpacer(){if(spacer){spacer.remove();spacer=null;spacerAnchor=null}}

  function restoreForcedMobile(){
    if(!forcedMobileAnchor||!forcedMobilePrevious)return;
    for(const [key,value] of Object.entries(forcedMobilePrevious))forcedMobileAnchor.style[key]=value;
    forcedMobileAnchor=null;forcedMobilePrevious=null;
    document.body.classList.remove('mova-mobile-fixed-ticker');
  }

  function ensureSpacer(anchor,clearance){
    if(!spacer || spacerAnchor!==anchor){
      clearSpacer();
      spacer=document.createElement('div');
      spacer.className='mova-ticker-layout-spacer';
      anchor.parentNode?.insertBefore(spacer,anchor);
      spacerAnchor=anchor;
    }
    spacer.style.height=clearance+'px';
    spacer.style.minHeight=clearance+'px';
  }

  function apply(){
    const ticker=findTicker(); if(!ticker)return;
    let anchor=positionedAncestor(ticker);
    let cs=getComputedStyle(anchor);
    const isMobile=window.matchMedia('(max-width:740px)').matches;

    if(!isMobile && forcedMobileAnchor)restoreForcedMobile();

    if(isMobile && cs.position!=='fixed'){
      if(forcedMobileAnchor && forcedMobileAnchor!==anchor)restoreForcedMobile();
      if(!forcedMobileAnchor){
        forcedMobileAnchor=anchor;
        forcedMobilePrevious={position:anchor.style.position,top:anchor.style.top,left:anchor.style.left,right:anchor.style.right,width:anchor.style.width,zIndex:anchor.style.zIndex,background:anchor.style.background,boxSizing:anchor.style.boxSizing};
      }
      anchor.style.position='fixed';
      anchor.style.left='0px';
      anchor.style.right='0px';
      anchor.style.width='100%';
      anchor.style.zIndex='80';
      anchor.style.boxSizing='border-box';
      if(getComputedStyle(anchor).backgroundColor==='rgba(0, 0, 0, 0)')anchor.style.background='#020810';
      document.body.classList.add('mova-mobile-fixed-ticker');
      cs=getComputedStyle(anchor);
    }

    if(isMobile && cs.position==='fixed'){
      /* At the top of the page, sit immediately below the MOVA header/logo.
         As the normal header scrolls away, smoothly move up until pinned at 0. */
      anchor.style.top=mobileHeaderBottom()+'px';
    }

    const rect=anchor.getBoundingClientRect();
    const clearance=Math.ceil(Math.max(48,rect.height)+8);
    document.documentElement.style.setProperty('--mova-ticker-clearance',clearance+'px');
    anchor.style.zIndex=isMobile?'80':'60';

    if(cs.position==='fixed')ensureSpacer(anchor,clearance);
    else{
      clearSpacer();
      if(cs.position==='sticky'){
        anchor.style.top='0px';
        if(getComputedStyle(anchor).backgroundColor==='rgba(0, 0, 0, 0)')anchor.style.background='#020810';
      }
    }
  }

  let scrollQueued=false;
  function onScroll(){
    if(scrollQueued)return;
    scrollQueued=true;
    requestAnimationFrame(()=>{scrollQueued=false;apply()});
  }
  const schedule=()=>requestAnimationFrame(()=>requestAnimationFrame(apply));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
  window.addEventListener('load',schedule);
  window.addEventListener('resize',schedule);
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(schedule,120));
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
console.log('MOVA preview mobile ticker/header handoff v193 complete.');
