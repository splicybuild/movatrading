import fs from 'node:fs';

const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');

const marker="  crName.textContent=companyName;";
if(!html.includes(marker))throw new Error('Company profile render marker not found');

html=html.replace(marker,`${marker}
  const brandHero=document.querySelector('.company-research-hero');
  if(brandHero){
    brandHero.classList.add('cr-brand-hero');
    brandHero.dataset.brandTicker=ticker||k;
    let brandImg=brandHero.querySelector('.cr-brand-watermark');
    if(!brandImg){
      brandImg=document.createElement('img');
      brandImg.className='cr-brand-watermark';
      brandImg.alt='';
      brandImg.setAttribute('aria-hidden','true');
      brandImg.referrerPolicy='no-referrer';
      brandHero.prepend(brandImg);
    }
    const brandSources=[];
    if(profile.logo&&/^https?:/i.test(profile.logo))brandSources.push(profile.logo);
    try{
      const rawSite=profile.website||'';
      if(rawSite){
        const parsed=new URL(/^https?:/i.test(rawSite)?rawSite:'https://'+rawSite);
        const domain=parsed.hostname.replace(/^www\./i,'');
        if(domain){
          brandSources.push('https://www.google.com/s2/favicons?domain='+encodeURIComponent(domain)+'&sz=256');
          brandSources.push('https://icons.duckduckgo.com/ip3/'+encodeURIComponent(domain)+'.ico');
        }
      }
    }catch(_){}
    let brandSourceIndex=0;
    const tryBrandSource=()=>{
      if(brandSourceIndex>=brandSources.length){
        brandHero.classList.remove('has-brand-watermark');
        brandImg.style.display='none';
        return;
      }
      brandImg.style.display='block';
      brandImg.src=brandSources[brandSourceIndex++];
    };
    brandImg.onload=()=>{
      if(brandImg.naturalWidth>8&&brandImg.naturalHeight>8){
        brandHero.classList.add('has-brand-watermark');
        brandImg.style.display='block';
      }else tryBrandSource();
    };
    brandImg.onerror=tryBrandSource;
    tryBrandSource();
  }`);

html=html.replace('</head>',`<style>
.company-research-hero.cr-brand-hero{position:relative!important;overflow:hidden!important;isolation:isolate;min-height:230px;padding:34px 28px!important;border-radius:26px;background:radial-gradient(circle at 77% 48%,rgba(31,121,173,.10),transparent 34%),linear-gradient(135deg,rgba(7,22,34,.92),rgba(3,11,18,.99))}
.company-research-hero.cr-brand-hero>.cr-brand-watermark{position:absolute!important;z-index:0!important;right:5%!important;top:50%!important;transform:translateY(-50%)!important;width:min(42vw,590px)!important;height:78%!important;object-fit:contain!important;object-position:center right!important;opacity:.30!important;filter:saturate(.72) brightness(1.18) contrast(1.02)!important;mix-blend-mode:screen;pointer-events:none!important;user-select:none!important}
.company-research-hero.cr-brand-hero:after{content:"";position:absolute;z-index:1;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(3,11,18,.96) 0%,rgba(3,11,18,.84) 42%,rgba(3,11,18,.18) 72%,rgba(3,11,18,.34) 100%)}
.company-research-hero.cr-brand-hero>*:not(.cr-brand-watermark){position:relative;z-index:2}
.ticker .tick,.ticker-track .tick{cursor:pointer!important}
@media(max-width:760px){.company-research-hero.cr-brand-hero{min-height:300px;padding:26px 20px!important}.company-research-hero.cr-brand-hero>.cr-brand-watermark{right:-12%!important;top:34%!important;width:74vw!important;height:50%!important;opacity:.24!important}.company-research-hero.cr-brand-hero:after{background:linear-gradient(90deg,rgba(3,11,18,.98) 0%,rgba(3,11,18,.86) 54%,rgba(3,11,18,.30) 100%)}}
</style></head>`);

fs.writeFileSync(file,html);
console.log('Added reliable visible company-brand hero artwork and pointer cursor.');
