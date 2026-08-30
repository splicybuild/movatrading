import { rmSync, mkdirSync, copyFileSync, cpSync, existsSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });

copyFileSync('index.html', 'dist/index.html');

if (existsSync('assets')) {
  cpSync('assets', 'dist/assets', { recursive: true });
}

for (const file of ['favicon.ico', 'manifest.webmanifest', 'mova-favicon.svg']) {
  if (existsSync(file)) copyFileSync(file, `dist/${file}`);
}

console.log('MOVA V2 clean static build complete.');
