import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

// Remove older injected news loaders to avoid competing messages/renderers.
html=html.replace(/<script id="mova-news-restore-v2">[\s\S]*?<\/script>/g,'');
html=html.replace(/<script id="mova-account-news-v3-runtime">[\s\S]*?<\/script>/g,'');
html=html.replace(/<script id="mova-account-news-v4-runtime">[\s\S]*?<\/script>/g,'');
html=html.replace(/<script id="mova-account-v5-runtime">[\s\S]*?<\/script>/g,'');
html=html.replace(/<div id="movaAuthV5"[\s\S]*?<\/div><\/div><\/div>/g,'');

// News should always show the built-in stories immediately, then upgrade to live stories if API succeeds.
html=html.replace(/async function renderNews\(\)\{[\s\S]*?\n\}/, `function renderNews(){
  const grid=document.getElementById('newsGrid');
  if(!grid)return;
  const fallback=(Array.isArray(newsItems)?newsItems:[]).slice(0,10);
  grid.innerHTML=fallback.map((n,i)=>\`<article class="card news-card" onclick="window.open('\\${n.url}','_blank','noopener')"><img class="news-img" src="\\${n.img}" alt="" loading="lazy" onerror="this.style.display='none'"><div class="news-copy"><span class="eyebrow">\\${n.tag} · \\${n.date}</span><h3>\\${n.title}</h3><p>\\${n.desc}</p><div class="news-meta"><span>Reuters</span><span>Open full article ↗</span></div></div></article>\`).join('');
  fetch('/api/news?symbols=NVDA,MSFT,AAPL,AMZN,META,GOOGL,TSLA,AVGO,AMD,NFLX',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{
    const items=(d.items||[]).slice(0,10);if(!items.length)return;
    const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    grid.innerHTML=items.map(n=>{const img=n.image?'<img class="news-img" src="'+esc(n.image)+'" alt="" loading="lazy" onerror="this.style.display=\\'none\\'">':'';return '<article class="card news-card" onclick="window.open(\\''+esc(n.url||'#')+'\\',\\'_blank\\',\\'noopener\\')">'+img+'<div class="news-copy"><span class="eyebrow">'+esc(n.source||'Market news')+'</span><h3>'+esc(n.title||n.headline||'Market story')+'</h3><p>'+esc((n.summary||n.body||'').slice(0,220))+'</p><div class="news-meta"><span>'+esc(n.source||'Market news')+'</span><span>Open full article ↗</span></div></div></article>'}).join('');
  }).catch(()=>{});
}`);

// Replace legacy desktop account opener so it always defers to the consolidated account system.
html=html.replace(/function openAccount\(\)\{[\s\S]*?\}\n  function closeAccount/, `function openAccount(){if(typeof window.movaOpenAccountV6==='function'){window.movaOpenAccountV6();return}ensureAccountModal();getProfile()?profileAccount():guestAccount();accountModal.classList.add('open')}
  function closeAccount`);

