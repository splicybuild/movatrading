import fs from 'node:fs';

const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');

const marker="  crName.textContent=companyName;";
if(!html.includes(marker))throw new Error('Company profile render marker not found');

html=html.replace(marker,`${marker}
  const brandHero=document.querySelector('.company-research-hero');
  if(brandHero){
    brandHero.classList.add('cr-brand-hero');
    let art=brandHero.querySelector('.cr-brand-art');
    if(!art){art=document.createElement('div');art.className='cr-brand-art';art.setAttribute('aria-hidden','true');brandHero.prepend(art)}
    art.style.backgroundImage='none';brandHero.classList.remove('has-brand-art');
    const wikiTitles={AAPL:'Apple Inc.',TSLA:'Tesla, Inc.',NVDA:'Nvidia',AMZN:'Amazon (company)',AVGO:'Broadcom Inc.',AMD:'Advanced Micro Devices',MU:'Micron Technology',MSFT:'Microsoft',META:'Meta Platforms',GOOGL:'Alphabet Inc.',GOOG:'Alphabet Inc.',NFLX:'Netflix, Inc.',INTC:'Intel',WMT:'Walmart',LLY:'Eli Lilly and Company',XOM:'ExxonMobil',JPM:'JPMorgan Chase'};
    const wikiTitle=wikiTitles[ticker||k]||companyName;
    const applyBrandImage=src=>new Promise(resolve=>{
      if(!src){resolve(false);return}
      const probe=new Image();
      probe.onload=()=>{if(probe.naturalWidth>40&&probe.naturalHeight>40){art.style.backgroundImage='url("'+String(src).replace(/"/g,'%22')+'")';brandHero.classList.add('has-brand-art');resolve(true)}else resolve(false)};
      probe.onerror=()=>resolve(false);probe.referrerPolicy='no-referrer';probe.src=src;
    });
    (async()=>{
      let applied=false;
      try{
        const r=await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(wikiTitle),{headers:{Accept:'application/json'}});
        if(r.ok){const d=await r.json();applied=await applyBrandImage(d?.originalimage?.source||d?.thumbnail?.source||'')}
      }catch(_){}
      if(!applied&&profile.logo)applied=await applyBrandImage(profile.logo);
      if(!applied)await applyBrandImage('/api/fundamentals?symbol='+encodeURIComponent(ticker||k)+'&asset=logo');
    })();
  }`);

html=html.replace('</head>',`<style>
.company-research-hero.cr-brand-hero{position:relative!important;overflow:hidden!important;isolation:isolate;min-height:230px;padding:34px 28px!important;border-radius:26px;background:linear-gradient(135deg,rgba(7,22,34,.92),rgba(3,11,18,.99))}
.company-research-hero.cr-brand-hero>.cr-brand-art{position:absolute!important;z-index:0!important;left:1%!important;top:0!important;width:66%!important;height:100%!important;background-repeat:no-repeat!important;background-position:9% 50%!important;background-size:min(34vw,500px) 76%!important;opacity:0!important;filter:grayscale(.18) saturate(.88) brightness(1.1)!important;mix-blend-mode:screen!important;pointer-events:none!important;transition:opacity .25s ease}
.company-research-hero.cr-brand-hero.has-brand-art>.cr-brand-art{opacity:.20!important}
.company-research-hero.cr-brand-hero:after{content:"";position:absolute;z-index:1;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(3,11,18,.72) 0%,rgba(3,11,18,.78) 42%,rgba(3,11,18,.94) 70%,rgba(3,11,18,.98) 100%)}
.company-research-hero.cr-brand-hero>*:not(.cr-brand-art){position:relative;z-index:2}
.ticker .tick,.ticker-track .tick,.tick[role="button"]{cursor:pointer!important}
@media(max-width:760px){.company-research-hero.cr-brand-hero{min-height:300px;padding:26px 20px!important}.company-research-hero.cr-brand-hero>.cr-brand-art{left:-8%!important;top:0!important;width:96%!important;height:72%!important;background-position:18% 42%!important;background-size:68vw 62%!important}.company-research-hero.cr-brand-hero.has-brand-art>.cr-brand-art{opacity:.16!important}.company-research-hero.cr-brand-hero:after{background:linear-gradient(90deg,rgba(3,11,18,.78) 0%,rgba(3,11,18,.84) 60%,rgba(3,11,18,.97) 100%)}}
</style></head>`);

fs.writeFileSync(file,html);
console.log('Added Wikipedia company artwork behind Research titles and pointer cursors.');
