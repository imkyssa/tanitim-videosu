// Herkese açık bir sayfanın ekran görüntüsünü marka/ altına kaydeder (ekran sahnesi ve tema doğrulaması için).
//   node betik/ekran-al.mjs <adres> <marka/dosya.png> [--genislik 1440] [--tam] [--koyu] [--cerez (çerez bandını gizleme)]
// Giriş gerektiren ekranlar için kullanma: kullanıcıdan o ekranın görüntüsünü marka/ altına kaydetmesini iste.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
const [adres, cikti] = process.argv.slice(2);
const arg = k => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : null; };
const genislik = +(arg('genislik') || 1440);
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: genislik, height: Math.round(genislik * .625) }, deviceScaleFactor: 2, colorScheme: process.argv.includes('--koyu') ? 'dark' : 'light' });
await page.goto(adres, { waitUntil: 'networkidle', timeout: 45000 });
if (!process.argv.includes('--cerez')) await page.addStyleTag({ content: '[id*=cookie i],[class*=cookie i],[id*=consent i],[class*=consent i],[class*=cerez i],[id*=cerez i]{display:none!important}' }); // çerez bandını yalnız görüntüde gizle
await page.waitForTimeout(800);
fs.mkdirSync(path.dirname(cikti), { recursive: true });
await page.screenshot({ path: cikti, fullPage: process.argv.includes('--tam') });
const boy = await page.evaluate(() => document.documentElement.scrollHeight);
console.log(`kaydedildi: ${cikti} (sayfa yüksekliği ${boy} px, ${genislik} px genişlikte)`);
await browser.close();
