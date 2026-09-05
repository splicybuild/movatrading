import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

html=html.replace(
  '<div class="full"><button class="mova-clean-btn" type="submit">Save setup</button> <span id="movaNativeSetupStatus" class="mova-clean-note"></span></div>',
  '<div class="full"><div id="movaSetupValidation" class="mova-setup-validation"></div><button class="mova-clean-btn" type="submit">Save setup</button> <span id="movaNativeSetupStatus" class="mova-clean-note"></span></div>'
);

const css=`<style id="mova-setup-validation-style">
.mova-setup-validation{display:none;margin:4px 0 12px;border:1px solid #1c455b;border-radius:13px;background:#06131c;padding:12px}.mova-setup-validation.show{display:block}.mova-setup-validation.good{border-color:rgba(102,255,138,.28)}.mova-setup-validation.warn{border-color:rgba(255,190,80,.32)}.mova-setup-validation.error{border-color:rgba(255,105,120,.55);background:rgba(255,105,120,.07)}.mova-validation-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.mova-validation-head strong{font-size:12px}.mova-rr{font-size:12px;font-weight:1000;color:#66ff8a}.mova-validation-list{margin:8px 0 0;padding-left:18px;color:#9cb0be;font-size:11px;line-height:1.55}.mova-setup-validation.error .mova-validation-list{color:#ffb2ba}.mova-validation-list li+li{margin-top:3px}.mova-validation-ok{margin-top:7px;color:#8fbca0;font-size:11px}
</style>`;
html=html.replace('</head>',css+'</head>');

['movaV2Direction','movaV2Entry','movaV2Stop','movaV2Support','movaV2Resistance','movaV2Target'].forEach(id=>{
  html=html.replace(new RegExp('id="'+id+'"'), 'id="'+id+'" oninput="movaNativeValidateSetup()" onchange="movaNativeValidateSetup()"');
});

const nativeFns=`
function movaNativeNumber(v){
  var s=String(v==null?'':v).replace(/[$£€,]/g,' ').replace(/[–—]/g,'-').trim();
  var m=s.match(/-?\\d+(?:\\.\\d+)?/g);if(!m||!m.length)return null;
  return Number(m[0]);
}
function movaNativeEntryBounds(v){
  var s=String(v==null?'':v).replace(/[$£€,]/g,' ').replace(/[–—]/g,'-').trim();
  var m=s.match(/\\d+(?:\\.\\d+)?/g);if(!m||!m.length)return {low:null,high:null,mid:null};
  var a=Number(m[0]),b=m.length>=2?Number(m[1]):a;
  var low=Math.min(a,b),high=Math.max(a,b);return {low:low,high:high,mid:(low+high)/2};
}
function movaNativeValidateSetup(){
  var box=document.getElementById('movaSetupValidation');if(!box)return {errors:[],warnings:[],rr:null};
  var direction=(document.getElementById('movaV2Direction')?.value||'Long');
  var eb=movaNativeEntryBounds(document.getElementById('movaV2Entry')?.value||'');
  var entry=eb.mid,stop=movaNativeNumber(document.getElementById('movaV2Stop')?.value||''),support=movaNativeNumber(document.getElementById('movaV2Support')?.value||''),resistance=movaNativeNumber(document.getElementById('movaV2Resistance')?.value||''),target=movaNativeNumber(document.getElementById('movaV2Target')?.value||'');
  var errors=[],warnings=[],rr=null,isLong=direction==='Long',isShort=direction==='Short';
  if(stop!=null&&eb.low!=null){
    if(isLong&&stop>=eb.low)errors.push('Invalid Long setup: the stop must be below the entry zone.');
    if(isShort&&stop<=eb.high)errors.push('Invalid Short setup: the stop must be above the entry zone.');
  }
  if(target!=null&&eb.high!=null){
    if(isLong&&target<=eb.high)errors.push('Invalid Long setup: the profit target must be above the entry zone.');
    if(isShort&&target>=eb.low)errors.push('Invalid Short setup: the profit target must be below the entry zone.');
  }
  if(support!=null&&resistance!=null&&support>=resistance)errors.push('Support must be below resistance.');
  if(isLong&&support!=null&&eb.low!=null&&support>eb.high)warnings.push('For a Long setup, support is usually at or below the entry area.');
  if(isShort&&resistance!=null&&eb.high!=null&&resistance<eb.low)warnings.push('For a Short setup, resistance is usually at or above the entry area.');
  if(entry!=null&&stop!=null&&target!=null){
    var risk=Math.abs(entry-stop),reward=Math.abs(target-entry);
    if(risk>0){rr=reward/risk;if(rr<1)warnings.push('Risk/reward is below 1:1. The potential loss is larger than the potential gain.');else if(rr<1.5)warnings.push('Risk/reward is below 1.5:1. Consider whether the reward justifies the risk.');}
  }
  if(entry==null&&stop==null&&target==null){box.className='mova-setup-validation';box.innerHTML='';return {errors:errors,warnings:warnings,rr:rr}}
  var head='<div class="mova-validation-head"><strong>SETUP CHECK</strong>'+(rr!=null?'<span class="mova-rr">Risk / Reward '+rr.toFixed(2)+':1</span>':'')+'</div>';
  var all=errors.concat(warnings);
  if(errors.length){box.className='mova-setup-validation show error';box.innerHTML=head+'<ul class="mova-validation-list">'+all.map(function(x){return '<li>'+movaNativeSetupEsc(x)+'</li>'}).join('')+'</ul>'}
  else if(warnings.length){box.className='mova-setup-validation show warn';box.innerHTML=head+'<ul class="mova-validation-list">'+warnings.map(function(x){return '<li>'+movaNativeSetupEsc(x)+'</li>'}).join('')+'</ul>'}
  else{box.className='mova-setup-validation show good';box.innerHTML=head+'<div class="mova-validation-ok">No obvious structural conflicts found. This is guidance, not a guarantee the trade will work.</div>'}
  return {errors:errors,warnings:warnings,rr:rr};
}
`;
const marker='function openCompanyResearch(';
const pos=html.indexOf(marker);if(pos<0)throw new Error('native script marker not found');
const scriptEnd=html.indexOf('</script>',pos);if(scriptEnd<0)throw new Error('native script end not found');
new Function(nativeFns);
html=html.slice(0,scriptEnd)+nativeFns+html.slice(scriptEnd);

html=html.replace(
  "if(!ticker){if(status)status.textContent='Enter a ticker.';return false}",
  "var check=movaNativeValidateSetup();if(check.errors&&check.errors.length){if(status)status.textContent='Fix the setup errors before saving.';return false}\n  if(!ticker){if(status)status.textContent='Enter a ticker.';return false}"
);

html=html.replace(
  "document.getElementById('movaV2SetupForm')?.scrollIntoView({behavior:'smooth',block:'start'});",
  "movaNativeValidateSetup();\n  document.getElementById('movaV2SetupForm')?.scrollIntoView({behavior:'smooth',block:'start'});"
);

writeFileSync(file,html);
console.log('MOVA Setup Builder blocking validation complete.');