const css=`<style id="mova-account-v6-style">
.mova-auth-v6{display:none;position:fixed;inset:0;z-index:2147483647;background:#041018;color:#eef5f8;overflow:auto}.mova-auth-v6.open{display:block}.mova-auth-v6-shell{width:min(760px,calc(100% - 28px));margin:70px auto;padding:24px;border:1px solid #153446;border-radius:20px;background:#06131c}.mova-auth-v6-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.mova-auth-v6-close{width:40px;height:40px;border-radius:50%;border:1px solid #21475b;background:#071722;color:#fff;font-size:20px;cursor:pointer}.mova-auth-v6-tabs{display:flex;gap:8px;margin:18px 0}.mova-auth-v6-tabs button{min-height:42px;border:1px solid #21475b;border-radius:11px;background:#071722;color:#9db0bd;padding:0 14px;font-weight:800;cursor:pointer}.mova-auth-v6-tabs button.active{background:#0a2230;color:#fff;border-color:#42bbff}.mova-auth-v6-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.mova-auth-v6-form label{display:grid;gap:6px;color:#8ba0af;font-size:11px;font-weight:800}.mova-auth-v6-form .full{grid-column:1/-1}.mova-auth-v6-input{min-height:46px;border:1px solid #193e54;border-radius:12px;background:#05111a;color:#f2f7fa;padding:0 12px;font:inherit}.mova-auth-v6-btn{min-height:46px;border:0;border-radius:12px;background:linear-gradient(135deg,#42bbff,#66ff8a);color:#041018;font-weight:900;cursor:pointer;padding:0 16px}.mova-auth-v6-note{margin-top:12px;color:#7890a1;font-size:11px;line-height:1.5}.mova-auth-v6-error{margin-top:10px;color:#ff9aa3;font-size:12px}.mova-auth-v6-success{margin-top:10px;color:#66ff8a;font-size:12px}@media(max-width:740px){.mova-auth-v6-shell{margin:18px auto}.mova-auth-v6-form{grid-template-columns:1fr}.mova-auth-v6-form .full{grid-column:auto}}
</style>`;
html=html.replace('</head>',css+'</head>');
html=html.replace('</body>',`<div id="movaAuthV6" class="mova-auth-v6"><div class="mova-auth-v6-shell"><div class="mova-auth-v6-head"><div><span class="eyebrow">MOVA ACCOUNT</span><h2 id="movaAuthV6Title">Access your account</h2></div><button id="movaAuthV6Close" class="mova-auth-v6-close" type="button">×</button></div><div id="movaAuthV6Body"></div></div></div></body>`);

