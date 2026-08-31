import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

const css=`
/* MOVA desktop account + expanded chart views */
.mova-desktop-account-btn{display:none}
.mova-desktop-account-modal{
    position:fixed;
    inset:0;
    z-index:2147483550;
    background:rgba(2,7,12,.78);
    backdrop-filter:blur(12px);
    align-items:center;
    justify-content:center;
    padding:24px;
}
.mova-desktop-account-modal.open{display:flex}
.mova-account-panel{width:min(410px,calc(100vw - 36px));max-height:calc(100vh - 48px);overflow:auto;background:#07131d;border:1px solid rgba(66,187,255,.25);border-radius:22px;padding:22px;box-shadow:0 28px 80px rgba(0,0,0,.52)}
.mova-account-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:18px}.mova-account-head h3{font-size:24px;margin:0}.mova-account-close{width:38px;height:38px;border-radius:50%;border:1px solid #193547;background:#081721;color:#dbe8ef;font-size:20px;cursor:pointer}.mova-account-copy{color:#8ca1b1;line-height:1.55;margin:0 0 18px}.mova-account-actions{display:grid;gap:10px}.mova-account-primary,.mova-account-secondary,.mova-account-danger{min-height:48px;border-radius:13px;font-weight:900;cursor:pointer}.mova-account-primary{border:0;background:linear-gradient(135deg,#209dff,#42bbff);color:#041018}.mova-account-secondary{border:1px solid #24485d;background:#091a25;color:#eef5f8}.mova-account-danger{border:1px solid rgba(255,102,115,.35);background:rgba(255,102,115,.08);color:#ff8792}.mova-account-form{display:grid;gap:11px}.mova-account-form label{display:grid;gap:6px;color:#8ba0af;font-size:11px;font-weight:800;letter-spacing:.06em}.mova-account-form input,.mova-account-form select{width:100%;box-sizing:border-box;min-height:46px;border:1px solid #193e54;border-radius:12px;background:#05111a;color:#f2f7fa;padding:0 12px;font:inherit}.mova-account-note{font-size:11px;line-height:1.5;color:#6f8798;margin-top:12px}.mova-account-profile{display:grid;gap:11px}.mova-account-profile strong{font-size:22px}.mova-account-profile span{color:#8ba0af}.mova-account-avatar-large{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#42bbff,#78ef31);color:#041018;font-size:20px;font-weight:1000;margin-bottom:5px}
.mova-chart-view-controls{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:10px 0 12px;padding:9px;border:1px solid #153446;border-radius:13px;background:#06121b}.mova-chart-view-label{font-size:10px;font-weight:900;color:#7891a2;letter-spacing:.07em;margin-right:3px}.mova-chart-view-btn{border:1px solid #1a4056;background:#081923;color:#9bb0be;border-radius:10px;min-height:35px;padding:0 11px;font-size:11px;font-weight:900;cursor:pointer}.mova-chart-view-btn:hover,.mova-chart-view-btn.active{background:#0d3851;border-color:#1b668f;color:#fff}.mova-chart-exit{display:none;margin-left:auto;border-color:rgba(255,102,115,.38);color:#ff9aa3}
.mova-chart-focus{position:fixed!important;z-index:2147483500!important;inset:10px!important;margin:0!important;max-width:none!important;width:auto!important;height:calc(100vh - 20px)!important;overflow:auto!important;background:#06131d!important;border:1px solid #1b4860!important;border-radius:20px!important;padding:18px!important;box-shadow:0 28px 100px rgba(0,0,0,.72)!important}.mova-chart-focus .mova-chart-exit{display:inline-flex;align-items:center}.mova-chart-focus #marketCanvas{display:block!important;width:100%!important;max-width:none!important}.mova-chart-focus.mova-chart-landscape #marketCanvas{height:min(67vh,760px)!important}.mova-chart-focus.mova-chart-portrait{left:50%!important;right:auto!important;transform:translateX(-50%);width:min(720px,calc(100vw - 20px))!important}.mova-chart-focus.mova-chart-portrait #marketCanvas{height:min(72vh,900px)!important}.mova-chart-backdrop{display:none;position:fixed;inset:0;z-index:2147483490;background:#02070b}.mova-chart-backdrop.open{display:block}
@media(min-width:741px){.mova-desktop-account-btn{display:inline-grid;place-items:center;flex:0 0 42px;width:42px;height:42px;margin-left:10px;border-radius:50%;border:1px solid rgba(66,187,255,.28);background:#071722;color:#dbeaf2;cursor:pointer}.mova-desktop-account-btn:hover{border-color:#42bbff;background:#0b2230}.mova-desktop-account-btn svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.mova-desktop-account-btn.signed-in{background:linear-gradient(135deg,#42bbff,#78ef31);color:#041018;border-color:transparent;font-size:13px;font-weight:1000}.mova-desktop-account-modal{display:none}}
@media(max-width:740px){.mova-desktop-account-modal,.mova-desktop-account-btn{display:none!important}.mova-chart-view-controls{gap:6px}.mova-chart-view-label{width:100%;margin-bottom:1px}.mova-chart-view-btn{flex:1;min-width:78px;padding:0 8px}.mova-chart-focus{inset:4px!important;height:calc(100vh - 8px)!important;border-radius:14px!important;padding:10px!important}.mova-chart-focus.mova-chart-landscape{inset:2px!important}.mova-chart-focus.mova-chart-landscape #marketCanvas{height:70vh!important}.mova-chart-focus.mova-chart-portrait{width:calc(100vw - 8px)!important}.mova-chart-focus.mova-chart-portrait #marketCanvas{height:68vh!important}}
`;
if(!html.includes('/* MOVA desktop account + expanded chart views */'))html=html.replace('</style>',css+'</style>');

