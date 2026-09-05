import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

const css=`<style id="mova-forgot-password-style">
.mna-forgot-wrap{margin-top:12px;text-align:right}.mna-forgot-link{border:0;background:transparent;color:#66ff8a;font-weight:800;cursor:pointer;padding:0;font:inherit}.mna-forgot-link:hover{text-decoration:underline}.mna-reset-note{color:#8299aa;font-size:12px;line-height:1.55;margin:8px 0 16px}.mna-reset-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
body.mova-light-theme .mna-forgot-link{color:#16884b!important}body.mova-light-theme .mna-reset-note{color:#5d7381!important}
</style>`;
html=html.replace('</head>',css+'</head>');

const runtime=`<script id="mova-forgot-password-runtime">(function(){
  const ACCOUNT_KEY='movaNativeAccountV2';
  const getAccount=()=>{try{return JSON.parse(localStorage.getItem(ACCOUNT_KEY)||'null')}catch(e){return null}};
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function renderReset(){
    const body=document.getElementById('mnaAuthBody');
    const title=document.getElementById('mnaAuthTitle');
    if(!body||!title)return;
    const a=getAccount();
    title.textContent='Reset your password';
    body.innerHTML='<p class="mna-reset-note">Enter the email address linked to your MOVA account. We\'ll send you a secure link to reset your password.</p><form id="mnaResetForm" class="mna-form"><label class="full">EMAIL<input id="mnaResetEmail" class="mna-input" type="email" required value="'+esc(a&&a.email||'')+'"></label><div class="full"><button class="mna-btn" type="submit">Send reset link</button><div id="mnaResetMsg" class="mna-msg"></div></div></form><div class="mna-reset-actions"><button id="mnaResetBack" class="mna-btn secondary" type="button">Back to sign in</button></div>';
    document.getElementById('mnaResetBack').onclick=function(){if(typeof window.movaNARenderAuth==='function')window.movaNARenderAuth('signin')};
    document.getElementById('mnaResetForm').onsubmit=function(e){
      e.preventDefault();
      const email=document.getElementById('mnaResetEmail').value.trim().toLowerCase();
      body.innerHTML='<div class="mna-success"><h3>Check your email</h3><p>If a MOVA account exists for <b>'+esc(email)+'</b>, a password reset link will be sent to that address.</p><p class="mna-reset-note">This preview currently uses browser-local accounts, so real email delivery will be connected when the server-backed authentication service is enabled.</p><button id="mnaResetDone" class="mna-btn" type="button">Back to sign in</button></div>';
      document.getElementById('mnaResetDone').onclick=function(){if(typeof window.movaNARenderAuth==='function')window.movaNARenderAuth('signin')};
    };
  }

  function addForgot(){
    const form=document.getElementById('mnaSignForm');
    if(!form||document.getElementById('mnaForgotPassword'))return;
    const wrap=document.createElement('div');
    wrap.className='mna-forgot-wrap full';
    wrap.innerHTML='<button id="mnaForgotPassword" class="mna-forgot-link" type="button">Forgot password?</button>';
    form.appendChild(wrap);
    document.getElementById('mnaForgotPassword').onclick=renderReset;
  }

  const mo=new MutationObserver(addForgot);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){mo.observe(document.body,{subtree:true,childList:true});addForgot()});
  else{mo.observe(document.body,{subtree:true,childList:true});addForgot()}
})();</script>`;
html=html.replace('</body>',runtime+'</body>');

writeFileSync(file,html);
console.log('MOVA Forgot Password changed to email-only reset request flow.');
