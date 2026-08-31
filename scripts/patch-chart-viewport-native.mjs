import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

const decl=/let\s+chartData\s*=\s*([^;]+);/;
const m=html.match(decl);
if(!m) throw new Error('Native chart viewport patch: chartData declaration not found');

const native=`let chartData=${m[1]};
let chartFullData=Array.isArray(chartData)?chartData.slice():[];
let chartZoomFactor=1;
let chartPanAnchor=1;
let chartPanDrag=null;

function chartVisibleCount(){
  const n=chartFullData.length||chartData.length||0;
  return Math.max(12,Math.min(n,Math.round(n/chartZoomFactor)));
}
function applyChartViewport(){
  if(!Array.isArray(chartFullData)||!chartFullData.length){chartFullData=Array.isArray(chartData)?chartData.slice():[]}
  if(chartZoomFactor<=1||chartFullData.length<=12){chartData=chartFullData.slice();chartPanAnchor=1;return}
  const visible=chartVisibleCount(),maxStart=Math.max(0,chartFullData.length-visible);
  const start=Math.max(0,Math.min(maxStart,Math.round(maxStart*chartPanAnchor)));
  chartData=chartFullData.slice(start,start+visible);
}
function redrawChartViewport(){applyChartViewport();if(typeof requestChartDraw==='function')requestChartDraw();else if(typeof drawMarketChart==='function')drawMarketChart();updateNativeChartZoomUi()}
function zoomChartNative(dir){
  if(!chartFullData.length&&Array.isArray(chartData))chartFullData=chartData.slice();
  if(dir>0)chartZoomFactor=Math.min(8,chartZoomFactor*1.5);
  else if(dir<0)chartZoomFactor=Math.max(1,chartZoomFactor/1.5);
  else{chartZoomFactor=1;chartPanAnchor=1}
  redrawChartViewport();
}
function chartDrawingActive(){
  return [...document.querySelectorAll('.active,[aria-pressed="true"]')].some(el=>/trendline|support|resistance|horizontal|draw/i.test((el.textContent||'')+' '+(el.dataset?.tool||'')+' '+(el.title||'')));
}
function updateNativeChartZoomUi(){
  const bar=document.getElementById('movaNativeChartZoom');if(!bar)return;
  const read=bar.querySelector('[data-native-zoom-readout]'),out=bar.querySelector('[data-native-zoom-out]'),reset=bar.querySelector('[data-native-zoom-reset]'),hint=bar.querySelector('[data-native-pan-hint]');
  if(read)read.textContent=chartZoomFactor<=1?'100%':Math.round(chartZoomFactor*100)+'%';
  if(out)out.disabled=chartZoomFactor<=1.001;
  if(reset)reset.disabled=chartZoomFactor<=1.001;
  if(hint)hint.textContent=chartZoomFactor>1?'Drag chart left/right to pan':'Zoom in to pan';
  const c=document.getElementById('marketCanvas');if(c){c.style.cursor=chartZoomFactor>1&&!chartDrawingActive()?(chartPanDrag?'grabbing':'grab'):'';c.style.touchAction=chartZoomFactor>1?'none':''}
}
function setupNativeChartViewport(){
  const canvas=document.getElementById('marketCanvas');if(!canvas)return;
  if(!document.getElementById('movaNativeChartZoom')){
    const bar=document.createElement('div');bar.id='movaNativeChartZoom';bar.className='mova-native-chart-zoom';
    bar.innerHTML='<span class="mova-native-chart-zoom-label">ZOOM / PAN</span><button type="button" data-native-zoom-in>＋ Zoom in</button><button type="button" data-native-zoom-out>− Zoom out</button><span data-native-zoom-readout>100%</span><button type="button" data-native-zoom-reset>Reset</button><span data-native-pan-hint>Zoom in to pan</span>';
    const views=document.querySelector('.mova-chart-view-controls');
    if(views)views.insertAdjacentElement('afterend',bar);else canvas.parentElement.insertAdjacentElement('beforebegin',bar);
    bar.querySelector('[data-native-zoom-in]').addEventListener('click',()=>zoomChartNative(1));
    bar.querySelector('[data-native-zoom-out]').addEventListener('click',()=>zoomChartNative(-1));
    bar.querySelector('[data-native-zoom-reset]').addEventListener('click',()=>zoomChartNative(0));
  }
  if(!canvas.dataset.nativeChartPan){
    canvas.dataset.nativeChartPan='1';
    canvas.addEventListener('pointerdown',e=>{
      if(chartZoomFactor<=1||chartDrawingActive())return;
      chartPanDrag={x:e.clientX,anchor:chartPanAnchor};
      try{canvas.setPointerCapture(e.pointerId)}catch(_){}
      updateNativeChartZoomUi();
    });
    canvas.addEventListener('pointermove',e=>{
      if(!chartPanDrag)return;
      e.preventDefault();
      const width=Math.max(1,canvas.getBoundingClientRect().width),visible=chartVisibleCount(),hidden=Math.max(1,chartFullData.length-visible);
      const delta=((e.clientX-chartPanDrag.x)/width)*(visible/hidden)*1.6;
      chartPanAnchor=Math.max(0,Math.min(1,chartPanDrag.anchor-delta));
      redrawChartViewport();
    },{passive:false});
    const stop=e=>{if(!chartPanDrag)return;chartPanDrag=null;try{canvas.releasePointerCapture(e.pointerId)}catch(_){}updateNativeChartZoomUi()};
    canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);canvas.addEventListener('lostpointercapture',()=>{chartPanDrag=null;updateNativeChartZoomUi()});
  }
  updateNativeChartZoomUi();
}
setTimeout(setupNativeChartViewport,250);setTimeout(setupNativeChartViewport,900);`;

html=html.replace(decl,native);
html=html.replace(/chartData\s*=\s*clean;/g,'chartFullData=clean.slice();chartPanAnchor=1;applyChartViewport();');

const css=`
/* Native MOVA chart zoom and pan */
.mova-native-chart-zoom{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:0 0 12px;padding:8px 9px;border:1px solid #153446;border-radius:13px;background:#06121b}.mova-native-chart-zoom-label{font-size:10px;font-weight:900;color:#7891a2;letter-spacing:.07em;margin-right:3px}.mova-native-chart-zoom button{border:1px solid #1a4056;background:#081923;color:#a9bbc6;border-radius:10px;min-height:35px;padding:0 12px;font-size:12px;font-weight:900;cursor:pointer}.mova-native-chart-zoom button:hover{background:#0d3851;border-color:#1b668f;color:#fff}.mova-native-chart-zoom button:disabled{opacity:.4;cursor:not-allowed}.mova-native-chart-zoom [data-native-zoom-readout]{min-width:50px;text-align:center;color:#7eefff;font-size:11px;font-weight:900}.mova-native-chart-zoom [data-native-pan-hint]{font-size:10px;color:#7891a2;font-weight:800;margin-left:4px}@media(max-width:740px){.mova-native-chart-zoom{gap:6px}.mova-native-chart-zoom-label{width:100%}.mova-native-chart-zoom button{flex:1;min-width:72px;padding:0 7px}.mova-native-chart-zoom [data-native-pan-hint]{width:100%;margin:2px 0 0;text-align:center}}
`;
html=html.replace('</style>',css+'</style>');

writeFileSync(file,html);
console.log('MOVA native chart zoom + pan patch complete.');
