import fs from 'node:fs';

const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');

const marker="  crName.textContent=companyName;";
if(!html.includes(marker))throw new Error('Company profile render marker not found');

html=html.replace(marker,`${marker}
  const brandHero=document.querySelector('.company-research-hero');
  if(brandHero){
    brandHero.querySelectorAll('.cr-brand-art,.cr-brand-watermark').forEach(x=>x.remove());
    const titleCol=crName?.parentElement;
    if(titleCol){
      titleCol.classList.add('cr-brand-title');
      titleCol.style.removeProperty('--cr-brand-image');
      titleCol.classList.remove('has-brand-image');
      const src='/api/company-history?ticker='+encodeURIComponent(ticker||k)+'&name='+encodeURIComponent(companyName)+'&asset=image&v=2';
      const probe=new Image();
      probe.onload=()=>{
        if(probe.naturalWidth>40&&probe.naturalHeight>40){
          titleCol.style.setProperty('--cr-brand-image','url("'+src.replace(/"/g,'%22')+'")');
          titleCol.classList.add('has-brand-image');
        }
      };
      probe.onerror=()=>{titleCol.classList.remove('has-brand-image');titleCol.style.removeProperty('--cr-brand-image')};
      probe.src=src;
    }
  }`);

html=html.replace('</head>',`<style>
.company-research-hero{overflow:hidden!important}
.company-research-hero>.cr-brand-title{position:relative!important;isolation:isolate!important;min-width:0!important;overflow:hidden!important;border-radius:22px;padding:22px 26px!important;background:linear-gradient(135deg,rgba(7,22,34,.68),rgba(3,11,18,.18))!important}
.company-research-hero>.cr-brand-title:before{content:"";position:absolute;z-index:-2;inset:0;background-image:var(--cr-brand-image);background-repeat:no-repeat;background-position:8% 50%;background-size:min(38vw,560px) 82%;opacity:0;filter:saturate(.85) brightness(1.1);mix-blend-mode:screen;transition:opacity .2s ease;pointer-events:none}
.company-research-hero>.cr-brand-title.has-brand-image:before{opacity:.22}
.company-research-hero>.cr-brand-title:after{content:"";position:absolute;z-index:-1;inset:0;background:linear-gradient(90deg,rgba(3,11,18,.76) 0%,rgba(3,11,18,.70) 38%,rgba(3,11,18,.38) 70%,rgba(3,11,18,.15) 100%);pointer-events:none}
.company-research-hero>.cr-brand-title>*{position:relative;z-index:1}
.company-research-hero>.cr-price-side{position:relative!important;z-index:3!important;background:transparent!important}
.ticker .tick,.ticker-track .tick,.tick[role="button"]{cursor:pointer!important}
@media(max-width:760px){.company-research-hero>.cr-brand-title{padding:20px!important}.company-research-hero>.cr-brand-title:before{background-position:12% 24%;background-size:76vw 54%}.company-research-hero>.cr-brand-title.has-brand-image:before{opacity:.16}.company-research-hero>.cr-brand-title:after{background:linear-gradient(90deg,rgba(3,11,18,.84),rgba(3,11,18,.62))}}
</style></head>`);

fs.writeFileSync(file,html);
console.log('Attached same-origin company artwork directly behind Research title column.');
