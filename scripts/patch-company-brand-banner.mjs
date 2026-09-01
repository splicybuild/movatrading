import fs from 'node:fs';

const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');

const marker="  crName.textContent=companyName;";
if(!html.includes(marker))throw new Error('Company profile render marker not found');

html=html.replace(marker,`${marker}
  const brandHero=document.querySelector('.company-research-hero');
  if(brandHero){
    brandHero.querySelectorAll('.cr-brand-art,.cr-brand-watermark').forEach(x=>x.remove());
    crName?.parentElement?.classList.remove('cr-brand-title','has-brand-image');
    crName?.parentElement?.style.removeProperty('--cr-brand-image');
    brandHero.classList.add('cr-brand-hero');
    brandHero.classList.remove('has-brand-image');
    brandHero.style.removeProperty('--cr-brand-image');
    const symbol=ticker||k;
    const titleMap={AAPL:'Apple Inc.',TSLA:'Tesla, Inc.',NVDA:'Nvidia',AMZN:'Amazon (company)',AVGO:'Broadcom Inc.',AMD:'Advanced Micro Devices',MU:'Micron Technology',MSFT:'Microsoft',META:'Meta Platforms',GOOGL:'Alphabet Inc.',GOOG:'Alphabet Inc.',NFLX:'Netflix, Inc.',INTC:'Intel',WMT:'Walmart',LLY:'Eli Lilly and Company',XOM:'ExxonMobil',JPM:'JPMorgan Chase'};
    const wikiTitle=titleMap[symbol]||companyName;
    const applyLogo=src=>new Promise(resolve=>{
      if(!src){resolve(false);return}
      const probe=new Image();
      probe.onload=()=>{
        if(probe.naturalWidth>24&&probe.naturalHeight>24){
          brandHero.style.setProperty('--cr-brand-image','url("'+String(src).replace(/"/g,'%22')+'")');
          brandHero.classList.add('has-brand-image');
          resolve(true);
        }else resolve(false);
      };
      probe.onerror=()=>resolve(false);
      probe.referrerPolicy='no-referrer';
      probe.src=src;
    });
    (async()=>{
      let applied=false;
      try{
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
              if(logo){
                const commons='https://commons.wikimedia.org/wiki/Special:Redirect/file/'+encodeURIComponent(logo)+'?width=1600';
                applied=await applyLogo(commons);
              }
            }
          }
        }
      }catch(_){}
      if(!applied)applied=await applyLogo('/api/fundamentals?symbol='+encodeURIComponent(symbol)+'&asset=logo&v=5');
      if(!applied&&profile.logo)await applyLogo(profile.logo);
    })();
  }`);

html=html.replace('</head>',`<style>
.company-research-hero.cr-brand-hero{position:relative!important;isolation:isolate!important;overflow:hidden!important;min-height:300px!important;padding:36px 40px!important;border-radius:26px!important;background:radial-gradient(circle at 62% 50%,rgba(50,174,255,.08),transparent 34%),#050d14!important}
.company-research-hero.cr-brand-hero:before{content:"";position:absolute;z-index:-2;inset:14px 4%;background-image:var(--cr-brand-image);background-repeat:no-repeat;background-position:center center;background-size:72% 78%;opacity:0;filter:brightness(0) invert(1) drop-shadow(0 0 28px rgba(255,255,255,.12));transition:opacity .25s ease;pointer-events:none}
.company-research-hero.cr-brand-hero.has-brand-image:before{opacity:.44}
.company-research-hero.cr-brand-hero:after{content:"";position:absolute;z-index:-1;inset:0;background:linear-gradient(90deg,rgba(3,11,18,.84) 0%,rgba(3,11,18,.62) 37%,rgba(3,11,18,.44) 64%,rgba(3,11,18,.66) 100%);pointer-events:none}
.company-research-hero.cr-brand-hero>*{position:relative;z-index:1}
.company-research-hero.cr-brand-hero>div:first-child{padding:6px 0!important;background:transparent!important;overflow:visible!important}
.company-research-hero.cr-brand-hero>.cr-price-side{z-index:3!important;background:transparent!important}
.ticker .tick,.ticker-track .tick,.tick[role="button"]{cursor:pointer!important}
@media(max-width:760px){.company-research-hero.cr-brand-hero{min-height:390px!important;padding:28px 22px!important}.company-research-hero.cr-brand-hero:before{inset:12px 3%;background-position:center 30%;background-size:82% 58%}.company-research-hero.cr-brand-hero.has-brand-image:before{opacity:.38}.company-research-hero.cr-brand-hero:after{background:linear-gradient(180deg,rgba(3,11,18,.58) 0%,rgba(3,11,18,.62) 48%,rgba(3,11,18,.90) 100%),linear-gradient(90deg,rgba(3,11,18,.58),rgba(3,11,18,.42))}}
</style></head>`);

fs.writeFileSync(file,html);
console.log('Added clear official company-logo heroes with full contain sizing.');
