// Scribe kelime zamanlarını kelimeler.js'e yazar; okunuşları ekran yazımına çevirir (tema.js → TEMA.yazim, TEMA.birlesik).
// Film için sahne başlarına boşluk ekleyip sesi yeniden kurar (görsellere nefes, filmi hedef süreye taşır).
//   node <skill>/scripts/kelimeler.mjs R1                          → ses/R1.mp3 = ses/ham/R1.mp3, kelimeler.js[R1]
//   node <skill>/scripts/kelimeler.mjs T1 --sahne "Fest,Müşterileri,…" [--hedef 59.5] [--enfazla 1.6]
// Girdi: ses/ham/<R>.mp3 ve ses/ham/<R>-kelimeler.json (Scribe words.json: {words:[{text,type,start,end}]} ya da düz dizi).
import fs from 'node:fs';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { FF } from './ortak.mjs';

const R = process.argv[2];
const arg = k => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : null; };
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync('tema.js', 'utf8'), ctx);
const TEMA = ctx.window.TEMA || {};
const YAZIM = TEMA.yazim || {};            // { 'Fest': 'Fast', 'Vatsap': 'WhatsApp' }
const BIRLESIK = TEMA.birlesik || [];      // [['Se', 'Ge', 'Ka', 'SGK']] — art arda okunan parçalar tek kelime olur

const ham0 = JSON.parse(fs.readFileSync(`ses/ham/${R}-kelimeler.json`, 'utf8'));
const ham = (Array.isArray(ham0) ? ham0 : ham0.words).filter(w => !w.type || w.type === 'word');
const sesSure = ham[ham.length - 1].end;
const sahne = arg('sahne') ? arg('sahne').split(',').map(s => s.trim()) : [];
const bas = []; { let j = 0; for (const k of sahne) { while (j < ham.length && ham[j].text.replace(/[.,;:!?]+$/, '') !== k.replace(/[.,;:!?]+$/, '')) j++; if (j >= ham.length) throw new Error('sahne kelimesi yok: ' + k); bas.push(j); j++; } }
const hedef = +(arg('hedef') || 59.5), enFazla = +(arg('enfazla') || 1.6);
const bosluk = bas.length ? Math.max(0, Math.min(enFazla, (hedef - 1.2 - sesSure) / bas.length)) : 0;
const kes = bas.map(i => (ham[i - 1].end + ham[i].start) / 2);

if (bas.length && bosluk > 0) {
  const p = [0, ...kes, null], f = [];
  for (let i = 0; i < p.length - 1; i++) f.push(`[0:a]atrim=start=${p[i].toFixed(3)}${p[i + 1] != null ? `:end=${p[i + 1].toFixed(3)}` : ''},asetpts=PTS-STARTPTS${p[i + 1] != null ? `,apad=pad_dur=${bosluk.toFixed(3)}` : ''}[p${i}]`);
  f.push(p.slice(0, -1).map((_, i) => `[p${i}]`).join('') + `concat=n=${p.length - 1}:v=0:a=1[c]`);
  const r = spawnSync(FF, ['-v', 'error', '-y', '-i', `ses/ham/${R}.mp3`, '-filter_complex', f.join(';'), '-map', '[c]', '-c:a', 'libmp3lame', '-b:a', '192k', `ses/${R}.mp3`], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('ffmpeg');
} else fs.copyFileSync(`ses/ham/${R}.mp3`, `ses/${R}.mp3`);

const kel = [];
for (let i = 0; i < ham.length; i++) {
  const w = ham[i];
  const kaydir = bosluk ? kes.filter(c => w.start > c).length * bosluk : 0;
  const t0 = +(w.start + kaydir).toFixed(3), t1 = +(w.end + kaydir).toFixed(3);
  const yalin = w.text.replace(/[.,;:!?]+$/, ''), son = w.text.slice(yalin.length);
  const b = BIRLESIK.find(x => x.slice(0, -1).every((p, j) => ham[i + j] && ham[i + j].text.replace(/[.,;:!?]+$/, '') === p));
  if (b) { const n = b.length - 1, sonW = ham[i + n - 1]; const sk = bosluk ? kes.filter(c => sonW.start > c).length * bosluk : 0;
    kel.push([b.at(-1) + sonW.text.slice(sonW.text.replace(/[.,;:!?]+$/, '').length), t0, +(sonW.end + sk).toFixed(3)]); i += n - 1; continue; }
  kel.push([(YAZIM[yalin] || yalin) + son, t0, t1]);
}
const kf = 'kelimeler.js';
const o = fs.existsSync(kf) ? JSON.parse(fs.readFileSync(kf, 'utf8').replace(/^window\.KELIMELER\s*=\s*/, '').replace(/;\s*$/, '') || '{}') : {};
o[R] = kel;
fs.writeFileSync(kf, 'window.KELIMELER=' + JSON.stringify(o) + ';\n');
console.log(`${R}: ses ${sesSure.toFixed(2)} sn${bas.length ? `, ${bas.length} boşluk × ${bosluk.toFixed(2)} sn` : ''} → ${kel.at(-1)[2].toFixed(2)} sn, ${kel.length} kelime`);
