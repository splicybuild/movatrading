import fs from 'node:fs';

const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');

const marker="  crName.textContent=companyName;";
if(!html.includes(marker))throw new Error('Company profile render marker not found');

html=html.replace(marker,`${marker}
  const brandHero=document.querySelector('.company-research-hero');
  if(brandHero){
    brandHero.querySelectorAll('.cr-brand-art,.cr-brand-watermark,.cr-brand-logo-stage').forEach(x=>x.remove());
    const copyCol=crName?.parentElement;
    copyCol?.classList.remove('cr-brand-title','has-brand-image');
    copyCol?.classList.add('cr-brand-copy');
    copyCol?.style.removeProperty('--cr-brand-image');
    brandHero.classList.add('cr-brand-hero');
    brandHero.classList.remove('has-brand-image');
    brandHero.style.removeProperty('--cr-brand-image');

    const symbol=ticker||k;
    const officialFiles={
      AAPL:'Apple logo black.svg',
      TSLA:'Tesla Motors.svg',
      NVDA:'NVIDIA logo white.svg',
      AMZN:'Amazon 2024.svg',
      MSFT:'Microsoft logo (2012).svg',
      LLY:'Eli Lilly and Company.svg',
      WMT:'Walmart logo (2025; Alt).svg',
      AMD:'AMD Logo.svg',
      MU:'Micron Technology logo 2024.svg',
      AVGO:'Broadcom logo (2016-present).svg',
      XOM:'Exxon Mobil Logo.svg',
      GOOGL:'Alphabet Inc Logo 2015.svg',
      GOOG:'Alphabet Inc Logo 2015.svg'
    };
    const titleMap={AAPL:'Apple Inc.',TSLA:'Tesla, Inc.',NVDA:'Nvidia',AMZN:'Amazon (company)',AVGO:'Broadcom Inc.',AMD:'Advanced Micro Devices',MU:'Micron Technology',MSFT:'Microsoft',META:'Meta Platforms',GOOGL:'Alphabet Inc.',GOOG:'Alphabet Inc.',NFLX:'Netflix, Inc.',INTC:'Intel',WMT:'Walmart',LLY:'Eli Lilly and Company',XOM:'ExxonMobil',JPM:'JPMorgan Chase',GS:'Goldman Sachs'};

    const stage=document.createElement('div');
    stage.className='cr-brand-logo-stage';
    stage.setAttribute('aria-hidden','true');
    const logoImg=document.createElement('img');
    logoImg.alt='';
    logoImg.referrerPolicy='no-referrer';
    stage.appendChild(logoImg);
    brandHero.prepend(stage);

    const classifyLogo=()=>{
      const ratio=logoImg.naturalWidth/Math.max(1,logoImg.naturalHeight);
      stage.dataset.shape=ratio>=2.35?'wide':ratio<=0.85?'tall':'balanced';
      stage.classList.add('loaded');
    };
    const applyLogo=src=>new Promise(resolve=>{
      if(!src){resolve(false);return}
      stage.classList.remove('loaded');
      logoImg.onload=()=>{
        if(logoImg.naturalWidth>24&&logoImg.naturalHeight>24){classifyLogo();resolve(true)}else resolve(false);
      };
      logoImg.onerror=()=>resolve(false);
      logoImg.src=src;
    });
    const commonsFile=fileName=>'https://commons.wikimedia.org/wiki/Special:Redirect/file/'+encodeURIComponent(fileName)+'?width=1600';

    (async()=>{
      let applied=false;
      const curated=officialFiles[symbol];
      if(curated)applied=await applyLogo(commonsFile(curated));
      if(!applied){
        try{
          const wikiTitle=titleMap[symbol]||companyName;
          const wp=new URL('https://en.wikipedia.org/w/api.php');
          wp.searchParams.set('action','query');wp.searchParams.set('prop','pageprops');wp.searchParams.set('redirects','1');wp.searchParams.set('titles',wikiTitle);wp.searchParams.set('format','json');wp.searchParams.set('origin','*');
          const wr=await fetch(wp.toString(),{headers:{Accept:'application/json'}});
          if(wr.ok){
            const wd=await wr.json(),page=Object.values(wd?.query?.pages||{})[0]||{},id=page?.pageprops?.wikibase_item||'';
            if(id){
              const wu=new URL('https://www.wikidata.org/w/api.php');
              wu.searchParams.set('action','wbgetentities');wu.searchParams.set('ids',id);wu.searchParams.set('props','claims');wu.searchParams.set('format','json');wu.searchParams.set('origin','*');
              const rr=await fetch(wu.toString(),{headers:{Accept:'application/json'}});
              if(rr.ok){
                const rd=await rr.json(),entity=rd?.entities?.[id]||{},logo=entity?.claims?.P154?.map(c=>c?.mainsnak?.datavalue?.value).find(v=>typeof v==='string')||'';
                if(logo)applied=await applyLogo(commonsFile(logo));
              }
            }
          }
        }catch(_){}
      }
      if(!applied&&profile.logo)applied=await applyLogo(profile.logo);
      if(!applied)stage.remove();
    })();
  }`);

