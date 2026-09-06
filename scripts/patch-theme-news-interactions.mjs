import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

// MOVA now uses its intended dark interface only. Replace the old Theme
// selector with a useful account preference instead.
const oldTheme='<select class="mna-input" style="width:160px"><option>Dark</option><option>Light</option></select>';
const accountStart='<select id="mnaAccountStartSelect" class="mna-input" style="width:190px" onchange="movaNASetAccountStart(this.value)"><option value="profile">Profile</option><option value="training">Training Account</option><option value="investments">Investments</option><option value="alerts">Alerts</option></select>';
if(!html.includes('<span>Theme</span>'+oldTheme))throw new Error('Theme settings row not found');
html=html.replace('<span>Theme</span>'+oldTheme,'<span>Account opens to</span>'+accountStart);
html=html.replace('Notification, profile and appearance settings.','Notification, profile and account preferences.');

const helpers=`
function movaNASetAccountStart(value){
  var allowed=['profile','training','investments','alerts'];
  var next=allowed.includes(String(value||''))?String(value):'profile';
  try{localStorage.setItem('movaAccountStartV1',next)}catch(e){}
}
function movaNAApplyAccountSettings(){
  document.body.classList.remove('mova-light-theme');
  try{localStorage.removeItem('movaThemeV1')}catch(e){}
  var img=document.querySelector('.brand.mova-brand-v187 img');
  if(img)img.src='assets/MOVA-NEW-Iconword-W-logo.svg?v=187';
  var value='profile';
  try{value=localStorage.getItem('movaAccountStartV1')||'profile'}catch(e){}
  var sel=document.getElementById('mnaAccountStartSelect');
  if(sel)sel.value=['profile','training','investments','alerts'].includes(value)?value:'profile';
}
`;

const marker='function openCompanyResearch(';
const pos=html.indexOf(marker);if(pos<0)throw new Error('main app marker not found');
const scriptStart=html.lastIndexOf('<script',pos),openEnd=html.indexOf('>',scriptStart);if(scriptStart<0||openEnd<0)throw new Error('main app script start not found');
new Function(helpers);
html=html.slice(0,openEnd+1)+helpers+html.slice(openEnd+1);

const oldOpen="function movaNAOpen(){movaNAEnsureUI();if(movaNASigned())movaNAWorkspace('profile');else movaNAOpenAuth(movaNAAccount()?'signin':'create')}";
const newOpen="function movaNAOpen(){movaNAEnsureUI();if(movaNASigned()){var start='profile';try{start=localStorage.getItem('movaAccountStartV1')||'profile'}catch(e){};if(!['profile','training','investments','alerts'].includes(start))start='profile';movaNAWorkspace(start)}else movaNAOpenAuth(movaNAAccount()?'signin':'create')}";
if(!html.includes(oldOpen))throw new Error('Account open function not found');
html=html.replace(oldOpen,newOpen);

html=html.replace("if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',movaNativeAccountBoot);else movaNativeAccountBoot();","if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){movaNativeAccountBoot();movaNAApplyAccountSettings()});else{movaNativeAccountBoot();movaNAApplyAccountSettings()}");
html=html.replace("if(section==='settings')document.getElementById('mnaSignOut').onclick=function(){","if(section==='settings'){movaNAApplyAccountSettings();document.getElementById('mnaSignOut').onclick=function(){");
html=html.replace("movaNACloseWorkspace();movaNAOpenAuth('signin')}}","movaNACloseWorkspace();movaNAOpenAuth('signin')}}}");

writeFileSync(file,html);
console.log('MOVA dark-only settings applied: Theme removed and Account opens to preference added.');
