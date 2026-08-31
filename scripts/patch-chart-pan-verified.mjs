import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

const marker="let activeResearchTicker=null,chartType='line',chartTimeframe='1M',indicators={sma:false,ema:false,rsi:false},drawMode=null,drawings=[],pendingPoint=null,chartData=[];";
if(!html.includes(marker)) throw new Error('Verified chart pan patch: chart state marker not found');

const injected=`${marker}
let chartFullData=[];
let chartZoomFactor=1;
let chartViewStart=0;
let chartPanDrag=null;

function chartVisibleCount(){
  const n=chartFullData.length;
  if(!n)return 0;
  return Math.max(12,Math.min(n,Math.round(n/chartZoomFactor)));
}
function applyChartViewport(){
  if(!chartFullData.length){chartData=[];return}
  const visible=chartVisibleCount();
  const maxStart=Math.max(0,chartFullData.length-visible);
  chartViewStart=Math.max(0,Math.min(maxStart,Math.round(chartViewStart)));
  chartData=chartFullData.slice(chartViewStart,chartViewStart+visible);
}
function setChartViewportData(data,reset=true){
  chartFullData=Array.isArray(data)?data.slice():[];
  if(reset){chartZoomFactor=1;chartViewStart=0}
  applyChartViewport();
  updateVerifiedZoomUi();
}
function zoomVerifiedChart(dir){
  if(!chartFullData.length&&chartData.length)chartFullData=chartData.slice();
  const oldVisible=chartVisibleCount()||chartFullData.length;
  const oldCenter=chartViewStart+(oldVisible-1)/2;
  if(dir>0)chartZoomFactor=Math.min(8,chartZoomFactor*1.5);
  else if(dir<0)chartZoomFactor=Math.max(1,chartZoomFactor/1.5);
  else{chartZoomFactor=1;chartViewStart=0;applyChartViewport();requestChartDraw();updateVerifiedZoomUi();return}
  const visible=chartVisibleCount();
  chartViewStart=Math.round(oldCenter-(visible-1)/2);
  const maxStart=Math.max(0,chartFullData.length-visible);
  if(chartZoomFactor>1&&dir>0&&oldVisible===chartFullData.length)chartViewStart=maxStart;
  chartViewStart=Math.max(0,Math.min(maxStart,chartViewStart));
  applyChartViewport();requestChartDraw();updateVerifiedZoomUi();
}
function chartDrawToolActive(){return !!drawMode}
function updateVerifiedZoomUi(){
  const bar=document.getElementById('movaVerifiedZoom');if(!bar)return;
  const read=bar.querySelector('[data-z-read]'),out=bar.querySelector('[data-z-out]'),reset=bar.querySelector('[data-z-reset]'),hint=bar.querySelector('[data-z-hint]');
  if(read)read.textContent=Math.round(chartZoomFactor*100)+'%';
  if(out)out.disabled=chartZoomFactor<=1.001;
  if(reset)reset.disabled=chartZoomFactor<=1.001;
  if(hint)hint.textContent=chartZoomFactor>1?'Drag chart left/right to move through history':'Zoom in, then drag chart';
  if(typeof marketCanvas!=='undefined'&&marketCanvas){marketCanvas.style.cursor=chartZoomFactor>1&&!chartDrawToolActive()?(chartPanDrag?'grabbing':'grab'):'crosshair';marketCanvas.style.touchAction=chartZoomFactor>1?'none':'auto'}
}
function setupVerifiedChartPan(){
  if(typeof marketCanvas==='undefined'||!marketCanvas)return;
  if(!document.getElementById('movaVerifiedZoom')){
    const bar=document.createElement('div');bar.id='movaVerifiedZoom';bar.className='mova-verified-zoom';
    bar.innerHTML='<span class="mova-verified-zoom-label">ZOOM / PAN</span><button type="button" data-z-in>＋ Zoom in</button><button type="button" data-z-out>− Zoom out</button><span data-z-read>100%</span><button type="button" data-z-reset>Reset</button><span data-z-hint>Zoom in, then drag chart</span>';
    const views=document.querySelector('.mova-chart-view-controls');
    if(views)views.insertAdjacentElement('afterend',bar);else marketCanvas.parentElement.insertAdjacentElement('beforebegin',bar);
    bar.querySelector('[data-z-in]').addEventListener('click',()=>zoomVerifiedChart(1));
    bar.querySelector('[data-z-out]').addEventListener('click',()=>zoomVerifiedChart(-1));
    bar.querySelector('[data-z-reset]').addEventListener('click',()=>zoomVerifiedChart(0));
  }
  if(!marketCanvas.dataset.movaVerifiedPan){
    marketCanvas.dataset.movaVerifiedPan='1';
    marketCanvas.addEventListener('pointerdown',e=>{
      if(chartZoomFactor<=1||chartDrawToolActive())return;
      chartPanDrag={id:e.pointerId,x:e.clientX,start:chartViewStart};
      try{marketCanvas.setPointerCapture(e.pointerId)}catch(_){}
      e.preventDefault();updateVerifiedZoomUi();
    });
    marketCanvas.addEventListener('pointermove',e=>{
      if(!chartPanDrag||e.pointerId!==chartPanDrag.id)return;
      const r=marketCanvas.getBoundingClientRect(),visible=chartVisibleCount();
      if(!r.width||!visible)return;
      const candlesPerPixel=visible/r.width;
      const delta=Math.round((e.clientX-chartPanDrag.x)*candlesPerPixel);
      chartViewStart=chartPanDrag.start-delta;
      const maxStart=Math.max(0,chartFullData.length-visible);
      chartViewStart=Math.max(0,Math.min(maxStart,chartViewStart));
      applyChartViewport();requestChartDraw();
      e.preventDefault();updateVerifiedZoomUi();
    },{passive:false});
    const stop=e=>{if(!chartPanDrag||e.pointerId!==chartPanDrag.id)return;chartPanDrag=null;try{marketCanvas.releasePointerCapture(e.pointerId)}catch(_){}e.preventDefault();updateVerifiedZoomUi()};
    marketCanvas.addEventListener('pointerup',stop,{passive:false});
    marketCanvas.addEventListener('pointercancel',stop,{passive:false});
  }
  updateVerifiedZoomUi();
}
setTimeout(setupVerifiedChartPan,100);
setTimeout(setupVerifiedChartPan,700);`;