const runtime=`<script id="mova-account-v6-runtime">(function(){
const ACCOUNT='movaAccountV6',SESSION='movaAccountSessionV6',PROFILE='movaMobileProfileV1';
const byId=id=>document.getElementById(id);
const get=(k,d=null)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v}catch(e){return d}};
const put=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};
const del=k=>{try{localStorage.removeItem(k)}catch(e){}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function acc(){return get(ACCOUNT)}function sess(){return get(SESSION)}function signed(){const a=acc(),s=sess();return !!(a&&s&&String(a.email).toLowerCase()===String(s.email).toLowerCase())}
function sync(a){if(a?.profile)put(PROFILE,a.profile);if(typeof updateMobileProfileChip==='function')updateMobileProfileChip()}
function closeAuth(){byId('movaAuthV6')?.classList.remove('open');document.body.style.overflow=''}
function openWorkspace(){const a=acc();if(!a||!signed()){openAuth(a?'signin':'create');return}sync(a);closeAuth();byId('movaDesktopAccountModal')?.classList.remove('open');byId('mobileAccess')?.classList.remove('open');if(typeof window.movaOpenAccountWorkspaceV2==='function')window.movaOpenAccountWorkspaceV2('profile')}
function openAuth(mode){byId('movaDesktopAccountModal')?.classList.remove('open');byId('mobileAccess')?.classList.remove('open');byId('movaAuthV6')?.classList.add('open');document.body.style.overflow='hidden';render(mode||'signin')}
function render(mode){const a=acc(),body=byId('movaAuthV6Body'),create=mode==='create';if(!body)return;byId('movaAuthV6Title').textContent=create?'Create your MOVA account':'Sign in to MOVA';body.innerHTML='<div class="mova-auth-v6-tabs"><button id="v6SignTab" class="'+(!create?'active':'')+'">Sign in</button><button id="v6CreateTab" class="'+(create?'active':'')+'">Create account</button></div>'+(create?'<form id="v6Create" class="mova-auth-v6-form"><label>FIRST NAME<input id="v6First" class="mova-auth-v6-input" required></label><label>EMAIL<input id="v6Email" class="mova-auth-v6-input" type="email" required></label><label>PASSWORD<input id="v6Pass" class="mova-auth-v6-input" type="password" minlength="8" required></label><label>CONFIRM PASSWORD<input id="v6Confirm" class="mova-auth-v6-input" type="password" minlength="8" required></label><label>EXPERIENCE<select id="v6Exp" class="mova-auth-v6-input"><option>Beginner</option><option>Intermediate</option><option>Experienced</option></select></label><label>PRIMARY FOCUS<select id="v6Focus" class="mova-auth-v6-input"><option>Stocks</option><option>Nasdaq 100</option><option>Commodities</option><option>Mixed markets</option></select></label><label class="full">STYLE<select id="v6Style" class="mova-auth-v6-input"><option>Long-term investor</option><option>Swing trader</option><option>Day trader</option><option>Learning / research</option></select></label><div class="full"><button class="mova-auth-v6-btn" type="submit">Create account</button><div id="v6Msg" class="mova-auth-v6-error"></div></div></form>':'<form id="v6Login" class="mova-auth-v6-form"><label class="full">EMAIL<input id="v6LoginEmail" class="mova-auth-v6-input" type="email" required value="'+esc(a?.email||'')+'"></label><label class="full">PASSWORD<input id="v6LoginPass" class="mova-auth-v6-input" type="password" required></label><div class="full"><button class="mova-auth-v6-btn" type="submit">Sign in</button><div id="v6Msg" class="mova-auth-v6-error"></div></div></form>')+'<p class="mova-auth-v6-note">This preview keeps the account on this browser only. The production version will need server-backed authentication for cross-device sign-in and email verification.</p>';
byId('v6SignTab').onclick=()=>render('signin');byId('v6CreateTab').onclick=()=>render('create');
if(create){byId('v6Create').onsubmit=e=>{e.preventDefault();const msg=byId('v6Msg'),pw=byId('v6Pass').value,cf=byId('v6Confirm').value;if(pw.length<8){msg.textContent='Password must be at least 8 characters.';return}if(pw!==cf){msg.textContent='Passwords do not match.';return}const profile={firstName:byId('v6First').value.trim(),email:byId('v6Email').value.trim().toLowerCase(),experience:byId('v6Exp').value,focus:byId('v6Focus').value,style:byId('v6Style').value,createdAt:new Date().toISOString()};const rec={email:profile.email,password:pw,profile,createdAt:Date.now()};if(!put(ACCOUNT,rec)||!put(SESSION,{email:rec.email,at:Date.now()})){msg.textContent='This browser blocked account storage.';return}sync(rec);msg.className='mova-auth-v6-success';msg.textContent='Account created. Opening your profile…';setTimeout(openWorkspace,100)}}else{byId('v6Login').onsubmit=e=>{e.preventDefault();const msg=byId('v6Msg'),rec=acc(),email=byId('v6LoginEmail').value.trim().toLowerCase(),pw=byId('v6LoginPass').value;if(!rec){msg.textContent='No saved MOVA account exists on this browser yet.';return}if(email!==String(rec.email).toLowerCase()||pw!==String(rec.password)){msg.textContent='Email or password is incorrect.';return}if(!put(SESSION,{email:rec.email,at:Date.now()})){msg.textContent='This browser blocked sign-in storage.';return}sync(rec);msg.className='mova-auth-v6-success';msg.textContent='Signed in. Opening your profile…';setTimeout(openWorkspace,80)}}
}
window.movaOpenAccountV6=function(){const a=acc();if(a&&signed())openWorkspace();else openAuth(a?'signin':'create')};
window.openAccountAccess=window.movaOpenAccountV6;
window.movaSignOutV6=function(){del(SESSION);byId('movaAccountWorkspaceV2')?.classList.remove('open');openAuth('signin')};
byId('movaAuthV6Close').onclick=closeAuth;
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.mova-desktop-account-btn,#mobileProfileChip');if(!b)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();window.movaOpenAccountV6()},true);
if(signed())sync(acc());
})();</script>`;
html=html.replace('</body>',runtime+'</body>');
writeFileSync(file,html);
console.log('MOVA consolidated account + news v6 complete.');