const runtime=`
<script>
(function(){
  const PROFILE_KEY='movaMobileProfileV1';
  const personSvg='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.6"></circle><path d="M5.8 19c.8-3.3 3-5 6.2-5s5.4 1.7 6.2 5"></path></svg>';
  const getProfile=()=>{try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')}catch(_){return null}};
  const saveProfile=p=>{try{localStorage.setItem(PROFILE_KEY,JSON.stringify(p))}catch(_){}};
  const removeProfile=()=>{try{localStorage.removeItem(PROFILE_KEY)}catch(_){}};

  let accountBtn=null,accountModal=null,accountPanel=null;
  function accountButton(){
    if(accountBtn||innerWidth<=740)return;
    const searchInput=[...document.querySelectorAll('input')].find(i=>/search mova/i.test(i.placeholder||''));
    if(!searchInput)return;
    const anchor=searchInput.closest('.search')||searchInput.parentElement;
    if(!anchor||!anchor.parentElement)return;
    accountBtn=document.createElement('button');
    accountBtn.type='button';accountBtn.className='mova-desktop-account-btn';accountBtn.title='MOVA account';accountBtn.setAttribute('aria-label','Open MOVA account');
    accountBtn.addEventListener('click',()=>openAccount());
    anchor.insertAdjacentElement('afterend',accountBtn);
    updateAccountButton();
  }
  function ensureAccountModal(){
    if(accountModal)return;
    accountModal=document.createElement('div');accountModal.className='mova-desktop-account-modal';accountModal.id='movaDesktopAccountModal';
    accountModal.innerHTML='<section class="mova-account-panel" role="dialog" aria-modal="true" aria-label="MOVA account"><div class="mova-account-head"><h3>MOVA Account</h3><button class="mova-account-close" type="button" aria-label="Close">×</button></div><div id="movaDesktopAccountBody"></div></section>';
    document.body.appendChild(accountModal);accountPanel=accountModal.querySelector('.mova-account-panel');
    accountModal.querySelector('.mova-account-close').onclick=closeAccount;
    accountModal.addEventListener('click',e=>{if(e.target===accountModal)closeAccount()});
  }
  function updateAccountButton(){
    if(!accountBtn)return;
    const p=getProfile();
    accountBtn.classList.toggle('signed-in',!!p);
    accountBtn.innerHTML=p?String(p.firstName||'M').trim().charAt(0).toUpperCase():personSvg;
    accountBtn.setAttribute('aria-label',p?'Open MOVA profile':'Sign in or create MOVA account');
  }
  function guestAccount(){
    const body=document.getElementById('movaDesktopAccountBody');
    body.innerHTML='<p class="mova-account-copy">Sign in to your MOVA profile or create one to keep your experience, market focus and preferences together.</p><div class="mova-account-actions"><button class="mova-account-primary" id="movaDesktopSignIn" type="button">Sign in</button><button class="mova-account-secondary" id="movaDesktopCreate" type="button">Create account</button></div><p class="mova-account-note">This build currently stores the MOVA profile on this device. It is not yet server-backed authentication.</p>';
    document.getElementById('movaDesktopSignIn').onclick=signInForm;document.getElementById('movaDesktopCreate').onclick=createForm;
  }
  function signInForm(){
    const p=getProfile(),body=document.getElementById('movaDesktopAccountBody');
    body.innerHTML='<form class="mova-account-form" id="movaDesktopSignInForm"><label>EMAIL<input id="movaDesktopLoginEmail" type="email" autocomplete="email" required placeholder="you@example.com"></label><button class="mova-account-primary" type="submit">Sign in</button><button class="mova-account-secondary" id="movaDesktopBack" type="button">Back</button><div class="mova-account-note" id="movaDesktopLoginNote"></div></form>';
    if(p?.email)document.getElementById('movaDesktopLoginEmail').value=p.email;
    document.getElementById('movaDesktopBack').onclick=guestAccount;
    document.getElementById('movaDesktopSignInForm').onsubmit=e=>{e.preventDefault();const email=document.getElementById('movaDesktopLoginEmail').value.trim().toLowerCase();const stored=getProfile();if(stored&&String(stored.email||'').trim().toLowerCase()===email){profileAccount();updateAccountButton();return}document.getElementById('movaDesktopLoginNote').textContent='No matching MOVA profile is saved on this device yet. Create an account first.'};
  }
  function createForm(existing=getProfile()){
    const body=document.getElementById('movaDesktopAccountBody');
    body.innerHTML='<form class="mova-account-form" id="movaDesktopCreateForm"><label>FIRST NAME<input id="movaDesktopFirstName" required autocomplete="given-name"></label><label>EMAIL<input id="movaDesktopEmail" type="email" required autocomplete="email"></label><label>EXPERIENCE<select id="movaDesktopExperience"><option>Beginner</option><option>Intermediate</option><option>Experienced</option></select></label><label>PRIMARY FOCUS<select id="movaDesktopFocus"><option>Stocks</option><option>Nasdaq 100</option><option>Commodities</option><option>Mixed markets</option></select></label><label>STYLE<select id="movaDesktopStyle"><option>Long-term investor</option><option>Swing trader</option><option>Day trader</option><option>Learning / research</option></select></label><button class="mova-account-primary" type="submit">Save MOVA profile</button><button class="mova-account-secondary" id="movaDesktopCancelEdit" type="button">Cancel</button></form>';
    if(existing){movaDesktopFirstName.value=existing.firstName||'';movaDesktopEmail.value=existing.email||'';movaDesktopExperience.value=existing.experience||'Beginner';movaDesktopFocus.value=existing.focus||'Stocks';movaDesktopStyle.value=existing.style||'Long-term investor'}
    document.getElementById('movaDesktopCancelEdit').onclick=()=>existing?profileAccount():guestAccount();
    document.getElementById('movaDesktopCreateForm').onsubmit=e=>{e.preventDefault();saveProfile({firstName:movaDesktopFirstName.value.trim(),email:movaDesktopEmail.value.trim(),experience:movaDesktopExperience.value,focus:movaDesktopFocus.value,style:movaDesktopStyle.value});updateAccountButton();if(typeof updateMobileProfileChip==='function')updateMobileProfileChip();profileAccount()};
  }
  function profileAccount(){
    const p=getProfile();if(!p){guestAccount();return}
    const body=document.getElementById('movaDesktopAccountBody'),initial=String(p.firstName||'M').charAt(0).toUpperCase();
    body.innerHTML='<div class="mova-account-profile"><div class="mova-account-avatar-large">'+initial+'</div><strong>'+escapeHtml(p.firstName||'MOVA profile')+'</strong><span>'+escapeHtml(p.email||'')+'</span><span>'+escapeHtml(p.experience||'')+' · '+escapeHtml(p.focus||'')+'</span><span>'+escapeHtml(p.style||'')+'</span><div class="mova-account-actions"><button class="mova-account-primary" id="movaDesktopEdit" type="button">Edit profile</button><button class="mova-account-danger" id="movaDesktopSignOut" type="button">Sign out on this device</button></div></div>';
    document.getElementById('movaDesktopEdit').onclick=()=>createForm(p);document.getElementById('movaDesktopSignOut').onclick=()=>{removeProfile();updateAccountButton();if(typeof updateMobileProfileChip==='function')updateMobileProfileChip();guestAccount()};
  }
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function openAccount(){if(innerWidth<=740)return;ensureAccountModal();getProfile()?profileAccount():guestAccount();accountModal.classList.add('open')}
  function closeAccount(){accountModal?.classList.remove('open')}

  let chartWorkspace=null,chartControls=null,chartBackdrop=null;
  function findChartWorkspace(){
    const canvas=document.getElementById('marketCanvas');if(!canvas)return null;
    let n=canvas.parentElement,best=null;
    while(n&&n!==document.body){if(/INTERACTIVE MARKET CHART/i.test(n.textContent||'')){best=n;break}n=n.parentElement}
    return best||canvas.parentElement;
  }
  function setupChartViews(){
    if(chartControls||!document.getElementById('marketCanvas'))return;
    chartWorkspace=findChartWorkspace();if(!chartWorkspace)return;
    const canvas=document.getElementById('marketCanvas');
    chartControls=document.createElement('div');chartControls.className='mova-chart-view-controls';
    chartControls.innerHTML='<span class="mova-chart-view-label">VIEW</span><button type="button" class="mova-chart-view-btn" data-chart-view="fullscreen">⛶ Full screen</button><button type="button" class="mova-chart-view-btn" data-chart-view="landscape">↔ Landscape</button><button type="button" class="mova-chart-view-btn" data-chart-view="portrait">↕ Portrait</button><button type="button" class="mova-chart-view-btn mova-chart-exit" data-chart-view="exit">Exit view</button>';
    canvas.parentElement.insertAdjacentElement('beforebegin',chartControls);
    chartBackdrop=document.createElement('div');chartBackdrop.className='mova-chart-backdrop';document.body.appendChild(chartBackdrop);
    chartControls.addEventListener('click',e=>{const b=e.target.closest('[data-chart-view]');if(b)setChartView(b.dataset.chartView)});
    document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&chartWorkspace?.classList.contains('mova-chart-native-fullscreen'))exitChartView(false)});
  }
  async function setChartView(mode){
    if(!chartWorkspace)return;
    if(mode==='exit'){exitChartView();return}
    exitChartView(false);
    chartWorkspace.classList.add('mova-chart-focus','mova-chart-'+mode);
    chartBackdrop?.classList.add('open');
    chartControls?.querySelectorAll('[data-chart-view]').forEach(b=>b.classList.toggle('active',b.dataset.chartView===mode));
    document.body.style.overflow='hidden';
    if(mode==='fullscreen'&&chartWorkspace.requestFullscreen){try{await chartWorkspace.requestFullscreen();chartWorkspace.classList.add('mova-chart-native-fullscreen')}catch(_){}}
    if((mode==='landscape'||mode==='portrait')&&chartWorkspace.requestFullscreen&&innerWidth<=740){try{await chartWorkspace.requestFullscreen();chartWorkspace.classList.add('mova-chart-native-fullscreen')}catch(_){}try{if(screen.orientation?.lock)await screen.orientation.lock(mode)}catch(_){}}
    setTimeout(()=>{if(typeof requestChartDraw==='function')requestChartDraw();else if(typeof drawMarketChart==='function')drawMarketChart()},80);
  }
  function exitChartView(leaveFullscreen=true){
    if(!chartWorkspace)return;
    chartWorkspace.classList.remove('mova-chart-focus','mova-chart-fullscreen','mova-chart-landscape','mova-chart-portrait','mova-chart-native-fullscreen');
    chartBackdrop?.classList.remove('open');chartControls?.querySelectorAll('[data-chart-view]').forEach(b=>b.classList.remove('active'));document.body.style.overflow='';
    try{if(screen.orientation?.unlock)screen.orientation.unlock()}catch(_){}
    if(leaveFullscreen&&document.fullscreenElement){document.exitFullscreen?.().catch(()=>{})}
    setTimeout(()=>{if(typeof requestChartDraw==='function')requestChartDraw();else if(typeof drawMarketChart==='function')drawMarketChart()},80);
  }
  window.addEventListener('resize',()=>{accountButton();updateAccountButton();if(chartWorkspace?.classList.contains('mova-chart-focus'))setTimeout(()=>typeof requestChartDraw==='function'&&requestChartDraw(),60)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{accountButton();setupChartViews()});else{accountButton();setupChartViews()}
  setTimeout(()=>{accountButton();setupChartViews()},500);
})();
</script>
`;
if(!html.includes('movaDesktopAccountModal'))html=html.replace('</body>',runtime+'</body>');

writeFileSync(file,html);
console.log('MOVA desktop account + chart view controls patch complete.');
