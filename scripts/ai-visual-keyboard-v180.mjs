import { readFileSync, writeFileSync } from 'node:fs';

const path='dist/index.html';
let html=readFileSync(path,'utf8');
if(html.includes('MOVA AI VISUAL + KEYBOARD v180')){
  console.log('MOVA AI visual/keyboard v180 already applied.');
  process.exit(0);
}

const patch=String.raw`
<style id="mova-ai-visual-keyboard-v180">
/* Richer visual research cards, generated from MOVA's own returned data. */
.mova-v180{display:grid;gap:11px;color:#dce8ef}
.mova-v180-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;padding:15px;border:1px solid rgba(98,200,255,.22);border-radius:18px;background:linear-gradient(145deg,#0a1b29,#08131c)}
.mova-v180-kicker{font-size:8px;font-weight:950;letter-spacing:.12em;text-transform:uppercase;color:#62c8ff}
.mova-v180-hero h3{margin:4px 0 5px;font-size:22px}.mova-v180-hero p{margin:0;color:#8fa6b7;font-size:9.5px;line-height:1.5}
.mova-v180-price{text-align:right}.mova-v180-price b{display:block;font-size:27px}.mova-v180-price span{display:inline-block;margin-top:5px;padding:5px 8px;border-radius:999px;background:#101d25;font-size:9px;font-weight:950}.mova-v180-price .up{color:#79ef31}.mova-v180-price .down{color:#ff6470}
.mova-v180-stats{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px}.mova-v180-stat{padding:10px;border:1px solid rgba(255,255,255,.065);border-radius:13px;background:#08131c;min-width:0}.mova-v180-stat span,.mova-v180-stat b{display:block}.mova-v180-stat span{font-size:7px;color:#7890a1;text-transform:uppercase;letter-spacing:.08em}.mova-v180-stat b{margin-top:5px;font-size:12px;overflow:hidden;text-overflow:ellipsis}.mova-v180-stat b.up{color:#79ef31}.mova-v180-stat b.down{color:#ff6470}.mova-v180-stat b.amber{color:#ffbd59}
.mova-v180-card{padding:13px 14px;border:1px solid rgba(255,255,255,.065);border-radius:16px;background:#08131c}.mova-v180-card h4{margin:0 0 10px;font-size:12px}
.mova-v180-chart{width:100%;height:145px;display:block}.mova-v180-chart .line{fill:none;stroke:#62c8ff;stroke-width:3;vector-effect:non-scaling-stroke}.mova-v180-chart .area{fill:url(#movaV180Area);stroke:none}.mova-v180-chart .support{stroke:#79ef31;stroke-width:1.4;stroke-dasharray:7 6;opacity:.7;vector-effect:non-scaling-stroke}.mova-v180-chart .resistance{stroke:#ff6470;stroke-width:1.4;stroke-dasharray:7 6;opacity:.7;vector-effect:non-scaling-stroke}
.mova-v180-chart-labels{display:flex;justify-content:space-between;gap:8px;margin-top:6px;color:#7890a1;font-size:8px}.mova-v180-chart-labels b{color:#c6d7e3;font-weight:900}
.mova-v180-gauge{margin-top:10px}.mova-v180-gauge-track{height:8px;border-radius:999px;background:linear-gradient(90deg,#ff6470,#ffbd59,#79ef31);position:relative;opacity:.72}.mova-v180-gauge-dot{position:absolute;top:50%;width:13px;height:13px;border-radius:50%;background:#fff;border:3px solid #168dff;transform:translate(-50%,-50%)}.mova-v180-gauge-labels{display:flex;justify-content:space-between;margin-top:5px;color:#71889a;font-size:7.5px}
.mova-v180-grid2{display:grid;grid-template-columns:1fr 1fr;gap:9px}.mova-v180-case{padding:13px;border:1px solid rgba(255,255,255,.065);border-radius:15px;background:#08131c}.mova-v180-case.bull{border-color:rgba(121,239,49,.19)}.mova-v180-case.bear{border-color:rgba(255,100,112,.19)}.mova-v180-case h4{margin:0 0 8px;font-size:12px}.mova-v180-case.bull h4{color:#79ef31}.mova-v180-case.bear h4{color:#ff6470}.mova-v180-case-row{display:grid;grid-template-columns:23px 1fr;gap:8px;margin-top:8px}.mova-v180-case-row i{width:23px;height:23px;display:grid;place-items:center;border-radius:8px;font-style:normal;font-size:10px;font-weight:950}.bull .mova-v180-case-row i{background:rgba(121,239,49,.1);color:#79ef31}.bear .mova-v180-case-row i{background:rgba(255,100,112,.1);color:#ff6470}.mova-v180-case-row b{display:block;font-size:9.5px}.mova-v180-case-row small{display:block;margin-top:2px;color:#91a5b4;font-size:8.5px;line-height:1.45}
.mova-v180-drivers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.mova-v180-driver{padding:10px;border-radius:12px;background:#091722;border:1px solid rgba(98,200,255,.09)}.mova-v180-driver b{display:block;font-size:9.5px}.mova-v180-driver small{display:block;margin-top:3px;color:#8fa4b3;font-size:8.5px;line-height:1.45}
.mova-v180-copy{font-size:10px;line-height:1.62;color:#b8cad6}.mova-v180-copy p{margin:0 0 8px}.mova-v180-copy p:last-child{margin-bottom:0}
.mova-v180-news{display:grid;gap:7px}.mova-v180-news a,.mova-v180-news div.item{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;padding:10px;border:1px solid rgba(98,200,255,.09);border-radius:12px;background:#091722;color:inherit;text-decoration:none}.mova-v180-news b{display:block;font-size:9.5px;line-height:1.35}.mova-v180-news small{display:block;margin-top:4px;color:#8399a9;font-size:8px;line-height:1.4}.mova-v180-news em{align-self:center;color:#62c8ff;font-style:normal;font-size:8px;font-weight:900}
.mova-v180-bars{display:grid;gap:7px}.mova-v180-bar-row{display:grid;grid-template-columns:66px minmax(0,1fr) 48px;gap:8px;align-items:center;font-size:8.5px}.mova-v180-bar{height:8px;background:#101e29;border-radius:999px;overflow:hidden}.mova-v180-bar i{display:block;height:100%;background:linear-gradient(90deg,#168dff,#62c8ff);border-radius:inherit}.mova-v180-bar-row strong{text-align:right;font-size:8.5px}

@media(max-width:800px){
  .mova-v180-hero{grid-template-columns:1fr;padding:12px}.mova-v180-price{text-align:left}.mova-v180-hero h3{font-size:18px}
  .mova-v180-stats{grid-template-columns:repeat(3,minmax(0,1fr))}.mova-v180-grid2,.mova-v180-drivers{grid-template-columns:1fr}.mova-v180-chart{height:118px}

  /* Normal AI state still allows the permanent bottom dock. */
  #movaAiModal.mova-ai-modal{background:#05080c!important}

  /* Keyboard-first mode: use the whole visible viewport and temporarily remove the app dock. */
  body.mova-ai-keyboard-open .nav{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
  body.mova-ai-keyboard-open #movaAiModal.mova-ai-modal{
    top:var(--mova-ai-vv-top,0px)!important;
    left:0!important;right:0!important;bottom:auto!important;
    width:100%!important;
    height:var(--mova-ai-vv-height,100dvh)!important;
    min-height:0!important;max-height:none!important;
    padding:0!important;
    align-items:stretch!important;
    justify-content:flex-start!important;
    overflow:hidden!important;
    background:#05080c!important;
    z-index:2147483646!important;
  }
  body.mova-ai-keyboard-open #movaAiModal .mova-ai-dialog{
    width:100%!important;height:100%!important;max-height:none!important;min-height:0!important;
    margin:0!important;border-radius:0!important;overflow:hidden!important;background:#071018!important;
  }
  body.mova-ai-keyboard-open #movaAiModal .mova-ai-dialog-head{padding:9px 11px!important;min-height:58px!important}
  body.mova-ai-keyboard-open #movaAiModal .mova-ai-suggestion-wrap,
  body.mova-ai-keyboard-open #movaAiModal .mova-ai-footer-note{display:none!important}
  body.mova-ai-keyboard-open #movaAiModal .mova-ai-thread{flex:1 1 auto!important;min-height:0!important;max-height:none!important;padding:9px 11px 7px!important;overflow-y:auto!important}
  body.mova-ai-keyboard-open #movaAiModal .mova-ai-composer{flex:0 0 auto!important;padding:8px 10px max(8px,env(safe-area-inset-bottom))!important;background:#08121a!important}
  body.mova-ai-keyboard-open #movaAiModal .mova-ai-composer input{height:46px!important;font-size:16px!important}
}
</style>
<script id="mova-ai-visual-keyboard-v180-js">
(function(){
  if(window.__movaAiVisualKeyboard180)return;window.__movaAiVisualKeyboard180=true;
  function esc(v){return String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))}
  function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
  function money(v){const x=n(v);return x==null?'—':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(x)}
  function pct(v){const x=n(v);return x==null?'—':(x>=0?'+':'')+x.toFixed(1)+'%'}
  function cls(v){const x=n(v);return x==null?'':x>0?'up':x<0?'down':''}
  function mean(a){const x=a.filter(Number.isFinite);return x.length?x.reduce((s,v)=>s+v,0)/x.length:null}
  function sma(rows,len){return rows.length>=len?mean(rows.slice(-len)):null}
  function rsi(rows,len=14){if(rows.length<len+1)return null;const slice=rows.slice(-(len+1));let g=0,l=0;for(let i=1;i<slice.length;i++){const d=slice[i]-slice[i-1];if(d>0)g+=d;else l-=d}const ag=g/len,al=l/len;if(al===0)return 100;if(ag===0)return 0;return 100-(100/(1+ag/al))}
  function percentile(values,p){const a=values.filter(Number.isFinite).slice().sort((a,b)=>a-b);if(!a.length)return null;const i=(a.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return lo===hi?a[lo]:a[lo]+(a[hi]-a[lo])*(i-lo)}
  function technicals(r){const rows=(Array.isArray(r?.historySeries)?r.historySeries:[]).map(x=>Number(x?.close)).filter(Number.isFinite);const latest=rows.length?rows[rows.length-1]:n(r?.snapshot?.price);const recent=rows.slice(-45);const s20=sma(rows,20),s50=sma(rows,50),rr=rsi(rows,14),support=percentile(recent,.12),resistance=percentile(recent,.88);let trend='Mixed';if(latest!=null&&s20!=null&&s50!=null)trend=latest>s20&&s20>s50?'Bullish':latest<s20&&s20<s50?'Bearish':latest>s20?'Improving':'Weakening';return {rows,latest,s20,s50,rsi:rr,support,resistance,trend}}
  function spark(rows,support,resistance){if(rows.length<2)return '';const w=760,h=145,p=5,min=Math.min(...rows,support??Infinity),max=Math.max(...rows,resistance??-Infinity),range=max-min||1;const y=v=>p+(1-(v-min)/range)*(h-p*2);const pts=rows.map((v,i)=>((p+(i/(rows.length-1))*(w-p*2)).toFixed(1)+','+y(v).toFixed(1))).join(' ');const area=p+','+(h-p)+' '+pts+' '+(w-p)+','+(h-p);const sy=support==null?'':y(support).toFixed(1),ry=resistance==null?'':y(resistance).toFixed(1);return '<svg class="mova-v180-chart" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none"><defs><linearGradient id="movaV180Area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#62c8ff" stop-opacity=".26"/><stop offset="1" stop-color="#62c8ff" stop-opacity="0"/></linearGradient></defs><polygon class="area" points="'+area+'"></polygon>'+(support==null?'':'<line class="support" x1="0" y1="'+sy+'" x2="'+w+'" y2="'+sy+'"></line>')+(resistance==null?'':'<line class="resistance" x1="0" y1="'+ry+'" x2="'+w+'" y2="'+ry+'"></line>')+'<polyline class="line" points="'+pts+'"></polyline></svg>'}
  function caseBlock(title,rows,type){const a=Array.isArray(rows)?rows:[];if(!a.length)return '';return '<div class="mova-v180-case '+type+'"><h4>'+(type==='bull'?'↗ ':'↘ ')+esc(title)+'</h4>'+a.slice(0,4).map(x=>'<div class="mova-v180-case-row"><i>'+(type==='bull'?'✓':'!')+'</i><div><b>'+esc(x?.title||'Factor')+'</b><small>'+esc(x?.detail||'')+'</small></div></div>').join('')+'</div>'}
  function drivers(rows){return (Array.isArray(rows)?rows:[]).slice(0,6).map(x=>'<div class="mova-v180-driver"><b>'+esc(x?.title||'Watch')+'</b><small>'+esc(x?.detail||'')+'</small></div>').join('')}
  function paragraphs(text){return String(text||'').split(/\n\n+/).map(x=>x.trim()).filter(Boolean).slice(0,8).map(x=>'<p>'+esc(x)+'</p>').join('')}
  function renderCompany(r,answer,sources){
    const c=r.company||{},s=r.snapshot||{},t=technicals(r),perf=Array.isArray(r.performance)?r.performance:[],range=r.range52||{};
    const rangeLow=n(range.low),rangeHigh=n(range.high),rangeLatest=n(range.latest??t.latest);let rangePos=null;if(rangeLow!=null&&rangeHigh!=null&&rangeLatest!=null&&rangeHigh>rangeLow)rangePos=Math.max(0,Math.min(100,100*(rangeLatest-rangeLow)/(rangeHigh-rangeLow)));
    const stats=[{l:'Today',v:s.changePct,k:'pct'},{l:'1M',v:perf.find(x=>x.label==='1M')?.value,k:'pct'},{l:'3M',v:perf.find(x=>x.label==='3M')?.value,k:'pct'},{l:'RSI 14',v:t.rsi,k:'rsi'},{l:'SMA 20',v:t.s20,k:'money'},{l:'Trend',v:t.trend,k:'text'}];
    const statHtml=stats.map(x=>{let val='—',cl='';if(x.k==='pct'){val=pct(x.v);cl=cls(x.v)}else if(x.k==='money')val=money(x.v);else if(x.k==='rsi'){val=n(x.v)==null?'—':Number(x.v).toFixed(0);cl=n(x.v)!=null&&(x.v>=70||x.v<=30)?'amber':''}else val=esc(x.v);return '<div class="mova-v180-stat"><span>'+esc(x.l)+'</span><b class="'+cl+'">'+val+'</b></div>'}).join('');
    const gauge=rangePos==null?'':'<div class="mova-v180-gauge"><div class="mova-v180-gauge-track"><i class="mova-v180-gauge-dot" style="left:'+rangePos.toFixed(1)+'%"></i></div><div class="mova-v180-gauge-labels"><span>'+money(rangeLow)+'</span><span>'+rangePos.toFixed(0)+'% through 52-week range</span><span>'+money(rangeHigh)+'</span></div></div>';
    const chart=t.rows.length>1?'<div class="mova-v180-card"><h4>Price trend • close-based support & resistance</h4>'+spark(t.rows,t.support,t.resistance)+'<div class="mova-v180-chart-labels"><span>Support estimate <b>'+money(t.support)+'</b></span><span>Resistance estimate <b>'+money(t.resistance)+'</b></span></div>'+gauge+'</div>':'';
    const companyCopy=[c.summary,c.business].filter(Boolean).slice(0,2).map(x=>'<p>'+esc(x)+'</p>').join('');
    const technicalRead='<div class="mova-v180-drivers"><div class="mova-v180-driver"><b>Trend structure</b><small>'+esc(t.trend)+' based on latest price versus the 20/50-session averages where enough history is available.</small></div><div class="mova-v180-driver"><b>Momentum</b><small>'+((t.rsi==null)?'Not enough returned history for RSI.':('RSI is about '+t.rsi.toFixed(0)+(t.rsi>=70?' — strong/possibly stretched.':t.rsi<=30?' — weak/possibly oversold.':' — mid-range momentum.')))+'</small></div><div class="mova-v180-driver"><b>Support context</b><small>Close-based support estimate '+money(t.support)+'. Treat this as an area, not an exact reversal point.</small></div><div class="mova-v180-driver"><b>Resistance context</b><small>Close-based resistance estimate '+money(t.resistance)+'. A decisive break above/below matters more than a brief touch.</small></div></div>';
    const news=(Array.isArray(r.news)?r.news:[]).filter(x=>x?.title).slice(0,5).map(x=>{const body='<div><b>'+esc(x.title)+'</b><small>'+esc([x.source,x.date].filter(Boolean).join(' · '))+(x.whyItMatters?'<br>'+esc(x.whyItMatters):'')+'</small></div><em>'+(x.url?'Open ↗':'Context')+'</em>';return x.url?'<a href="'+esc(x.url)+'" target="_blank" rel="noopener">'+body+'</a>':'<div class="item">'+body+'</div>'}).join('');
    const src=(Array.isArray(sources)?sources:[]).filter(x=>x?.url).slice(0,8).map(x=>'<a href="'+esc(x.url)+'" target="_blank" rel="noopener">'+esc(x.title||'Source')+'</a>').join('');
    return '<div class="mova-v180">'+
      '<div class="mova-v180-hero"><div><div class="mova-v180-kicker">MOVA DATA SYNTHESIS</div><h3>'+esc(c.name||r.ticker)+' <span class="muted">('+esc(r.ticker||'')+')</span></h3><p>'+esc([c.industry,c.headquarters,s.provider].filter(Boolean).join(' · '))+'</p></div><div class="mova-v180-price"><b>'+money(s.price??t.latest)+'</b><span class="'+cls(s.changePct)+'">'+pct(s.changePct)+' today</span></div></div>'+
      '<div class="mova-v180-stats">'+statHtml+'</div>'+chart+
      (companyCopy?'<div class="mova-v180-card mova-v180-copy"><h4>Business context</h4>'+companyCopy+'</div>':'')+
      '<div class="mova-v180-card"><h4>Technical read</h4>'+technicalRead+'</div>'+ 
      '<div class="mova-v180-grid2">'+caseBlock('Bull case',r.bullCase,'bull')+caseBlock('Bear case / risks',r.bearCase,'bear')+'</div>'+ 
      (drivers(r.watchNext)?'<div class="mova-v180-card"><h4>What to watch next</h4><div class="mova-v180-drivers">'+drivers(r.watchNext)+'</div></div>':'')+
      (news?'<div class="mova-v180-card"><h4>News & catalysts</h4><div class="mova-v180-news">'+news+'</div></div>':'')+
      (answer?'<div class="mova-v180-card mova-v180-copy"><h4>MOVA analysis</h4>'+paragraphs(answer)+'</div>':'')+
      (src?'<div class="mova-v180-card"><h4>Sources</h4><div class="mova-ai-sources visual">'+src+'</div></div>':'')+
      '</div>';
  }
  function renderPortfolio(r,answer){
    const total=n(r.totalValue)||0,cash=n(r.cash)||0,pnl=n(r.totalPnl)||0,pnlPct=n(r.totalPnlPct)||0,cons=Array.isArray(r.concentrations)?r.concentrations:[],sc=r.scenarios||{};
    const max=Math.max(1,...cons.map(x=>n(x.weightPct)||0));
    const bars=cons.slice(0,8).map(x=>'<div class="mova-v180-bar-row"><span>'+esc(x.ticker||'')+'</span><div class="mova-v180-bar"><i style="width:'+Math.min(100,100*(n(x.weightPct)||0)/max).toFixed(1)+'%"></i></div><strong>'+((n(x.weightPct)||0).toFixed(1))+'%</strong></div>').join('');
    const scen=[['4% / yr',sc?.cautious?.fiveYears],['8% / yr',sc?.base?.fiveYears],['12% / yr',sc?.strong?.fiveYears]].map(x=>'<div class="mova-v180-stat"><span>'+x[0]+' • 5Y</span><b>'+money(x[1])+'</b></div>').join('');
    return '<div class="mova-v180"><div class="mova-v180-hero"><div><div class="mova-v180-kicker">MOVA PORTFOLIO SYNTHESIS</div><h3>Portfolio overview</h3><p>Recorded holdings and cash inside MOVA</p></div><div class="mova-v180-price"><b>'+money(total)+'</b><span class="'+cls(pnl)+'">'+pct(pnlPct)+' P/L</span></div></div><div class="mova-v180-stats"><div class="mova-v180-stat"><span>Total value</span><b>'+money(total)+'</b></div><div class="mova-v180-stat"><span>Cash</span><b>'+money(cash)+'</b></div><div class="mova-v180-stat"><span>Unrealised P/L</span><b class="'+cls(pnl)+'">'+money(pnl)+'</b></div>'+scen+'</div>'+(bars?'<div class="mova-v180-card"><h4>Concentration by holding</h4><div class="mova-v180-bars">'+bars+'</div></div>':'')+(answer?'<div class="mova-v180-card mova-v180-copy"><h4>MOVA analysis</h4>'+paragraphs(answer)+'</div>':'')+'</div>';
  }

  const priorAdd=window.movaAiAdd;
  window.movaAiAdd=function(role,text,sources=[],research=null){
    if(role==='assistant'&&research&&(research.type==='company'||research.type==='portfolio')){
      const host=document.getElementById('movaAiThread');if(!host)return;
      const box=document.createElement('div');box.className='mova-ai-msg assistant mova-ai-visual';
      box.innerHTML=research.type==='company'?renderCompany(research,text,sources):renderPortfolio(research,text);
      host.appendChild(box);window.movaAiScroll?.();return;
    }
    return typeof priorAdd==='function'?priorAdd(role,text,sources,research):undefined;
  };

  function mobile(){return window.matchMedia&&window.matchMedia('(max-width:800px)').matches}
  function syncKeyboard(){
    if(!mobile()||!document.body)return;
    const vv=window.visualViewport,modal=document.getElementById('movaAiModal');
    const visible=!!(modal&&modal.classList.contains('open'));
    const focused=document.activeElement&&document.activeElement.id==='movaAiQuestion';
    const height=vv?vv.height:window.innerHeight,top=vv?vv.offsetTop:0;
    const shrink=vv?Math.max(0,window.innerHeight-vv.height-vv.offsetTop):0;
    document.documentElement.style.setProperty('--mova-ai-vv-height',Math.max(220,Math.round(height))+'px');
    document.documentElement.style.setProperty('--mova-ai-vv-top',Math.max(0,Math.round(top))+'px');
    const open=visible&&(shrink>110||(focused&&vv&&vv.height<window.innerHeight*.82));
    document.body.classList.toggle('mova-ai-keyboard-open',open);
  }
  if(window.visualViewport){window.visualViewport.addEventListener('resize',syncKeyboard);window.visualViewport.addEventListener('scroll',syncKeyboard)}
  window.addEventListener('resize',syncKeyboard);
  document.addEventListener('focusin',e=>{if(e.target&&e.target.id==='movaAiQuestion')setTimeout(syncKeyboard,40)});
  document.addEventListener('focusout',e=>{if(e.target&&e.target.id==='movaAiQuestion')setTimeout(syncKeyboard,180)});
  const oldOpen=window.movaAiOpenModal;if(typeof oldOpen==='function')window.movaAiOpenModal=function(prefill=''){const out=oldOpen(prefill);setTimeout(syncKeyboard,40);return out};
  const oldClose=window.movaAiCloseModal;if(typeof oldClose==='function')window.movaAiCloseModal=function(){document.body?.classList.remove('mova-ai-keyboard-open');return oldClose()};
  syncKeyboard();
})();
</script>
<!-- MOVA AI VISUAL + KEYBOARD v180 -->
`;

html+=patch;
writeFileSync(path,html,'utf8');
console.log('MOVA AI v180 visual synthesis and keyboard-first mobile mode applied.');
