import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

// Wire the existing Setup Builder form directly to MOVA's native runtime.
html=html.replace(/<form id="movaV2SetupForm" class="mova-clean-form">/,
  '<form id="movaV2SetupForm" class="mova-clean-form" onsubmit="return movaNativeSaveSetup(event)">');

// Add a status line beneath the Save setup button if not already present.
html=html.replace(
  '<div class="full"><button class="mova-clean-btn" type="submit">Save setup</button></div>',
  '<div class="full"><button class="mova-clean-btn" type="submit">Save setup</button> <span id="movaNativeSetupStatus" class="mova-clean-note"></span></div>'
);

const css=`<style id="mova-native-setup-builder-style">
.mova-setup-saved-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:18px}.mova-setup-saved-head h3{margin:0;font-size:16px}.mova-setup-badge{display:inline-flex;align-items:center;border:1px solid rgba(102,255,138,.24);border-radius:999px;padding:5px 8px;color:#66ff8a;font-size:9px;font-weight:1000;letter-spacing:.07em}.mova-setup-card{border:1px solid #153446;border-radius:14px;background:#041019;padding:14px}.mova-setup-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.mova-setup-card h4{margin:0;font-size:17px}.mova-setup-meta{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}.mova-setup-meta span{border:1px solid #153446;border-radius:999px;padding:5px 8px;color:#8fa5b4;font-size:10px}.mova-setup-thesis{margin:10px 0 0;color:#92a5b3;line-height:1.5;font-size:12px}.mova-setup-actions{display:flex;gap:7px;flex-wrap:wrap}.mova-setup-action{border:1px solid #24536a;background:#0a2230;color:#eef5f8;border-radius:9px;padding:7px 9px;font-size:10px;font-weight:900;cursor:pointer}.mova-setup-action.danger{border-color:rgba(255,105,120,.34);color:#ff9aa3;background:rgba(255,105,120,.08)}
</style>`;
html=html.replace('</head>',css+'</head>');

const nativeFns=`
function movaNativeSetupGet(){try{return JSON.parse(localStorage.getItem('movaNativeSetupsV1')||'[]')||[]}catch(e){return[]}}
function movaNativeSetupPut(v){try{localStorage.setItem('movaNativeSetupsV1',JSON.stringify(v))}catch(e){}}
function movaNativeSetupEsc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
function movaNativeRenderSetups(){
  var list=document.getElementById('movaV2Setups');
  if(!list)return;
  var a=movaNativeSetupGet();
  if(!a.length){list.innerHTML='<div class="mova-setup-saved-head"><h3>Saved setups</h3><span class="mova-setup-badge">0 SAVED</span></div><small>No saved setups yet. Build one above and press Save setup.</small>';return}
  list.innerHTML='<div class="mova-setup-saved-head"><h3>Saved setups</h3><span class="mova-setup-badge">'+a.length+' SAVED</span></div>'+a.map(function(x){
    var meta=[];
    if(x.entry)meta.push('<span>Entry '+movaNativeSetupEsc(x.entry)+'</span>');
    if(x.stop)meta.push('<span>Stop '+movaNativeSetupEsc(x.stop)+'</span>');
    if(x.support)meta.push('<span>Support '+movaNativeSetupEsc(x.support)+'</span>');
    if(x.target)meta.push('<span>Target '+movaNativeSetupEsc(x.target)+'</span>');
    return '<div class="mova-setup-card"><div class="mova-setup-card-top"><div><h4>'+movaNativeSetupEsc(x.ticker)+' · '+movaNativeSetupEsc(x.direction)+'</h4><div class="mova-setup-meta">'+meta.join('')+'</div></div><div class="mova-setup-actions"><button class="mova-setup-action" type="button" onclick="movaNativeLoadSetup('+x.id+')">Load</button><button class="mova-setup-action danger" type="button" onclick="movaNativeDeleteSetup('+x.id+')">Delete</button></div></div><p class="mova-setup-thesis">'+movaNativeSetupEsc(x.thesis||'No thesis entered.')+'</p></div>';
  }).join('');
}
function movaNativeSaveSetup(ev){
  if(ev&&ev.preventDefault)ev.preventDefault();
  var ticker=(document.getElementById('movaV2Ticker')?.value||'').trim().toUpperCase();
  var direction=document.getElementById('movaV2Direction')?.value||'Long';
  var entry=(document.getElementById('movaV2Entry')?.value||'').trim();
  var stop=(document.getElementById('movaV2Stop')?.value||'').trim();
  var support=(document.getElementById('movaV2Support')?.value||'').trim();
  var target=(document.getElementById('movaV2Target')?.value||'').trim();
  var thesis=(document.getElementById('movaV2Thesis')?.value||'').trim();
  var status=document.getElementById('movaNativeSetupStatus');
  if(!ticker){if(status)status.textContent='Enter a ticker.';return false}
  if(!thesis){if(status)status.textContent='Add a short thesis.';return false}
  var a=movaNativeSetupGet();
  a.unshift({id:Date.now(),ticker:ticker,direction:direction,entry:entry,stop:stop,support:support,target:target,thesis:thesis,createdAt:new Date().toISOString()});
  movaNativeSetupPut(a.slice(0,50));
  if(document.getElementById('movaV2SetupForm'))document.getElementById('movaV2SetupForm').reset();
  if(status)status.textContent='Setup saved.';
  movaNativeRenderSetups();
  return false;
}
function movaNativeLoadSetup(id){
  var x=movaNativeSetupGet().find(function(s){return s.id===id});if(!x)return;
  if(document.getElementById('movaV2Ticker'))movaV2Ticker.value=x.ticker||'';
  if(document.getElementById('movaV2Direction'))movaV2Direction.value=x.direction||'Long';
  if(document.getElementById('movaV2Entry'))movaV2Entry.value=x.entry||'';
  if(document.getElementById('movaV2Stop'))movaV2Stop.value=x.stop||'';
  if(document.getElementById('movaV2Support'))movaV2Support.value=x.support||'';
  if(document.getElementById('movaV2Target'))movaV2Target.value=x.target||'';
  if(document.getElementById('movaV2Thesis'))movaV2Thesis.value=x.thesis||'';
  var status=document.getElementById('movaNativeSetupStatus');if(status)status.textContent='Setup loaded into builder.';
  document.getElementById('movaV2SetupForm')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function movaNativeDeleteSetup(id){
  var a=movaNativeSetupGet().filter(function(s){return s.id!==id});
  movaNativeSetupPut(a);movaNativeRenderSetups();
}
`;

const marker='function openCompanyResearch(';
const pos=html.indexOf(marker);
if(pos<0) throw new Error('native MOVA script marker not found');
const scriptEnd=html.indexOf('</script>',pos);
if(scriptEnd<0) throw new Error('native MOVA script end not found');
new Function(nativeFns);
html=html.slice(0,scriptEnd)+nativeFns+html.slice(scriptEnd);

// Render saved setups after the page is loaded. Use native script function through a safe inline hook.
html=html.replace('</body>',`<script id="mova-native-setup-init">if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){if(typeof movaNativeRenderSetups==='function')movaNativeRenderSetups()})}else{if(typeof movaNativeRenderSetups==='function')movaNativeRenderSetups()}</script></body>`);

writeFileSync(file,html);
console.log('MOVA native Setup Builder test patch complete.');
