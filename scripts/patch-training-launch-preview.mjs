import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');
const js=`(function(){
function ensurePreviewProfile(){
  try{
    if(typeof getMobileProfile==='function'){
      var p=getMobileProfile();if(p)return p;
    }
  }catch(e){}
  var keys=['movaMobileProfileV1','movaProfileV1','movaProfile','movaAccountProfileV1'];
  for(var i=0;i<keys.length;i++){
    try{var raw=localStorage.getItem(keys[i]);if(raw){var p=JSON.parse(raw);if(p)return p}}catch(e){}
  }
  var temp={firstName:'Preview',lastName:'User',email:'preview@mova.local'};
  try{localStorage.setItem('movaMobileProfileV1',JSON.stringify(temp))}catch(e){}
  return temp;
}
function openTrainingWorkspace(){
  ensurePreviewProfile();
  if(window.MovaAccountWorkspace&&typeof window.MovaAccountWorkspace.open==='function'){
    var r=window.MovaAccountWorkspace.open('training');
    if(r!==false)return;
  }
  setTimeout(function(){
    if(window.MovaAccountWorkspace&&typeof window.MovaAccountWorkspace.open==='function')window.MovaAccountWorkspace.open('training');
  },100);
}
function bind(){
  var b=document.getElementById('movaStaticTraining');
  if(b){b.onclick=openTrainingWorkspace;b.setAttribute('data-training-launch','wired')}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
setTimeout(bind,250);setTimeout(bind,800);
window.MovaOpenTrainingWorkspace=openTrainingWorkspace;
})();`;
new Function(js);
html=html.replace('</body>','<script id="mova-training-launch-preview-v1">'+js+'</script></body>');
writeFileSync(file,html);
console.log('MOVA training launcher preview patch complete.');
