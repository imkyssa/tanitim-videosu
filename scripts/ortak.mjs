// Ortak: ffmpeg/ffprobe yolu ve proje ayarı. Betikler proje klasöründen (index.html'in olduğu yer) çalıştırılır.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const AYAR = fs.existsSync('ayar.json') ? JSON.parse(fs.readFileSync('ayar.json', 'utf8')) : {};

function bul(ad) {
  if (AYAR[ad]) return AYAR[ad];
  if (process.env[ad.toUpperCase()]) return process.env[ad.toUpperCase()];
  const w = spawnSync(process.platform === 'win32' ? 'where' : 'which', [ad], { encoding: 'utf8' });
  if (w.status === 0 && w.stdout.trim()) return w.stdout.trim().split(/\r?\n/)[0];
  // Windows: winget ile kurulan Gyan.FFmpeg
  const kok = path.join(process.env.LOCALAPPDATA || '', 'Microsoft/WinGet/Packages');
  if (fs.existsSync(kok)) for (const p of fs.readdirSync(kok).filter(n => /ffmpeg/i.test(n))) {
    const ara = d => { for (const n of fs.readdirSync(d)) { const y = path.join(d, n); if (fs.statSync(y).isDirectory()) { const r = ara(y); if (r) return r; } else if (n.toLowerCase() === ad + '.exe') return y; } return null; };
    const r = ara(path.join(kok, p)); if (r) return r;
  }
  throw new Error(`${ad} bulunamadı: ayar.json'a "${ad}": "<yol>" yaz ya da PATH'e ekle`);
}
export const FF = bul('ffmpeg');
export const FP = bul('ffprobe');
export const sure = f => Number(spawnSync(FP, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.toString().trim());