html=html.replace('</head>',`<style>
.company-research-hero.cr-brand-hero{position:relative!important;isolation:isolate!important;overflow:hidden!important;min-height:310px!important;padding:38px 42px!important;border-radius:26px!important;background:#050d14!important}
.company-research-hero.cr-brand-hero>.cr-brand-logo-stage{position:absolute!important;z-index:0!important;inset:0!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0 18% 0 31%!important;overflow:hidden!important;pointer-events:none!important}
.company-research-hero.cr-brand-hero>.cr-brand-logo-stage:before{content:"";position:absolute!important;z-index:0!important;left:34%!important;right:14%!important;top:8%!important;bottom:8%!important;border-radius:42px!important;background:radial-gradient(ellipse at center,rgba(255,255,255,.99) 0%,rgba(249,251,253,.97) 58%,rgba(240,245,249,.82) 73%,rgba(240,245,249,.28) 88%,transparent 100%)!important;filter:drop-shadow(0 12px 42px rgba(0,0,0,.20))!important}
.company-research-hero.cr-brand-hero>.cr-brand-logo-stage img{position:relative!important;z-index:1!important;display:block!important;width:auto!important;height:auto!important;max-width:100%!important;max-height:72%!important;object-fit:contain!important;object-position:center!important;opacity:0!important;filter:drop-shadow(0 8px 24px rgba(0,0,0,.18))!important;transition:opacity .22s ease!important}
.company-research-hero.cr-brand-hero>.cr-brand-logo-stage.loaded img{opacity:.98!important}
.company-research-hero.cr-brand-hero>.cr-brand-logo-stage[data-shape="wide"] img{max-width:100%!important;max-height:58%!important}
.company-research-hero.cr-brand-hero>.cr-brand-logo-stage[data-shape="tall"] img{max-width:46%!important;max-height:82%!important}
.company-research-hero.cr-brand-hero>.cr-brand-logo-stage[data-shape="balanced"] img{max-width:76%!important;max-height:76%!important}
.company-research-hero.cr-brand-hero>.cr-brand-copy{position:relative!important;z-index:3!important;width:min(72%,1320px)!important;margin-left:-8px!important;padding:14px 19% 14px 8px!important;border-radius:22px!important;background:linear-gradient(90deg,rgba(3,11,18,.97) 0%,rgba(3,11,18,.91) 48%,rgba(3,11,18,.68) 72%,rgba(3,11,18,0) 100%)!important;text-shadow:0 2px 12px rgba(0,0,0,.75)!important}
.company-research-hero.cr-brand-hero:after{content:"";position:absolute;z-index:1;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(3,11,18,.22) 0%,rgba(3,11,18,.06) 42%,rgba(3,11,18,.02) 70%,rgba(3,11,18,.34) 100%)}
.company-research-hero.cr-brand-hero>*:not(.cr-brand-logo-stage){position:relative;z-index:2}
.company-research-hero.cr-brand-hero>.cr-price-side{z-index:4!important;background:transparent!important}
.ticker .tick,.ticker-track .tick,.tick[role="button"]{cursor:pointer!important}
@media(max-width:760px){.company-research-hero.cr-brand-hero{min-height:410px!important;padding:26px 20px!important}.company-research-hero.cr-brand-hero>.cr-brand-logo-stage{align-items:flex-start!important;padding:28px 5% 0!important}.company-research-hero.cr-brand-hero>.cr-brand-logo-stage:before{left:5%!important;right:5%!important;top:4%!important;bottom:35%!important;border-radius:28px!important}.company-research-hero.cr-brand-hero>.cr-brand-logo-stage[data-shape="wide"] img{max-width:86%!important;max-height:40%!important}.company-research-hero.cr-brand-hero>.cr-brand-logo-stage[data-shape="tall"] img{max-width:40%!important;max-height:48%!important}.company-research-hero.cr-brand-hero>.cr-brand-logo-stage[data-shape="balanced"] img{max-width:68%!important;max-height:44%!important}.company-research-hero.cr-brand-hero>.cr-brand-copy{width:100%!important;margin:0!important;padding:150px 0 12px!important;background:linear-gradient(180deg,rgba(3,11,18,0) 0%,rgba(3,11,18,.72) 42%,rgba(3,11,18,.97) 72%,rgba(3,11,18,.99) 100%)!important}.company-research-hero.cr-brand-hero:after{background:linear-gradient(180deg,rgba(3,11,18,.03) 0%,rgba(3,11,18,.16) 45%,rgba(3,11,18,.82) 100%)}}
</style></head>`);

fs.writeFileSync(file,html);
console.log('Added bright neutral brand canvas with preserved official colours and dark readable copy zone.');