html=html.replace(marker,injected);

html=html.replace('chartData=rows;const s=document.getElementById(\'chartDataStatus\');','setChartViewportData(rows,true);const s=document.getElementById(\'chartDataStatus\');');
html=html.replace('chartData=getCachedMarketData(activeResearchTicker,tf,a.p);\n    drawings=[];pendingPoint=null;requestChartDraw();','setChartViewportData(getCachedMarketData(activeResearchTicker,tf,a.p),true);\n    drawings=[];pendingPoint=null;requestChartDraw();');
html=html.replace('chartData=getCachedMarketData(k,chartTimeframe,a.p);drawings=[];pendingPoint=null;','setChartViewportData(getCachedMarketData(k,chartTimeframe,a.p),true);drawings=[];pendingPoint=null;');

const required=[
  "setChartViewportData(rows,true);const s=document.getElementById('chartDataStatus');",
  'setChartViewportData(getCachedMarketData(activeResearchTicker,tf,a.p),true);',
  'setChartViewportData(getCachedMarketData(k,chartTimeframe,a.p),true);'
];
for(const r of required)if(!html.includes(r))throw new Error('Verified chart pan patch: required replacement failed: '+r);

const css=`
/* Verified MOVA chart zoom and pan */
.mova-verified-zoom{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:0 0 12px;padding:8px 9px;border:1px solid #153446;border-radius:13px;background:#06121b}.mova-verified-zoom-label{font-size:10px;font-weight:900;color:#7891a2;letter-spacing:.07em;margin-right:3px}.mova-verified-zoom button{border:1px solid #1a4056;background:#081923;color:#a9bbc6;border-radius:10px;min-height:35px;padding:0 12px;font-size:12px;font-weight:900;cursor:pointer}.mova-verified-zoom button:hover{background:#0d3851;border-color:#1b668f;color:#fff}.mova-verified-zoom button:disabled{opacity:.4;cursor:not-allowed}.mova-verified-zoom [data-z-read]{min-width:50px;text-align:center;color:#7eefff;font-size:11px;font-weight:900}.mova-verified-zoom [data-z-hint]{font-size:10px;color:#7891a2;font-weight:800;margin-left:4px}@media(max-width:740px){.mova-verified-zoom{gap:6px}.mova-verified-zoom-label{width:100%}.mova-verified-zoom button{flex:1;min-width:72px;padding:0 7px}.mova-verified-zoom [data-z-hint]{width:100%;margin:2px 0 0;text-align:center}}
`;
if(!html.includes('/* Verified MOVA chart zoom and pan */'))html=html.replace('</style>',css+'</style>');

writeFileSync(file,html);
console.log('Verified MOVA chart zoom + pan patch complete.');
