import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

// Remove competing injected runtimes from earlier preview attempts.
html=html.replace(/<script id="mova-news-restore-v2">[\s\S]*?<\/script>/g,'');
html=html.replace(/<script id="mova-account-news-v3-runtime">[\s\S]*?<\/script>/g,'');
html=html.replace(/<script id="mova-account-news-v4-runtime">[\s\S]*?<\/script>/g,'');
html=html.replace(/<script id="mova-account-v5-runtime">[\s\S]*?<\/script>/g,'');

// Make the built-in news stories the guaranteed first render. Live news may replace them afterwards.
html=html.replace(/async function renderNews\(\)\{[\s\S]*?\n\}/, `function renderNews(){
  const grid=document.getElementById('newsGrid');
  if(!grid)return;
  const fallback=(Array.isArray(newsItems)?newsItems:[]).slice(0,10);
  grid.innerHTML=fallback.map(function(n){
    return '<article class="card news-card" onclick="window.open(\\''+n.url+'\\',\\'_blank\\',\\'noopener\\')"><img class="news-img" src="'+n.img+'" alt="" loading="lazy" onerror="this.style.display=\\'none\\'"><div class="news-copy"><span class="eyebrow">'+n.tag+' · '+n.date+'</span><h3>'+n.title+'</h3><p>'+n.desc+'</p><div class="news-meta"><span>Reuters</span><span>Open full article ↗</span></div></div></article>';
  }).join('');
  fetch('/api/news?symbols=NVDA,MSFT,AAPL,AMZN,META,GOOGL,TSLA,AVGO,AMD,NFLX',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('news');return r.json()}).then(function(d){
    const items=(d.items||[]).slice(0,10);if(!items.length)return;
    const esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
    grid.innerHTML=items.map(function(n){
      const img=n.image?'<img class="news-img" src="'+esc(n.image)+'" alt="" loading="lazy" onerror="this.style.display=\\'none\\'">':'';
      return '<article class="card news-card" onclick="window.open(\\''+esc(n.url||'#')+'\\',\\'_blank\\',\\'noopener\\')">'+img+'<div class="news-copy"><span class="eyebrow">'+esc(n.source||'Market news')+'</span><h3>'+esc(n.title||n.headline||'Market story')+'</h3><p>'+esc(String(n.summary||n.body||'').slice(0,220))+'</p><div class="news-meta"><span>'+esc(n.source||'Market news')+'</span><span>Open full article ↗</span></div></div></article>';
    }).join('');
  }).catch(function(){});
}`);

const css=`<style id="mova-account-v7-style">
.mova-auth-v7{display:none;position:fixed;inset:0;z-index:2147483647;background:#041018;color:#eef5f8;overflow:auto}.mova-auth-v7.open{display:block}.mova-auth-v7-shell{width:min(760px,calc(100% - 28px));margin:70px auto;padding:24px;border:1px solid #153446;border-radius:20px;background:#06131c}.mova-auth-v7-head{display:flex;justify-content:space-between;gap:12px;align-items:center}.mova-auth-v7-close{width:40px;height:40px;border-radius:50%;border:1px solid #21475b;background:#071722;color:#fff;font-size:20px;cursor:pointer}.mova-auth-v7-tabs{display:flex;gap:8px;margin:18px 0}.mova-auth-v7-tabs button{min-height:42px;border:1px solid #21475b;border-radius:11px;background:#071722;color:#9db0bd;padding:0 14px;font-weight:800;cursor:pointer}.mova-auth-v7-tabs button.active{background:#0a2230;color:#fff;border-color:#42bbff}.mova-auth-v7-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.mova-auth-v7-form label{display:grid;gap:6px;color:#8ba0af;font-size:11px;font-weight:800}.mova-auth-v7-form .full{grid-column:1/-1}.mova-auth-v7-input{min-height:46px;border:1px solid #193e54;border-radius:12px;background:#05111a;color:#f2f7fa;padding:0 12px;font:inherit}.mova-auth-v7-btn{min-height:46px;border:0;border-radius:12px;background:linear-gradient(135deg,#42bbff,#66ff8a);color:#041018;font-weight:900;cursor:pointer;padding:0 16px}.mova-auth-v7-note{margin-top:12px;color:#7890a1;font-size:11px;line-height:1.5}.mova-auth-v7-error{margin-top:10px;color:#ff9aa3;font-size:12px}.mova-auth-v7-success{margin-top:10px;color:#66ff8a;font-size:12px}@media(max-width:740px){.mova-auth-v7-shell{margin:18px auto}.mova-auth-v7-form{grid-template-columns:1fr}.mova-auth-v7-form .full{grid-column:auto}}
</style>`;
html=html.replace('</head>',css+'</head>');
html=html.replace('</body>',`<div id="movaAuthV7" class="mova-auth-v7"><div class="mova-auth-v7-shell"><div class="mova-auth-v7-head"><div><span class="eyebrow">MOVA ACCOUNT</span><h2 id="movaAuthV7Title">Access your account</h2></div><button id="movaAuthV7Close" class="mova-auth-v7-close" type="button">×</button></div><div id="movaAuthV7Body"></div></div></div></body>`);

