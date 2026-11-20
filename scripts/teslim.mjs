// Teslim paketi (proje klasöründen): node <skill>/scripts/teslim.mjs
// ayar.json → teslim: { ad: "marka-tanitim", hedef: "C:/Users/.../Desktop" (isteğe bağlı kopya + zip yeri),
//   liste: [["R1", "konu-klasoru", "Konu açıklaması"], …]  ← YAPILIŞ SIRASIYLA; yeni video listenin SONUNA eklenir ki numaralar kaymasın }
// Çıktı: teslim/<NN-ad-klasor>/<ad>-<klasor>-<dikey-9x16|kare-1x1|yatay-16x9>.mp4 + ICERIK.md + KAYNAKLAR.md (+ hedef/ad klasörü + ad.zip)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { AYAR, sure } from './ortak.mjs';

const T = AYAR.teslim || {};
if (!T.liste || !T.liste.length) throw new Error('ayar.json → teslim.liste boş');
const AD = T.ad || 'tanitim-videolari';
const ORAN = { '9x16': 'dikey-9x16', '1x1': 'kare-1x1', '16x9': 'yatay-16x9' };
const oranlar = T.oranlar || Object.keys(ORAN);
const no = i => String(i + 1).padStart(2, '0');
const kok = 'teslim';
fs.rmSync(kok, { recursive: true, force: true });
fs.mkdirSync(kok, { recursive: true });
const satirlar = [];
for (const [i, [kod, klasor, konu]] of T.liste.entries()) {
  const kad = `${no(i)}-${AD}-${klasor}`, hedef = path.join(kok, kad);
  fs.mkdirSync(hedef, { recursive: true });
  let s = 0;
  for (const o of oranlar) {
    const kaynak = `out/${kod}-${o}.mp4`;
    if (!fs.existsSync(kaynak)) throw new Error('eksik video: ' + kaynak);
    fs.copyFileSync(kaynak, path.join(hedef, `${AD}-${klasor}-${ORAN[o]}.mp4`));
    s = sure(kaynak);
  }
  satirlar.push(`| ${no(i)} | \`${kad}/\` | ${konu} | ${s.toFixed(1).replace('.', ',')} sn |`);
}
if (fs.existsSync('KAYNAKLAR.md')) fs.copyFileSync('KAYNAKLAR.md', path.join(kok, 'KAYNAKLAR.md'));
fs.writeFileSync(path.join(kok, 'ICERIK.md'), `# ${T.baslik || AD}

Her klasör bir video; içinde ${oranlar.length} format var. Klasörler yapılış sırasıyla numaralı.

| No | Klasör | Konu | Süre |
|---|---|---|---|
${satirlar.join('\n')}

## Formatlar

| Dosya eki | Boyut | Nerede kullanılır |
|---|---|---|
| \`dikey-9x16\` | 1080×1920 | Instagram Reels/Hikâye, TikTok, YouTube Shorts |
| \`kare-1x1\` | 1080×1080 | Instagram ve Facebook akışı, Google Ads görüntülü |
| \`yatay-16x9\` | 1920×1080 | YouTube, Google Ads video, web sitesi, sunum |

Hepsi H.264 MP4, 30 fps, ses -14 LUFS. Altyazı videoya gömülü.${fs.existsSync('KAYNAKLAR.md') ? ' Müzik, efekt ve yazı tipi kaynakları: `KAYNAKLAR.md`.' : ''}
`);
console.log(`${T.liste.length} klasör, ${T.liste.length * oranlar.length} video → ${kok}/`);

if (T.hedef) {
  const hk = path.join(T.hedef, AD), hz = path.join(T.hedef, AD + '.zip');
  fs.rmSync(hk, { recursive: true, force: true });
  fs.cpSync(kok, hk, { recursive: true });
  const gecici = path.resolve(AD + '.zip');
  fs.rmSync(gecici, { force: true });
  const tar = process.platform === 'win32' ? 'C:/Windows/System32/tar.exe' : 'zip';
  const z = process.platform === 'win32' ? spawnSync(tar, ['-a', '-c', '-f', gecici, ...fs.readdirSync(kok)], { cwd: path.resolve(kok) }) : spawnSync('zip', ['-r', '-q', gecici, '.'], { cwd: path.resolve(kok) });
  if (z.status !== 0) throw new Error('zip: ' + z.stderr);
  fs.rmSync(hz, { force: true });
  fs.renameSync(gecici, hz);
  // denetim: teslim = hedef kopya (dosya adı + boyut)
  const liste = d => { const r = []; (function gez(a, on) { for (const n of fs.readdirSync(a)) { const p = path.join(a, n); fs.statSync(p).isDirectory() ? gez(p, on + n + '/') : r.push(`${on + n} ${fs.statSync(p).size}`); } })(d, ''); return r.sort(); };
  const ayni = JSON.stringify(liste(kok)) === JSON.stringify(liste(hk));
  console.log(`kopya: ${hk}\nzip: ${hz} (${(fs.statSync(hz).size / 1048576).toFixed(0)} MB); ${ayni ? 'denetim temiz' : 'FARK VAR: teslim ≠ kopya'}`);
}
