import { rmSync, mkdirSync, copyFileSync, cpSync, appendFileSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
copyFileSync('index.html', 'dist/index.html');
cpSync('assets', 'dist/assets', { recursive: true });

const runtimePatch = String.raw`
<style id="mova-ai-runtime-v176">
.mova-ai-modal{z-index:2147483647!important}
.mova-ai-dialog{width:min(96vw,1080px)!important;max-height:min(92vh,920px)!important}
.mova-ai-dialog .mova-ai-thread{max-height:60vh!important}
.mova-ai-msg.assistant.mova-ai-visual{padding:0!important;background:transparent!important;border:0!important;white-space:normal!important;margin-right:0!important}
.mova-ai-research{display:grid;gap:12px;color:#dce8ef}
.mova-ai-research-head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;padding:16px;border:1px solid rgba(98,200,255,.20);border-radius:18px;background:linear-gradient(145deg,#0a1a27,#08131c)}
.mova-ai-research-head h3{margin:3px 0 5px;font-size:22px}.mova-ai-research-head p{margin:0;color:#8fa6b7;font-size:10px;line-height:1.5}
.mova-ai-price{text-align:right}.mova-ai-price b{display:block;font-size:27px}.mova-ai-price span{display:inline-block;margin-top:5px;padding:5px 8px;border-radius:999px;font-size:10px;font-weight:900;background:#101d25}.mova-ai-price .up{color:#79ef31}.mova-ai-price .down{color:#ff6b75}
.mova-ai-stat-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}.mova-ai-stat{padding:11px;border-radius:13px;background:#08131c;border:1px solid rgba(255,255,255,.06);min-width:0}.mova-ai-stat span,.mova-ai-stat b{display:block}.mova-ai-stat span{font-size:8px;color:#7890a1;text-transform:uppercase;letter-spacing:.08em}.mova-ai-stat b{margin-top:5px;font-size:14px}.mova-ai-stat b.up{color:#79ef31}.mova-ai-stat b.down{color:#ff6b75}
.mova-ai-chart-card,.mova-ai-section{padding:14px 15px;border:1px solid rgba(255,255,255,.065);border-radius:16px;background:#08131c}.mova-ai-section h4,.mova-ai-chart-card h4{margin:0 0 10px;font-size:13px}.mova-ai-chart{height:130px;width:100%;display:block}.mova-ai-chart polyline{fill:none;stroke:#62c8ff;stroke-width:3;vector-effect:non-scaling-stroke}.mova-ai-chart .fill{fill:url(#movaAiArea);stroke:none}.mova-ai-range{margin-top:9px}.mova-ai-range-track{position:relative;height:8px;border-radius:999px;background:#111f2a;overflow:visible}.mova-ai-range-fill{position:absolute;inset:0;border-radius:inherit;background:linear-gradient(90deg,#ff6b75,#ffbd59,#79ef31);opacity:.55}.mova-ai-range-dot{position:absolute;top:50%;width:13px;height:13px;border-radius:50%;background:#fff;border:3px solid #168dff;transform:translate(-50%,-50%)}.mova-ai-range-labels{display:flex;justify-content:space-between;margin-top:6px;font-size:8px;color:#7890a1}
.mova-ai-copy{font-size:11px;line-height:1.65;color:#bdcdd8}.mova-ai-copy p{margin:0 0 9px}.mova-ai-copy p:last-child{margin-bottom:0}
.mova-ai-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.mova-ai-case{padding:14px;border-radius:16px;border:1px solid rgba(255,255,255,.065);background:#08131c}.mova-ai-case.bull{border-color:rgba(121,239,49,.18)}.mova-ai-case.bear{border-color:rgba(255,93,103,.18)}.mova-ai-case h4{margin:0 0 10px;font-size:13px}.mova-ai-case-row{display:grid;grid-template-columns:24px 1fr;gap:8px;margin-top:9px}.mova-ai-case-row i{width:24px;height:24px;display:grid;place-items:center;border-radius:8px;font-style:normal;font-size:11px;font-weight:900}.bull .mova-ai-case-row i{background:rgba(121,239,49,.10);color:#79ef31}.bear .mova-ai-case-row i{background:rgba(255,93,103,.10);color:#ff6b75}.mova-ai-case-row b{display:block;font-size:10px}.mova-ai-case-row small{display:block;margin-top:3px;color:#91a5b4;font-size:9px;line-height:1.45}
.mova-ai-watch{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.mova-ai-watch>div{padding:10px;border-radius:12px;background:#091722;border:1px solid rgba(98,200,255,.08)}.mova-ai-watch b{display:block;font-size:10px}.mova-ai-watch small{display:block;margin-top:3px;color:#8fa3b2;font-size:8.5px;line-height:1.45}
.mova-ai-news{display:grid;gap:8px}.mova-ai-news-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;padding:12px;border-radius:13px;background:#091722;border:1px solid rgba(98,200,255,.10);text-decoration:none;color:inherit}.mova-ai-news-card:hover{border-color:rgba(98,200,255,.42);background:#0b1d2a}.mova-ai-news-card b{display:block;font-size:10px;line-height:1.4}.mova-ai-news-meta{margin-top:4px;font-size:8px;color:#7890a1}.mova-ai-news-why{margin-top:7px;font-size:9px;line-height:1.45;color:#9fb2c0}.mova-ai-news-open{align-self:center;color:#62c8ff;font-size:9px;font-weight:900;white-space:nowrap}.mova-ai-sources.visual{margin-top:0}.mova-ai-sources.visual a{font-size:8px!important}
@media(max-width:800px){.mova-ai-dialog .mova-ai-thread{max-height:66vh!important}.mova-ai-research-head{grid-template-columns:1fr}.mova-ai-price{text-align:left}.mova-ai-stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.mova-ai-two{grid-template-columns:1fr}.mova-ai-watch{grid-template-columns:1fr}.mova-ai-news-card{grid-template-columns:1fr}.mova-ai-news-open{justify-self:start}.mova-ai-chart{height:110px}}
</style>
<script id="mova-ai-runtime-v176-js">
(function(){
  function errText(v){if(!v)return 'Unknown error';if(typeof v==='string')return v;if(v instanceof Error)return v.message||String(v);if(typeof v==='object'){if(typeof v.message==='string')return v.message;if(typeof v.error==='string')return v.error;if(v.error&&typeof v.error.message==='string')return v.error.message;try{return JSON.stringify(v)}catch(_){return 'Unknown error'}}return String(v)}
  function esc(v){return String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))}
  function money(v){const n=Number(v);return Number.isFinite(n)?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n):'—'}
  function pct(v){const n=Number(v);return Number.isFinite(n)?(n>=0?'+':'')+n.toFixed(1)+'%':'—'}
  function cls(v){const n=Number(v);return !Number.isFinite(n)?'':n>0?'up':n<0?'down':''}
  function paragraphs(text){return String(text||'').split(/\n\n+/).map(x=>x.trim()).filter(Boolean).slice(0,6).map(x=>'<p>'+esc(x)+'</p>').join('')}
  function spark(series){
    const rows=(Array.isArray(series)?series:[]).map(x=>Number(x?.close)).filter(Number.isFinite);if(rows.length<2)return '';
    const min=Math.min(...rows),max=Math.max(...rows),range=max-min||1,w=760,h=130,p=5;
    const pts=rows.map((v,i)=>{const x=p+(i/(rows.length-1))*(w-p*2),y=p+(1-(v-min)/range)*(h-p*2);return x.toFixed(1)+','+y.toFixed(1)}).join(' ');
    const area=p+','+(h-p)+' '+pts+' '+(w-p)+','+(h-p);
    return '<svg class="mova-ai-chart" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none"><defs><linearGradient id="movaAiArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#62c8ff" stop-opacity=".24"/><stop offset="1" stop-color="#62c8ff" stop-opacity="0"/></linearGradient></defs><polygon class="fill" points="'+area+'"></polygon><polyline points="'+pts+'"></polyline></svg>';
  }
  function renderCase(title,rows,type){const arr=Array.isArray(rows)?rows:[];if(!arr.length)return '';return '<div class="mova-ai-case '+type+'"><h4>'+(type==='bull'?'↗ ':'↘ ')+esc(title)+'</h4>'+arr.map((x,i)=>'<div class="mova-ai-case-row"><i>'+(type==='bull'?'✓':'!')+'</i><div><b>'+esc(x?.title||'Factor')+'</b><small>'+esc(x?.detail||'')+'</small></div></div>').join('')+'</div>'}
  function renderResearch(r,answer,sources){
    if(!r||r.type!=='company')return null;
    const c=r.company||{},s=r.snapshot||{},perf=Array.isArray(r.performance)?r.performance:[],range=r.range52||null;
    const stats=[{label:'Today',value:s.changePct,kind:'pct'},...perf].slice(0,5);
    if(range)stats.push({label:'52W high',value:range.high,kind:'money'});
    let rangeHtml='';
    if(range&&Number.isFinite(Number(range.low))&&Number.isFinite(Number(range.high))&&Number.isFinite(Number(range.latest))){const span=Number(range.high)-Number(range.low)||1,pos=Math.max(0,Math.min(100,100*(Number(range.latest)-Number(range.low))/span));rangeHtml='<div class="mova-ai-range"><div class="mova-ai-range-track"><div class="mova-ai-range-fill"></div><i class="mova-ai-range-dot" style="left:'+pos.toFixed(1)+'%"></i></div><div class="mova-ai-range-labels"><span>'+money(range.low)+'</span><span>52-week range</span><span>'+money(range.high)+'</span></div></div>'}
    const companyCopy=[c.summary,c.business,c.origins].filter(Boolean).slice(0,3).map(x=>'<p>'+esc(x)+'</p>').join('');
    const watch=(Array.isArray(r.watchNext)?r.watchNext:[]).map(x=>'<div><b>'+esc(x?.title||'Watch')+'</b><small>'+esc(x?.detail||'')+'</small></div>').join('');
    const news=(Array.isArray(r.news)?r.news:[]).filter(x=>x?.title).slice(0,6).map(x=>{const body='<div><b>'+esc(x.title)+'</b><div class="mova-ai-news-meta">'+esc([x.source,x.date].filter(Boolean).join(' · '))+'</div><div class="mova-ai-news-why"><strong>Why it matters:</strong> '+esc(x.whyItMatters||x.summary||'Relevant to the current investment context.')+'</div></div><span class="mova-ai-news-open">'+(x.url?'Read article ↗':'Context')+'</span>';return x.url?'<a class="mova-ai-news-card" href="'+esc(x.url)+'" target="_blank" rel="noopener">'+body+'</a>':'<div class="mova-ai-news-card">'+body+'</div>'}).join('');
    const sourceHtml=(Array.isArray(sources)?sources:[]).filter(x=>x?.url).slice(0,10).map(x=>'<a href="'+esc(x.url)+'" target="_blank" rel="noopener">'+esc(x.title||'Source')+'</a>').join('');
    return '<div class="mova-ai-research">'+
      '<div class="mova-ai-research-head"><div><div class="label">MOVA RESEARCH</div><h3>'+esc(c.name||r.ticker)+' <span class="muted">('+esc(r.ticker||'')+')</span></h3><p>'+esc([c.industry,c.headquarters].filter(Boolean).join(' · '))+'</p></div><div class="mova-ai-price"><b>'+money(s.price)+'</b><span class="'+cls(s.changePct)+'">'+pct(s.changePct)+' today</span></div></div>'+
      '<div class="mova-ai-stat-grid">'+stats.map(x=>'<div class="mova-ai-stat"><span>'+esc(x.label)+'</span><b class="'+(x.kind==='money'?'':cls(x.value))+'">'+(x.kind==='money'?money(x.value):pct(x.value))+'</b></div>').join('')+'</div>'+
      (spark(r.historySeries)?'<div class="mova-ai-chart-card"><h4>Price trend — recent history</h4>'+spark(r.historySeries)+rangeHtml+'</div>':'')+
      (companyCopy?'<div class="mova-ai-section mova-ai-copy"><h4>Who they are & how the business works</h4>'+companyCopy+'</div>':'')+
      '<div class="mova-ai-two">'+renderCase('Bull case',r.bullCase,'bull')+renderCase('Bear case / risks',r.bearCase,'bear')+'</div>'+
      (watch?'<div class="mova-ai-section"><h4>What to watch next</h4><div class="mova-ai-watch">'+watch+'</div></div>':'')+
      (news?'<div class="mova-ai-section"><h4>Related news & catalysts</h4><div class="mova-ai-news">'+news+'</div></div>':'')+
      (answer?'<div class="mova-ai-section mova-ai-copy"><h4>MOVA analysis</h4>'+paragraphs(answer)+'</div>':'')+
      (sourceHtml?'<div class="mova-ai-section"><h4>Sources</h4><div class="mova-ai-sources visual">'+sourceHtml+'</div></div>':'')+
      '</div>';
  }

  const originalOpen=window.movaAiOpenModal;
  if(typeof originalOpen==='function')window.movaAiOpenModal=function(prefill=''){const modal=document.getElementById('movaAiModal');if(modal)document.body.appendChild(modal);return originalOpen(prefill)};
  window.movaAiErrorText=errText;
  window.movaAiAdd=function(role,text,sources=[],research=null){const host=document.getElementById('movaAiThread');if(!host)return;const box=document.createElement('div');box.className='mova-ai-msg '+role;const visual=role==='assistant'?renderResearch(research,text,sources):null;if(visual){box.classList.add('mova-ai-visual');box.innerHTML=visual}else{box.textContent=String(text??'');if(Array.isArray(sources)&&sources.length){const src=document.createElement('div');src.className='mova-ai-sources';sources.slice(0,8).forEach((s,i)=>{if(!s||!s.url)return;const a=document.createElement('a');a.href=s.url;a.target='_blank';a.rel='noopener';a.textContent=String(s.title||('Source '+(i+1))).slice(0,70);src.appendChild(a)});box.appendChild(src)}}host.appendChild(box);window.movaAiScroll?.()};

  window.movaAskAiSubmit=async function(ev){if(ev)ev.preventDefault();window.movaAiOpenModal?.();const input=document.getElementById('movaAiQuestion'),btn=document.getElementById('movaAiAskBtn'),host=document.getElementById('movaAiThread'),q=String(input?.value||'').trim();if(!q)return false;window.movaAiAdd('user',q);if(Array.isArray(window.movaAiHistory))window.movaAiHistory.push({role:'user',content:q});if(input)input.value='';if(btn){btn.disabled=true;btn.textContent='...'}const thinking=document.createElement('div');thinking.className='mova-ai-thinking';thinking.textContent='MOVA is researching the company, market data, price history and relevant news...';host?.appendChild(thinking);window.movaAiScroll?.();try{const history=Array.isArray(window.movaAiHistory)?window.movaAiHistory.slice(-8):[],portfolio=typeof window.movaAiPortfolioPayload==='function'?window.movaAiPortfolioPayload():{holdings:[],cash:0};const r=await fetch('/api/ask-ai',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({question:q,portfolio,history})});const raw=await r.text();let d={};try{d=raw?JSON.parse(raw):{}}catch(_){d={error:raw||('Ask AI '+r.status)}}if(!r.ok||d.error)throw new Error(errText(d.error||d)||('Ask AI '+r.status));thinking.remove();window.movaAiAdd('assistant',d.answer||'No answer returned.',d.sources||[],d.research||null);if(Array.isArray(window.movaAiHistory))window.movaAiHistory.push({role:'assistant',content:d.answer||''})}catch(e){thinking.remove();window.movaAiAdd('error','MOVA AI could not complete this request: '+errText(e))}finally{if(btn){btn.disabled=false;btn.textContent='↑'}}return false};
})();
</script>
`;

appendFileSync('dist/index.html', runtimePatch, 'utf8');
console.log('MOVA build complete with visual AI research cards.');
