import { readFileSync, writeFileSync } from 'node:fs';

const file = 'dist/index.html';
let html = readFileSync(file, 'utf8');

const css = `
/* MOVA desktop nav underline */
@media (min-width: 741px) {
  header nav button,
  nav button,
  .nav button {
    position: relative;
    background: transparent !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  header nav button::after,
  nav button::after,
  .nav button::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 1px;
    height: 3px;
    background: linear-gradient(90deg, #42bbff, #78ef31);
    border-radius: 999px;
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.18s ease;
    pointer-events: none;
  }

  header nav button:hover::after,
  nav button:hover::after,
  .nav button:hover::after,
  header nav button.active::after,
  nav button.active::after,
  .nav button.active::after {
    transform: scaleX(1);
  }

  header nav button.active,
  nav button.active,
  .nav button.active {
    background: transparent !important;
    box-shadow: none !important;
    color: #f5f8fb !important;
  }
}
`;

// Replace an older version if present; otherwise insert fresh CSS.
const marker='/* MOVA desktop nav underline */';
const start=html.indexOf(marker);
if(start!==-1){
  const mediaStart=html.lastIndexOf('@media', start);
  const styleEnd=html.indexOf('</style>', start);
  if(mediaStart!==-1 && styleEnd!==-1){
    // Remove only the old nav-underline block by matching from marker to the next standalone closing brace sequence.
    const before=html.slice(0, mediaStart);
    const tail=html.slice(mediaStart);
    const match=tail.match(/@media \(min-width:\s*741px\)\s*\{[\s\S]*?\/\* MOVA desktop nav underline \*\/[\s\S]*?\n\}\n/);
    if(match)html=before+tail.replace(match[0],css+'\n');
    else html=html.replace('</style>', css + '</style>');
  }
}else{
  html = html.replace('</style>', css + '</style>');
}

writeFileSync(file, html);
console.log('MOVA button nav underline patch complete.');
