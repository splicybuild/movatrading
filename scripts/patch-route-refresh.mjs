import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

const script=`
<script id="mova-route-refresh-v188">
(function(){
  const KEY='movaCurrentRouteV1';
  const ROUTES=new Set(['home','pulse','learn','portfolio','news']);

  function normalise(v){
    v=String(v||'').replace(/^#/,'').trim().toLowerCase();
    return ROUTES.has(v)?v:null;
  }

  function desiredRoute(){
    return normalise(location.hash)||normalise(sessionStorage.getItem(KEY))||normalise(localStorage.getItem(KEY))||'home';
  }

  function saveRoute(route){
    route=normalise(route);
    if(!route)return;
    try{sessionStorage.setItem(KEY,route)}catch(_){}
    try{localStorage.setItem(KEY,route)}catch(_){}
    if(location.hash!=='#'+route){
      try{history.replaceState({movaRoute:route},'',location.pathname+location.search+'#'+route)}catch(_){}
    }
  }

  function install(){
    if(typeof window.go!=='function'){
      setTimeout(install,25);
      return;
    }
    if(window.go.__movaRouteWrapped)return;

    const original=window.go;
    const initial=desiredRoute();

    function wrappedGo(route,...args){
      const r=normalise(route);
      if(r) saveRoute(r);
      return original.call(this,route,...args);
    }
    wrappedGo.__movaRouteWrapped=true;
    wrappedGo.__movaOriginal=original;
    window.go=wrappedGo;

    requestAnimationFrame(()=>{
      const route=initial;
      if(route && route!=='home'){
        try{original.call(window,route)}catch(_){}
        saveRoute(route);
      } else {
        saveRoute('home');
      }
    });
  }

  window.addEventListener('hashchange',()=>{
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
console.log('MOVA route refresh persistence patch v188 complete.');
