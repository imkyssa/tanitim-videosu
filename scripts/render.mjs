// Kare kare çizim (proje klasöründen):
//   node <skill>/scripts/render.mjs R1 9x16 onizleme 0.5,3,8   → onizleme/R1-9x16-<sn>.png
//   node <skill>/scripts/render.mjs R1 9x16 video [isci=6]     → out/R1-9x16-sessiz.mp4 (+ out/R1-9x16-ses.json)
// Kareler tarayıcı protokolünden (CDP) kayıpsız PNG alınır, paralel tarayıcılara bölünür, parçalar kodlanır ve birleştirilir.
// Kodlayıcı: KODEK=nvenc (NVIDIA, hızlı) | x264 (varsayılan, her yerde çalışır). Tarayıcı: kurulu Chrome (playwright-core).
import { chromium } from 'playwright-core';
import { spawn, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { FF, AYAR } from './ortak.mjs';

const FPS = 30;
const [R, O, mod, arg] = process.argv.slice(2);
const [W, H] = { '9x16': [1080, 1920], '1x1': [1080, 1080], '16x9': [1920, 1080] }[O] || [];
if (!W) throw new Error('oran: 9x16 | 1x1 | 16x9');
const ARGS = ['--allow-file-access-from-files', '--force-color-profile=srgb', '--hide-scrollbars', ...(AYAR.gpu === false ? [] : ['--force_high_performance_gpu', '--use-angle=d3d11'])];

async function sayfaAc() {
  const browser = await chromium.launch({ channel: AYAR.tarayici || 'chrome', args: ARGS });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('SAYFA HATASI:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('KONSOL:', m.text()); });
  await page.goto(pathToFileURL(path.resolve('index.html')).href + `?r=${R}&o=${O}`);
  await page.waitForFunction(() => window.ready === true, null, { timeout: 30000 });
  const cdp = await page.context().newCDPSession(page);
  const kare = async t => {
    await page.evaluate(x => window.seek(x), t);
    const r = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
    return Buffer.from(r.data, 'base64');
  };
  return { browser, page, kare };
}

const KODEK = process.env.KODEK || AYAR.kodek || 'x264';
const RENK = ['-pix_fmt', 'yuv420p', '-g', String(FPS * 2), '-vf', 'scale=in_range=full:out_range=tv,format=yuv420p',
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv'];
const KODLA = {
  x264: ['-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-threads', '2', ...RENK],
  nvenc: ['-c:v', 'h264_nvenc', '-preset', 'p7', '-tune', 'hq', '-rc', 'vbr', '-cq', '19', '-b:v', '0', '-profile:v', 'high', ...RENK],
}[KODEK];
if (!KODLA) throw new Error('KODEK: x264 | nvenc');

if (mod === 'onizleme') {
  const { browser, kare } = await sayfaAc();
  fs.mkdirSync('onizleme', { recursive: true });
  for (const s of (arg || '1').split(',').map(Number)) fs.writeFileSync(`onizleme/${R}-${O}-${s.toFixed(2).padStart(5, '0')}.png`, await kare(s));
  console.log('önizleme bitti');
  await browser.close();
} else if (mod === 'video') {
  fs.mkdirSync('out/parca', { recursive: true });
  const ilk = await sayfaAc();
  const bilgi = await ilk.page.evaluate(() => ({ sure: window.SURE, ses: window.SES }));
  fs.writeFileSync(`out/${R}-${O}-ses.json`, JSON.stringify(bilgi));
  const n = Math.round(bilgi.sure * FPS);
  const isci = Math.max(1, Math.min(+(arg || 6), 8));
  const boy = Math.ceil(n / isci);
  const bas = Date.now();
  let biten = 0;
  const parcalar = await Promise.all(Array.from({ length: isci }, async (_, w) => {
    const a = w * boy, b = Math.min(n, a + boy);
    if (a >= b) return null;
    const s = w === 0 ? ilk : await sayfaAc();
    const dosya = `out/parca/${R}-${O}-${w}.mp4`;
    const ff = spawn(FF, ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', ...KODLA, dosya], { stdio: ['pipe', 'ignore', 'inherit'] });
    for (let i = a; i < b; i++) {
      const png = await s.kare(i / FPS);
      if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
      if (++biten % 150 === 0) console.log(`${R}-${O} ${biten}/${n} kare (${((Date.now() - bas) / 1000).toFixed(0)} sn)`);
    }
    ff.stdin.end();
    const kod = await new Promise(r => ff.on('close', r));
    if (kod !== 0) console.error(`KODLAMA HATASI (${KODEK}, çıkış ${kod})` + (KODEK === 'nvenc' ? ' — KODEK=x264 ile yeniden dene' : ''));
    await s.browser.close();
    return dosya;
  }));
  const liste = `out/parca/${R}-${O}.txt`;
  fs.writeFileSync(liste, parcalar.filter(Boolean).map(p => `file '${path.resolve(p).replace(/\\/g, '/')}'`).join('\n'));
  const cikti = `out/${R}-${O}-sessiz.mp4`;
  const r = spawnSync(FF, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', liste, '-c', 'copy', '-movflags', '+faststart', cikti], { stdio: 'inherit' });
  console.log(r.status === 0 ? `video bitti: ${cikti} ${n} kare, ${((Date.now() - bas) / 1000).toFixed(1)} sn (${isci} işçi)` : 'BİRLEŞTİRME HATASI');
} else throw new Error('mod: onizleme | video');
