import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

const script=`
<script id="mova-route-refresh-v192">
(function(){
  const KEY='movaCurrentRouteV1';
  const COMPANY_KEY='movaCurrentCompanyV1';
  const ROUTES=new Set(['home','pulse','learn','portfolio','news']);

  function normalise(v){
    v=String(v||'').replace(/^#/,'').trim().toLowerCase();
    return ROUTES.has(v)?v:null;
  }
  function companyFromHash(){
    const m=String(location.hash||'').match(/^#company=([A-Z0-9.\-]+)$/i);
    return m?m[1].toUpperCase():null;
  }
  function desiredRoute(){
    return normalise(location.hash)||normalise(sessionStorage.getItem(KEY))||normalise(localStorage.getItem(KEY))||'home';
  }
  function saveRoute(route,updateHash=true){
    route=normalise(route);
    if(!route)return;
    try{sessionStorage.setItem(KEY,route)}catch(_){}
    try{localStorage.setItem(KEY,route)}catch(_){}
    if(updateHash && location.hash!=='#'+route){
      try{history.replaceState({movaRoute:route},'',location.pathname+location.search+'#'+route)}catch(_){}
    }
  }
  function saveCompany(symbol){
    const k=String(symbol||'').trim().toUpperCase();
    if(!k)return;
    try{sessionStorage.setItem(COMPANY_KEY,k)}catch(_){}
    try{history.replaceState({movaCompany:k},'',location.pathname+location.search+'#company='+encodeURIComponent(k))}catch(_){}
  }
  function clearCompany(){
    try{sessionStorage.removeItem(COMPANY_KEY)}catch(_){}
  }

  function install(){
    if(typeof window.go!=='function' || typeof window.openCompanyResearch!=='function' || typeof window.closeCompanyResearch!=='function'){
      setTimeout(install,25);
      return;
    }
    if(window.go.__movaRouteWrapped)return;

    const originalGo=window.go;
    const originalOpenCompany=window.openCompanyResearch;
    const originalCloseCompany=window.closeCompanyResearch;
    const companyAtLoad=companyFromHash();
    const initialRoute=desiredRoute();

    function wrappedGo(route,...args){
      const r=normalise(route);
      if(r){ clearCompany(); saveRoute(r,true); }
      return originalGo.call(this,route,...args);
    }
    wrappedGo.__movaRouteWrapped=true;
    wrappedGo.__movaOriginal=originalGo;
    window.go=wrappedGo;

    window.openCompanyResearch=function(symbol,...args){
      const base=pages?.find?.(page=>document.getElementById(page)?.classList.contains('active'))||initialRoute||'pulse';
      saveRoute(base,false);
      saveCompany(symbol);
      return originalOpenCompany.call(this,symbol,...args);
    };

    window.closeCompanyResearch=function(...args){
      const result=originalCloseCompany.apply(this,args);
      clearCompany();
      const page=pages?.find?.(p=>document.getElementById(p)?.classList.contains('active'))||initialRoute||'pulse';
      saveRoute(page,true);
      return result;
    };

    requestAnimationFrame(()=>{
      const route=initialRoute||'home';
      try{ originalGo.call(window,route); }catch(_){}
      saveRoute(route,!companyAtLoad);
      if(companyAtLoad){
        setTimeout(()=>{
          try{ originalOpenCompany.call(window,companyAtLoad); saveCompany(companyAtLoad); }catch(_){}
        },60);
      }
    });
  }

  window.addEventListener('hashchange',()=>{
    const company=companyFromHash();
    if(company && typeof window.openCompanyResearch==='function'){
      try{window.openCompanyResearch(company)}catch(_){}
      return;
    }
    const route=normalise(location.hash);
    if(route && typeof window.go==='function'){
      try{window.go(route)}catch(_){}
    }
  });

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install);
  else install();
})();
</script>
`;

if(!html.includes('</body>')) throw new Error('Route refresh patch: </body> not found');
html=html.replace('</body>',script+'</body>');
writeFileSync(file,html);
console.log('MOVA route + company refresh persistence patch v192 complete.');
