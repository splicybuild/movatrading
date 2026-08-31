import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

// Five days of 30-minute candles including pre/post-market needs a larger sample.
html=html.replace("'5D':['30min',65]","'5D':['30min',170]");

// Overlay genuine discontinuities clearly instead of making them look like missing chart data.
const bridgeScript=`
<script>
(function(){
  if(typeof drawMarketChart!=='function')return;
  const baseDraw=drawMarketChart;

  function drawPriceContinuity(){
    if(chartType!=='candlestick'||!(chartTimeframe==='1D'||chartTimeframe==='5D'))return;
    if(!Array.isArray(chartData)||chartData.length<2)return;

    const c=marketCanvas,ctx=c.getContext('2d'),W=c.width,H=c.height,pad={l:62,r:26,t:25,b:38};
    const highs=chartData.map(d=>Number(d.high)).filter(Number.isFinite);
    const lows=chartData.map(d=>Number(d.low)).filter(Number.isFinite);
    if(!highs.length||!lows.length)return;
    const max=Math.max(...highs),min=Math.min(...lows),span=max-min||1;
    const X=i=>pad.l+i*(W-pad.l-pad.r)/(chartData.length-1);
    const Y=v=>pad.t+(max-v)/span*(H-pad.t-pad.b);
    const step=(W-pad.l-pad.r)/Math.max(1,chartData.length-1);

    // A subtle close-price trace makes separate sessions read as one continuous timeline.
    ctx.save();
    ctx.strokeStyle='rgba(132,166,188,.30)';
    ctx.lineWidth=1.1;
    ctx.setLineDash([]);
    ctx.beginPath();
    chartData.forEach((d,i)=>{
      const x=X(i),y=Y(Number(d.close));
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    });
    ctx.stroke();
    ctx.restore();

    // Detect any true close-to-next-open jump, including same-date after-hours earnings gaps.
    for(let i=1;i<chartData.length;i++){
      const prev=chartData[i-1],cur=chartData[i];
      const pc=Number(prev.close),co=Number(cur.open);
      if(!Number.isFinite(pc)||!Number.isFinite(co)||pc<=0)continue;
      const pct=(co/pc-1)*100;
      if(Math.abs(pct)<2)continue;

      const x1=X(i-1),x2=X(i),xm=(x1+x2)/2;
      const y1=Y(pc),y2=Y(co),top=Math.min(y1,y2),bottom=Math.max(y1,y2);
      const positive=pct>0;

      ctx.save();
      ctx.fillStyle=positive?'rgba(120,239,49,.10)':'rgba(255,102,115,.10)';
      ctx.fillRect(xm-Math.max(5,step*.48),top,Math.max(10,step*.96),Math.max(2,bottom-top));

      ctx.strokeStyle=positive?'rgba(120,239,49,.85)':'rgba(255,102,115,.85)';
      ctx.lineWidth=2;
      ctx.setLineDash([6,4]);
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.stroke();
      ctx.setLineDash([]);

      const label='PRICE GAP '+(pct>0?'+':'')+pct.toFixed(1)+'%';
      ctx.font='bold 11px system-ui';
      const tw=ctx.measureText(label).width;
      const lx=Math.max(pad.l+3,Math.min(xm-tw/2,W-pad.r-tw-3));
      const ly=Math.max(pad.t+14,Math.min(top-7,H-pad.b-5));
      ctx.fillStyle='rgba(5,14,21,.92)';
      ctx.fillRect(lx-5,ly-12,tw+10,17);
      ctx.fillStyle=positive?'#9df96c':'#ff8490';
      ctx.fillText(label,lx,ly);
      ctx.restore();
    }
  }

  drawMarketChart=function(){
    baseDraw();
    drawPriceContinuity();
  };
})();
</script>
`;

// Replace earlier bridge overlay if present; otherwise append it.
html=html.replace(/<script>\s*\(function\(\)\{\s*if\(typeof drawMarketChart!==['"]function['"]\)return;[\s\S]*?drawSessionGapBridges\(\)[\s\S]*?<\/script>\s*/,'');
if(!html.includes('function drawPriceContinuity'))html=html.replace('</body>',bridgeScript+'</body>');

writeFileSync(file,html);
console.log('MOVA price-gap visualization patch complete.');
