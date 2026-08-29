import { rmSync, mkdirSync, copyFileSync, cpSync, readFileSync, writeFileSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
copyFileSync('index.html', 'dist/index.html');
cpSync('assets', 'dist/assets', { recursive: true });

const path = 'dist/index.html';
let html = readFileSync(path, 'utf8');

function replaceOne(from, to, label) {
  if (!html.includes(from)) throw new Error(`MOVA build patch could not find ${label}`);
  html = html.replace(from, to);
}

replaceOne(
  '.mova-ai-modal{position:fixed!important;inset:0!important;z-index:1200!important;',
  '.mova-ai-modal{position:fixed!important;inset:0!important;z-index:2147483647!important;',
  'AI modal z-index'
);

replaceOne(
  "function movaAiOpenModal(prefill=''){const modal=document.getElementById('movaAiModal'),input=document.getElementById('movaAiQuestion');if(!modal)return false;movaAiRenderSuggestions();",
  "function movaAiOpenModal(prefill=''){const modal=document.getElementById('movaAiModal'),input=document.getElementById('movaAiQuestion');if(!modal)return false;document.body.appendChild(modal);movaAiRenderSuggestions();",
  'AI modal open function'
);

replaceOne(
  "function movaAiEscape(v){return String(v??'').replace(/[&<>\\\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\\"':'&quot;'}[c]));}",
  "function movaAiEscape(v){return String(v??'').replace(/[&<>\\\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\\"':'&quot;'}[c]));}function movaAiErrorText(v){if(!v)return 'Unknown error';if(typeof v==='string')return v;if(v instanceof Error)return v.message||String(v);if(typeof v==='object'){if(typeof v.message==='string')return v.message;if(typeof v.error==='string')return v.error;if(v.error&&typeof v.error.message==='string')return v.error.message;try{return JSON.stringify(v)}catch(_){return 'Unknown error'}}return String(v);}",
  'AI error formatter insertion point'
);

replaceOne(
  "const d=await r.json();if(!r.ok||d.error)throw new Error(d.error||('Ask AI '+r.status));",
  "const raw=await r.text();let d={};try{d=raw?JSON.parse(raw):{}}catch(_){d={error:raw||('Ask AI '+r.status)}}if(!r.ok||d.error)throw new Error(movaAiErrorText(d.error||d)||('Ask AI '+r.status));",
  'AI response parser'
);

replaceOne(
  "movaAiAdd('error','MOVA AI could not complete this request: '+e.message)",
  "movaAiAdd('error','MOVA AI could not complete this request: '+movaAiErrorText(e))",
  'AI catch error rendering'
);

if (html.includes('<!-- MOVA BUILD v174 MOVA AI POPUP -->')) {
  html = html.replace('<!-- MOVA BUILD v174 MOVA AI POPUP -->', '<!-- MOVA BUILD v175 MOVA AI RUNTIME FIX -->');
}
if (html.includes('data-mova-build="v174-mova-ai-popup"')) {
  html = html.replace('data-mova-build="v174-mova-ai-popup"', 'data-mova-build="v175-mova-ai-runtime-fix"');
}

for (const check of [
  'z-index:2147483647!important',
  'document.body.appendChild(modal)',
  'function movaAiErrorText',
  'const raw=await r.text()',
  'movaAiErrorText(e)'
]) {
  if (!html.includes(check)) throw new Error(`MOVA build verification failed: ${check}`);
}

writeFileSync(path, html, 'utf8');
console.log('MOVA production HTML patched successfully.');
