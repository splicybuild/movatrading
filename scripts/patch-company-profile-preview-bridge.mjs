import fs from 'node:fs';

const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');

const old=`const fetchJson=async(url,timeout=7000)=>{
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),timeout);
    try{const r=await fetch(url,{signal:ctrl.signal});if(!r.ok)throw new Error('HTTP '+r.status);return await r.json();}
    finally{clearTimeout(timer)}
  };`;

const replacement=`const fetchJson=async(url,timeout=7000)=>{
    const attempt=async target=>{
      const ctrl=new AbortController();
      const timer=setTimeout(()=>ctrl.abort(),timeout);
      try{const r=await fetch(target,{signal:ctrl.signal});if(!r.ok)throw new Error('HTTP '+r.status);return await r.json();}
      finally{clearTimeout(timer)}
    };
    try{return await attempt(url)}catch(firstError){
      if(location.hostname==='movatrading-vert.vercel.app')throw firstError;
      const u=new URL(url,location.origin);
      let endpoint='';
      if(u.pathname==='/api/fundamentals')endpoint='fundamentals';
      else if(u.pathname==='/api/market')endpoint='market';
      else if(u.pathname==='/api/company-history')endpoint='company-history';
      if(!endpoint)throw firstError;
      const bridge=new URL('/api/company-profile-bridge',location.origin);
      bridge.searchParams.set('endpoint',endpoint);
      u.searchParams.forEach((v,k)=>bridge.searchParams.set(k,v));
      return await attempt(bridge.toString());
    }
  };`;

if(!html.includes(old))throw new Error('Company profile fetch helper not found for preview bridge patch');
html=html.replace(old,replacement);
fs.writeFileSync(file,html);
console.log('Patched company profile preview API fallback bridge.');
