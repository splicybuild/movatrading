import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

// MOVA now uses its intended dark interface only. Replace the old Theme
// selector with a useful live-market display preference instead.
const oldTheme='<select class="mna-input" style="width:160px"><option>Dark</option><option>Light</option></select>';
const tickerSpeed='<select id="mnaTickerSpeedSelect" class="mna-input" style="width:160px" onchange="movaNASetTickerSpeed(this.value)"><option value="slow">Slow</option><option value="normal">Normal</option><option value="fast">Fast</option></select>';
if(!html.includes('<span>Theme</span>'+oldTheme))throw new Error('Theme settings row not found');
html=html.replace('<span>Theme</span>'+oldTheme,'<span>Ticker speed</span>'+tickerSpeed);
html=html.replace('Notification, profile and appearance settings.','Notification and live market display settings.');

const helpers=`
function movaNASetTickerSpeed(value){
  var allowed=['slow','normal','fast'];
  var next=allowed.includes(String(value||''))?String(value):'normal';
  try{localStorage.setItem('movaTickerSpeedV1',next)}catch(e){}
}
function movaNAApplyAccountSettings(){
  document.body.classList.remove('mova-light-theme');
  try{localStorage.removeItem('movaThemeV1');localStorage.removeItem('movaAccountStartV1')}catch(e){}
  var img=document.querySelector('.brand.mova-brand-v187 img');
  if(img)img.src='assets/MOVA-NEW-Iconword-W-logo.svg?v=187';
  var value='normal';
  try{value=localStorage.getItem('movaTickerSpeedV1')||'normal'}catch(e){}
  var sel=document.getElementById('mnaTickerSpeedSelect');
  if(sel)sel.value=['slow','normal','fast'].includes(value)?value:'normal';
}
`;

const marker='function openCompanyResearch(';
const pos=html.indexOf(marker);if(pos<0)throw new Error('main app marker not found');
const scriptStart=html.lastIndexOf('<script',pos),openEnd=html.indexOf('>',scriptStart);if(scriptStart<0||openEnd<0)throw new Error('main app script start not found');
new Function(helpers);
html=html.slice(0,openEnd+1)+helpers+html.slice(openEnd+1);

html=html.replace("if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',movaNativeAccountBoot);else movaNativeAccountBoot();","if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){movaNativeAccountBoot();movaNAApplyAccountSettings()});else{movaNativeAccountBoot();movaNAApplyAccountSettings()}");
html=html.replace("if(section==='settings')document.getElementById('mnaSignOut').onclick=function(){","if(section==='settings'){movaNAApplyAccountSettings();document.getElementById('mnaSignOut').onclick=function(){");
html=html.replace("movaNACloseWorkspace();movaNAOpenAuth('signin')}}","movaNACloseWorkspace();movaNAOpenAuth('signin')}}}");

writeFileSync(file,html);
console.log('MOVA dark-only settings applied: Theme removed and Ticker speed preference added.');
