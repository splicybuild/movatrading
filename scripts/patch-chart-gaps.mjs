import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

// With extended-hours candles enabled, 5D needs more than 65 x 30-minute bars.
html=html.replace("'5D':['30min',65]","'5D':['30min',170]");

// Draw an explicit bridge between one trading session's close and the next session's open.
// This preserves the real price jump while stopping it from looking like missing chart data.
const bridgeScript=`
<script>
(function(){
  if(typeof drawMarketChart!=='function')return;
  const baseDraw=drawMarketChart;
  function drawSessionGapBridges(){
    if(chartType!=='candlestick'||!(chartTimeframe==='1D'||chartTimeframe==='5D'))return;
    if(!Array.isArray(chartData)||chartData.length<2||!chartData.some(d=>d.datetime))return;
    const c=marketCanvas,ctx=c.getContext('2d'),W=c.width,H=c.height,pad={l:62,r:26,t:25,b:38};
    const highs=chartData.map(d=>d.high),lows=chartData.map(d=>d.low),max=Math.max(...highs),min=Math.min(...lows),span=max-min||1;
    const X=i=>pad.l+i*(W-pad.l-pad.r)/(chartData.length-1);
    const Y=v=>pad.t+(max-v)/span*(H-pad.t-pad.b);
    ctx.save();
    ctx.strokeStyle='rgba(66,187,255,.58)';
    ctx.lineWidth=1.6;
    ctx.setLineDash([5,5]);
    for(let i=1;i<chartData.length;i++){
      const prev=chartData[i-1],cur=chartData[i];
      const prevDay=String(prev.datetime||'').slice(0,10),curDay=String(cur.datetime||'').slice(0,10);
      if(!prevDay||!curDay||prevDay===curDay)continue;
      ctx.beginPath();
      ctx.moveTo(X(i-1),Y(prev.close));
      ctx.lineTo(X(i),Y(cur.open));
      ctx.stroke();
    }
    ctx.restore();
  }
  drawMarketChart=function(){baseDraw();drawSessionGapBridges()};
})();
</script>
`;

if(!html.includes('drawSessionGapBridges'))html=html.replace('</body>',bridgeScript+'</body>');

writeFileSync(file,html);
console.log('MOVA chart-gap bridge patch complete.');
