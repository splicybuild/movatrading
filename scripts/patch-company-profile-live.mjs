import fs from 'node:fs';

const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');

const start='async function hydrateCompanyHistoryLive(k,a){';
const end='\nfunction renderReportedRows';
const startAt=html.indexOf(start);
const endAt=startAt>=0?html.indexOf(end,startAt):-1;
if(startAt<0||endAt<0)throw new Error('Could not locate hydrateCompanyHistoryLive in dist/index.html');

const replacement=`async function hydrateCompanyHistoryLive(k,a){
  const root=document.getElementById('crOriginFacts');
  const esc=v=>String(v??'').replace(/[&<>\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]));
  const fetchJson=async url=>{const r=await fetch(url);if(!r.ok)throw new Error('HTTP '+r.status);return r.json();};
  const money=n=>{
    const v=Number(n);if(!Number.isFinite(v))return 'Not available';
    return '$'+v.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  };
  try{
    if(location.protocol==='file:')throw new Error('Live profile requires deployed MOVA');
    const [fundResult,historyResult,marketResult]=await Promise.allSettled([
      fetchJson('/api/fundamentals?symbol='+encodeURIComponent(k)),
      fetchJson('/api/company-history?ticker='+encodeURIComponent(k)+'&name='+encodeURIComponent(a.n)),
      fetchJson('/api/market?symbols='+encodeURIComponent(k))
    ]);
    const fundamentals=fundResult.status==='fulfilled'?fundResult.value:null;
    const history=historyResult.status==='fulfilled'?historyResult.value:null;
    const market=marketResult.status==='fulfilled'?marketResult.value:null;
    if(!fundamentals&&!history&&!market)throw new Error('Company feeds unavailable');

    const profile=fundamentals?.profile||{};
    const liveMarket=Array.isArray(market?.assets)?market.assets.find(x=>x.ticker===k):null;
    const cachedLive=(typeof liveQuotes!=='undefined'&&liveQuotes?.get)?liveQuotes.get(k):null;
    const quote=liveMarket||cachedLive||null;
    const companyName=profile.name||history?.name||a.n||k;
    const industry=profile.industry||'Not available from Finnhub';
    const exchange=profile.exchange||'Not available from Finnhub';
    const country=profile.country||'Not available from Finnhub';
    const ticker=profile.ticker||k;
    const priceText=quote?.priceNative!=null?money(quote.priceNative):'Live quote unavailable';
    const changePct=quote?.changePct;
    const moveText=Number.isFinite(Number(changePct))?((Number(changePct)>=0?'+':'')+Number(changePct).toFixed(2)+'%'):'—';

    if(quote?.priceNative!=null){
      crPrice.textContent=priceText;
      crMove.textContent=moveText;
      crMove.className=Number(changePct)>=0?'up':'down';
    }
    crName.textContent=companyName;
    crWhoTitle.textContent=companyName;
    crEyebrow.textContent=(profile.industry||a.sector||'Company')+' · '+ticker;

    const summary=history?.summary||history?.overview||'';
    const business=history?.sections?.business||history?.business||history?.sections?.products||history?.products||'';
    const origins=history?.sections?.origins||history?.origins||summary;
    const profileSummary=summary||(
      companyName+' is a publicly traded company'+
      (profile.industry?' in the '+profile.industry+' industry':'')+
      (profile.exchange?' listed on '+profile.exchange:'')+
      (profile.country?' and based in '+profile.country:'')+'.'
    );
    crIntro.textContent=profileSummary;
    crWho.textContent=profileSummary;
    crWhat.textContent=business||('Finnhub classifies '+companyName+' in the '+industry+' industry. A detailed business description is not available from the live company-profile feed.');
    crHistorySummary.textContent=origins||'Detailed company history is temporarily unavailable.';

    crFacts.innerHTML=[
      ['Industry',industry],
      ['Ticker',ticker],
      ['Current price',priceText],
      ['Exchange',exchange]
    ].map(x=>'<div class="cr-fact"><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b></div>').join('');

    const founded=history?.foundedDisplay||history?.founded||'Not provided by Finnhub';
    const historyFounders=Array.isArray(history?.founders)?history.founders.filter(Boolean).join(', '):(history?.founders||'');
    const founders=historyFounders||'Not provided by Finnhub';
    const headquarters=history?.headquarters||'Not provided by Finnhub';
    const website=profile.website||profile.weburl||history?.website||'';
    const sourceParts=[];
    if(fundamentals)sourceParts.push('Finnhub live profile');
    if(history)sourceParts.push('company-history enrichment');
    if(quote?.provider)sourceParts.push(quote.provider+' quote');
    const detailRows=[
      ['Founded',founded],
      ['Founder(s)',founders],
      ['Headquarters',headquarters],
      ['Country',country],
      ['IPO',profile.ipo||'Not available from Finnhub'],
      ['Website',website||'Not available'],
      ['Research source',sourceParts.join(' + ')||'Live company feeds']
    ];
    root.innerHTML=detailRows.map(x=>'<div class="cr-fact"><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b></div>').join('');

    const rev=history?.revenueContext||null;
    const revItems=Array.isArray(rev?.items)?rev.items.filter(x=>x?.description):[];
    if(revItems.length){
      crBusinessMix.innerHTML=(rev?.summary?'<div class="cr-fact"><span>BUSINESS MODEL</span><b>'+esc(rev.summary)+'</b></div>':'')+
        revItems.slice(0,5).map(x=>'<div class="cr-fact"><span>'+esc(x.label||'Revenue / business area')+'</span><b>'+esc(x.description)+'</b></div>').join('')+
        '<div class="cr-fact"><span>DATA NOTE</span><b>Qualitative source information only — MOVA does not invent segment percentages.</b></div>';
    }else{
      crBusinessMix.innerHTML='<div class="cr-fact"><span>SEGMENT DATA</span><b>Finnhub company profile does not provide revenue-by-segment percentages. MOVA will not display an estimated 70/30 split.</b></div>';
    }

    crHistoryStats.innerHTML=[
      ['Current',priceText],
      ['Latest move',moveText],
      ['Industry',industry],
      ['IPO',profile.ipo||'Not available']
    ].map(x=>'<div class="cr-fact"><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b></div>').join('');

    if(Array.isArray(history?.timeline)&&history.timeline.length){
      crMilestones.innerHTML=history.timeline.map(x=>'<div class="timeline-item"><time>'+esc(x.year||'')+'</time><i class="timeline-dot"></i><p><b>'+esc(x.title||'')+'</b>'+(x.text?' — '+esc(x.text):'')+'</p></div>').join('');
    }else{
      crMilestones.innerHTML='<div class="cr-fact"><span>HISTORY</span><b>Verified company milestones are temporarily unavailable.</b></div>';
    }
  }catch(err){
    root.innerHTML=[
      ['Founded','Live data unavailable'],
      ['Founder(s)','Live data unavailable'],
      ['Headquarters','Live data unavailable'],
      ['Research source','Company profile feeds temporarily unavailable']
    ].map(x=>'<div class="cr-fact"><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b></div>').join('');
    crBusinessMix.innerHTML='<div class="cr-fact"><span>SEGMENT DATA</span><b>Live company data is temporarily unavailable. No fallback percentages are being shown.</b></div>';
  }
}`;

html=html.slice(0,startAt)+replacement+html.slice(endAt);
fs.writeFileSync(file,html);
console.log('Patched full company Overview with Finnhub-first live profile, synchronized quote, and non-invented business mix.');
