import { readFileSync, writeFileSync } from 'node:fs';

const file = 'dist/index.html';
let html = readFileSync(file, 'utf8');

// Existing mobile profile patch.
html = html.replace(
  /<div id="mobileProfileChip" class="mobile-profile-chip" onclick="showMobileProfile\(\)">[\s\S]*?<\/div>/,
  () => `<button id="mobileProfileChip" type="button" class="mobile-profile-chip" onclick="openAccountAccess()" aria-label="Sign in or create MOVA account" title="Account">
    <span id="mobileProfileAvatar" class="mobile-profile-avatar" aria-hidden="true"></span>
    <span id="mobileProfileName" class="profile-name">Account</span>
  </button>`
);

html = html.replace(
  /function updateMobileProfileChip\(\)\{[\s\S]*?mobileProfileName\.textContent=p\.firstName\|\|'Profile';\n\}/,
  () => `function updateMobileProfileChip(){
    const chip=document.getElementById('mobileProfileChip');
    if(!chip)return;
    chip.classList.add('show');
    const p=getMobileProfile();
    if(!p){
      chip.classList.remove('signed-in');
      mobileProfileAvatar.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.6"></circle><path d="M5.8 19c.8-3.3 3-5 6.2-5s5.4 1.7 6.2 5"></path></svg>';
      mobileProfileName.textContent='Account';
      chip.setAttribute('aria-label','Sign in or create MOVA account');
      return;
    }
    chip.classList.add('signed-in');
    const initial=(p.firstName||'M').trim().charAt(0).toUpperCase()||'M';
    mobileProfileAvatar.textContent=initial;
    mobileProfileName.textContent=p.firstName||'Profile';
    chip.setAttribute('aria-label',\`Open MOVA account for \${p.firstName||'profile'}\`);
  }
  function openAccountAccess(){
    if(!isMobileMova())return;
    openMobileAccess();
  }`
);

if (!html.includes('/* V2.4.4 persistent mobile account button */')) {
  const css = `
  /* V2.4.4 persistent mobile account button */
  .mobile-profile-chip{cursor:pointer;font-family:inherit}
  .mobile-profile-avatar svg{width:20px;height:20px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
  @media(max-width:740px){
    .mobile-profile-chip{display:flex!important;width:42px!important;height:42px!important;max-width:none!important;padding:0!important;align-items:center!important;justify-content:center!important;right:10px!important;border:1px solid rgba(66,187,255,.24)!important;background:rgba(7,19,29,.96)!important;box-shadow:0 7px 22px rgba(0,0,0,.28)!important}
    .mobile-profile-chip .mobile-profile-avatar{width:29px!important;height:29px!important;background:transparent!important;color:#d9e8f1!important;border:0!important;font-size:11px!important}
    .mobile-profile-chip.signed-in .mobile-profile-avatar{background:linear-gradient(135deg,#42bbff,#78ef31)!important;color:#041018!important}
  }
  `;
  html = html.replace('</style>', () => css + '</style>');
}

// Avoid duplicate Market View label.
html = html.replace(
  /<span class="eyebrow">MARKET VIEW<\/span>\s*<h2>Market View<\/h2>/,
  () => '<span class="eyebrow">YOUR MARKETS</span>\n    <h2>Market View</h2>'
);

// Better timeframe sample sizes.
html = html.replace(
  /function timeframeApiParams\(tf\)\{return\{[^}]+\}\[tf\]\|\|\['1day',110\]\}/,
  () => `function timeframeApiParams(tf){return{'1D':['5min',78],'5D':['30min',65],'1M':['1day',22],'3M':['1day',66],'1Y':['1day',252],'5Y':['1week',260],'MAX':['1month',500]}[tf]||['1day',110]}`
);

