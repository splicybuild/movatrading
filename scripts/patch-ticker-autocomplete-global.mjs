import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

const css=`<style id="mova-global-autocomplete-style">
.mova-auto-wrap{position:relative!important}.mova-auto-list{display:none;position:absolute;left:0;right:0;top:calc(100% + 5px);z-index:2147483646;background:#07151f;border:1px solid #1b465d;border-radius:12px;box-shadow:0 16px 38px rgba(0,0,0,.42);overflow:hidden;max-height:270px;overflow-y:auto}.mova-auto-list.open{display:block}.mova-auto-item{display:grid;grid-template-columns:72px minmax(0,1fr);gap:10px;width:100%;padding:10px 12px;border:0;border-bottom:1px solid #102f40;background:transparent;color:#eef5f8;text-align:left;cursor:pointer}.mova-auto-item:last-child{border-bottom:0}.mova-auto-item:hover,.mova-auto-item:focus{background:#0a2230;outline:none}.mova-auto-item b{color:#66ff8a;font-size:12px}.mova-auto-item span{color:#9cb0be;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mova-auto-empty{padding:11px 12px;color:#7890a1;font-size:11px}.mova-auto-selected{display:block;margin-top:5px;color:#66ff8a;font-size:10px;font-weight:700}
.mova-alert-form{align-items:start!important}.mova-alert-form>label{display:grid!important;grid-template-rows:14px 46px auto!important;gap:6px!important;align-content:start!important}.mova-alert-form #mnaAlertSymbol,.mova-alert-form #mnaAlertNote{height:46px!important;min-height:46px!important;margin:0!important}
body.mova-light-theme .mova-auto-list{background:#fff;border-color:#b8ccd7}.mova-light-theme .mova-auto-item{color:#14212b;border-bottom-color:#dbe6ec}.mova-light-theme .mova-auto-item:hover,.mova-light-theme .mova-auto-item:focus{background:#eef6f9}.mova-light-theme .mova-auto-item span{color:#5d7381}.mova-light-theme .mova-auto-empty{color:#5d7381}
@media(max-width:740px){.mova-auto-list{position:absolute}}
</style>`;
html=html.replace('</head>',css+'</head>');

const runtime=`<script id="mova-global-autocomplete-runtime">(function(){
  function source(){try{return Array.isArray(assets)?assets:[]}catch(e){return[]}}
  function matches(q){q=String(q||'').trim().toLowerCase();if(!q)return[];return source().filter(function(a){return String(a.k||'').toLowerCase().includes(q)||String(a.n||'').toLowerCase().includes(q)}).sort(function(a,b){var ak=String(a.k||'').toLowerCase(),bk=String(b.k||'').toLowerCase(),an=String(a.n||'').toLowerCase(),bn=String(b.n||'').toLowerCase();var ar=ak===q?0:ak.startsWith(q)?1:an.startsWith(q)?2:3,br=bk===q?0:bk.startsWith(q)?1:bn.startsWith(q)?2:3;return ar-br}).slice(0,8)}
  function ensureWrap(input){var parent=input.parentElement;if(!parent)return null;if(!parent.classList.contains('mova-auto-wrap'))parent.classList.add('mova-auto-wrap');var box=parent.querySelector(':scope > .mova-auto-list');if(!box){box=document.createElement('div');box.className='mova-auto-list';parent.appendChild(box)}return box}
  function hide(input){var p=input&&input.parentElement,b=p&&p.querySelector(':scope > .mova-auto-list');if(b)b.classList.remove('open')}
  function pick(input,a,kind){input.value=String(a.k||'').toUpperCase();hide(input);var p=input.parentElement;if(p){var old=p.querySelector(':scope > .mova-auto-selected');if(old)old.remove();var s=document.createElement('small');s.className='mova-auto-selected';s.textContent=String(a.n||'')+' · '+String(a.k||'').toUpperCase();p.appendChild(s)}if(kind==='header'){try{if(typeof openAsset==='function')openAsset(a.k)}catch(e){}}}
  function render(input,kind){var box=ensureWrap(input);if(!box)return;var q=input.value.trim();box.innerHTML='';if(!q){box.classList.remove('open');return}var list=matches(q);if(!list.length){var e=document.createElement('div');e.className='mova-auto-empty';e.textContent='No matching MOVA ticker found.';box.appendChild(e);box.classList.add('open');return}list.forEach(function(a){var b=document.createElement('button');b.type='button';b.className='mova-auto-item';var sym=document.createElement('b');sym.textContent=a.k||'';var name=document.createElement('span');name.textContent=a.n||'';b.appendChild(sym);b.appendChild(name);b.onmousedown=function(ev){ev.preventDefault()};b.onclick=function(){pick(input,a,kind)};box.appendChild(b)});box.classList.add('open')}
  function inPulseSearch(input){var n=input;for(var i=0;i<7&&n;i++,n=n.parentElement){if(/Search a stock\. Understand the move\./i.test(n.textContent||''))return true}return false}
  function classify(input){if(input.id==='headerSearch'||/Search MOVA/i.test(input.placeholder||''))return'header';if(input.id==='mnaAlertSymbol'||/AMD or GOLD/i.test(input.placeholder||''))return'alert';if(/Search a stock/i.test(input.placeholder||''))return'news';if(inPulseSearch(input))return'pulse';return''}
  function bind(input){if(!input||input.dataset.movaAutoBound==='1')return;var kind=classify(input);if(!kind)return;input.dataset.movaAutoBound='1';input.setAttribute('autocomplete','off');if(kind==='alert'){var f=input.closest('.mna-form');if(f)f.classList.add('mova-alert-form')}input.addEventListener('input',function(){render(input,kind)});input.addEventListener('focus',function(){if(input.value.trim())render(input,kind)});input.addEventListener('blur',function(){setTimeout(function(){hide(input)},140)});input.addEventListener('keydown',function(e){var box=ensureWrap(input),items=box?Array.from(box.querySelectorAll('.mova-auto-item')):[];if(e.key==='Escape'){hide(input);return}if(e.key==='ArrowDown'&&items.length){e.preventDefault();items[0].focus()}})}
  function scan(){document.querySelectorAll('input').forEach(bind)}
  var mo=new MutationObserver(scan);
  function start(){scan();mo.observe(document.body,{subtree:true,childList:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();</script>`;
html=html.replace('</body>',runtime+'</body>');

writeFileSync(file,html);
console.log('MOVA autocomplete now covers header, News, Pulse and Alerts; Alerts fields aligned.');
