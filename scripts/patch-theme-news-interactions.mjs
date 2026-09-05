import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

const css=`<style id="mova-theme-v1-style">
body.mova-light-theme{background:#f4f7f9!important;color:#14212b!important}
body.mova-light-theme header,body.mova-light-theme .ticker-shell,body.mova-light-theme .ticker,body.mova-light-theme .page,body.mova-light-theme main,body.mova-light-theme section{background-color:#f4f7f9!important;color:#14212b!important}
body.mova-light-theme .card,body.mova-light-theme .mova-clean-card,body.mova-light-theme .mna-card,body.mova-light-theme .mna-stat,body.mova-light-theme .mna-row,body.mova-light-theme .news-search-wrap,body.mova-light-theme .ticker-item,body.mova-light-theme .mna-news{background:#fff!important;color:#14212b!important;border-color:#c8d7df!important}
body.mova-light-theme h1,body.mova-light-theme h2,body.mova-light-theme h3,body.mova-light-theme strong,body.mova-light-theme b,body.mova-light-theme nav button.active{color:#10202a!important}
body.mova-light-theme p,body.mova-light-theme .mna-copy,body.mova-light-theme .mna-news-body p,body.mova-light-theme .mova-clean-note,body.mova-light-theme .eyebrow{color:#5d7381!important}
body.mova-light-theme input,body.mova-light-theme select,body.mova-light-theme textarea,body.mova-light-theme .mna-input{background:#fff!important;color:#14212b!important;border-color:#b8ccd7!important}
body.mova-light-theme .mna-side,body.mova-light-theme #movaNativeAccount,body.mova-light-theme #movaNativeAuth .mna-box{background:#eef4f7!important;color:#14212b!important;border-color:#c8d7df!important}
body.mova-light-theme .mna-nav{color:#4f6674!important;background:transparent!important}body.mova-light-theme .mna-nav.active,body.mova-light-theme .mna-nav:hover{background:#dfeef5!important;color:#10202a!important;border-color:#8bbbd0!important}
body.mova-light-theme .mna-x{background:#fff!important;color:#14212b!important;border-color:#aac2ce!important}
body.mova-light-theme .mna-pie:after{background:#fff!important}
body.mova-light-theme .mobile-nav{background:#f4f7f9!important;border-color:#c8d7df!important}
body.mova-light-theme .mobile-nav button,body.mova-light-theme header nav button{color:#516976!important}
body.mova-light-theme .mova-desktop-account-btn{background:#fff!important;color:#14212b!important;border-color:#aac2ce!important}
</style>`;
html=html.replace('</head>',css+'</head>');

// Give Settings theme selector an id and make the selection persistent/app-wide.
html=html.replace('<select class="mna-input" style="width:160px"><option>Dark</option><option>Light</option></select>','<select id="mnaThemeSelect" class="mna-input" style="width:160px" onchange="movaNASetTheme(this.value)"><option>Dark</option><option>Light</option></select>');

const helpers=`
function movaNASetTheme(value){var light=String(value||'').toLowerCase()==='light';document.body.classList.toggle('mova-light-theme',light);try{localStorage.setItem('movaThemeV1',light?'light':'dark')}catch(e){}}
function movaNAApplyTheme(){var v='dark';try{v=localStorage.getItem('movaThemeV1')||'dark'}catch(e){};document.body.classList.toggle('mova-light-theme',v==='light');var s=document.getElementById('mnaThemeSelect');if(s)s.value=v==='light'?'Light':'Dark'}
`;
const marker='function openCompanyResearch(';
const pos=html.indexOf(marker);if(pos<0)throw new Error('main app marker not found');
const scriptStart=html.lastIndexOf('<script',pos),openEnd=html.indexOf('>',scriptStart);if(scriptStart<0||openEnd<0)throw new Error('main app script start not found');
new Function(helpers);
html=html.slice(0,openEnd+1)+helpers+html.slice(openEnd+1);

// Apply persisted theme after DOM creation and whenever Settings is rendered.
html=html.replace("if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',movaNativeAccountBoot);else movaNativeAccountBoot();","if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){movaNativeAccountBoot();movaNAApplyTheme()});else{movaNativeAccountBoot();movaNAApplyTheme()}");
html=html.replace("if(section==='settings')document.getElementById('mnaSignOut').onclick=function(){","if(section==='settings'){movaNAApplyTheme();document.getElementById('mnaSignOut').onclick=function(){");
html=html.replace("movaNACloseWorkspace();movaNAOpenAuth('signin')}}","movaNACloseWorkspace();movaNAOpenAuth('signin')}}}");

writeFileSync(file,html);
console.log('MOVA full light theme + Settings theme persistence complete.');
