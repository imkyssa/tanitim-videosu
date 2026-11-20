// SVG logonun boş kenarlarını kırpar (viewBox'ı içeriğe daraltır): node betik/svg-kirp.mjs marka/logo.svg [pay=20]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [dosya, payS] = process.argv.slice(2); const pay = +(payS || 20);
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage();
await p.goto(pathToFileURL(path.resolve(dosya)).href);
const kutu = await p.evaluate(() => { const s = document.querySelector('svg'); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const e of s.querySelectorAll('path,rect,circle,ellipse,polygon,polyline,use,text,image')) { if (e.closest('defs,clipPath,mask')) continue; try { const k = e.getBBox(); if (!k.width && !k.height) continue; const m = e.getCTM(), r = s.getCTM().inverse().multiply(m);
    for (const [x, y] of [[k.x, k.y], [k.x + k.width, k.y], [k.x, k.y + k.height], [k.x + k.width, k.y + k.height]]) { const q = new DOMPoint(x, y).matrixTransform(r); x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); } } catch {} }
  return { x0, y0, x1, y1 }; });
await b.close();
let s = fs.readFileSync(dosya, 'utf8');
const vb = `${(kutu.x0 - pay).toFixed(1)} ${(kutu.y0 - pay).toFixed(1)} ${(kutu.x1 - kutu.x0 + 2 * pay).toFixed(1)} ${(kutu.y1 - kutu.y0 + 2 * pay).toFixed(1)}`;
s = s.replace(/viewBox="[^"]*"/, `viewBox="${vb}"`).replace(/\swidth="[^"]*"/, ' width="' + Math.round(kutu.x1 - kutu.x0 + 2 * pay) + '"').replace(/\sheight="[^"]*"/, ' height="' + Math.round(kutu.y1 - kutu.y0 + 2 * pay) + '"');
const cikti = dosya.replace(/\.svg$/, '-kirpik.svg'); fs.writeFileSync(cikti, s);
console.log(`${cikti}: viewBox ${vb}, oran ${((kutu.x1 - kutu.x0 + 2 * pay) / (kutu.y1 - kutu.y0 + 2 * pay)).toFixed(2)}`);
