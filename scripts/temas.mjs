// Önizleme karelerinden temas tablosu: node <skill>/scripts/temas.mjs <çıktı.png> <sütun> <genişlik> kare1.png kare2.png ...
import { spawnSync } from 'node:child_process';
import { FF } from './ortak.mjs';
const [cikti, sutunS, genS, ...kareler] = process.argv.slice(2);
const sutun = +sutunS, gen = +genS, n = kareler.length;
const girdi = kareler.flatMap(k => ['-i', k]);
const olc = kareler.map((_, i) => `[${i}:v]scale=${gen}:-2,pad=iw+8:ih+8:4:4:color=0x333333[k${i}]`).join(';');
const yer = kareler.map((_, i) => `${(i % sutun) ? Array.from({ length: i % sutun }, (_, j) => `w${j}`).join('+') : '0'}_${Math.floor(i / sutun) ? Array.from({ length: Math.floor(i / sutun) }, (_, j) => `h${j * sutun}`).join('+') : '0'}`).join('|');
const f = n === 1 ? `${olc}` : `${olc};${kareler.map((_, i) => `[k${i}]`).join('')}xstack=inputs=${n}:layout=${yer}:fill=black`;
const r = spawnSync(FF, ['-v', 'error', '-y', ...girdi, '-filter_complex', f, ...(n === 1 ? ['-map', '[k0]'] : []), '-frames:v', '1', cikti], { stdio: 'inherit' });
process.exit(r.status);
