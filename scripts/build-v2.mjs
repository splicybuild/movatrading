import { rmSync, mkdirSync, copyFileSync, cpSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });

function replaceRequired(source, find, replacement, label) {
  if (!source.includes(find)) throw new Error(`MOVA build patch missing: ${label}`);
  return source.replace(find, replacement);
}

const sourceDir = 'src/v2';
if (existsSync(sourceDir)) {
  const parts = readdirSync(sourceDir)
    .filter(file => /^part-\d+\.b64part$/.test(file))
    .sort();

  if (!parts.length) throw new Error('MOVA V2 source parts missing');

  const encoded = parts
    .map(file => readFileSync(`${sourceDir}/${file}`, 'utf8').trim())
    .join('');

  let html = gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');

  // V2.4.3 FIX 1: restore the exact high-resolution MOVA icon already in /assets.
  html = replaceRequired(
    html,
    'src="assets/MOVA-mobile-access-icon.svg" alt="MOVA icon"',
    'src="assets/mova-M-icon-logo.png" alt="MOVA icon"',
    'mobile ACCESS MOVA logo'
  );

  // V2.4.3 FIX 2: company research must open as its own app view from Home or Pulse.
  html = replaceRequired(
    html,
    `function openCompanyResearch(k){\n  recordMarketView(k);\n  const a=assets.find(x=>x.k===k),p=getProfile(k);if(!a||!p)return;\n  document.getElementById('pulse').classList.remove('active');companyResearchView.classList.add('open');`,
    `let companyResearchReturnPage='pulse';\nlet companyResearchReturnScroll=0;\nfunction openCompanyResearch(k){\n  recordMarketView(k);\n  const a=assets.find(x=>x.k===k),p=getProfile(k);if(!a||!p)return;\n  companyResearchReturnPage=pages.find(page=>document.getElementById(page)?.classList.contains('active'))||'pulse';\n  companyResearchReturnScroll=window.scrollY||0;\n  pages.forEach(page=>document.getElementById(page)?.classList.remove('active'));\n  document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav==='pulse'));\n  document.querySelectorAll('[data-mob]').forEach(b=>b.classList.toggle('active',b.dataset.mob==='pulse'));\n  companyResearchView.classList.add('open');`,
    'company research open state'
  );

  html = replaceRequired(
    html,
    `function closeCompanyResearch(){\n  companyResearchView.classList.remove('open');\n  document.getElementById('pulse').classList.add('active');\n  document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav==='pulse'));\n  document.querySelectorAll('[data-mob]').forEach(b=>b.classList.toggle('active',b.dataset.mob==='pulse'));\n  window.scrollTo({top:0,behavior:'auto'});updateTopButton();\n}`,
    `function closeCompanyResearch(){\n  companyResearchView.classList.remove('open');\n  const page=pages.includes(companyResearchReturnPage)?companyResearchReturnPage:'pulse';\n  pages.forEach(p=>document.getElementById(p)?.classList.toggle('active',p===page));\n  document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===page));\n  document.querySelectorAll('[data-mob]').forEach(b=>b.classList.toggle('active',b.dataset.mob===page));\n  requestAnimationFrame(()=>window.scrollTo({top:companyResearchReturnScroll,behavior:'auto'}));\n  updateTopButton();\n}`,
    'company research close state'
  );

  // V2.4.3 FIX 3: sector clicks open an immediate top-10 modal instead of content below the fold.
  html = replaceRequired(
    html,
    `function showSector(s){\n  const cards=sectors[s].map(k=>{const a=assets.find(x=>x.k===k);return \`<div class="card stock-card" onclick="openCompanyResearch('\${a.k}')"><span class="eyebrow">\${a.k}</span><strong>\${a.n}</strong><small>\${a.p} · <span class="\${a.c}">\${a.m}</span></small><small>\${a.signal}</small></div>\`}).join('');\n  sectorResults.innerHTML=\`<div class="section-head" style="margin-bottom:8px"><div><span class="eyebrow">SECTOR MEMBERS</span><h2 style="font-size:20px">\${s}</h2></div><button class="btn" onclick="sectorResults.classList.remove('open')">Close</button></div><div class="stock-grid">\${cards}</div>\`;\n  sectorResults.classList.add('open');\n}`,
    `function sectorModalCards(s){\n  const list=sectors[s]||[];\n  return list.map((k,i)=>{\n    const a=assets.find(x=>x.k===k),q=quoteFor(k);\n    if(!a)return'';\n    return \`<button type="button" class="sector-modal-row" onclick="openSectorCompany('\${a.k}')"><span class="sector-modal-rank">\${String(i+1).padStart(2,'0')}</span><span class="sector-modal-company"><b>\${a.k}</b><small>\${a.n}</small></span><span class="sector-modal-price"><b>\${q?.priceText||a.p}</b><small class="\${q?.className||a.c}">\${q?.changeText||a.m}</small></span><span class="sector-modal-arrow">›</span></button>\`;\n  }).join('');\n}\nfunction renderSectorModal(s){\n  modal(s,'TOP 10 · '+String(breadthPct[s]??'—')+'% BREADTH',\`<div class="sector-modal-intro">MOVA’s 10 tracked \${s.toLowerCase()} names. Tap any ticker to open its full company profile and analysis.</div><div class="sector-modal-list">\${sectorModalCards(s)}</div>\`);\n}\nasync function showSector(s){\n  renderSectorModal(s);\n  const symbols=(sectors[s]||[]).join(',');\n  if(!symbols||location.protocol==='file:')return;\n  try{\n    const r=await fetch('/api/market?symbols='+encodeURIComponent(symbols));\n    if(!r.ok)return;\n    const d=await r.json();\n    (d.assets||[]).forEach(q=>liveQuotes.set(q.ticker,q));\n    if(document.getElementById('modal')?.classList.contains('open')&&modalTitle.textContent===s){\n      modalBody.innerHTML=\`<div class="sector-modal-intro">MOVA’s 10 tracked \${s.toLowerCase()} names. Tap any ticker to open its full company profile and analysis.</div><div class="sector-modal-list">\${sectorModalCards(s)}</div>\`;\n    }\n  }catch(_){}\n}\nfunction openSectorCompany(k){closeModal();openCompanyResearch(k);}`,
    'sector modal behavior'
  );

  html = html.replace('<div id="sectorResults" class="sector-results"></div>', '');

  const sectorModalCss = `\n/* V2.4.3 sector popup */\n.sector-modal-intro{color:#8ca1b1;font-size:12px;line-height:1.55;margin:2px 0 12px}.sector-modal-list{display:grid;gap:7px}.sector-modal-row{display:grid;grid-template-columns:34px minmax(0,1fr) auto 20px;align-items:center;gap:10px;width:100%;padding:12px;border:1px solid var(--line);border-radius:13px;background:#061019;color:#eef5f8;text-align:left;cursor:pointer}.sector-modal-row:hover,.sector-modal-row:focus{border-color:rgba(66,187,255,.35);background:#0a1a25}.sector-modal-rank{color:#61798b;font-size:10px;font-weight:900}.sector-modal-company b{display:block;font-size:13px}.sector-modal-company small{display:block;color:#7890a1;font-size:10px;margin-top:2px}.sector-modal-price{text-align:right;white-space:nowrap}.sector-modal-price b{display:block;font-size:12px}.sector-modal-price small{display:block;font-size:10px;font-weight:900;margin-top:2px}.sector-modal-arrow{font-size:24px;color:#42bbff;text-align:right}@media(max-width:740px){.sector-modal-intro{font-size:13px!important}.sector-modal-list{gap:8px!important}.sector-modal-row{grid-template-columns:30px minmax(0,1fr) auto 16px!important;padding:13px 10px!important;min-height:65px!important}.sector-modal-company b{font-size:15px!important}.sector-modal-company small{font-size:11px!important}.sector-modal-price b{font-size:13px!important}.sector-modal-price small{font-size:11px!important}}\n`;
  html = replaceRequired(html, '</style>', sectorModalCss + '</style>', 'sector modal styles');

  writeFileSync('dist/index.html', html);
} else {
  copyFileSync('index.html', 'dist/index.html');
}

if (existsSync('assets')) {
  cpSync('assets', 'dist/assets', { recursive: true });
}

for (const file of ['favicon.ico', 'manifest.webmanifest', 'mova-favicon.svg']) {
  if (existsSync(file)) copyFileSync(file, `dist/${file}`);
}

console.log('MOVA V2.4.3 preview build complete.');
