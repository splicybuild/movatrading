import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

const css=`
/* MOVA visual chart zoom + pan viewport */
.mova-chart-viewport{position:relative;overflow:hidden;border-radius:12px;touch-action:none;min-height:0}.mova-chart-viewport>canvas{display:block;transform-origin:50% 50%;will-change:transform}.mova-visual-zoom{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:0 0 12px;padding:8px 9px;border:1px solid #153446;border-radius:13px;background:#06121b}.mova-visual-zoom-label{font-size:10px;font-weight:900;color:#7891a2;letter-spacing:.07em;margin-right:3px}.mova-visual-zoom button{border:1px solid #1a4056;background:#081923;color:#a9bbc6;border-radius:10px;min-height:35px;padding:0 12px;font-size:12px;font-weight:900;cursor:pointer}.mova-visual-zoom button:hover{background:#0d3851;border-color:#1b668f;color:#fff}.mova-visual-zoom button:disabled{opacity:.4;cursor:not-allowed}.mova-visual-zoom [data-vz-readout]{min-width:50px;text-align:center;color:#7eefff;font-size:11px;font-weight:900}.mova-visual-zoom [data-vz-hint]{font-size:10px;color:#7891a2;font-weight:800;margin-left:4px}.mova-chart-viewport.is-zoomed{cursor:grab}.mova-chart-viewport.is-dragging{cursor:grabbing}@media(max-width:740px){.mova-visual-zoom{gap:6px}.mova-visual-zoom-label{width:100%}.mova-visual-zoom button{flex:1;min-width:72px;padding:0 7px}.mova-visual-zoom [data-vz-hint]{width:100%;margin:2px 0 0;text-align:center}}
`;
if(!html.includes('/* MOVA visual chart zoom + pan viewport */'))html=html.replace('</style>',css+'</style>');

const runtime=`
<script data-mova-visual-chart-viewport>
(function(){
  let scale=1,panX=0,panY=0,drag=null,viewport=null,canvas=null,controls=null;

  function drawingActive(){
    return [...document.querySelectorAll('.active,[aria-pressed="true"]')].some(el=>/trendline|support|resistance|horizontal|draw/i.test((el.textContent||'')+' '+(el.dataset?.tool||'')+' '+(el.title||'')));
  }
  function limits(){
    if(!viewport)return{x:0,y:0};
    const r=viewport.getBoundingClientRect();
    return{x:Math.max(0,(scale-1)*r.width/2),y:Math.max(0,(scale-1)*r.height/2)};
  }
  function clamp(){
    const l=limits();panX=Math.max(-l.x,Math.min(l.x,panX));panY=Math.max(-l.y,Math.min(l.y,panY));
  }
  function apply(){
    if(!canvas||!viewport)return;
    clamp();
    canvas.style.transform='translate('+panX+'px,'+panY+'px) scale('+scale+')';
    viewport.classList.toggle('is-zoomed',scale>1.001);
    viewport.classList.toggle('is-dragging',!!drag);
    const read=controls?.querySelector('[data-vz-readout]'),out=controls?.querySelector('[data-vz-out]'),reset=controls?.querySelector('[data-vz-reset]'),hint=controls?.querySelector('[data-vz-hint]');
    if(read)read.textContent=Math.round(scale*100)+'%';
    if(out)out.disabled=scale<=1.001;
    if(reset)reset.disabled=scale<=1.001&&Math.abs(panX)<1&&Math.abs(panY)<1;
    if(hint)hint.textContent=scale>1.001?'Drag anywhere on chart to move':'Zoom in, then drag to move';
  }
  function zoom(dir){
    if(dir>0)scale=Math.min(4,scale*1.25);
    else if(dir<0)scale=Math.max(1,scale/1.25);
    else{scale=1;panX=0;panY=0}
    if(scale<=1.001){scale=1;panX=0;panY=0}
    apply();
  }
  function setup(){
    canvas=document.getElementById('marketCanvas');if(!canvas)return;
    if(!canvas.parentElement.classList.contains('mova-chart-viewport')){
      viewport=document.createElement('div');viewport.className='mova-chart-viewport';
      canvas.parentNode.insertBefore(viewport,canvas);viewport.appendChild(canvas);
    }else viewport=canvas.parentElement;
    if(!document.getElementById('movaVisualZoom')){
      controls=document.createElement('div');controls.id='movaVisualZoom';controls.className='mova-visual-zoom';
      controls.innerHTML='<span class="mova-visual-zoom-label">ZOOM / PAN</span><button type="button" data-vz-in>＋ Zoom in</button><button type="button" data-vz-out>− Zoom out</button><span data-vz-readout>100%</span><button type="button" data-vz-reset>Reset</button><span data-vz-hint>Zoom in, then drag to move</span>';
      const views=document.querySelector('.mova-chart-view-controls');
      if(views)views.insertAdjacentElement('afterend',controls);else viewport.insertAdjacentElement('beforebegin',controls);
      controls.querySelector('[data-vz-in]').addEventListener('click',()=>zoom(1));
      controls.querySelector('[data-vz-out]').addEventListener('click',()=>zoom(-1));
      controls.querySelector('[data-vz-reset]').addEventListener('click',()=>zoom(0));
    }else controls=document.getElementById('movaVisualZoom');

    if(!viewport.dataset.movaVisualPan){
      viewport.dataset.movaVisualPan='1';
      viewport.addEventListener('pointerdown',e=>{
        if(scale<=1.001||drawingActive())return;
        drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:panX,startY:panY};
        try{viewport.setPointerCapture(e.pointerId)}catch(_){}
        e.preventDefault();e.stopPropagation();apply();
      },true);
      viewport.addEventListener('pointermove',e=>{
        if(!drag||e.pointerId!==drag.id)return;
        panX=drag.startX+(e.clientX-drag.x);panY=drag.startY+(e.clientY-drag.y);
        e.preventDefault();e.stopPropagation();apply();
      },true);
      const stop=e=>{
        if(!drag||e.pointerId!==drag.id)return;
        try{viewport.releasePointerCapture(e.pointerId)}catch(_){}
        drag=null;e.preventDefault();e.stopPropagation();apply();
      };
      viewport.addEventListener('pointerup',stop,true);viewport.addEventListener('pointercancel',stop,true);
      viewport.addEventListener('dblclick',e=>{if(scale>1.001&&!drawingActive()){zoom(0);e.preventDefault();e.stopPropagation()}},true);
    }
    apply();
    window.addEventListener('resize',apply,{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
  setTimeout(setup,350);setTimeout(setup,1000);
})();
</script>
`;
if(!html.includes('data-mova-visual-chart-viewport'))html=html.replace('</body>',runtime+'</body>');

writeFileSync(file,html);
console.log('MOVA visual chart zoom + pan viewport patch complete.');
