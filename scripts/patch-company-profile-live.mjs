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
  const localProfile=typeof getProfile==='function'?getProfile(k):null;
  const localFact=(...labels)=>{
    const rows=Array.isArray(localProfile?.facts)?localProfile.facts:[];
    const wanted=labels.map(x=>String(x).toLowerCase());
    const row=rows.find(x=>wanted.includes(String(x?.[0]||'').toLowerCase()));
    return row?.[1]||'';
  };
  const esc=v=>String(v??'').replace(/[&<>\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]));
  const fetchJson=async url=>{const r=await fetch(url);if(!r.ok)throw new Error('HTTP '+r.status);return r.json();};
  try{
    if(location.protocol==='file:')throw new Error('Live profile requires deployed MOVA');
    const [fundResult,historyResult]=await Promise.allSettled([
      fetchJson('/api/fundamentals?symbol='+encodeURIComponent(k)),
      fetchJson('/api/company-history?ticker='+encodeURIComponent(k)+'&name='+encodeURIComponent(a.n))
    ]);
    const fundamentals=fundResult.status==='fulfilled'?fundResult.value:null;
    const history=historyResult.status==='fulfilled'?historyResult.value:null;
    if(!fundamentals&&!history)throw new Error('Company profile feeds unavailable');

    const profile=fundamentals?.profile||{};
    if(history?.summary||history?.overview)crWho.textContent=history.summary||history.overview;
    const origins=history?.sections?.origins||history?.origins;
    if(origins)crHistorySummary.textContent=origins;
    if(profile?.name&&crWhoTitle)crWhoTitle.textContent=profile.name;

    const founded=history?.foundedDisplay||history?.founded||localFact('Founded','Foundation')||'Not available';
    const historyFounders=Array.isArray(history?.founders)?history.founders.filter(Boolean).join(', '):(history?.founders||'');
    const founders=historyFounders||localFact('Founder','Founders','Founder(s)')||'Not identified';
    const headquarters=history?.headquarters||localFact('Headquarters','HQ')||'Not available';
    const website=history?.website||profile?.website||profile?.weburl||'';
    const rows=[
      ['Founded',founded],
      ['Founder(s)',founders],
      ['Headquarters',headquarters]
    ];
    if(profile?.country)rows.push(['Country',profile.country]);
    if(profile?.industry)rows.push(['Industry',profile.industry]);
    if(profile?.exchange)rows.push(['Exchange',profile.exchange]);
    if(profile?.ipo)rows.push(['IPO',profile.ipo]);
    if(website)rows.push(['Website',website]);
    const sources=[];
    if(fundamentals)sources.push('Finnhub live company profile');
    if(history)sources.push('company-history research');
    rows.push(['Research source',sources.join(' + ')||'Live company data']);
    root.innerHTML=rows.map(x=>'<div class="cr-fact"><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b></div>').join('');

    if(Array.isArray(history?.timeline)&&history.timeline.length){
      crMilestones.innerHTML=history.timeline.map(x=>'<div class="timeline-item"><time>'+esc(x.year||'')+'</time><i class="timeline-dot"></i><p><b>'+esc(x.title||'')+'</b>'+(x.text?' — '+esc(x.text):'')+'</p></div>').join('');
    }
  }catch(err){
    const founded=localFact('Founded','Foundation')||'Not available';
    const founders=localFact('Founder','Founders','Founder(s)')||'Not identified';
    const headquarters=localFact('Headquarters','HQ')||'Not available';
    root.innerHTML=[['Founded',founded],['Founder(s)',founders],['Headquarters',headquarters],['Research source','Local MOVA profile · live feed temporarily unavailable']].map(x=>'<div class="cr-fact"><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b></div>').join('');
  }
}`;

html=html.slice(0,startAt)+replacement+html.slice(endAt);
fs.writeFileSync(file,html);
console.log('Patched company Research profile: Finnhub live facts first, history enrichment second, local fallback last.');
