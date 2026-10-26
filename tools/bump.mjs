// Stamps ?v=<content-hash> on every local CSS/JS reference in index.html.
// Run after editing CSS or JS:  node tools/bump.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const html = readFileSync('index.html', 'utf8');
const out = html.replace(/(href|src)="(assets\/(?:css|js)\/[^"?]+)(?:\?v=[a-f0-9]+)?"/g, (m, attr, path) => {
  const v = createHash('sha1').update(readFileSync(path)).digest('hex').slice(0, 8);
  return `${attr}="${path}?v=${v}"`;
});
writeFileSync('index.html', out);
console.log([...out.matchAll(/assets\/(?:css|js)\/[^"]+\?v=[a-f0-9]+/g)].map(m => m[0]).join('\n'));
