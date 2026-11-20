// Tabler Icons (MIT) yollarını ikonlar.js'e toplar.
//   Skill içinde (bir kez): node scripts/ikon-uret.mjs --temel <node_modules/@tabler/icons/icons>  → motor/ikonlar.js
//   Projede ek simge:        node betik/ikon-uret.mjs ad1 ad2 …   (gerekirse önce: npm i @tabler/icons) → ikonlar.js'e ekler
// Simge adları: https://tabler.io/icons
import fs from 'node:fs';
import path from 'node:path';
const ic = s => s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<path stroke="none" d="M0 0h24v24H0z" fill="none"\s*\/>/, '').trim();
const TEMEL = `alarm alert-circle alert-triangle archive arrow-down arrow-left arrow-right arrow-up arrows-exchange award bell bolt book bookmark
box brand-apple brand-google-play brand-whatsapp brand-instagram brand-linkedin brand-youtube briefcase browser building building-bank building-store bulb calculator
calendar calendar-due calendar-event camera car cash chart-bar chart-line chart-pie check checkbox checklist chevron-right circle-check circle-x click clipboard
clipboard-check clipboard-list clock cloud cloud-upload code coffee coin copy credit-card crown database device-desktop device-laptop device-mobile
discount download edit eye file file-certificate file-check file-invoice file-text file-type-pdf filter fingerprint flag folder gavel gift globe
hand-click headset heart heart-rate-monitor help home hourglass id inbox info-circle key layout-dashboard layout-grid layout-kanban leaf link list
list-check lock lock-open login logout mail mailbox map-pin message message-circle messages microphone moon notebook package paperclip percentage
phone photo pin player-play plug plus pointer printer qrcode radar receipt refresh repeat report-money robot rocket rosette school search send
server settings share shield shield-check shopping-cart sparkles speakerphone star stars stethoscope stopwatch sun table tag target thumb-up ticket
tool tools trash trending-up truck upload user user-check user-plus users video wallet wand world x zoom-check zzz`.split(/\s+/);
const DOLU = ['circle-check', 'bell', 'moon', 'sun', 'bolt', 'star', 'pointer', 'mail', 'heart'];
const i = process.argv.indexOf('--temel');
if (i > 0) {
  const D = process.argv[i + 1];
  const out = { cizgi: {}, dolu: {} };
  for (const n of TEMEL) { const f = `${D}/outline/${n}.svg`; if (fs.existsSync(f)) out.cizgi[n] = ic(fs.readFileSync(f, 'utf8')); else console.error('yok: ' + n); }
  for (const n of DOLU) { const f = `${D}/filled/${n}.svg`; if (fs.existsSync(f)) out.dolu[n] = ic(fs.readFileSync(f, 'utf8')); }
  const hedef = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../motor/ikonlar.js');
  fs.writeFileSync(hedef, '// Tabler Icons (MIT)\nwindow.IKONLAR=' + JSON.stringify(out) + ';\n');
  console.log('temel ikon:', Object.keys(out.cizgi).length, Object.keys(out.dolu).length, '→', hedef);
} else {
  const adlar = process.argv.slice(2);
  const D = 'node_modules/@tabler/icons/icons';
  if (!fs.existsSync(D)) throw new Error('önce: npm i @tabler/icons');
  const src = fs.readFileSync('ikonlar.js', 'utf8');
  const out = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
  for (const n of adlar) { const f = `${D}/outline/${n}.svg`; if (!fs.existsSync(f)) { console.error('yok: ' + n); continue; } out.cizgi[n] = ic(fs.readFileSync(f, 'utf8')); }
  fs.writeFileSync('ikonlar.js', '// Tabler Icons (MIT)\nwindow.IKONLAR=' + JSON.stringify(out) + ';\n');
  console.log('eklendi:', adlar.join(', '));
}
