// Ses üretmeden (kredi harcamadan) taslak önizleme için tahmini kelime zamanları.
//   node <skill>/scripts/kelime-tahmin.mjs R1 "Ekran yazımıyla metin. Noktalama duraklama sayılır."  [--hiz 2.2] [--sahne "Kelime1,Kelime2"] [--bosluk 1.2]
// kelimeler.js[R]'e yazar; gerçek ses gelince kelimeler.mjs aynı kaydın üzerine yazar.
import fs from 'node:fs';
const [R, metin] = process.argv.slice(2);
const arg = k => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : null; };
const hiz = +(arg('hiz') || 2.2); // 2,2 = enerjik reklam sesi; sakin anlatım için 1,9
const sahne = arg('sahne') ? arg('sahne').split(',').map(s => s.trim()) : [];
const bosluk = +(arg('bosluk') || (sahne.length ? 1.2 : 0));
let t = 0, si = 0;
const kel = metin.trim().split(/\s+/).map(w => {
  const yalin = w.replace(/[.,;:!?]+$/, '');
  if (si < sahne.length && yalin === sahne[si] && t > 0) { t += bosluk; si++; }
  const d = Math.max(.14, yalin.length * .058) * 2.2 / hiz; // ~0,058 sn/harf (Türkçe reklam anlatımı ölçümü)
  const k = [w, +t.toFixed(3), +(t + d).toFixed(3)];
  t += d + .08 + (/[.!?]$/.test(w) ? .22 : /[,;:]$/.test(w) ? .1 : 0);
  return k;
});
const kf = 'kelimeler.js';
const o = fs.existsSync(kf) ? JSON.parse(fs.readFileSync(kf, 'utf8').replace(/^window\.KELIMELER\s*=\s*/, '').replace(/;\s*$/, '') || '{}') : {};
o[R] = kel;
fs.writeFileSync(kf, 'window.KELIMELER=' + JSON.stringify(o) + ';\n');
console.log(`${R}: tahmini ${kel.at(-1)[2].toFixed(1)} sn, ${kel.length} kelime (TASLAK — gerçek ses değil)`);