const runtime=`<script id="mova-account-v7-runtime">(function(){
const ACCOUNT='movaAccountV7',SESSION='movaAccountSessionV7',PROFILE='movaMobileProfileV1';
function el(id){return document.getElementById(id)}
function get(k,d){try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v}catch(e){return d}}
function put(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
function del(k){try{localStorage.removeItem(k)}catch(e){}}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function account(){return get(ACCOUNT,null)}
function signed(){const a=account(),s=get(SESSION,null);return !!(a&&s&&String(a.email).toLowerCase()===String(s.email).toLowerCase())}
function sync(a){if(a&&a.profile)put(PROFILE,a.profile);if(typeof updateMobileProfileChip==='function')updateMobileProfileChip()}
function closeAuth(){el('movaAuthV7')?.classList.remove('open');document.body.style.overflow=''}
function openWorkspace(){const a=account();if(!a||!signed()){openAuth(a?'signin':'create');return}sync(a);closeAuth();el('movaDesktopAccountModal')?.classList.remove('open');el('mobileAccess')?.classList.remove('open');if(typeof window.movaOpenAccountWorkspaceV2==='function')window.movaOpenAccountWorkspaceV2('profile')}
function openAuth(mode){el('movaDesktopAccountModal')?.classList.remove('open');el('mobileAccess')?.classList.remove('open');el('movaAuthV7')?.classList.add('open');document.body.style.overflow='hidden';render(mode||'signin')}
function render(mode){const a=account(),body=el('movaAuthV7Body'),create=mode==='create';if(!body)return;el('movaAuthV7Title').textContent=create?'Create your MOVA account':'Sign in to MOVA';body.innerHTML='<div class="mova-auth-v7-tabs"><button id="v7SignTab" class="'+(!create?'active':'')+'">Sign in</button><button id="v7CreateTab" class="'+(create?'active':'')+'">Create account</button></div>'+(create?'<form id="v7Create" class="mova-auth-v7-form"><label>FIRST NAME<input id="v7First" class="mova-auth-v7-input" required></label><label>EMAIL<input id="v7Email" class="mova-auth-v7-input" type="email" required></label><label>PASSWORD<input id="v7Pass" class="mova-auth-v7-input" type="password" minlength="8" required></label><label>CONFIRM PASSWORD<input id="v7Confirm" class="mova-auth-v7-input" type="password" minlength="8" required></label><label>EXPERIENCE<select id="v7Exp" class="mova-auth-v7-input"><option>Beginner</option><option>Intermediate</option><option>Experienced</option></select></label><label>PRIMARY FOCUS<select id="v7Focus" class="mova-auth-v7-input"><option>Stocks</option><option>Nasdaq 100</option><option>Commodities</option><option>Mixed markets</option></select></label><label class="full">STYLE<select id="v7Style" class="mova-auth-v7-input"><option>Long-term investor</option><option>Swing trader</option><option>Day trader</option><option>Learning / research</option></select></label><div class="full"><button class="mova-auth-v7-btn" type="submit">Create account</button><div id="v7Msg" class="mova-auth-v7-error"></div></div></form>':'<form id="v7Login" class="mova-auth-v7-form"><label class="full">EMAIL<input id="v7LoginEmail" class="mova-auth-v7-input" type="email" required value="'+esc(a&&a.email||'')+'"></label><label class="full">PASSWORD<input id="v7LoginPass" class="mova-auth-v7-input" type="password" required></label><div class="full"><button class="mova-auth-v7-btn" type="submit">Sign in</button><div id="v7Msg" class="mova-auth-v7-error"></div></div></form>')+'<p class="mova-auth-v7-note">This preview keeps account data on this browser only. Production email verification and cross-device sign-in require a server-backed authentication service.</p>';
el('v7SignTab').onclick=function(){render('signin')};el('v7CreateTab').onclick=function(){render('create')};
if(create){el('v7Create').onsubmit=function(e){e.preventDefault();const msg=el('v7Msg'),pw=el('v7Pass').value,cf=el('v7Confirm').value;if(pw.length<8){msg.textContent='Password must be at least 8 characters.';return}if(pw!==cf){msg.textContent='Passwords do not match.';return}const profile={firstName:el('v7First').value.trim(),email:el('v7Email').value.trim().toLowerCase(),experience:el('v7Exp').value,focus:el('v7Focus').value,style:el('v7Style').value,createdAt:new Date().toISOString()};const rec={email:profile.email,password:pw,profile:profile,createdAt:Date.now()};if(!put(ACCOUNT,rec)||!put(SESSION,{email:rec.email,at:Date.now()})){msg.textContent='This browser blocked account storage.';return}sync(rec);msg.className='mova-auth-v7-success';msg.textContent='Account created. Opening your profile…';setTimeout(openWorkspace,100)}}else{el('v7Login').onsubmit=function(e){e.preventDefault();const msg=el('v7Msg'),rec=account(),email=el('v7LoginEmail').value.trim().toLowerCase(),pw=el('v7LoginPass').value;if(!rec){msg.textContent='No saved MOVA account exists on this browser yet.';return}if(email!==String(rec.email).toLowerCase()||pw!==String(rec.password)){msg.textContent='Email or password is incorrect.';return}if(!put(SESSION,{email:rec.email,at:Date.now()})){msg.textContent='This browser blocked sign-in storage.';return}sync(rec);msg.className='mova-auth-v7-success';msg.textContent='Signed in. Opening your profile…';setTimeout(openWorkspace,80)}}
}
window.movaOpenAccountV7=function(){const a=account();if(a&&signed())openWorkspace();else openAuth(a?'signin':'create')};
window.openAccountAccess=window.movaOpenAccountV7;
window.movaSignOutV7=function(){del(SESSION);el('movaAccountWorkspaceV2')?.classList.remove('open');openAuth('signin')};
el('movaAuthV7Close').onclick=closeAuth;
document.addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('.mova-desktop-account-btn,#mobileProfileChip');if(!b)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();window.movaOpenAccountV7()},true);
if(signed())sync(account());
})();</script>`;
html=html.replace('</body>',runtime+'</body>');

writeFileSync(file,html);
console.log('MOVA consolidated account + news v7 complete.');
