import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

// Five days of 30-minute candles including pre/post-market needs a larger sample.
html=html.replace("'5D':['30min',65]","'5D':['30min',170]");

// Patch the REAL candlestick drawing loop directly. This is deliberately build-time
// rather than a late runtime wrapper, so every chart redraw uses the gap treatment.
const original=`}else{const cw=Math.max(2,(W-pad.l-pad.r)/chartData.length*.62);chartData.forEach((d,i)=>{const x=X(i),up=d.close>=d.open,col=up?'#78ef31':'#ff6673';ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,Y(d.high));ctx.lineTo(x,Y(d.low));ctx.stroke();const y1=Y(d.open),y2=Y(d.close);ctx.fillRect(x-cw/2,Math.min(y1,y2),cw,Math.max(2,Math.abs(y2-y1)))})}function drawInd`;

const patched=`}else{const cw=Math.max(2,(W-pad.l-pad.r)/chartData.length*.62);chartData.forEach((d,i)=>{const x=X(i),up=d.close>=d.open,col=up?'#78ef31':'#ff6673';if(i>0){const prev=chartData[i-1],pc=Number(prev.close),co=Number(d.open),gapPct=pc>0?((co/pc)-1)*100:0;if(Number.isFinite(gapPct)&&Math.abs(gapPct)>=2){const px=X(i-1),py=Y(pc),oy=Y(co),positive=gapPct>0,gcol=positive?'#78ef31':'#ff6673',top=Math.min(py,oy),bottom=Math.max(py,oy);ctx.save();ctx.fillStyle=positive?'rgba(120,239,49,.10)':'rgba(255,102,115,.10)';ctx.fillRect(Math.min(px,x)-cw*.35,top,Math.abs(x-px)+cw*.7,Math.max(2,bottom-top));ctx.strokeStyle=gcol;ctx.lineWidth=2.4;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,oy);ctx.stroke();ctx.setLineDash([]);const label='PRICE GAP '+(gapPct>0?'+':'')+gapPct.toFixed(1)+'%';ctx.font='bold 11px system-ui';const tw=ctx.measureText(label).width,lx=Math.max(pad.l+4,Math.min((px+x)/2-tw/2,W-pad.r-tw-4)),ly=Math.max(pad.t+15,Math.min(top-7,H-pad.b-8));ctx.fillStyle='rgba(5,14,21,.94)';ctx.fillRect(lx-5,ly-12,tw+10,17);ctx.fillStyle=gcol;ctx.fillText(label,lx,ly);ctx.restore()}}ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,Y(d.high));ctx.lineTo(x,Y(d.low));ctx.stroke();const y1=Y(d.open),y2=Y(d.close);ctx.fillRect(x-cw/2,Math.min(y1,y2),cw,Math.max(2,Math.abs(y2-y1)))})}function drawInd`;

if(!html.includes(original)){
  throw new Error('MOVA candlestick renderer patch target not found');
}
html=html.replace(original,patched);

writeFileSync(file,html);
console.log('MOVA direct candlestick price-gap renderer patch complete.');
