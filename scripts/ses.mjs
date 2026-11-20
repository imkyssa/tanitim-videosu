// Seslendirme + müzik (seslendirmede kısılır) + efektler → görüntüyle birleştirir (proje klasöründen):
//   node <skill>/scripts/ses.mjs R1 9x16   → out/R1-9x16.mp4  (out/R1-9x16-sessiz.mp4 ve -ses.json gerekir)
// Ses -14 LUFS'e (sosyal medya) normalize edilir. Müzik muzik/<ad>.mp3, efektler sfx/<ad>.mp3.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { FF } from './ortak.mjs';

const [R, O] = process.argv.slice(2);
const { sure: D, ses: S } = JSON.parse(fs.readFileSync(`out/${R}-${O}-ses.json`, 'utf8'));

const onbellekYol = 'out/tepe.json';
const onbellek = fs.existsSync(onbellekYol) ? JSON.parse(fs.readFileSync(onbellekYol, 'utf8')) : {};
function tepe(f) {
  if (onbellek[f] != null) return onbellek[f];
  const r = spawnSync(FF, ['-i', f, '-af', 'volumedetect', '-vn', '-f', 'null', '-'], { encoding: 'utf8' });
  const m = /max_volume: ([-\d.]+)/.exec(r.stderr);
  onbellek[f] = m ? +m[1] : 0;
  fs.writeFileSync(onbellekYol, JSON.stringify(onbellek, null, 1));
  return onbellek[f];
}
const ms = s => Math.max(0, Math.round(s * 1000));
const girdi = ['-i', `out/${R}-${O}-sessiz.mp4`];
const f = [];
let n = 1;
girdi.push('-i', S.dosya);
f.push(`[${n}:a]aresample=48000,aformat=channel_layouts=stereo,atempo=${S.tempo.toFixed(4)},adelay=${ms(S.bas)}|${ms(S.bas)},apad=whole_dur=${D},asplit=2[vo][yan]`);
n++;
const mz = S.muzik || {};
if (mz.dosya !== false) {
  girdi.push('-i', `muzik/${mz.dosya || 'corporate-company-introduction-video'}.mp3`);
  f.push(`[${n}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=start=${mz.bas || 0},asetpts=PTS-STARTPTS${mz.tempo ? `,atempo=${mz.tempo.toFixed(4)}` : ''},atrim=0:${D},volume=${mz.kazanc ?? -6}dB,afade=t=in:st=0:d=0.25,afade=t=out:st=${(D - 0.8).toFixed(2)}:d=0.8[mz0]`);
  f.push(`[mz0][yan]sidechaincompress=threshold=0.035:ratio=${mz.oran || 5}:attack=25:release=420:makeup=1[mz]`);
  n++;
} else f.push('[yan]anullsink');
const efekt = [];
for (const [ad, t, g] of S.sfx) {
  const dosya = `sfx/${ad}.mp3`;
  if (!fs.existsSync(dosya)) { console.error('efekt yok, atlandı: ' + dosya); continue; }
  girdi.push('-i', dosya);
  const kazanc = -6 - tepe(dosya) + g;
  f.push(`[${n}:a]aresample=48000,aformat=channel_layouts=stereo,volume=${kazanc.toFixed(1)}dB,adelay=${ms(t)}|${ms(t)}[e${n}]`);
  efekt.push(`[e${n}]`); n++;
}
const karis = mz.dosya !== false ? '[vo][mz]' : '[vo]';
const adet = (mz.dosya !== false ? 2 : 1) + efekt.length;
f.push(`${karis}${efekt.join('')}amix=inputs=${adet}:normalize=0:dropout_transition=0,atrim=0:${D},loudnorm=I=-14:TP=-1.5:LRA=9[ses]`);
const cikti = `out/${R}-${O}.mp4`;
const r = spawnSync(FF, ['-v', 'error', '-y', ...girdi, '-filter_complex', f.join(';'), '-map', '0:v', '-map', '[ses]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', '-shortest', cikti], { stdio: 'inherit' });
console.log(r.status === 0 ? 'hazır: ' + cikti : 'HATA');
process.exit(r.status);
