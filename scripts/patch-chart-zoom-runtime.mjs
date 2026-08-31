import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

const runtime=`
<script data-mova-chart-zoom-runtime>
(function(){
  let zoomFactor=1;
  let zoomAnchor=1; // 0 = oldest/left, 1 = newest/right
  let originalDraw=null;
  let zoomControls=null;
  let canvas=null;
  let dragging=false;
  let dragStartX=0;
  let dragStartAnchor=1;

  function visibleSlice(data){
    if(!Array.isArray(data)||data.length<3||zoomFactor<=1)return data;
    const visible=Math.max(12,Math.round(data.length/zoomFactor));
    if(visible>=data.length)return data;
    const maxStart=data.length-visible;
    const start=Math.max(0,Math.min(maxStart,Math.round(maxStart*zoomAnchor)));
    return data.slice(start,start+visible);
  }

  function installZoomRenderer(){
    if(originalDraw||typeof drawMarketChart!=='function')return false;
    originalDraw=drawMarketChart;
    drawMarketChart=function(){
      if(zoomFactor<=1||!Array.isArray(chartData)||chartData.length<3)return originalDraw();
      const full=chartData;
      chartData=visibleSlice(full);
      try{return originalDraw()}finally{chartData=full}
    };
    return true;
  }

  function redraw(){
    if(typeof requestChartDraw==='function')requestChartDraw();
    else if(typeof drawMarketChart==='function')drawMarketChart();
  }

  function drawingToolActive(){
    const active=[...document.querySelectorAll('.active,[aria-pressed="true"]')];
    return active.some(el=>/trendline|support|resistance|horizontal|draw/i.test((el.textContent||'')+' '+(el.dataset?.tool||'')+' '+(el.title||'')));
  }

  function updateControls(){
    if(!zoomControls)return;
    const read=zoomControls.querySelector('.mova-chart-zoom-readout');
    const out=zoomControls.querySelector('[data-zoom="out"]');
    const reset=zoomControls.querySelector('[data-zoom="reset"]');
    const hint=zoomControls.querySelector('.mova-chart-pan-hint');
    if(read)read.textContent=zoomFactor===1?'100%':Math.round(zoomFactor*100)+'%';
    if(out)out.disabled=zoomFactor<=1.001;
    if(reset)reset.disabled=zoomFactor<=1.001;
    if(hint)hint.textContent=zoomFactor>1?'Drag chart to pan':'Zoom in to pan';
    if(canvas){canvas.style.cursor=zoomFactor>1&&!drawingToolActive()?(dragging?'grabbing':'grab'):'';canvas.style.touchAction=zoomFactor>1?'none':''}
  }

  function changeZoom(action){
    const old=zoomFactor;
    if(action==='in')zoomFactor=Math.min(8,zoomFactor*1.5);
    if(action==='out')zoomFactor=Math.max(1,zoomFactor/1.5);
    if(action==='reset'){zoomFactor=1;zoomAnchor=1}
    if(old<=1&&zoomFactor>1)zoomAnchor=1;
    updateControls();
    redraw();
  }

  function panByPixels(dx){
    if(zoomFactor<=1||!Array.isArray(chartData)||chartData.length<3||!canvas)return;
    const visible=Math.max(12,Math.round(chartData.length/zoomFactor));
    const hidden=Math.max(1,chartData.length-visible);
    const width=Math.max(1,canvas.getBoundingClientRect().width);
    // Drag right -> look further back (older candles); drag left -> newer candles.
    const delta=(dx/width)*(visible/hidden)*1.35;
    zoomAnchor=Math.max(0,Math.min(1,dragStartAnchor-delta));
    redraw();
  }

  function bindPan(){
    if(!canvas||canvas.dataset.movaPanBound)return;
    canvas.dataset.movaPanBound='1';
    canvas.addEventListener('pointerdown',e=>{
      if(zoomFactor<=1||drawingToolActive())return;
      dragging=true;dragStartX=e.clientX;dragStartAnchor=zoomAnchor;
      try{canvas.setPointerCapture(e.pointerId)}catch(_){}
      updateControls();
    });
    canvas.addEventListener('pointermove',e=>{
      if(!dragging)return;
      e.preventDefault();
      panByPixels(e.clientX-dragStartX);
    },{passive:false});
    const end=e=>{
      if(!dragging)return;
      dragging=false;
      try{canvas.releasePointerCapture(e.pointerId)}catch(_){}
      updateControls();
    };
    canvas.addEventListener('pointerup',end);
    canvas.addEventListener('pointercancel',end);
    canvas.addEventListener('lostpointercapture',()=>{dragging=false;updateControls()});
  }

  function setup(){
    if(zoomControls||!document.getElementById('marketCanvas'))return;
    if(!installZoomRenderer())return;
    const viewControls=document.querySelector('.mova-chart-view-controls');
    canvas=document.getElementById('marketCanvas');
    zoomControls=document.createElement('div');
    zoomControls.className='mova-chart-zoom-controls';
    zoomControls.innerHTML='<span class="mova-chart-zoom-label">ZOOM</span><button type="button" class="mova-chart-zoom-btn" data-zoom="in">＋ Zoom in</button><button type="button" class="mova-chart-zoom-btn" data-zoom="out">− Zoom out</button><span class="mova-chart-zoom-readout">100%</span><button type="button" class="mova-chart-zoom-btn" data-zoom="reset">Reset</button><span class="mova-chart-pan-hint" style="font-size:10px;color:#7891a2;font-weight:800;margin-left:4px">Zoom in to pan</span>';
    if(viewControls)viewControls.insertAdjacentElement('afterend',zoomControls);
    else canvas.parentElement.insertAdjacentElement('beforebegin',zoomControls);
    zoomControls.addEventListener('click',e=>{const b=e.target.closest('[data-zoom]');if(b)changeZoom(b.dataset.zoom)});
    bindPan();
    updateControls();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
  setTimeout(setup,400);
  setTimeout(setup,1000);
})();
</script>
`;

if(!html.includes('data-mova-chart-zoom-runtime'))html=html.replace('</body>',runtime+'</body>');
writeFileSync(file,html);
console.log('MOVA chart zoom + pan runtime injected.');
