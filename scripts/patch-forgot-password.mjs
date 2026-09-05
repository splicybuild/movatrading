import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

const css=`<style id="mova-forgot-password-style">
.mna-forgot-wrap{grid-column:1/-1;margin-top:-2px;text-align:right}.mna-forgot-link{border:0;background:transparent;color:#66ff8a;font-weight:800;cursor:pointer;padding:2px 0;font:inherit}.mna-forgot-link:hover{text-decoration:underline}.mna-reset-note{color:#8299aa;font-size:12px;line-height:1.55;margin:8px 0 16px}.mna-reset-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
body.mova-light-theme .mna-forgot-link{color:#16884b!important}body.mova-light-theme .mna-reset-note{color:#5d7381!important}
</style>`;
html=html.replace('</head>',css+'</head>');

const runtime=`<script id="mova-forgot-password-runtime">(function(){
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function getAccount(){try{return JSON.parse(localStorage.getItem('movaNativeAccountV2')||'null')}catch(e){return null}}
  function backToSignIn(){if(typeof window.movaNARenderAuth==='function')window.movaNARenderAuth('signin')}
  function renderResetRequest(){
    var body=document.getElementById('mnaAuthBody');
    var title=document.getElementById('mnaAuthTitle');
    if(!body||!title)return;
    var a=getAccount();
    title.textContent='Reset your password';
    body.innerHTML='<p class="mna-reset-note">Enter the email address linked to your MOVA account. We will send you a secure link to reset your password.</p><form id="mnaResetRequestForm" class="mna-form"><label class="full">EMAIL<input id="mnaResetEmail" class="mna-input" type="email" required value="'+esc(a&&a.email||'')+'"></label><div class="full"><button class="mna-btn" type="submit">Send reset link</button></div></form><div class="mna-reset-actions"><button id="mnaResetBack" class="mna-btn secondary" type="button">Back to sign in</button></div>';
    document.getElementById('mnaResetBack').onclick=backToSignIn;
    document.getElementById('mnaResetRequestForm').onsubmit=function(e){
      e.preventDefault();
      var email=document.getElementById('mnaResetEmail').value.trim().toLowerCase();
      body.innerHTML='<div class="mna-success"><h3>Check your email</h3><p>If a MOVA account exists for <b>'+esc(email)+'</b>, a password reset link will be sent to that address.</p><p class="mna-reset-note">Real reset-email delivery will be enabled when MOVA is connected to its server-backed authentication service.</p><button id="mnaResetDone" class="mna-btn" type="button">Back to sign in</button></div>';
      document.getElementById('mnaResetDone').onclick=backToSignIn;
    };
  }
  function addForgot(){
    var form=document.getElementById('mnaSignForm');
    if(!form||document.getElementById('mnaForgotPassword'))return;
    var wrap=document.createElement('div');
    wrap.className='mna-forgot-wrap';
    wrap.innerHTML='<button id="mnaForgotPassword" class="mna-forgot-link" type="button">Forgot password?</button>';
    var submit=form.querySelector('button[type="submit"]');
    if(submit&&submit.parentElement)submit.parentElement.insertAdjacentElement('afterend',wrap);else form.appendChild(wrap);
    document.getElementById('mnaForgotPassword').onclick=renderResetRequest;
  }
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#mnaSignTab');if(b)setTimeout(addForgot,0)},true);
  var mo=new MutationObserver(addForgot);
  function start(){mo.observe(document.body,{subtree:true,childList:true});addForgot();setInterval(addForgot,350)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();</script>`;
html=html.replace('</body>',runtime+'</body>');

writeFileSync(file,html);
console.log('MOVA Forgot Password link restored with email-only reset request.');
