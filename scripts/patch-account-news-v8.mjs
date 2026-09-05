import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

// Remove the account-workspace news helper so only one News renderer controls #newsGrid.
html=html.replace(/<script id="mova-news-restore-v2">[\s\S]*?<\/script>/g,'');

// Replace the app's own News renderer. Built-in stories render immediately; live stories may replace them.
const oldRender=/function renderNews\(\)\{[\s\S]*?\n\}/;
if(!oldRender.test(html)) throw new Error('renderNews function not found');
html=html.replace(oldRender, `function renderNews(){
  const grid=document.getElementById('newsGrid');
  if(!grid)return;
  grid.style.display='grid';
  const fallback=(Array.isArray(newsItems)?newsItems:[]).slice(0,10);
  grid.innerHTML=fallback.map(function(n){
    return '<article class="card news-card" onclick="window.open(\\''+n.url+'\\',\\'_blank\\',\\'noopener\\')"><img class="news-img" src="'+n.img+'" alt="" loading="lazy" onerror="this.style.display=\\'none\\'"><div class="news-copy"><span class="eyebrow">'+n.tag+' · '+n.date+'</span><h3>'+n.title+'</h3><p>'+n.desc+'</p><div class="news-meta"><span>Reuters</span><span>Open full article ↗</span></div></div></article>';
  }).join('');
  if(!grid.innerHTML)grid.innerHTML='<div style="grid-column:1/-1;color:#8299aa;padding:16px 0">No market stories available right now.</div>';
  fetch('/api/news?symbols=NVDA,MSFT,AAPL,AMZN,META,GOOGL,TSLA,AVGO,AMD,NFLX',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('news');return r.json()}).then(function(d){
    const items=(d.items||[]).slice(0,10);if(!items.length)return;
    const esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
    grid.innerHTML=items.map(function(n){
      const img=n.image?'<img class="news-img" src="'+esc(n.image)+'" alt="" loading="lazy" onerror="this.style.display=\\'none\\'">':'';
      return '<article class="card news-card" onclick="window.open(\\''+esc(n.url||'#')+'\\',\\'_blank\\',\\'noopener\\')">'+img+'<div class="news-copy"><span class="eyebrow">'+esc(n.source||'Market news')+'</span><h3>'+esc(n.title||n.headline||'Market story')+'</h3><p>'+esc(String(n.summary||n.body||'').slice(0,220))+'</p><div class="news-meta"><span>'+esc(n.source||'Market news')+'</span><span>Open full article ↗</span></div></div></article>';
    }).join('');
  }).catch(function(){});
}`);

// Replace the exact legacy desktop opener so the header icon cannot bypass the account session system.
const oldOpen="function openAccount(){if(innerWidth<=740)return;const p=getProfile();if(p&&typeof window.movaOpenAccountWorkspaceV2==='function'){accountModal?.classList.remove('open');window.movaOpenAccountWorkspaceV2('profile');return}ensureAccountModal();p?profileAccount():guestAccount();accountModal.classList.add('open')}";
if(!html.includes(oldOpen)) throw new Error('legacy openAccount function not found');
html=html.replace(oldOpen,"function openAccount(){if(typeof window.movaAccountOpenV8==='function'){window.movaAccountOpenV8();return}ensureAccountModal();guestAccount();accountModal.classList.add('open')}");

