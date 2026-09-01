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
    brandHero.dataset.brand=symbol;
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
      GOOG:'Alphabet Inc Logo 2015.svg',
      GS:'Goldman Sachs logo.svg'
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
.company-research-hero.cr-brand-hero{--brand-a:#07131d;--brand-b:#0b2434;--brand-glow:rgba(66,187,255,.18);--logo-core:rgba(235,246,255,.90);position:relative!important;isolation:isolate!important;overflow:hidden!important;grid-template-columns:minmax(0,1fr) minmax(230px,285px)!important;gap:28px!important;align-items:stretch!important;min-height:315px!important;padding:34px 36px!important;border:1px solid rgba(118,168,199,.13)!important;border-radius:28px!important;background:radial-gradient(circle at 68% 35%,var(--brand-glow),transparent 34%),linear-gradient(135deg,var(--brand-a),var(--brand-b))!important;box-shadow:0 20px 60px rgba(0,0,0,.16)!important}
.company-research-hero.cr-brand-hero[data-brand="MSFT"]{--brand-a:#071623;--brand-b:#12364a;--brand-glow:rgba(0,164,239,.24);--logo-core:rgba(242,247,250,.92)}
.company-research-hero.cr-brand-hero[data-brand="NVDA"]{--brand-a:#061208;--brand-b:#173519;--brand-glow:rgba(118,185,0,.27);--logo-core:rgba(224,244,216,.91)}
.company-research-hero.cr-brand-hero[data-brand="AMZN"]{--brand-a:#11151a;--brand-b:#2b2115;--brand-glow:rgba(255,153,0,.28);--logo-core:rgba(255,244,225,.94)}
.company-research-hero.cr-brand-hero[data-brand="TSLA"]{--brand-a:#150609;--brand-b:#3b0c14;--brand-glow:rgba(232,33,39,.30);--logo-core:rgba(255,229,231,.91)}
.company-research-hero.cr-brand-hero[data-brand="AAPL"]{--brand-a:#0d1116;--brand-b:#333941;--brand-glow:rgba(207,213,220,.25);--logo-core:rgba(245,247,250,.93)}
.company-research-hero.cr-brand-hero[data-brand="MU"]{--brand-a:#061521;--brand-b:#123b58;--brand-glow:rgba(0,149,218,.28);--logo-core:rgba(224,245,255,.94)}
.company-research-hero.cr-brand-hero[data-brand="LLY"]{--brand-a:#16070b;--brand-b:#48121e;--brand-glow:rgba(206,24,54,.25);--logo-core:rgba(255,232,237,.92)}
.company-research-hero.cr-brand-hero[data-brand="WMT"]{--brand-a:#041a31;--brand-b:#07569a;--brand-glow:rgba(255,194,32,.22);--logo-core:rgba(231,244,255,.94)}
.company-research-hero.cr-brand-hero[data-brand="AMD"]{--brand-a:#120909;--brand-b:#3a1616;--brand-glow:rgba(237,28,36,.25);--logo-core:rgba(255,235,235,.92)}
.company-research-hero.cr-brand-hero[data-brand="AVGO"]{--brand-a:#18090c;--brand-b:#40151b;--brand-glow:rgba(204,9,47,.24);--logo-core:rgba(255,232,236,.92)}
.company-research-hero.cr-brand-hero[data-brand="XOM"]{--brand-a:#140606;--brand-b:#391010;--brand-glow:rgba(237,28,36,.24);--logo-core:rgba(255,232,232,.92)}
.company-research-hero.cr-brand-hero[data-brand="GOOGL"],.company-research-hero.cr-brand-hero[data-brand="GOOG"]{--brand-a:#0c1320;--brand-b:#172846;--brand-glow:rgba(66,133,244,.24);--logo-core:rgba(244,248,255,.94)}
.company-research-hero.cr-brand-hero[data-brand="GS"]{--brand-a:#061723;--brand-b:#123d58;--brand-glow:rgba(64,153,204,.26);--logo-core:rgba(230,246,255,.94)}
.company-research-hero.cr-brand-hero>.cr-brand-logo-stage{position:absolute!important;z-index:0!important;left:31%!important;right:300px!important;top:18px!important;bottom:18px!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;pointer-events:none!important}
.company-research-hero.cr-brand-hero>.cr-brand-logo-stage:before{content:"";position:absolute!important;inset:-4%!important;background:radial-gradient(ellipse at center,var(--logo-core) 0%,color-mix(in srgb,var(--logo-core) 64%,transparent) 32%,color-mix(in srgb,var(--brand-glow) 74%,transparent) 58%,transparent 78%)!important;filter:blur(13px)!important;opacity:.86!important}
.company-research-hero.cr-brand-hero>.cr-brand-logo-stage img{position:relative!important;z-index:1!important;display:block!important;width:auto!important;height:auto!important;max-width:88%!important;max-height:70%!important;object-fit:contain!important;object-position:center!important;opacity:0!important;filter:drop-shadow(0 9px 28px rgba(0,0,0,.20))!important;transition:opacity .22s ease!important}
.company-research-hero.cr-brand-hero>.cr-brand-logo-stage.loaded img{opacity:.96!important}
.company-research-hero.cr-brand-hero>.cr-brand-logo-stage[data-shape="wide"] img{max-width:94%!important;max-height:58%!important}
.company-research-hero.cr-brand-hero>.cr-brand-logo-stage[data-shape="tall"] img{max-width:45%!important;max-height:82%!important}
.company-research-hero.cr-brand-hero>.cr-brand-logo-stage[data-shape="balanced"] img{max-width:72%!important;max-height:76%!important}
.company-research-hero.cr-brand-hero>.cr-brand-copy{position:relative!important;z-index:3!important;align-self:center!important;width:100%!important;max-width:1120px!important;margin:0!important;padding:14px 30% 14px 4px!important;background:linear-gradient(90deg,rgba(3,11,18,.97) 0%,rgba(3,11,18,.90) 48%,rgba(3,11,18,.57) 72%,rgba(3,11,18,0) 100%)!important;text-shadow:0 2px 12px rgba(0,0,0,.72)!important}
.company-research-hero.cr-brand-hero>.cr-price-side{position:relative!important;z-index:4!important;align-self:stretch!important;display:flex!important;flex-direction:column!important;justify-content:center!important;gap:11px!important;min-width:0!important;padding:16px!important;margin:0!important;border:1px solid rgba(157,202,228,.18)!important;border-radius:22px!important;background:linear-gradient(180deg,rgba(5,18,29,.82),rgba(5,15,24,.72))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 12px 34px rgba(0,0,0,.20)!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important}
.company-research-hero.cr-brand-hero>.cr-price-side .cr-price-card{min-width:0!important;padding:8px 6px 12px!important;border:0!important;border-radius:0!important;background:transparent!important;text-align:right!important;box-shadow:none!important}
.company-research-hero.cr-brand-hero>.cr-price-side .cr-price-card span{font-size:9px!important;letter-spacing:.08em!important}
.company-research-hero.cr-brand-hero>.cr-price-side .cr-price-card b{font-size:clamp(31px,3vw,44px)!important;margin:7px 0 10px!important}
.company-research-hero.cr-brand-hero>.cr-price-side .cr-watch-btn{width:100%!important;margin:0!important;border-radius:12px!important;background:rgba(5,20,31,.70)!important;border:1px solid rgba(66,187,255,.34)!important;box-shadow:none!important}
.company-research-hero.cr-brand-hero:after{content:"";position:absolute;z-index:1;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(3,11,18,.18) 0%,rgba(3,11,18,.03) 55%,rgba(3,11,18,.18) 78%,rgba(3,11,18,.36) 100%)}
.company-research-hero.cr-brand-hero>*:not(.cr-brand-logo-stage){position:relative;z-index:2}
.ticker .tick,.ticker-track .tick,.tick[role="button"]{cursor:pointer!important}
@media(max-width:900px){.company-research-hero.cr-brand-hero{grid-template-columns:minmax(0,1fr) 230px!important}.company-research-hero.cr-brand-hero>.cr-brand-logo-stage{left:34%!important;right:242px!important}.company-research-hero.cr-brand-hero>.cr-brand-copy{padding-right:23%!important}}
@media(max-width:760px){.company-research-hero.cr-brand-hero{grid-template-columns:1fr!important;min-height:460px!important;padding:24px 18px!important;gap:14px!important}.company-research-hero.cr-brand-hero>.cr-brand-logo-stage{left:4%!important;right:4%!important;top:18px!important;bottom:auto!important;height:185px!important;align-items:center!important}.company-research-hero.cr-brand-hero>.cr-brand-logo-stage img{max-width:82%!important;max-height:72%!important}.company-research-hero.cr-brand-hero>.cr-brand-logo-stage[data-shape="tall"] img{max-width:36%!important;max-height:80%!important}.company-research-hero.cr-brand-hero>.cr-brand-copy{padding:158px 0 10px!important;background:linear-gradient(180deg,rgba(3,11,18,0) 0%,rgba(3,11,18,.48) 36%,rgba(3,11,18,.94) 72%,rgba(3,11,18,.98) 100%)!important}.company-research-hero.cr-brand-hero>.cr-price-side{align-self:auto!important;padding:12px 14px!important;border-radius:17px!important;background:rgba(5,17,27,.80)!important}.company-research-hero.cr-brand-hero>.cr-price-side .cr-price-card{text-align:left!important;display:grid!important;grid-template-columns:1fr auto!important;align-items:end!important;column-gap:12px!important}.company-research-hero.cr-brand-hero>.cr-price-side .cr-price-card b{font-size:30px!important;margin:4px 0!important}.company-research-hero.cr-brand-hero>.cr-price-side .cr-price-card small{grid-column:2;grid-row:1 / span 2;align-self:center!important}}
</style></head>`);

fs.writeFileSync(file,html);
console.log('Added brand-specific Research heroes and an integrated glass price/watchlist panel.');
