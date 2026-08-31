import fs from 'node:fs';

const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');

const start='async function hydrateCompanyHistoryLive(k,a){';
const end='\nfunction renderReportedRows';
const startAt=html.indexOf(start);
const endAt=startAt>=0?html.indexOf(end,startAt):-1;
if(startAt<0||endAt<0)throw new Error('Could not locate company overview renderer');

let block=html.slice(startAt,endAt);
const marker="  const money=n=>";
if(!block.includes(marker))throw new Error('Could not locate overview helper marker');
block=block.replace(marker,`  const compact=(value,maxSentences=4,maxChars=650)=>{\n    const s=String(value||'').replace(/\\s+/g,' ').trim();\n    if(!s)return '';\n    const parts=s.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[s];\n    let out=parts.slice(0,maxSentences).join(' ').trim();\n    if(out.length>maxChars)out=out.slice(0,maxChars).replace(/\\s+\\S*$/,'')+'…';\n    return out;\n  };\n${marker}`);

block=block
  .replace("crBusinessMix.innerHTML='<div class=\"cr-fact\"><span>SEGMENT DATA</span><b>Loading verified company information…</b></div>';","crBusinessMix.innerHTML='<div class=\"cr-fact\"><span>SEGMENT DATA</span><b>Loading verified company information…</b></div>';crMilestones.innerHTML='<div class=\"timeline-loading\">Loading verified dated milestones…</div>';crHistorySummary.textContent='Loading verified company history…';")
  .replace("fetchJson('/api/company-history?rev=20260831c&ticker='+encodeURIComponent(k)+'&name='+encodeURIComponent(a.n),6500)","fetchJson('/api/company-history?rev=20260831d&ticker='+encodeURIComponent(k)+'&name='+encodeURIComponent(a.n),7500)")
  .replace("if(summary){crIntro.textContent=summary;crWho.textContent=summary}","if(summary){crIntro.textContent=compact(summary,2,360);crWho.textContent=compact(summary,4,620)}")
  .replace("if(business)crWhat.textContent=business;","if(business)crWhat.textContent=compact(business,4,620);")
  .replace("if(origins)crHistorySummary.textContent=origins;","if(origins)crHistorySummary.textContent=compact(origins,4,680);")
  .replace("esc(rev.summary)","esc(compact(rev.summary,2,360))")
  .replace("esc(x.description)","esc(compact(x.description,2,300))")
  .replace("history.timeline.slice(0,10).map(x=>", "history.timeline.slice(0,12).map(x=>")
  .replace("}catch(_){\n    root.innerHTML=factRows([","}catch(_){\n    crMilestones.innerHTML='<div class=\"timeline-loading\">Verified dated milestones are temporarily unavailable.</div>';crHistorySummary.textContent='Verified company history is temporarily unavailable.';\n    root.innerHTML=factRows([");

html=html.slice(0,startAt)+block+html.slice(endAt);
html=html.replace('</head>',`<style>
#crMilestones.timeline{position:relative;display:grid;gap:0;margin-top:14px}
#crMilestones .timeline-item{position:relative;display:grid;grid-template-columns:92px 20px minmax(0,1fr);gap:10px;align-items:start;padding:0 0 24px}
#crMilestones .timeline-item:last-child{padding-bottom:0}
#crMilestones .timeline-item:not(:last-child)::after{content:"";position:absolute;left:111px;top:15px;bottom:-1px;width:2px;background:linear-gradient(180deg,rgba(66,187,255,.8),rgba(120,239,49,.3))}
#crMilestones .timeline-dot{position:relative;z-index:2;width:12px;height:12px;border-radius:50%;background:#42bbff;margin-top:3px;box-shadow:0 0 0 5px rgba(66,187,255,.10)}
#crMilestones .timeline-item time{font-size:12px;font-weight:800;color:#8198a9;padding-top:1px}
#crMilestones .timeline-item p{margin:0!important;line-height:1.55!important}
#crMilestones .timeline-item p b{color:#eef5fb}
.timeline-loading{padding:14px;border:1px dashed rgba(127,151,169,.24);border-radius:13px;color:#8094a5;font-size:12px}
@media(max-width:650px){#crMilestones .timeline-item{grid-template-columns:60px 18px minmax(0,1fr);gap:8px}#crMilestones .timeline-item:not(:last-child)::after{left:76px}}
</style></head>`);
fs.writeFileSync(file,html);
console.log('Enabled connected dated company timelines and removed generic milestone fallback.');
