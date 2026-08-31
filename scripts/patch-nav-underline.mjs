import { readFileSync, writeFileSync } from 'node:fs';

const file = 'dist/index.html';
let html = readFileSync(file, 'utf8');

const css = `
/* MOVA desktop nav underline */
@media (min-width: 741px) {
  nav a,
  .nav a {
    position: relative;
    background: transparent !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  nav a::after,
  .nav a::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 3px;
    height: 3px;
    background: #42bbff;
    border-radius: 999px;
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.18s ease;
  }

  nav a:hover::after,
  .nav a:hover::after,
  nav a.active::after,
  .nav a.active::after {
    transform: scaleX(1);
  }

  nav a.active,
  .nav a.active {
    background: transparent !important;
    box-shadow: none !important;
  }
}
`;

if (!html.includes('/* MOVA desktop nav underline */')) {
  html = html.replace('</style>', css + '</style>');
}

writeFileSync(file, html);
console.log('MOVA nav underline patch complete.');
