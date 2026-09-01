import fs from 'node:fs';

const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');

const marker="  crName.textContent=companyName;";
if(!html.includes(marker))throw new Error('Company profile render marker not found');

html=html.replace(marker,`${marker}
  const brandHero=document.querySelector('.company-research-hero');
  if(brandHero){
    brandHero.classList.add('cr-brand-hero');
    let brandImg=brandHero.querySelector('.cr-brand-watermark');
    if(profile.logo){
      if(!brandImg){
        brandImg=document.createElement('img');
        brandImg.className='cr-brand-watermark';
        brandImg.alt='';
        brandImg.setAttribute('aria-hidden','true');
        brandImg.referrerPolicy='no-referrer';
        brandHero.prepend(brandImg);
      }
      brandImg.onload=()=>brandHero.classList.add('has-brand-watermark');
      brandImg.onerror=()=>{brandHero.classList.remove('has-brand-watermark');brandImg.style.display='none'};
      brandImg.style.display='block';
      brandImg.src=profile.logo;
    }else if(brandImg){
      brandHero.classList.remove('has-brand-watermark');
      brandImg.remove();
    }
  }`);

html=html.replace('</head>',`<style>
.company-research-hero.cr-brand-hero{position:relative!important;overflow:hidden!important;isolation:isolate;min-height:230px;padding:34px 28px!important;border-radius:26px;background:linear-gradient(135deg,rgba(7,22,34,.88),rgba(3,11,18,.98))}
.company-research-hero.cr-brand-hero>.cr-brand-watermark{position:absolute!important;z-index:0!important;right:4%!important;top:50%!important;transform:translateY(-50%)!important;width:min(40vw,560px)!important;height:74%!important;object-fit:contain!important;object-position:center right!important;opacity:.17!important;filter:grayscale(1) brightness(0) invert(1)!important;pointer-events:none!important;user-select:none!important}
.company-research-hero.cr-brand-hero:after{content:"";position:absolute;z-index:1;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(3,11,18,.94) 0%,rgba(3,11,18,.83) 44%,rgba(3,11,18,.28) 76%,rgba(3,11,18,.46) 100%)}
.company-research-hero.cr-brand-hero>*:not(.cr-brand-watermark){position:relative;z-index:2}
@media(max-width:760px){.company-research-hero.cr-brand-hero{min-height:300px;padding:26px 20px!important}.company-research-hero.cr-brand-hero>.cr-brand-watermark{right:-15%!important;top:32%!important;width:78vw!important;height:48%!important;opacity:.13!important}.company-research-hero.cr-brand-hero:after{background:linear-gradient(90deg,rgba(3,11,18,.97) 0%,rgba(3,11,18,.86) 58%,rgba(3,11,18,.42) 100%)}}
</style></head>`);

fs.writeFileSync(file,html);
console.log('Added visible official company-logo banner to Research header.');
