import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

const tickerOld='<label>TICKER<input id="movaV2Ticker" class="mova-clean-input" required></label>';
const tickerNew=`<label class="mova-setup-field mova-ticker-field">TICKER
  <input id="movaV2Ticker" class="mova-clean-input" autocomplete="off" placeholder="Start typing AMD, Amazon, Apple…" required oninput="movaNativeTickerSuggest(this.value)" onfocus="movaNativeTickerSuggest(this.value)" onblur="setTimeout(movaNativeTickerHide,140)">
  <small class="mova-field-help">Type a ticker or company name, then select the correct match.</small>
  <div id="movaTickerSuggestions" class="mova-ticker-suggestions"></div>
</label>`;
if(!html.includes(tickerOld)) throw new Error('ticker field not found');
html=html.replace(tickerOld,tickerNew);

html=html.replace('<label>ENTRY ZONE<input id="movaV2Entry" class="mova-clean-input"></label>',
`<label class="mova-setup-field">ENTRY ZONE
  <input id="movaV2Entry" class="mova-clean-input" placeholder="e.g. $168–172">
  <small class="mova-field-help">The price area where you would consider entering the trade.</small>
</label>`);
html=html.replace('<label>STOP / INVALIDATION<input id="movaV2Stop" class="mova-clean-input"></label>',
`<label class="mova-setup-field">STOP / INVALIDATION
  <input id="movaV2Stop" class="mova-clean-input" placeholder="e.g. $162.50">
  <small class="mova-field-help">The price where your trade idea is considered wrong and you would exit.</small>
</label>`);
html=html.replace('<label>SUPPORT<input id="movaV2Support" class="mova-clean-input"></label>',
`<label class="mova-setup-field">SUPPORT LEVEL
  <input id="movaV2Support" class="mova-clean-input" placeholder="e.g. $165">
  <small class="mova-field-help">An area where buyers have previously stepped in and price may find a floor.</small>
</label>`);
html=html.replace('<label>RESISTANCE / TARGET<input id="movaV2Target" class="mova-clean-input"></label>',
`<label class="mova-setup-field">RESISTANCE LEVEL
  <input id="movaV2Resistance" class="mova-clean-input" placeholder="e.g. $180">
  <small class="mova-field-help">An area where sellers have previously stepped in and price may struggle to move higher.</small>
</label>
<label class="mova-setup-field">PROFIT TARGET
  <input id="movaV2Target" class="mova-clean-input" placeholder="e.g. $185">
  <small class="mova-field-help">Your planned take-profit level if the setup works.</small>
</label>`);

const css=`<style id="mova-setup-guidance-style">
.mova-setup-field{position:relative;align-content:start}.mova-field-help{display:block;color:#6f8798;font-size:10px;line-height:1.45;margin-top:-1px;font-weight:500;text-transform:none;letter-spacing:0}.mova-ticker-field{z-index:20}.mova-ticker-suggestions{display:none;position:absolute;left:0;right:0;top:100%;margin-top:4px;border:1px solid #1b465d;border-radius:12px;background:#07151f;box-shadow:0 16px 38px rgba(0,0,0,.42);overflow:hidden;max-height:260px;overflow-y:auto}.mova-ticker-suggestions.open{display:block}.mova-ticker-option{display:grid;grid-template-columns:70px minmax(0,1fr);gap:10px;width:100%;border:0;border-bottom:1px solid #102f40;background:transparent;color:#eef5f8;padding:10px 12px;text-align:left;cursor:pointer}.mova-ticker-option:last-child{border-bottom:0}.mova-ticker-option:hover,.mova-ticker-option:focus{background:#0a2230;outline:none}.mova-ticker-option b{color:#66ff8a;font-size:12px}.mova-ticker-option span{color:#9cb0be;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mova-ticker-empty{padding:11px 12px;color:#7890a1;font-size:11px}.mova-selected-company{color:#66ff8a!important;margin-top:2px!important}@media(max-width:740px){.mova-ticker-suggestions{position:relative;top:auto;margin-top:5px}}
</style>`;
html=html.replace('</head>',css+'</head>');

