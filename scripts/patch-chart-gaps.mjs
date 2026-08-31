import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

// Five days of 30-minute candles including pre/post-market needs a larger sample.
html=html.replace("'5D':['30min',65]","'5D':['30min',170]");

// Patch the real candlestick drawing loop directly.
// Keep the chart readable: only genuine session breaks qualify, thresholds scale
// with timeframe, and only the most meaningful gaps are annotated.
const original=`}else{const cw=Math.max(2,(W-pad.l-pad.r)/chartData.length*.62);chartData.forEach((d,i)=>{const x=X(i),up=d.close>=d.open,col=up?'#78ef31':'#ff6673';ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,Y(d.high));ctx.lineTo(x,Y(d.low));ctx.stroke();const y1=Y(d.open),y2=Y(d.close);ctx.fillRect(x-cw/2,Math.min(y1,y2),cw,Math.max(2,Math.abs(y2-y1)))})}function drawInd`;

const patched=`}else{const cw=Math.max(2,(W-pad.l-pad.r)/chartData.length*.62),gapThreshold={'1D':2,'5D':2.5,'1M':4,'3M':5,'1Y':6,'5Y':8,'MAX':10}[chartTimeframe]||5,gapLimit={'1D':3,'5D':4,'1M':4,'3M':4,'1Y':5,'5Y':5,'MAX':5}[chartTimeframe]||4,gapCandidates=[];for(let gi=1;gi<chartData.length;gi++){const gp=chartData[gi-1],gc=chartData[gi],pc=Number(gp.close),co=Number(gc.open),prevDay=String(gp.datetime||'').slice(0,10),curDay=String(gc.datetime||'').slice(0,10),hasTimes=Boolean(prevDay&&curDay),sessionBreak=!hasTimes||prevDay!==curDay,gapPct=pc>0?((co/pc)-1)*100:0;if(sessionBreak&&Number.isFinite(gapPct)&&Math.abs(gapPct)>=gapThreshold)gapCandidates.push({i:gi,pct:gapPct})}const gapIndices=new Set(gapCandidates.sort((a,b)=>Math.abs(b.pct)-Math.abs(a.pct)).slice(0,gapLimit).map(g=>g.i)),gapRanks=new Map(gapCandidates.slice(0,gapLimit).map((g,r)=>[g.i,r]));chartData.forEach((d,i)=>{const x=X(i),up=d.close>=d.open,col=up?'#78ef31':'#ff6673';if(i>0&&gapIndices.has(i)){const prev=chartData[i-1],pc=Number(prev.close),co=Number(d.open),gapPct=pc>0?((co/pc)-1)*100:0,px=X(i-1),py=Y(pc),oy=Y(co),positive=gapPct>0,gcol=positive?'#78ef31':'#ff6673',top=Math.min(py,oy),bottom=Math.max(py,oy),rank=gapRanks.get(i)||0;ctx.save();ctx.strokeStyle=gcol;ctx.globalAlpha=.72;ctx.lineWidth=1.6;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,oy);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;const label='PRICE GAP '+(gapPct>0?'+':'')+gapPct.toFixed(1)+'%';ctx.font='bold 10px system-ui';const tw=ctx.measureText(label).width,lx=Math.max(pad.l+4,Math.min((px+x)/2-tw/2,W-pad.r-tw-4)),baseY=positive?top-8:bottom+18,stagger=(rank%2)*15,ly=Math.max(pad.t+14,Math.min(baseY+(positive?-stagger:stagger),H-pad.b-5));ctx.fillStyle='rgba(5,14,21,.92)';ctx.fillRect(lx-4,ly-11,tw+8,15);ctx.fillStyle=gcol;ctx.fillText(label,lx,ly);ctx.restore()}ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,Y(d.high));ctx.lineTo(x,Y(d.low));ctx.stroke();const y1=Y(d.open),y2=Y(d.close);ctx.fillRect(x-cw/2,Math.min(y1,y2),cw,Math.max(2,Math.abs(y2-y1)))})}function drawInd`;

if(!html.includes(original)){
  throw new Error('MOVA candlestick renderer patch target not found');
}
html=html.replace(original,patched);

writeFileSync(file,html);
console.log('MOVA clean session-gap renderer patch complete.');
