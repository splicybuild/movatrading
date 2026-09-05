import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

// Trade Lab: Training Mode is now just an entry point to the signed-in Profile workspace.
html=html.replace('Practise with virtual funds using live prices. Account controls sit under your profile workspace.','Your Training Account is managed from your MOVA profile, alongside investments, alerts and settings.');
html=html.replace('>Open Training Account</button>','>See Profile</button>');

const runtime=`<script id="mova-account-profile-entry-v9">(function(){
function accountOpen(){
  if(typeof window.movaAccountOpenV8==='function'){window.movaAccountOpenV8();return true}
  if(typeof window.openAccountAccess==='function'){window.openAccountAccess();return true}
  return false
}

// Capture the header/profile control before any older handler can swallow the click.
document.addEventListener('click',function(e){
  const b=e.target.closest&&e.target.closest('.mova-desktop-account-btn,#mobileProfileChip');
  if(!b)return;
  e.preventDefault();
  e.stopPropagation();
  if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  accountOpen();
},true);

// Trade Lab Training Mode button now opens the user's Profile workspace/login flow.
document.addEventListener('click',function(e){
  const b=e.target.closest&&e.target.closest('#movaV2Training');
  if(!b)return;
  e.preventDefault();
  e.stopPropagation();
  if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  accountOpen();
},true);

// Keep button wording correct if the Trade Lab is re-rendered by its own runtime.
function fixTrainingCard(){
  const b=document.getElementById('movaV2Training');
  if(!b)return;
  b.textContent='See Profile';
  const card=b.closest('.mova-clean-card');
  const p=card&&card.querySelector('p');
  if(p)p.textContent='Your Training Account is managed from your MOVA profile, alongside investments, alerts and settings.';
}
fixTrainingCard();
const lab=document.getElementById('portfolio');
if(lab)new MutationObserver(fixTrainingCard).observe(lab,{childList:true,subtree:true});
})();</script>`;
html=html.replace('</body>',runtime+'</body>');

writeFileSync(file,html);
console.log('MOVA profile entry + Trade Lab profile link v9 complete.');
