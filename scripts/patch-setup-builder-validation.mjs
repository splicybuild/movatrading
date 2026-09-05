import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

// Add live validation panel below the Setup Builder fields.
html=html.replace(
  '<div class="full"><button class="mova-clean-btn" type="submit">Save setup</button> <span id="movaNativeSetupStatus" class="mova-clean-note"></span></div>',
  '<div class="full"><div id="movaSetupValidation" class="mova-setup-validation"></div><button class="mova-clean-btn" type="submit">Save setup</button> <span id="movaNativeSetupStatus" class="mova-clean-note"></span></div>'
);

const css=`<style id="mova-setup-validation-style">
.mova-setup-validation{display:none;margin:4px 0 12px;border:1px solid #1c455b;border-radius:13px;background:#06131c;padding:12px}.mova-setup-validation.show{display:block}.mova-setup-validation.good{border-color:rgba(102,255,138,.28)}.mova-setup-validation.warn{border-color:rgba(255,190,80,.32)}.mova-validation-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.mova-validation-head strong{font-size:12px}.mova-rr{font-size:12px;font-weight:1000;color:#66ff8a}.mova-validation-list{margin:8px 0 0;padding-left:18px;color:#9cb0be;font-size:11px;line-height:1.55}.mova-validation-list li+li{margin-top:3px}.mova-validation-ok{margin-top:7px;color:#8fbca0;font-size:11px}
</style>`;
html=html.replace('</head>',css+'</head>');

// Attach live validation triggers to the existing inputs/select.
['movaV2Direction','movaV2Entry','movaV2Stop','movaV2Support','movaV2Resistance','movaV2Target'].forEach(id=>{
  html=html.replace(new RegExp('id="'+id+'"'), 'id="'+id+'" oninput="movaNativeValidateSetup()" onchange="movaNativeValidateSetup()"');
});

const nativeFns=`
function movaNativeNumber(v){
  var s=String(v==null?'':v).replace(/[$£€,]/g,' ').replace(/[–—]/g,'-').trim();
  var m=s.match(/-?\d+(?:\.\d+)?/g);if(!m||!m.length)return null;
  return Number(m[0]);
}
function movaNativeEntryMid(v){
  var s=String(v==null?'':v).replace(/[$£€,]/g,' ').replace(/[–—]/g,'-').trim();
  var m=s.match(/\d+(?:\.\d+)?/g);if(!m||!m.length)return null;
  if(m.length>=2)return (Number(m[0])+Number(m[1]))/2;
  return Number(m[0]);
}
function movaNativeValidateSetup(){
  var box=document.getElementById('movaSetupValidation');if(!box)return {warnings:[]};
  var direction=(document.getElementById('movaV2Direction')?.value||'Long');
  var entry=movaNativeEntryMid(document.getElementById('movaV2Entry')?.value||'');
  var stop=movaNativeNumber(document.getElementById('movaV2Stop')?.value||'');
  var support=movaNativeNumber(document.getElementById('movaV2Support')?.value||'');
  var resistance=movaNativeNumber(document.getElementById('movaV2Resistance')?.value||'');
  var target=movaNativeNumber(document.getElementById('movaV2Target')?.value||'');
  var w=[],rr=null;
  var isLong=direction==='Long',isShort=direction==='Short';
  if(entry!=null&&stop!=null){
    if(isLong&&stop>=entry)w.push('For a Long setup, the stop is usually below the entry zone.');
    if(isShort&&stop<=entry)w.push('For a Short setup, the stop is usually above the entry zone.');
  }
  if(entry!=null&&target!=null){
    if(isLong&&target<=entry)w.push('For a Long setup, the profit target is usually above the entry zone.');
    if(isShort&&target>=entry)w.push('For a Short setup, the profit target is usually below the entry zone.');
  }
  if(support!=null&&resistance!=null&&support>=resistance)w.push('Support is normally below resistance. Check those levels.');
  if(isLong&&support!=null&&entry!=null&&support>entry)w.push('For a Long setup, support is often at or below the entry area.');
  if(isShort&&resistance!=null&&entry!=null&&resistance<entry)w.push('For a Short setup, resistance is often at or above the entry area.');
  if(entry!=null&&stop!=null&&target!=null){
    var risk=Math.abs(entry-stop),reward=Math.abs(target-entry);
    if(risk>0){rr=reward/risk;if(rr<1)w.push('Risk/reward is below 1:1. The potential loss is larger than the potential gain.');else if(rr<1.5)w.push('Risk/reward is below 1.5:1. Consider whether the reward justifies the risk.');}
  }
  if(entry==null&&stop==null&&target==null){box.className='mova-setup-validation';box.innerHTML='';return {warnings:w,rr:rr}}
  var head='<div class="mova-validation-head"><strong>SETUP CHECK</strong>'+(rr!=null?'<span class="mova-rr">Risk / Reward '+rr.toFixed(2)+':1</span>':'')+'</div>';
  if(w.length){box.className='mova-setup-validation show warn';box.innerHTML=head+'<ul class="mova-validation-list">'+w.map(function(x){return '<li>'+movaNativeSetupEsc(x)+'</li>'}).join('')+'</ul>'}
  else{box.className='mova-setup-validation show good';box.innerHTML=head+'<div class="mova-validation-ok">No obvious structural conflicts found. This is guidance, not a guarantee the trade will work.</div>'}
  return {warnings:w,rr:rr};
}
`;
const marker='function openCompanyResearch(';
const pos=html.indexOf(marker);if(pos<0)throw new Error('native script marker not found');
const scriptEnd=html.indexOf('</script>',pos);if(scriptEnd<0)throw new Error('native script end not found');
new Function(nativeFns);
html=html.slice(0,scriptEnd)+nativeFns+html.slice(scriptEnd);

// Validate after loading a saved setup.
html=html.replace(
  "document.getElementById('movaV2SetupForm')?.scrollIntoView({behavior:'smooth',block:'start'});",
  "movaNativeValidateSetup();\n  document.getElementById('movaV2SetupForm')?.scrollIntoView({behavior:'smooth',block:'start'});"
);

writeFileSync(file,html);
console.log('MOVA Setup Builder validation complete.');
