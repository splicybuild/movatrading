import { rmSync, mkdirSync, copyFileSync, cpSync, appendFileSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
copyFileSync('index.html', 'dist/index.html');
cpSync('assets', 'dist/assets', { recursive: true });

const runtimePatch = String.raw`
<style id="mova-ai-runtime-v175">
.mova-ai-modal{z-index:2147483647!important}
</style>
<script id="mova-ai-runtime-v175-js">
(function(){
  function errText(v){
    if(!v)return 'Unknown error';
    if(typeof v==='string')return v;
    if(v instanceof Error)return v.message||String(v);
    if(typeof v==='object'){
      if(typeof v.message==='string')return v.message;
      if(typeof v.error==='string')return v.error;
      if(v.error&&typeof v.error.message==='string')return v.error.message;
      try{return JSON.stringify(v)}catch(_){return 'Unknown error'}
    }
    return String(v);
  }

  const originalOpen=window.movaAiOpenModal;
  if(typeof originalOpen==='function'){
    window.movaAiOpenModal=function(prefill=''){
      const modal=document.getElementById('movaAiModal');
      if(modal)document.body.appendChild(modal);
      return originalOpen(prefill);
    };
  }

  window.movaAiErrorText=errText;

  window.movaAskAiSubmit=async function(ev){
    if(ev)ev.preventDefault();
    window.movaAiOpenModal?.();
    const input=document.getElementById('movaAiQuestion');
    const btn=document.getElementById('movaAiAskBtn');
    const host=document.getElementById('movaAiThread');
    const q=String(input?.value||'').trim();
    if(!q)return false;

    window.movaAiAdd?.('user',q);
    if(Array.isArray(window.movaAiHistory))window.movaAiHistory.push({role:'user',content:q});
    if(input)input.value='';
    if(btn){btn.disabled=true;btn.textContent='...';}

    const thinking=document.createElement('div');
    thinking.className='mova-ai-thinking';
    thinking.textContent='MOVA is researching the company, market data, price history and relevant news...';
    host?.appendChild(thinking);
    window.movaAiScroll?.();

    try{
      const history=Array.isArray(window.movaAiHistory)?window.movaAiHistory.slice(-8):[];
      const portfolio=typeof window.movaAiPortfolioPayload==='function'?window.movaAiPortfolioPayload():{holdings:[],cash:0};
      const r=await fetch('/api/ask-ai',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({question:q,portfolio,history})});
      const raw=await r.text();
      let d={};
      try{d=raw?JSON.parse(raw):{};}catch(_){d={error:raw||('Ask AI '+r.status)};}
      if(!r.ok||d.error)throw new Error(errText(d.error||d)||('Ask AI '+r.status));
      thinking.remove();
      window.movaAiAdd?.('assistant',d.answer||'No answer returned.',d.sources||[]);
      if(Array.isArray(window.movaAiHistory))window.movaAiHistory.push({role:'assistant',content:d.answer||''});
    }catch(e){
      thinking.remove();
      window.movaAiAdd?.('error','MOVA AI could not complete this request: '+errText(e));
    }finally{
      if(btn){btn.disabled=false;btn.textContent='↑';}
    }
    return false;
  };
})();
</script>
`;

appendFileSync('dist/index.html', runtimePatch, 'utf8');
console.log('MOVA build complete with AI runtime fix.');
