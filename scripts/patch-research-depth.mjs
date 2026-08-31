import fs from 'node:fs';
const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');

// Use the repaired history endpoint directly rather than the retired alias.
html=html.replace("fetchJson('/api/company-profile?ticker='+encodeURIComponent(k)+'&name='+encodeURIComponent(a.n),6500)","fetchJson('/api/company-history?ticker='+encodeURIComponent(k)+'&name='+encodeURIComponent(a.n),6500)");

// Never leave the old generic local history/milestones visible while live history loads.
html=html.replace(
  "crBusinessMix.innerHTML='<div class=\"cr-fact\"><span>SEGMENT DATA</span><b>Loading verified company information…</b></div>';",
  "crBusinessMix.innerHTML='<div class=\"cr-fact\"><span>SEGMENT DATA</span><b>Loading verified company information…</b></div>';crHistorySummary.textContent='Loading verified company history…';crMilestones.innerHTML='<div class=\"timeline-loading\">Loading dated company milestones…</div>';"
);

// Add live valuation context from the existing Finnhub fundamentals response.
html=html.replace(
  "const profile=fundamentals?.profile||{};",
  "const profile=fundamentals?.profile||{};const valuation=fundamentals?.statistics?.valuations_metrics||{};const financialStats=fundamentals?.statistics?.financials||{};"
);
html=html.replace(
  "const factRows=rows=>rows.map(x=>'<div class=\"cr-fact\"><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b></div>').join('');",
  "const factRows=rows=>rows.map(x=>'<div class=\"cr-fact\"><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b></div>').join('');const fmtCap=n=>{const v=Number(n);if(!Number.isFinite(v))return '—';const dollars=v*1e6;return dollars>=1e12?'$'+(dollars/1e12).toFixed(2)+'T':dollars>=1e9?'$'+(dollars/1e9).toFixed(1)+'B':dollars>=1e6?'$'+(dollars/1e6).toFixed(0)+'M':'$'+dollars.toLocaleString()};const fmtRatio=n=>Number.isFinite(Number(n))?Number(n).toFixed(1)+'x':'—';const fmtPct=n=>Number.isFinite(Number(n))?(Number(n)*100).toFixed(1)+'%':'—';"
);
html=html.replace(
  "crFacts.innerHTML=factRows([['Industry',industry],['Ticker',ticker],['Current price',priceText],['Exchange',exchange]]);",
  "crFacts.innerHTML=factRows([['Industry',industry],['Ticker',ticker],['Current price',priceText],['Day move',moveText],['Market cap',fmtCap(profile.marketCapitalization)],['P/E (TTM)',fmtRatio(valuation.trailing_pe)],['Net margin',fmtPct(financialStats.profit_margin)],['Exchange',exchange]]);"
);

// If history enrichment fails, show an honest unavailable state instead of generic made-up milestones.
html=html.replace(
  "}catch(_){\n    root.innerHTML=factRows([",
  "}catch(_){\n    crHistorySummary.textContent='Verified company history is temporarily unavailable.';crMilestones.innerHTML='<div class=\"timeline-loading\">Dated milestones temporarily unavailable.</div>';\n    root.innerHTML=factRows(["
);

// Turn milestone rows into an actual connected visual timeline.
html=html.replace('</head>',`<style>
#crFacts{grid-template-columns:repeat(4,minmax(0,1fr))}
#crMilestones.timeline{position:relative;display:grid;gap:0;margin-top:16px}
#crMilestones .timeline-item{position:relative;display:grid;grid-template-columns:92px 20px minmax(0,1fr);gap:12px;align-items:start;padding:0 0 26px}
#crMilestones .timeline-item:last-child{padding-bottom:0}
#crMilestones .timeline-item:not(:last-child)::after{content:"";position:absolute;left:113px;top:15px;bottom:-1px;width:2px;background:linear-gradient(180deg,rgba(66,187,255,.65),rgba(120,239,49,.28))}
#crMilestones .timeline-dot{position:relative;z-index:2;width:12px;height:12px;margin-top:3px;box-shadow:0 0 0 5px rgba(66,187,255,.10)}
#crMilestones .timeline-item time{font-size:13px;font-weight:850;color:#8ca3b5;padding-top:1px}
#crMilestones .timeline-item p{padding:0 0 0 2px;line-height:1.55!important}
#crMilestones .timeline-item p b{color:#eef5fb}
.timeline-loading{padding:16px;border:1px dashed rgba(120,145,164,.22);border-radius:14px;color:#8095a5;font-size:12px}
@media(max-width:900px){#crFacts{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){#crFacts{grid-template-columns:1fr 1fr}#crMilestones .timeline-item{grid-template-columns:64px 18px minmax(0,1fr);gap:8px}#crMilestones .timeline-item:not(:last-child)::after{left:80px}}
</style></head>`);

fs.writeFileSync(file,html);
console.log('Added direct live history, richer overview facts and a connected dated milestone timeline.');
