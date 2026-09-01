import fs from 'node:fs';

const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');

const marker="  crName.textContent=companyName;";
if(!html.includes(marker))throw new Error('Company profile render marker not found');

html=html.replace(marker,`${marker}
  const brandHero=(()=>{let el=crName?.parentElement;while(el&&el!==document.body&&!el.querySelector('#crPrice'))el=el.parentElement;return el&&el!==document.body?el:null})();
  if(brandHero){
    brandHero.classList.add('cr-brand-hero');
    let brandImg=brandHero.querySelector('.cr-brand-watermark');
    if(profile.logo){
      if(!brandImg){brandImg=document.createElement('img');brandImg.className='cr-brand-watermark';brandImg.alt='';brandImg.setAttribute('aria-hidden','true');brandHero.prepend(brandImg)}
      brandImg.src=profile.logo;brandImg.style.display='block';
    }else if(brandImg){brandImg.remove();}
  }`);

html=html.replace('</head>',`<style>
.cr-brand-hero{position:relative!important;overflow:hidden!important;isolation:isolate;border-radius:26px}
.cr-brand-hero>.cr-brand-watermark{position:absolute!important;z-index:0!important;right:5%!important;top:50%!important;transform:translateY(-50%)!important;width:min(42vw,620px)!important;height:82%!important;object-fit:contain!important;object-position:center right!important;opacity:.105!important;filter:grayscale(.08) saturate(.8) brightness(1.22)!important;pointer-events:none!important;user-select:none!important}
.cr-brand-hero:after{content:"";position:absolute;z-index:1;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(3,11,18,.97) 0%,rgba(3,11,18,.91) 38%,rgba(3,11,18,.55) 66%,rgba(3,11,18,.72) 100%)}
.cr-brand-hero>*:not(.cr-brand-watermark){position:relative;z-index:2}
@media(max-width:760px){.cr-brand-hero{border-radius:18px}.cr-brand-hero>.cr-brand-watermark{right:-9%!important;width:72vw!important;height:72%!important;opacity:.08!important}.cr-brand-hero:after{background:linear-gradient(90deg,rgba(3,11,18,.98) 0%,rgba(3,11,18,.9) 54%,rgba(3,11,18,.68) 100%)}}
</style></head>`);

fs.writeFileSync(file,html);
console.log('Added official company-logo hero watermark to Research headers.');