// Extend setup persistence to keep resistance separate from profit target.
html=html.replace(
"var target=(document.getElementById('movaV2Target')?.value||'').trim();",
"var resistance=(document.getElementById('movaV2Resistance')?.value||'').trim();\n  var target=(document.getElementById('movaV2Target')?.value||'').trim();"
);
html=html.replace(
"a.unshift({id:Date.now(),ticker:ticker,direction:direction,entry:entry,stop:stop,support:support,target:target,thesis:thesis,createdAt:new Date().toISOString()});",
"a.unshift({id:Date.now(),ticker:ticker,direction:direction,entry:entry,stop:stop,support:support,resistance:resistance,target:target,thesis:thesis,createdAt:new Date().toISOString()});"
);
html=html.replace(
"if(x.support)meta.push('<span>Support '+movaNativeSetupEsc(x.support)+'</span>');\n    if(x.target)meta.push('<span>Target '+movaNativeSetupEsc(x.target)+'</span>');",
"if(x.support)meta.push('<span>Support '+movaNativeSetupEsc(x.support)+'</span>');\n    if(x.resistance)meta.push('<span>Resistance '+movaNativeSetupEsc(x.resistance)+'</span>');\n    if(x.target)meta.push('<span>Target '+movaNativeSetupEsc(x.target)+'</span>');"
);
html=html.replace(
"if(document.getElementById('movaV2Support'))movaV2Support.value=x.support||'';\n  if(document.getElementById('movaV2Target'))movaV2Target.value=x.target||'';",
"if(document.getElementById('movaV2Support'))movaV2Support.value=x.support||'';\n  if(document.getElementById('movaV2Resistance'))movaV2Resistance.value=x.resistance||'';\n  if(document.getElementById('movaV2Target'))movaV2Target.value=x.target||'';"
);

const nativeFns=`
function movaNativeTickerSource(){
  try{return Array.isArray(assets)?assets:[]}catch(e){return[]}
}
function movaNativeTickerSuggest(value){
  var box=document.getElementById('movaTickerSuggestions');if(!box)return;
  var q=String(value||'').trim().toLowerCase();
  if(!q){box.classList.remove('open');box.innerHTML='';return}
  var list=movaNativeTickerSource().filter(function(a){
    return String(a.k||'').toLowerCase().includes(q)||String(a.n||'').toLowerCase().includes(q)
  }).sort(function(a,b){
    var ak=String(a.k||'').toLowerCase(),bk=String(b.k||'').toLowerCase();
    var ae=ak===q?0:ak.startsWith(q)?1:String(a.n||'').toLowerCase().startsWith(q)?2:3;
    var be=bk===q?0:bk.startsWith(q)?1:String(b.n||'').toLowerCase().startsWith(q)?2:3;
    return ae-be
  }).slice(0,8);
  if(!list.length){box.innerHTML='<div class="mova-ticker-empty">No matching MOVA ticker found.</div>';box.classList.add('open');return}
  box.innerHTML=list.map(function(a){return '<button type="button" class="mova-ticker-option" onmousedown="event.preventDefault()" onclick="movaNativeTickerPick(\''+String(a.k||'').replace(/'/g,"\\'")+'\',\''+String(a.n||'').replace(/'/g,"\\'")+'\')"><b>'+movaNativeSetupEsc(a.k||'')+'</b><span>'+movaNativeSetupEsc(a.n||'')+'</span></button>'}).join('');
  box.classList.add('open');
}
function movaNativeTickerPick(ticker,name){
  var input=document.getElementById('movaV2Ticker');if(input)input.value=String(ticker||'').toUpperCase();
  var box=document.getElementById('movaTickerSuggestions');if(box){box.classList.remove('open');box.innerHTML=''}
  var field=input&&input.closest('.mova-ticker-field');if(field){var old=field.querySelector('.mova-selected-company');if(old)old.remove();var s=document.createElement('small');s.className='mova-field-help mova-selected-company';s.textContent=String(name||'')+' · '+String(ticker||'').toUpperCase();field.appendChild(s)}
}
function movaNativeTickerHide(){var box=document.getElementById('movaTickerSuggestions');if(box)box.classList.remove('open')}
`;
const marker='function openCompanyResearch(';
const pos=html.indexOf(marker);if(pos<0)throw new Error('native script marker not found');
const scriptEnd=html.indexOf('</script>',pos);if(scriptEnd<0)throw new Error('native script end not found');
new Function(nativeFns);
html=html.slice(0,scriptEnd)+nativeFns+html.slice(scriptEnd);

writeFileSync(file,html);
console.log('MOVA Setup Builder guidance + ticker autocomplete complete.');
