import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

// --- NEWS: replace the app's own renderer instead of layering another observer over it.
html=html.replace(/function renderNews\(\)\{[\s\S]*?\n\}/, `async function renderNews(){
  const grid=document.getElementById('newsGrid');
  if(!grid)return;
  grid.innerHTML='<div style="grid-column:1/-1;color:#8299aa;padding:16px 0">Loading latest market stories…</div>';
  try{
    const r=await fetch('/api/news?symbols=NVDA,MSFT,AAPL,AMZN,META,GOOGL,TSLA,AVGO,AMD,NFLX',{cache:'no-store'});
    const d=await r.json();
    if(!r.ok)throw new Error(d.error||'News request failed');
    const items=(d.items||[]).slice(0,10);
    if(!items.length)throw new Error('No live stories');
    grid.innerHTML=items.map((n,i)=>{
      const title=String(n.title||n.headline||'Market story').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const desc=String(n.summary||n.body||'').slice(0,220).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const source=String(n.source||'Market news').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const url=String(n.url||'#').replace(/"/g,'&quot;');
      const img=n.image?'<img class="news-img" src="'+String(n.image).replace(/"/g,'&quot;')+'" alt="" loading="lazy" onerror="this.style.display=\\'none\\'">':'';
      return '<article class="card news-card" onclick="window.open(\\''+url+'\\',\\'_blank\\',\\'noopener\\')">'+img+'<div class="news-copy"><span class="eyebrow">'+source+'</span><h3>'+title+'</h3><p>'+desc+'</p><div class="news-meta"><span>'+source+'</span><span>Open full article ↗</span></div></div></article>';
    }).join('');
  }catch(e){
    // Keep the original built-in stories as a visible fallback instead of leaving the page blank.
    grid.innerHTML=(Array.isArray(newsItems)?newsItems:[]).slice(0,10).map((n,i)=>'<article class="card news-card" onclick="window.open(\\''+n.url+'\\',\\'_blank\\',\\'noopener\\')"><img class="news-img" src="'+n.img+'" alt="" loading="lazy" onerror="this.style.display=\\'none\\'"><div class="news-copy"><span class="eyebrow">'+n.tag+' · '+n.date+'</span><h3>'+n.title+'</h3><p>'+n.desc+'</p><div class="news-meta"><span>Reuters</span><span>Open full article ↗</span></div></div></article>').join('');
    if(!grid.innerHTML)grid.innerHTML='<div style="grid-column:1/-1;color:#8299aa;padding:16px 0">Market stories could not be loaded right now.</div>';
  }
}`);

// --- ACCOUNT: one persistent local prototype account used by desktop and mobile.
const accountCss=`<style id="mova-account-v5-style">
.mova-auth-v5{display:none;position:fixed;inset:0;z-index:2147483647;background:#041018;color:#eef5f8;overflow:auto}.mova-auth-v5.open{display:block}.mova-auth-v5-shell{width:min(760px,calc(100% - 28px));margin:70px auto;padding:24px;border:1px solid #153446;border-radius:20px;background:#06131c}.mova-auth-v5-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.mova-auth-v5-head h2{margin:0}.mova-auth-v5-close{width:40px;height:40px;border-radius:50%;border:1px solid #21475b;background:#071722;color:#fff;font-size:20px;cursor:pointer}.mova-auth-v5-tabs{display:flex;gap:8px;margin:18px 0}.mova-auth-v5-tabs button{min-height:42px;border:1px solid #21475b;border-radius:11px;background:#071722;color:#9db0bd;padding:0 14px;font-weight:800;cursor:pointer}.mova-auth-v5-tabs button.active{background:#0a2230;color:#fff;border-color:#42bbff}.mova-auth-v5-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.mova-auth-v5-form label{display:grid;gap:6px;color:#8ba0af;font-size:11px;font-weight:800}.mova-auth-v5-form .full{grid-column:1/-1}.mova-auth-v5-input{min-height:46px;border:1px solid #193e54;border-radius:12px;background:#05111a;color:#f2f7fa;padding:0 12px;font:inherit}.mova-auth-v5-btn{min-height:46px;border:0;border-radius:12px;background:linear-gradient(135deg,#42bbff,#66ff8a);color:#041018;font-weight:900;cursor:pointer;padding:0 16px}.mova-auth-v5-note{margin-top:12px;color:#7890a1;font-size:11px;line-height:1.5}.mova-auth-v5-error{margin-top:10px;color:#ff9aa3;font-size:12px}.mova-auth-v5-success{margin-top:10px;color:#66ff8a;font-size:12px}@media(max-width:740px){.mova-auth-v5-shell{margin:18px auto}.mova-auth-v5-form{grid-template-columns:1fr}.mova-auth-v5-form .full{grid-column:auto}}
</style>`;
html=html.replace('</head>',accountCss+'</head>');