const css=`<style id="mova-account-v8-style">
.mova-auth-v8{display:none;position:fixed;inset:0;z-index:2147483647;background:#041018;color:#eef5f8;overflow:auto}.mova-auth-v8.open{display:block}.mova-auth-v8-shell{width:min(760px,calc(100% - 28px));margin:70px auto;padding:24px;border:1px solid #153446;border-radius:20px;background:#06131c}.mova-auth-v8-head{display:flex;justify-content:space-between;align-items:center;gap:12px}.mova-auth-v8-close{width:40px;height:40px;border-radius:50%;border:1px solid #21475b;background:#071722;color:#fff;font-size:20px;cursor:pointer}.mova-auth-v8-tabs{display:flex;gap:8px;margin:18px 0}.mova-auth-v8-tabs button{min-height:42px;border:1px solid #21475b;border-radius:11px;background:#071722;color:#9db0bd;padding:0 14px;font-weight:800;cursor:pointer}.mova-auth-v8-tabs button.active{background:#0a2230;color:#fff;border-color:#42bbff}.mova-auth-v8-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.mova-auth-v8-form label{display:grid;gap:6px;color:#8ba0af;font-size:11px;font-weight:800}.mova-auth-v8-form .full{grid-column:1/-1}.mova-auth-v8-input{min-height:46px;border:1px solid #193e54;border-radius:12px;background:#05111a;color:#f2f7fa;padding:0 12px;font:inherit}.mova-auth-v8-btn{min-height:46px;border:0;border-radius:12px;background:linear-gradient(135deg,#42bbff,#66ff8a);color:#041018;font-weight:900;cursor:pointer;padding:0 16px}.mova-auth-v8-btn.secondary{background:#0a2230;color:#eef5f8;border:1px solid #24536a}.mova-auth-v8-note{margin-top:12px;color:#7890a1;font-size:11px;line-height:1.5}.mova-auth-v8-error{margin-top:10px;color:#ff9aa3;font-size:12px}.mova-auth-v8-success{border:1px solid rgba(102,255,138,.35);background:rgba(102,255,138,.07);border-radius:14px;padding:16px;margin-top:18px}.mova-auth-v8-success h3{margin:0 0 8px;color:#66ff8a}.mova-auth-v8-success p{color:#9bb0bd;line-height:1.6}@media(max-width:740px){.mova-auth-v8-shell{margin:18px auto}.mova-auth-v8-form{grid-template-columns:1fr}.mova-auth-v8-form .full{grid-column:auto}}
</style>`;
html=html.replace('</head>',css+'</head>');
html=html.replace('</body>',`<div id="movaAuthV8" class="mova-auth-v8"><div class="mova-auth-v8-shell"><div class="mova-auth-v8-head"><div><span class="eyebrow">MOVA ACCOUNT</span><h2 id="movaAuthV8Title">Access your account</h2></div><button id="movaAuthV8Close" class="mova-auth-v8-close" type="button">×</button></div><div id="movaAuthV8Body"></div></div></div></body>`);

