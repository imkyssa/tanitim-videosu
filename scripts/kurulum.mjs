// Skill kurulumu / güncellemesi: node ~/.claude/skills/tanitim-videosu/scripts/kurulum.mjs
// - Üretim ajanını (ajan/tanitim-uretici.md) ~/.claude/agents/ altına kopyalar (Claude Code ajanları oradan yükler).
// - Gerekenleri denetler: Node sürümü, Chrome, ffmpeg. Hiçbir şey indirmez/kurmaz; eksikleri söyler.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ajanlar = path.join(os.homedir(), '.claude', 'agents');
fs.mkdirSync(ajanlar, { recursive: true });
const kaynak = path.join(SKILL, 'ajan', 'tanitim-uretici.md'), hedef = path.join(ajanlar, 'tanitim-uretici.md');
const ayni = fs.existsSync(hedef) && fs.readFileSync(hedef, 'utf8') === fs.readFileSync(kaynak, 'utf8');
if (!ayni) { fs.copyFileSync(kaynak, hedef); console.log('ajan kuruldu: ' + hedef + ' (yeni oturumda görünür)'); } else console.log('ajan güncel: ' + hedef);

const ana = +process.versions.node.split('.')[0];
console.log((ana >= 18 ? '✓' : '✗') + ' Node ' + process.versions.node + (ana >= 18 ? '' : ' — 18+ gerekli'));
const var_ = ad => spawnSync(process.platform === 'win32' ? 'where' : 'which', [ad], { encoding: 'utf8' }).status === 0;
const chrome = process.platform === 'win32'
  ? ['C:/Program Files/Google/Chrome/Application/chrome.exe', path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe')].some(p => fs.existsSync(p))
  : process.platform === 'darwin' ? fs.existsSync('/Applications/Google Chrome.app') : var_('google-chrome') || var_('google-chrome-stable');
console.log((chrome ? '✓' : '✗') + ' Google Chrome' + (chrome ? '' : ' — kurulu Chrome gerekli (render kurulu Chrome ile yapılır)'));
let ff = var_('ffmpeg');
if (!ff && process.platform === 'win32') { const k = path.join(process.env.LOCALAPPDATA || '', 'Microsoft/WinGet/Packages'); ff = fs.existsSync(k) && fs.readdirSync(k).some(n => /ffmpeg/i.test(n)); }
console.log((ff ? '✓' : '✗') + ' ffmpeg' + (ff ? '' : ' — kur (Windows: winget install Gyan.FFmpeg) ya da projede ayar.json → "ffmpeg" yolunu yaz'));
console.log('\nAyrıca: Claude in Chrome eklentisi (site analizi) ve ElevenLabs bağlayıcısı (seslendirme) oturuma bağlı olmalı.');
