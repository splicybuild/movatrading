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
block=block.replace(marker,`  const compact=(value,maxSentences=2,maxChars=300)=>{\n    const s=String(value||'').replace(/\\s+/g,' ').trim();\n    if(!s)return '';\n    const parts=s.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[s];\n    let out=parts.slice(0,maxSentences).join(' ').trim();\n    if(out.length>maxChars)out=out.slice(0,maxChars).replace(/\\s+\\S*$/,'')+'…';\n    return out;\n  };\n${marker}`);

block=block
  .replace("if(summary){crIntro.textContent=summary;crWho.textContent=summary}","if(summary){crIntro.textContent=compact(summary,1,190);crWho.textContent=compact(summary,2,280)}")
  .replace("if(business)crWhat.textContent=business;","if(business)crWhat.textContent=compact(business,2,300);")
  .replace("if(origins)crHistorySummary.textContent=origins;","if(origins)crHistorySummary.textContent=compact(origins,2,300);")
  .replace("esc(rev.summary)","esc(compact(rev.summary,1,220))")
  .replace("esc(x.description)","esc(compact(x.description,1,170))")
  .replace("history.timeline.map(x=>", "history.timeline.slice(0,5).map(x=>");

html=html.slice(0,startAt)+block+html.slice(endAt);
fs.writeFileSync(file,html);
console.log('Summarized company Overview copy and capped timeline/business snippets.');
