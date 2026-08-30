import { rmSync, mkdirSync, copyFileSync, cpSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });

const sourceDir = 'src/v2';
if (existsSync(sourceDir)) {
  const parts = readdirSync(sourceDir)
    .filter(file => /^part-\d+\.b64part$/.test(file))
    .sort();

  if (!parts.length) throw new Error('MOVA V2 source parts missing');

  const encoded = parts
    .map(file => readFileSync(`${sourceDir}/${file}`, 'utf8').trim())
    .join('');
  const html = gunzipSync(Buffer.from(encoded, 'base64'));
  writeFileSync('dist/index.html', html);
} else {
  copyFileSync('index.html', 'dist/index.html');
}

if (existsSync('assets')) {
  cpSync('assets', 'dist/assets', { recursive: true });
}

for (const file of ['favicon.ico', 'manifest.webmanifest', 'mova-favicon.svg']) {
  if (existsSync(file)) copyFileSync(file, `dist/${file}`);
}

console.log('MOVA V2.4.2 preview build complete.');
