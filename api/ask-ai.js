function num(v){const n=Number(v);return Number.isFinite(n)?n:0;}
function money(v){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(num(v));}
function safeText(v,max=8000){return String(v||'').replace(/\u0000/g,'').slice(0,max);}
function portfolioSummary(raw){
  const holdings=Array.isArray(raw?.holdings)?raw.holdings.slice(0,40):[];
  const rows=holdings.map(h=>{
    const qty=num(h.qty),avg=num(h.avg),current=num(h.current),value=qty*current,cost=qty*avg,pnl=value-cost,pnlPct=cost?100*pnl/cost:0;
    return {ticker:safeText(h.ticker,20).toUpperCase(),qty,avg,current,value,cost,pnl,pnlPct};
  }).filter(x=>x.ticker);
  const holdingsValue=rows.reduce((s,x)=>s+x.value,0);
  const cost=rows.reduce((s,x)=>s+x.cost,0);
  const cash=num(raw?.cash);
  const total=holdingsValue+cash;
  const pnl=holdingsValue-cost;
  const ranked=rows.slice().sort((a,b)=>b.value-a.value);
  const concentrations=ranked.map(x=>({ticker:x.ticker,weightPct:total?100*x.value/total:0,value:x.value}));
  const project=(rate,years)=>total*Math.pow(1+rate,years);
  return {
    cash,holdingsValue,totalValue:total,totalCost:cost,totalPnl:pnl,totalPnlPct:cost?100*pnl/cost:0,
    holdings:rows,concentrations,
    illustrativeScenarios:{
      note:'Illustrative compound-return scenarios only; these are not forecasts.',
      cautious:{annualRate:0.04,oneYear:project(.04,1),threeYears:project(.04,3),fiveYears:project(.04,5)},
      base:{annualRate:0.08,oneYear:project(.08,1),threeYears:project(.08,3),fiveYears:project(.08,5)},
      strong:{annualRate:0.12,oneYear:project(.12,1),threeYears:project(.12,3),fiveYears:project(.12,5)}
    }
  };
}
function fallbackPortfolioAnswer(q,p){
  const top=p.concentrations.slice(0,3).map(x=>`${x.ticker} ${x.weightPct.toFixed(1)}%`).join(', ')||'No holdings';
  const s=p.illustrativeScenarios;
  return `MOVA portfolio snapshot\n\nCurrent portfolio value: ${money(p.totalValue)} (${money(p.holdingsValue)} invested + ${money(p.cash)} cash). Unrealised P/L versus recorded average cost: ${p.totalPnl>=0?'+':''}${money(p.totalPnl)} (${p.totalPnlPct>=0?'+':''}${p.totalPnlPct.toFixed(1)}%).\n\nLargest concentrations: ${top}. Concentration is important because a small number of large positions can dominate both upside and drawdown risk.\n\nIllustrative growth scenarios (not forecasts):\n• 4% annualised: ${money(s.cautious.oneYear)} in 1y, ${money(s.cautious.threeYears)} in 3y, ${money(s.cautious.fiveYears)} in 5y.\n• 8% annualised: ${money(s.base.oneYear)} in 1y, ${money(s.base.threeYears)} in 3y, ${money(s.base.fiveYears)} in 5y.\n• 12% annualised: ${money(s.strong.oneYear)} in 1y, ${money(s.strong.threeYears)} in 3y, ${money(s.strong.fiveYears)} in 5y.\n\nFor a deeper answer to “${safeText(q,180)}” using current company news, macro drivers and web research, MOVA needs OPENAI_API_KEY configured on the deployment.`;
}
function collectSources(data){
  const out=[];
  for(const item of data?.output||[]){
    if(item?.type==='web_search_call'){
      const src=item?.action?.sources;
      if(Array.isArray(src))for(const s of src){const url=s?.url||s?.link,title=s?.title||s?.name||url;if(url&&!out.some(x=>x.url===url))out.push({title:safeText(title,180),url:safeText(url,800)});}
    }
    if(item?.type==='message'){
      for(const c of item?.content||[]){
        for(const a of c?.annotations||[]){const url=a?.url||a?.url_citation?.url,title=a?.title||a?.url_citation?.title||url;if(url&&!out.some(x=>x.url===url))out.push({title:safeText(title,180),url:safeText(url,800)});}
      }
    }
  }
  return out.slice(0,12);
}
export default {async fetch(request){
  if(request.method==='GET')return Response.json({ok:true,configured:Boolean(process.env.OPENAI_API_KEY),model:'gpt-5.6-terra'},{headers:{'Cache-Control':'no-store'}});
  if(request.method!=='POST')return Response.json({error:'Method not allowed'},{status:405});
  try{
    const body=await request.json();
    const question=safeText(body?.question,5000).trim();
    if(!question)return Response.json({error:'Ask a question first.'},{status:400});
    const portfolio=portfolioSummary(body?.portfolio||{});
    const history=Array.isArray(body?.history)?body.history.slice(-8).map(x=>({role:x?.role==='assistant'?'assistant':'user',content:safeText(x?.content,4000)})):[];
    const key=process.env.OPENAI_API_KEY;
    if(!key){
      if(/portfolio|holding|investment|invested|growth|project|risk|diversif|concentrat|profit|loss|p\/?l/i.test(question))return Response.json({answer:fallbackPortfolioAnswer(question,portfolio),sources:[],configured:false,portfolio},{headers:{'Cache-Control':'no-store'}});
      return Response.json({answer:'MOVA Ask AI is installed, but the deployment does not currently have OPENAI_API_KEY configured. Once it is added, I can answer this with live web research, current relevant news and detailed stock analysis.',sources:[],configured:false},{headers:{'Cache-Control':'no-store'}});
    }

    const now=new Date().toISOString();
    const instructions=`You are MOVA AI, the research assistant inside MOVA Trading. Current timestamp: ${now}. Answer questions about stocks, shares, ETFs, indices, commodities, market drivers, news and the user's supplied MOVA portfolio.\n\nFor any question naming a stock, share, ticker, listed company, ETF, index or commodity, use web search so the answer reflects current information even when the user does not explicitly say latest or current. For current or time-sensitive questions, use web search. Prefer primary/company filings, investor relations, exchanges, regulators and established financial/news sources. State dates for current news. Distinguish facts from interpretation. Never invent prices, analyst targets, earnings numbers or headlines. For company research, cover what the business does, relevant investment and share-price history, financial and earnings context, valuation context when reliably available, recent news and catalysts, material risks, competitive or sector factors, and what investors should watch next. Explain why each factor matters rather than listing facts.\n\nFor portfolio questions, analyse the supplied holdings, weights, recorded average costs, P/L and cash. Identify concentration, diversification, correlated exposures, company/sector/macro risks, catalysts and what could materially change the outlook. If the user asks for projected growth, use scenario analysis and clearly label assumptions; never present a projection as guaranteed. The supplied 4%, 8% and 12% compound scenarios are illustrative reference cases, not predictions. You may supplement them with researched company/market context.\n\nStyle: detailed but concise, plain English, useful to a trader/investor. Lead with a direct answer, then use short sections when useful: MOVA view; Current drivers; Relevant news/catalysts; Risks; Portfolio impact; Scenarios; What to watch next. Explain why each factor matters. Avoid generic filler. Do not tell the user simply to consult an adviser. Include a brief informational-not-personal-financial-advice note only when the answer contains investment conclusions or projections.`;

    const context={question,portfolio,conversation:history};
    const r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'gpt-5.6-terra',
        reasoning:{effort:'medium'},
        text:{verbosity:'high'},
        tools:[{type:'web_search_preview',search_context_size:'high'}],
        tool_choice:'auto',
        include:['web_search_call.action.sources'],
        store:false,
        max_output_tokens:7000,
        instructions,
        input:[{role:'user',content:[{type:'input_text',text:`MOVA context (JSON):\n${JSON.stringify(context)}\n\nAnswer the user's question using this context.`}]}]
      })
    });
    const data=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(data?.error?.message||`OpenAI ${r.status}`);
    const answer=safeText(data?.output_text||'',30000) || (data?.output||[]).flatMap(i=>i?.content||[]).filter(c=>c?.type==='output_text').map(c=>c.text).join('\n').trim();
    if(!answer)throw new Error('AI returned no text response');
    return Response.json({answer,sources:collectSources(data),configured:true,model:data?.model||'gpt-5.6-terra',asOf:now,portfolio},{headers:{'Cache-Control':'no-store'}});
  }catch(e){return Response.json({error:e?.message||'MOVA Ask AI failed'},{status:500,headers:{'Cache-Control':'no-store'}});}
}};