const authMarkup=`<div id="movaAuthV5" class="mova-auth-v5"><div class="mova-auth-v5-shell"><div class="mova-auth-v5-head"><div><span class="eyebrow">MOVA ACCOUNT</span><h2 id="movaAuthV5Title">Access your account</h2></div><button id="movaAuthV5Close" class="mova-auth-v5-close" type="button">×</button></div><div id="movaAuthV5Body"></div></div></div>`;
html=html.replace('</body>',authMarkup+'</body>');

const runtime=`<script id="mova-account-v5-runtime">(function(){
const ACCOUNT='movaAccountV5',PROFILE='movaMobileProfileV1',SESSION='movaAccountSessionV5';
const get=(k,d=null)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v}catch(e){return d}};
const put=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};
const del=k=>{try{localStorage.removeItem(k)}catch(e){}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function account(){return get(ACCOUNT,null)}
function signedIn(){return get(SESSION,null)?.email===account()?.email}
function syncProfile(a){if(a?.profile)put(PROFILE,a.profile);if(typeof updateMobileProfileChip==='function')updateMobileProfileChip()}
function openAuth(mode){document.getElementById('movaDesktopAccountModal')?.classList.remove('open');document.getElementById('mobileAccess')?.classList.remove('open');document.getElementById('movaAuthV5')?.classList.add('open');document.body.style.overflow='hidden';renderAuth(mode||'signin')}
function closeAuth(){document.getElementById('movaAuthV5')?.classList.remove('open');document.body.style.overflow=''}
function openWorkspace(){const a=account();if(!a)return openAuth('create');syncProfile(a);put(SESSION,{email:a.email,at:Date.now()});closeAuth();if(typeof window.movaOpenAccountWorkspaceV2==='function'){window.movaOpenAccountWorkspaceV2('profile');return}openAuth('signin')}
function renderAuth(mode){const a=account(),body=document.getElementById('movaAuthV5Body');if(!body)return;const create=mode==='create';document.getElementById('movaAuthV5Title').textContent=create?'Create your MOVA account':'Sign in to MOVA';body.innerHTML='<div class="mova-auth-v5-tabs"><button id="movaAuthTabSign" class="'+(!create?'active':'')+'">Sign in</button><button id="movaAuthTabCreate" class="'+(create?'active':'')+'">Create account</button></div>'+(create?'<form id="movaAuthCreateV5" class="mova-auth-v5-form"><label>FIRST NAME<input id="movaV5First" class="mova-auth-v5-input" required></label><label>EMAIL<input id="movaV5Email" class="mova-auth-v5-input" type="email" required></label><label>PASSWORD<input id="movaV5Password" class="mova-auth-v5-input" type="password" minlength="8" required></label><label>CONFIRM PASSWORD<input id="movaV5Confirm" class="mova-auth-v5-input" type="password" minlength="8" required></label><label>EXPERIENCE<select id="movaV5Exp" class="mova-auth-v5-input"><option>Beginner</option><option>Intermediate</option><option>Experienced</option></select></label><label>PRIMARY FOCUS<select id="movaV5Focus" class="mova-auth-v5-input"><option>Stocks</option><option>Nasdaq 100</option><option>Commodities</option><option>Mixed markets</option></select></label><label class="full">STYLE<select id="movaV5Style" class="mova-auth-v5-input"><option>Long-term investor</option><option>Swing trader</option><option>Day trader</option><option>Learning / research</option></select></label><div class="full"><button class="mova-auth-v5-btn" type="submit">Create account</button><div id="movaV5Msg" class="mova-auth-v5-error"></div></div></form>':'<form id="movaAuthSignV5" class="mova-auth-v5-form"><label class="full">EMAIL<input id="movaV5LoginEmail" class="mova-auth-v5-input" type="email" required value="'+esc(a?.email||'')+'"></label><label class="full">PASSWORD<input id="movaV5LoginPassword" class="mova-auth-v5-input" type="password" required></label><div class="full"><button class="mova-auth-v5-btn" type="submit">Sign in</button><div id="movaV5Msg" class="mova-auth-v5-error"></div></div></form>')+'<p class="mova-auth-v5-note">Preview account data is saved on this browser so you can sign out, refresh and sign back in without recreating the account. Server-backed accounts and email verification require the production authentication backend.</p>';
body.querySelector('#movaAuthTabSign').onclick=()=>renderAuth('signin');body.querySelector('#movaAuthTabCreate').onclick=()=>renderAuth('create');
if(create){body.querySelector('#movaAuthCreateV5').onsubmit=e=>{e.preventDefault();const pw=movaV5Password.value,cf=movaV5Confirm.value,msg=movaV5Msg;if(pw.length<8){msg.textContent='Password must be at least 8 characters.';return}if(pw!==cf){msg.textContent='Passwords do not match.';return}const profile={firstName:movaV5First.value.trim(),email:movaV5Email.value.trim().toLowerCase(),experience:movaV5Exp.value,focus:movaV5Focus.value,style:movaV5Style.value,createdAt:new Date().toISOString()};const rec={email:profile.email,password:pw,profile,verified:false,createdAt:Date.now()};if(!put(ACCOUNT,rec)){msg.textContent='This browser blocked account storage.';return}syncProfile(rec);put(SESSION,{email:rec.email,at:Date.now()});msg.className='mova-auth-v5-success';msg.textContent='Account created and saved on this browser.';setTimeout(openWorkspace,250)}}else{body.querySelector('#movaAuthSignV5').onsubmit=e=>{e.preventDefault();const rec=account(),email=movaV5LoginEmail.value.trim().toLowerCase(),pw=movaV5LoginPassword.value,msg=movaV5Msg;if(!rec){msg.textContent='No saved MOVA account exists on this browser yet.';return}if(email!==rec.email||pw!==rec.password){msg.textContent='Email or password is incorrect.';return}put(SESSION,{email:rec.email,at:Date.now()});syncProfile(rec);openWorkspace()}}
}
document.getElementById('movaAuthV5Close').onclick=closeAuth;
document.addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('.mova-desktop-account-btn,#mobileProfileChip');if(!b)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();const a=account();if(a&&signedIn())openWorkspace();else openAuth(a?'signin':'create')},true);
// Override the legacy mobile access button so a saved account opens/signs in instead of asking to recreate it.
window.openAccountAccess=function(){const a=account();if(a&&signedIn())openWorkspace();else openAuth(a?'signin':'create')};
// If an older profile exists, preserve it visually but do not invent a password for it.
const old=get(PROFILE,null);if(old&&!account()){}
window.movaSignOutV5=function(){del(SESSION);closeAuth();openAuth('signin')};
})();</script>`;
html=html.replace('</body>',runtime+'</body>');

writeFileSync(file,html);
console.log('MOVA account persistence + News renderer v5 complete.');