const runtime=`<script id="mova-account-v8-runtime">(function(){
const ACCOUNT='movaAccountV8',SESSION='movaAccountSessionV8',PROFILE='movaMobileProfileV1';
function el(id){return document.getElementById(id)}
function get(k,d){try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v}catch(e){return d}}
function put(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
function del(k){try{localStorage.removeItem(k)}catch(e){}}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function account(){return get(ACCOUNT,null)}
function session(){return get(SESSION,null)}
function signed(){const a=account(),s=session();return !!(a&&s&&String(a.email).toLowerCase()===String(s.email).toLowerCase())}
function syncProfile(a){if(a&&a.profile)put(PROFILE,a.profile);if(typeof updateMobileProfileChip==='function')updateMobileProfileChip()}
function clearProfileDisplay(){if(!signed()){del(PROFILE);if(typeof updateMobileProfileChip==='function')updateMobileProfileChip()}}
function closeAuth(){el('movaAuthV8')?.classList.remove('open');document.body.style.overflow=''}
function openWorkspace(){const a=account();if(!a||!signed()){openAuth(a?'signin':'create');return}syncProfile(a);closeAuth();el('movaDesktopAccountModal')?.classList.remove('open');el('mobileAccess')?.classList.remove('open');if(typeof window.movaOpenAccountWorkspaceV2==='function'){window.movaOpenAccountWorkspaceV2('profile');return}openAuth('signin')}
function openAuth(mode){el('movaDesktopAccountModal')?.classList.remove('open');el('mobileAccess')?.classList.remove('open');el('movaAuthV8')?.classList.add('open');document.body.style.overflow='hidden';render(mode||'signin')}
function render(mode){const a=account(),body=el('movaAuthV8Body'),create=mode==='create';if(!body)return;el('movaAuthV8Title').textContent=create?'Create your MOVA account':'Sign in to MOVA';body.innerHTML='<div class="mova-auth-v8-tabs"><button id="v8SignTab" class="'+(!create?'active':'')+'">Sign in</button><button id="v8CreateTab" class="'+(create?'active':'')+'">Create account</button></div>'+(create?'<form id="v8Create" class="mova-auth-v8-form"><label>FIRST NAME<input id="v8First" class="mova-auth-v8-input" required></label><label>EMAIL<input id="v8Email" class="mova-auth-v8-input" type="email" required></label><label>PASSWORD<input id="v8Pass" class="mova-auth-v8-input" type="password" minlength="8" required></label><label>CONFIRM PASSWORD<input id="v8Confirm" class="mova-auth-v8-input" type="password" minlength="8" required></label><label>EXPERIENCE<select id="v8Exp" class="mova-auth-v8-input"><option>Beginner</option><option>Intermediate</option><option>Experienced</option></select></label><label>PRIMARY FOCUS<select id="v8Focus" class="mova-auth-v8-input"><option>Stocks</option><option>Nasdaq 100</option><option>Commodities</option><option>Mixed markets</option></select></label><label class="full">STYLE<select id="v8Style" class="mova-auth-v8-input"><option>Long-term investor</option><option>Swing trader</option><option>Day trader</option><option>Learning / research</option></select></label><div class="full"><button class="mova-auth-v8-btn" type="submit">Create account</button><div id="v8Msg" class="mova-auth-v8-error"></div></div></form>':'<form id="v8Login" class="mova-auth-v8-form"><label class="full">EMAIL<input id="v8LoginEmail" class="mova-auth-v8-input" type="email" required value="'+esc(a&&a.email||'')+'"></label><label class="full">PASSWORD<input id="v8LoginPass" class="mova-auth-v8-input" type="password" required></label><div class="full"><button class="mova-auth-v8-btn" type="submit">Sign in</button><div id="v8Msg" class="mova-auth-v8-error"></div></div></form>')+'<p class="mova-auth-v8-note">This preview stores the account on this browser. Production email verification and cross-device sign-in will require the server-backed authentication service.</p>';
el('v8SignTab').onclick=function(){render('signin')};el('v8CreateTab').onclick=function(){render('create')};
if(create){el('v8Create').onsubmit=function(e){e.preventDefault();const msg=el('v8Msg'),pw=el('v8Pass').value,cf=el('v8Confirm').value;if(pw.length<8){msg.textContent='Password must be at least 8 characters.';return}if(pw!==cf){msg.textContent='Passwords do not match.';return}const profile={firstName:el('v8First').value.trim(),email:el('v8Email').value.trim().toLowerCase(),experience:el('v8Exp').value,focus:el('v8Focus').value,style:el('v8Style').value,createdAt:new Date().toISOString()};const rec={email:profile.email,password:pw,profile:profile,createdAt:Date.now()};if(!put(ACCOUNT,rec)){msg.textContent='This browser blocked account storage.';return}del(SESSION);del(PROFILE);if(typeof updateMobileProfileChip==='function')updateMobileProfileChip();body.innerHTML='<div class="mova-auth-v8-success"><h3>Account successfully created</h3><p>Your MOVA account has been saved. You can now sign in using <b>'+esc(rec.email)+'</b> and the password you just created.</p><button id="v8GoSignIn" class="mova-auth-v8-btn" type="button">Sign in now</button></div>';el('v8GoSignIn').onclick=function(){render('signin')}}}else{el('v8Login').onsubmit=function(e){e.preventDefault();const msg=el('v8Msg'),rec=account(),email=el('v8LoginEmail').value.trim().toLowerCase(),pw=el('v8LoginPass').value;if(!rec){msg.textContent='No saved MOVA account exists on this browser yet.';return}if(email!==String(rec.email).toLowerCase()||pw!==String(rec.password)){msg.textContent='Email or password is incorrect.';return}if(!put(SESSION,{email:rec.email,at:Date.now()})){msg.textContent='This browser blocked sign-in storage.';return}syncProfile(rec);msg.className='mova-auth-v8-success';msg.innerHTML='<h3>Sign in successful</h3><p>Opening your MOVA account…</p>';setTimeout(openWorkspace,220)}}
}
// Preserve a v7 account so the user does not have to recreate it again; require a fresh sign-in.
if(!account()){const old=get('movaAccountV7',null)||get('movaAccountV5',null);if(old&&old.email&&old.password)put(ACCOUNT,old)}
window.movaAccountOpenV8=function(){const a=account();if(a&&signed())openWorkspace();else openAuth(a?'signin':'create')};
window.openAccountAccess=window.movaAccountOpenV8;
window.movaSignOutV8=function(){del(SESSION);clearProfileDisplay();el('movaAccountWorkspaceV2')?.classList.remove('open');openAuth('signin')};
el('movaAuthV8Close').onclick=closeAuth;
clearProfileDisplay();
// Re-render News whenever its page becomes active, so SPA navigation cannot leave an empty grid.
document.addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('[data-nav="news"],[data-mob="news"]');if(b)setTimeout(function(){if(typeof renderNews==='function')renderNews()},80)},true);
const mo=new MutationObserver(function(){const p=el('news');if(p&&p.classList.contains('active')){const g=el('newsGrid');if(g&&!g.children.length&&typeof renderNews==='function')renderNews()}});mo.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
})();</script>`;
html=html.replace('</body>',runtime+'</body>');
writeFileSync(file,html);
console.log('MOVA account + News v8 complete.');