// Replace live history hydration: preserve timestamps, dedupe, and sync quote/header.
html = html.replace(
  /async function refreshLiveResearchChart\(k,tf=chartTimeframe\)\{[\s\S]*?\}\nfunction showChartHelp/,
  () => `function largestSessionGap(rows){
    let best=null;
    for(let i=1;i<rows.length;i++){
      const prev=rows[i-1],cur=rows[i];
      if(!prev.datetime||!cur.datetime)continue;
      const prevDay=String(prev.datetime).slice(0,10),curDay=String(cur.datetime).slice(0,10);
      if(prevDay===curDay)continue;
      const pct=(cur.open/prev.close-1)*100;
      if(!Number.isFinite(pct))continue;
      if(!best||Math.abs(pct)>Math.abs(best.pct))best={pct,from:prevDay,to:curDay};
    }
    return best;
  }
  function applyResearchLivePrice(price,movePct=null){
    if(!Number.isFinite(Number(price)))return;
    const text='$'+Number(price).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
    chartLastPrice.textContent=text;
    if(document.getElementById('crPrice'))crPrice.textContent=text;
    if(Number.isFinite(Number(movePct))){
      const cls=Number(movePct)>=0?'up':'down';
      const move=(Number(movePct)>=0?'+':'')+Number(movePct).toFixed(2)+'%';
      chartLastMove.textContent=move;chartLastMove.className=cls;
      if(document.getElementById('crMove')){crMove.textContent=move;crMove.className=cls}
    }
  }
  async function hydrateResearchLiveQuote(k){
    const cached=liveQuotes.get(k);
    if(cached)applyResearchLivePrice(cached.priceNative,cached.changePct);
    if(location.protocol==='file:')return;
    try{
      const r=await fetch('/api/market?symbols='+encodeURIComponent(k),{cache:'no-store'});
      if(!r.ok)return;
      const d=await r.json(),q=d.assets?.find(x=>x.ticker===k)||d.assets?.[0];
      if(q){liveQuotes.set(k,q);applyResearchLivePrice(q.priceNative,q.changePct)}
    }catch(_){}
  }
  async function refreshLiveResearchChart(k,tf=chartTimeframe){
    if(location.protocol==='file:')return;
    try{
      const [interval,size]=timeframeApiParams(tf);
      const r=await fetch(\`/api/history?symbol=\${encodeURIComponent(k)}&interval=\${interval}&outputsize=\${size}\`,{cache:'no-store'});
      if(!r.ok)return;
      const d=await r.json();
      const rows=(d.values||[])
        .map(x=>({datetime:x.datetime||x.timestamp||'',open:Number(x.open),high:Number(x.high),low:Number(x.low),close:Number(x.close)}))
        .filter(x=>[x.open,x.high,x.low,x.close].every(v=>Number.isFinite(v)&&v>0))
        .sort((a,b)=>String(a.datetime).localeCompare(String(b.datetime)));
      const seen=new Set();
      const clean=rows.filter(x=>{const key=x.datetime||[x.open,x.high,x.low,x.close].join('|');if(seen.has(key))return false;seen.add(key);return true});
      if(!clean.length||k!==activeResearchTicker||tf!==chartTimeframe)return;
      chartData=clean;
      const last=clean.at(-1);
      if(last)applyResearchLivePrice(last.close,null);
      const gap=largestSessionGap(clean);
      const s=document.getElementById('chartDataStatus');
      if(s){
        const gapText=gap&&Math.abs(gap.pct)>=3
          ?\` · Session gap \${gap.pct>=0?'+':''}\${gap.pct.toFixed(1)}% preserved\`
          :'';
        s.textContent=\`Live OHLC · \${d.source||'Twelve Data'} · \${d.resolvedSymbol||k}\${gapText}\`;
      }
      requestChartDraw();
      hydrateResearchLiveQuote(k);
    }catch(_){}
  }
  function showChartHelp`
);

// Make sure initial opening also asks for the live quote.
html = html.replace(
  /refreshLiveResearchChart\(k,chartTimeframe\);\n\}/,
  () => `refreshLiveResearchChart(k,chartTimeframe);\n  hydrateResearchLiveQuote(k);\n}`
);

// Draw dashed session separators on intraday charts, making real overnight gaps obvious.
html = html.replace(
  /for\(let i=0;i<6;i\+\+\)\{const x=pad\.l\+i\*\(W-pad\.l-pad\.r\)\/5;ctx\.beginPath\(\);ctx\.moveTo\(x,pad\.t\);ctx\.lineTo\(x,H-pad\.b\);ctx\.stroke\(\)\}/,
  match => match + `if((chartTimeframe==='1D'||chartTimeframe==='5D')&&chartData.some(d=>d.datetime)){ctx.save();ctx.setLineDash([5,7]);ctx.strokeStyle='rgba(66,187,255,.18)';ctx.fillStyle='#607b8e';ctx.font='10px system-ui';let lastDay='';chartData.forEach((d,i)=>{const day=String(d.datetime||'').slice(0,10);if(day&&lastDay&&day!==lastDay){const x=X(i)-Math.max(1,(W-pad.l-pad.r)/(chartData.length-1))/2;ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,H-pad.b);ctx.stroke();const label=new Date(day+'T12:00:00').toLocaleDateString([], {weekday:'short'});ctx.fillText(label,Math.min(x+4,W-pad.r-24),H-10)}if(day)lastDay=day});ctx.restore()}`
);

writeFileSync(file, html);
console.log('MOVA V2.4.5 market-chart consistency patch complete.');
