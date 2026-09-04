import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

const oldOpenAsset=`function openAsset(k){
  recordMarketView(k);
 const a=assets.find(x=>x.k===k);
 if(!a)return;
 modal(a.n,\`${'${a.sector}'} · ${'${a.k}'}\`,\`<div class="detail"><div><span>Price</span><b>${'${a.p}'}</b></div><div><span>Move</span><b class="${'${a.c}'}">${'${a.m}'}</b></div><div><span>MOVA read</span><b>${'${a.signal}'}</b></div></div><p>${'${a.why}'}</p><button class="btn primary" style="width:100%" onclick="closeModal();go('pulse');pulseInput.value='${'${a.k}'}';searchPulse()">Open in Pulse →</button>\`);
}`;

if(!html.includes(oldOpenAsset)) throw new Error('Direct company navigation patch: openAsset function not found');

html=html.replace(oldOpenAsset,`function openAsset(k){
  recordMarketView(k);
  const a=assets.find(x=>x.k===k);
  if(!a)return;
  openCompanyResearch(k);
}`);

writeFileSync(file,html);
console.log('MOVA direct ticker-to-company navigation patch complete; stable company visuals left untouched.');
