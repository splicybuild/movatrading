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
    const src='/api/company-history?ticker='+encodeURIComponent(ticker||k)+'&name='+encodeURIComponent(companyName)+'&asset=image&v=3';
    const probe=new Image();
    probe.onload=()=>{
      if(probe.naturalWidth>40&&probe.naturalHeight>40){
        brandHero.style.setProperty('--cr-brand-image','url("'+src.replace(/"/g,'%22')+'")');
        brandHero.classList.add('has-brand-image');
      }
    };
    probe.onerror=()=>{brandHero.classList.remove('has-brand-image');brandHero.style.removeProperty('--cr-brand-image')};
    probe.src=src;
  }`);

html=html.replace('</head>',`<style>
.company-research-hero.cr-brand-hero{position:relative!important;isolation:isolate!important;overflow:hidden!important;min-height:280px!important;padding:34px 38px!important;border-radius:26px!important;background:#050d14!important}
.company-research-hero.cr-brand-hero:before{content:"";position:absolute;z-index:-2;inset:0;background-image:var(--cr-brand-image);background-repeat:no-repeat;background-position:center 46%;background-size:cover;opacity:0;filter:saturate(.82) brightness(.92) contrast(1.08);transform:scale(1.015);transition:opacity .25s ease;pointer-events:none}
.company-research-hero.cr-brand-hero.has-brand-image:before{opacity:.48}
.company-research-hero.cr-brand-hero:after{content:"";position:absolute;z-index:-1;inset:0;background:linear-gradient(90deg,rgba(3,11,18,.90) 0%,rgba(3,11,18,.75) 38%,rgba(3,11,18,.46) 66%,rgba(3,11,18,.66) 100%),linear-gradient(0deg,rgba(3,11,18,.30),rgba(3,11,18,.08));pointer-events:none}
.company-research-hero.cr-brand-hero>*{position:relative;z-index:1}
.company-research-hero.cr-brand-hero>div:first-child{padding:6px 0!important;background:transparent!important;overflow:visible!important}
.company-research-hero.cr-brand-hero>.cr-price-side{z-index:3!important;background:transparent!important}
.ticker .tick,.ticker-track .tick,.tick[role="button"]{cursor:pointer!important}
@media(max-width:760px){.company-research-hero.cr-brand-hero{min-height:390px!important;padding:28px 22px!important}.company-research-hero.cr-brand-hero:before{background-position:center 34%;background-size:cover}.company-research-hero.cr-brand-hero.has-brand-image:before{opacity:.40}.company-research-hero.cr-brand-hero:after{background:linear-gradient(180deg,rgba(3,11,18,.66) 0%,rgba(3,11,18,.72) 48%,rgba(3,11,18,.93) 100%),linear-gradient(90deg,rgba(3,11,18,.52),rgba(3,11,18,.36))}}
</style></head>`);

fs.writeFileSync(file,html);
console.log('Expanded same-origin company artwork across full Research hero.');
