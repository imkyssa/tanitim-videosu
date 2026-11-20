// Yeni tanıtım videosu projesi kurar: node <skill>/scripts/kur.mjs <proje-klasoru>
// Motoru, sahne kütüphanesini, simgeleri, CC0 müzik/efektleri ve şablon dosyaları kopyalar; playwright-core kurar.
// Var olan dosyaların üzerine yazmaz (motor dosyaları hariç: motor.js, sahneler.js, index.html, ikonlar.js güncellenir).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hedef = path.resolve(process.argv[2] || 'tanitim');
fs.mkdirSync(hedef, { recursive: true });
for (const d of ['ses/ham', 'marka', 'out', 'onizleme', 'sfx', 'muzik']) fs.mkdirSync(path.join(hedef, d), { recursive: true });
const kopya = (a, b, ustune = false) => { const h = path.join(hedef, b); if (ustune || !fs.existsSync(h)) { fs.copyFileSync(path.join(SKILL, a), h); console.log((ustune ? 'güncellendi: ' : 'eklendi: ') + b); } };
for (const f of ['motor.js', 'sahneler.js', 'index.html', 'ikonlar.js']) kopya('motor/' + f, f, true);
kopya('ornek/tema.js', 'tema.js');
kopya('ornek/icerik.js', 'icerik.js');
kopya('ornek/ayar.json', 'ayar.json');
kopya('assets/KAYNAKLAR.md', 'KAYNAKLAR.md');
if (!fs.existsSync(path.join(hedef, 'kelimeler.js'))) fs.writeFileSync(path.join(hedef, 'kelimeler.js'), 'window.KELIMELER={};\n');
for (const f of fs.readdirSync(path.join(SKILL, 'assets/sfx'))) kopya('assets/sfx/' + f, 'sfx/' + f);
for (const f of fs.readdirSync(path.join(SKILL, 'assets/muzik'))) kopya('assets/muzik/' + f, 'muzik/' + f);
if (!fs.existsSync(path.join(hedef, 'package.json'))) fs.writeFileSync(path.join(hedef, 'package.json'), JSON.stringify({ name: 'tanitim-videosu', private: true, type: 'module', dependencies: { 'playwright-core': '^1.49.1' } }, null, 2));
if (!fs.existsSync(path.join(hedef, 'node_modules/playwright-core'))) {
  console.log('playwright-core kuruluyor…');
  const r = spawnSync('npm install --no-audit --no-fund', { cwd: hedef, stdio: 'inherit', shell: true });
  if (r.status !== 0) console.error('npm install başarısız; elle çalıştır: cd ' + hedef + ' && npm install');
}
// render/ses betikleri playwright-core'u proje klasöründen bulsun diye betikler oraya bağlanmaz; NODE_PATH yerine proje içinden çalıştır.
fs.mkdirSync(path.join(hedef, 'betik'), { recursive: true });
for (const f of fs.readdirSync(path.join(SKILL, 'scripts')).filter(f => f.endsWith('.mjs') && !['kur.mjs', 'kurulum.mjs'].includes(f))) fs.copyFileSync(path.join(SKILL, 'scripts', f), path.join(hedef, 'betik', f));
console.log(`\nProje hazır: ${hedef}\nKomutlar proje klasöründen: node betik/render.mjs R1 9x16 onizleme 1,5,10`);
