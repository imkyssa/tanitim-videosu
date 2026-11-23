// Tanıtım videosu motoru: oran yerleşimi, zaman, yumuşama, başlık/altyazı/arka plan/kapanış.
// Görünüm tamamen window.TEMA'dan gelir (tema.js). Sayfa ?r=R1&o=9x16 ile açılır; window.seek(t) her kareyi belirli çizer.
// Kod adı kuralı: R… = kısa reklam (≤15 sn hedef, gerekirse ≤%10 hızlanır); diğerleri (T…, A…) = film, hızlanmaz.
(function () {
  'use strict';
  const q = new URLSearchParams(location.search);
  const O = q.get('o') || '9x16';
  const R = q.get('r') || 'R1';
  const BOYUT = { '9x16': [1080, 1920], '1x1': [1080, 1080], '16x9': [1920, 1080] };
  const [W, H] = BOYUT[O];
  const TM = window.TEMA, RK = TM.renk;
  const ADRES = q.get('adres') || TM.adres || '';

  // ---------- renk yardımcıları (tema renklerinden açık/koyu tonlar türetir) ----------
  const hex = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
  const hexYaz = a => '#' + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  const karis = (a, b, p) => { const x = hex(a), y = hex(b); return hexYaz(x.map((v, i) => v + (y[i] - v) * p)); };
  const saydam = (h, a) => { const [r, g, b] = hex(h); return `rgba(${r},${g},${b},${a})`; };
  // açık: rengi yüzeye doğru açar (rozet zemini); koyu temada da yüzeyle karışır, yani koyu bir ton olur
  const acik = (h, p = .88) => karis(h, RK.yuzey, p);
  const Renk = { ...RK, acik, karis, saydam, hex };

  // CSS değişkenleri
  const kok = document.documentElement.style;
  ['zemin', 'yuzey', 'murekkep', 'ikincil', 'soluk', 'cizgi', 'ana', 'ana2', 'vurgu1', 'vurgu2', 'basari', 'hata', 'dikkat', 'bilgi', 'mor'].forEach(k => RK[k] && kok.setProperty('--' + k, RK[k]));
  kok.setProperty('--font', `'${TM.font.aile}', ${TM.font.yedek || 'system-ui, sans-serif'}`);
  kok.setProperty('--kose', (TM.kose ?? 24) + 'px');
  kok.setProperty('--golge', saydam(RK.golge || (TM.koyu ? '#000000' : '#10285A'), TM.koyu ? .55 : .28));
  kok.setProperty('--golge2', saydam(RK.golge || (TM.koyu ? '#000000' : '#10285A'), TM.koyu ? .35 : .16));
  kok.setProperty('--vurgu-grad', `linear-gradient(95deg, ${RK.vurgu1} 0%, ${RK.vurgu2} 100%)`);
  kok.setProperty('--hata-grad', `linear-gradient(95deg, ${RK.hata} 0%, ${karis(RK.hata, '#000000', .18)} 100%)`);
  kok.setProperty('--cta-grad', `linear-gradient(95deg, ${RK.ana} 0%, ${RK.ana2 || karis(RK.ana, '#000000', .15)} 100%)`);
  kok.setProperty('--cta-golge', saydam(RK.ana, .6));
  kok.setProperty('--altyazi-zemin', RK.altyaziZemin || saydam(TM.koyu ? '#000000' : RK.murekkep, .88));
  kok.setProperty('--altyazi-yazi', RK.altyaziYazi || 'rgba(255,255,255,.94)');
  kok.setProperty('--altyazi-vurgu', RK.altyaziVurgu || karis(RK.vurgu1, '#FFFFFF', .45));

  // ---------- yerleşim (oran başına) ----------
  const YER = {
    '9x16': { logo: { x: 84, y: 196, fs: 34 }, baslik: { x: 84, y: 330, w: 912, fs: 98, hiza: 'left' }, etiket: { fs: 26 },
      gorsel: { cx: 540, cy: 1048, w: 1000, h: 760, olcek: 1.08 }, altyazi: { y: 1505, fs: 40, w: 940 }, kapanis: { olcek: 1 } },
    '1x1': { logo: { x: 60, y: 54, fs: 28 }, baslik: { x: 60, y: 124, w: 960, fs: 70, hiza: 'left' }, etiket: { fs: 20 },
      gorsel: { cx: 540, cy: 650, w: 900, h: 560 }, altyazi: { y: 1000, fs: 32, w: 980 }, kapanis: { olcek: .78 } },
    '16x9': { logo: { x: 96, y: 72, fs: 30 }, baslik: { x: 110, y: 410, w: 760, fs: 90, hiza: 'left' }, etiket: { fs: 22 },
      gorsel: { cx: 1380, cy: 540, w: 900, h: 760 }, altyazi: { y: 990, fs: 34, w: 1500 }, kapanis: { olcek: .9 } }
  };
  const L = YER[O];

  // ---------- yardımcılar ----------
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const P = (t, t0, d) => clamp((t - t0) / d);
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const fx = s => ((ax * s + bx) * s + cx) * s, fy = s => ((ay * s + by) * s + cy) * s, dx = s => (3 * ax * s + 2 * bx) * s + cx;
    return x => { if (x <= 0) return 0; if (x >= 1) return 1; let s = x;
      for (let i = 0; i < 8; i++) { const e = fx(s) - x, d = dx(s); if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break; s -= e / d; }
      return fy(clamp(s)); };
  }
  const E = {
    ui: bezier(.22, 1, .36, 1), kam: bezier(.65, 0, .35, 1), cik: bezier(.55, 0, .9, .4),
    expo: p => p >= 1 ? 1 : 1 - Math.pow(2, -10 * p), inout: p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2,
    yay: (p, z = .42, f = 2.2) => p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.exp(-p * 6.5 * z / .42) * Math.cos(p * Math.PI * f * 2) * (1 - p * .2)
  };
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const $ = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  const css = (e, o) => { for (const k in o) e.style[k] = o[k]; return e; };
  const tr = n => Math.round(n).toLocaleString(TM.dil || 'tr-TR');
  function ikon(ad, renk, boyut = 24, kalin = 2, dolu = false) {
    const yol = (dolu ? window.IKONLAR.dolu : window.IKONLAR.cizgi)[ad] || '';
    if (!yol) console.error('ikon yok: ' + ad + ' (scripts/ikon-uret.mjs listesine ekle)');
    return dolu ? `<svg width="${boyut}" height="${boyut}" viewBox="0 0 24 24" fill="${renk}">${yol}</svg>`
      : `<svg width="${boyut}" height="${boyut}" viewBox="0 0 24 24" fill="none" stroke="${renk}" stroke-width="${kalin}" stroke-linecap="round" stroke-linejoin="round">${yol}</svg>`;
  }

  // ---------- ses ve zaman ----------
  const KEL = window.KELIMELER[R];
  if (!KEL) throw new Error('kelimeler.js içinde ' + R + ' yok (önce ses + kelimeler.mjs ya da kelime-tahmin.mjs)');
  const SES_BAS = 0.2, KUYRUK = 1.0;
  const HEDEF = /^R/.test(R) ? (TM.reklamSure || 15) : 999;
  const sesSure = KEL[KEL.length - 1][2];
  const TEMPO = Math.min(1.1, Math.max(1, sesSure / (HEDEF - SES_BAS - KUYRUK)));
  const D = Math.round((SES_BAS + sesSure / TEMPO + KUYRUK) * 30) / 30;
  const kucuk = s => s.toLocaleLowerCase(TM.dil || 'tr');
  function ara(k, n = 0) {
    if (typeof k === 'number') return KEL[k];
    const kk = kucuk(k);
    const bul = KEL.filter(w => kucuk(w[0]).replace(/[.,;:!?]/g, '') === kk);
    if (!bul[n]) throw new Error('kelime yok: ' + k + (n ? ' (' + n + '. tekrar)' : ''));
    return bul[n];
  }
  const T = (k, n) => SES_BAS + ara(k, n)[1] / TEMPO;
  const Tson = (k, n) => SES_BAS + ara(k, n)[2] / TEMPO;

  // ---------- sahne iskeleti ----------
  const sahne = document.getElementById('sahne');
  css(sahne, { width: W + 'px', height: H + 'px' });
  const icerik = document.getElementById('icerik'), kapanisK = document.getElementById('kapanis');

  // ---------- arka plan ----------
  const arka = document.getElementById('arka');
  const auroralar = [{ r: 1, x: .12, y: .18, s: .95 }, { r: 2, x: .9, y: .32, s: .85 }, { r: 3, x: .5, y: .98, s: 1.15 }].map(a => ({ ...a, el: $('div', 'aurora', arka) }));
  const ARKA = { ton: [[0, 0]] }; // [zaman, ton] — 0 marka, 1 sakin/gece, 2 sıcak/sabah, 3 sorun/uyarı (tema.tonlar)
  const TONLAR = TM.tonlar;
  const rgba = s => s.match(/[\d.]+/g).map(Number);
  const karRenk = (a, b, p) => { const x = hex(a), y = hex(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], p))).join(',')})`; };
  const karRgba = (a, b, p) => { const x = rgba(a), y = rgba(b); return `rgba(${x.map((v, i) => i < 3 ? Math.round(lerp(v, y[i], p)) : lerp(v, y[i], p).toFixed(3)).join(',')})`; };
  function arkaCiz(t) {
    let a = ARKA.ton[0][1], b = a, p = 0;
    for (let i = 0; i < ARKA.ton.length; i++) if (t >= ARKA.ton[i][0]) { a = i ? ARKA.ton[i - 1][1] : ARKA.ton[i][1]; b = ARKA.ton[i][1]; p = E.inout(P(t, ARKA.ton[i][0], .8)); }
    const A = TONLAR[a], B = TONLAR[b];
    sahne.style.background = `radial-gradient(120% 90% at 30% 10%, ${karRenk(A[1], B[1], p)} 0%, ${karRenk(A[0], B[0], p)} 70%)`;
    const m = Math.max(W, H);
    auroralar.forEach((au, i) => {
      const x = (au.x + Math.sin(t * .35 + au.r * 1.7) * .06) * W, y = (au.y + Math.cos(t * .28 + au.r) * .05) * H;
      const s = m * .55 * au.s * (1 + Math.sin(t * .5 + au.r) * .06);
      css(au.el, { width: s + 'px', height: s + 'px', left: (x - s / 2) + 'px', top: (y - s / 2) + 'px', background: `radial-gradient(closest-side, ${karRgba(A[2][i], B[2][i], p)}, rgba(0,0,0,0))` });
    });
    document.getElementById('izgara').style.transform = `translate(${(t * 6) % 46}px, ${(t * 4) % 46}px)`;
  }
  (function () {
    const c = document.getElementById('gren'); c.width = W / 2; c.height = H / 2; css(c, { width: W + 'px', height: H + 'px', mixBlendMode: TM.koyu ? 'screen' : 'multiply' });
    const x = c.getContext('2d'), d = x.createImageData(c.width, c.height), r = rng(7);
    for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0);
  })();

  // ---------- marka (köşe logosu ve kapanış) ----------
  const logoImg = (stil = '') => TM.logo ? `<img src="${TM.logo}" style="${stil}">` : '';
  const markaMetin = () => Array.isArray(TM.logoMetin) ? `${TM.logoMetin[0]} <b>${TM.logoMetin[1] || ''}</b>` : (TM.logoMetin ?? TM.ad);
  const logo = document.getElementById('logo');
  logo.innerHTML = `${logoImg(`height:1.7em;width:${TM.logoOran ? 1.7 * TM.logoOran + 'em' : '1.7em'};border-radius:${TM.logoYuvarlak === false ? '.2em' : '50%'};object-fit:contain`)}<span>${TM.logoKoseMetin === false ? '' : markaMetin()}</span>`;
  css(logo, { left: L.logo.x + 'px', top: L.logo.y + 'px', fontSize: L.logo.fs + 'px' });

  // ---------- başlık ----------
  // "Hepsi *tek ekranda.*" — *…* marka vurgusu, !…! sorun vurgusu (hata rengi). Satır sonu: |
  function Baslik(metin, o = {}) {
    const el = $('div', 'baslik', icerik);
    const y = o.yer || L.baslik;
    css(el, { left: y.x + 'px', top: (o.y != null ? o.y : y.y) + 'px', width: y.w + 'px', fontSize: (y.fs * (o.olcek || 1)) + 'px', textAlign: o.hiza || y.hiza });
    const kelimeler = [];
    let mod = '';
    metin.split(/\s+/).forEach(parca => {
      if (parca === '|') { $('br', null, el); return; }
      let p = parca;
      if (p.startsWith('*')) { mod = 'vurgu'; p = p.slice(1); } else if (p.startsWith('!')) { mod = 'vurgu-k'; p = p.slice(1); }
      let bitir = false;
      if (/[*!]([.,?!:]*)$/.test(p) && mod) { bitir = true; p = p.replace(/[*!]([.,?!:]*)$/, '$1'); }
      const k = $('span', 'k ' + mod, el); $('i', null, k, p);
      el.appendChild(document.createTextNode(' '));
      kelimeler.push(k.firstChild);
      if (bitir) mod = '';
    });
    return { el, kelimeler,
      ciz(t, t0, t1, ara = .07) {
        const gor = t >= t0 - .01 && (t1 == null || t <= t1 + .01);
        el.style.display = gor ? 'block' : 'none';
        if (!gor) return;
        kelimeler.forEach((k, i) => {
          const g = E.expo(P(t, t0 + i * ara, .7)), c = t1 == null ? 0 : E.cik(P(t, t1 - .42 + i * .025, .36));
          css(k, { transform: `translateY(${(1 - g) * 105 - c * 105}%)`, filter: `blur(${((1 - g) * 10 + c * 8).toFixed(2)}px)`, opacity: (g * (1 - c)).toFixed(3) });
        });
      } };
  }

  // ---------- görsel tuval (1000×760 tasarım alanı) ----------
  function Tuval(o = {}) {
    const g = o.yer || L.gorsel;
    const el = $('div', 'tuval', icerik);
    const s = Math.min(g.w / 1000, g.h / 760) * (o.olcek || 1) * (g.olcek || 1);
    const taban = { x: g.cx - 500 * s, y: g.cy - 380 * s, s };
    css(el, { transform: `translate(${taban.x}px, ${taban.y}px) scale(${s})` });
    return { el, taban, s,
      kamera(x = 0, y = 0, z = 1, op = 1) { css(el, { transform: `translate(${taban.x + (x - (z - 1) * 500) * s}px, ${taban.y + (y - (z - 1) * 380) * s}px) scale(${s * z})`, opacity: op }); } };
  }

  // ---------- altyazı ----------
  const altyazi = document.getElementById('altyazi');
  css(altyazi, { left: ((W - L.altyazi.w) / 2) + 'px', width: L.altyazi.w + 'px', top: (L.altyazi.y - L.altyazi.fs * .9) + 'px', fontSize: L.altyazi.fs + 'px' });
  const kutu = $('div', 'kutu', altyazi);
  const OBEKLER = []; { let o = []; KEL.forEach((w, i) => { o.push(i); if (/[.,;:!?]$/.test(w[0]) || o.length >= 3) { OBEKLER.push(o); o = []; } }); if (o.length) OBEKLER.push(o); }
  let sonObek = -1;
  function altyaziCiz(t, gizle) {
    const st = t - SES_BAS;
    let ob = -1;
    for (let i = 0; i < OBEKLER.length; i++) { const a = KEL[OBEKLER[i][0]][1] / TEMPO - .05, b = (i + 1 < OBEKLER.length ? KEL[OBEKLER[i + 1][0]][1] : KEL[OBEKLER[i].at(-1)][2] + .3) / TEMPO; if (st >= a && st < b) ob = i; }
    if (ob < 0 || gizle || TM.altyazi === false) { altyazi.style.opacity = 0; return; }
    if (ob !== sonObek) { kutu.innerHTML = OBEKLER[ob].map(i => `<span data-i="${i}">${KEL[i][0].replace(/[;:]$/, '')}</span>`).join(''); sonObek = ob; }
    const bas = KEL[OBEKLER[ob][0]][1] / TEMPO - .05, g = E.expo(P(st, bas, .25));
    css(altyazi, { opacity: g, transform: `translateY(${(1 - g) * 14}px) scale(${.96 + g * .04})` });
    kutu.querySelectorAll('span').forEach(s => { const w = KEL[+s.dataset.i]; s.style.color = st >= w[1] / TEMPO - .02 ? 'var(--altyazi-vurgu)' : 'var(--altyazi-yazi)'; });
  }

  // ---------- kapanış kartı ----------
  function Kapanis(t0, o = {}) {
    const k = kapanisK, sk = L.kapanis.olcek;
    k.innerHTML = '';
    const daire = $('div', 'abs', k), yigin = $('div', 'abs', k);
    css(yigin, { left: 0, top: 0, width: W + 'px', height: H + 'px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' });
    const isik = $('div', 'abs', k);
    const amblem = $('div', null, yigin);
    // TM.logoAzami (px, logo yüksekliği): küçük raster logoyu kapanışta doğal boyunun çok üstüne büyütmemek için üst sınır
    const lh = Math.min(220 * sk, TM.logoAzami || 9e9), yuv = TM.logoYuvarlak === false ? '18%' : '50%', aw = lh * (TM.logoOran || 1);
    css(amblem, { width: aw + 'px', height: lh + 'px', borderRadius: yuv, position: 'relative', display: TM.logo ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' });
    amblem.innerHTML = `<div style="position:absolute;inset:-30%;border-radius:50%;background:radial-gradient(closest-side,${saydam(RK.ana, .22)},${saydam(RK.ana, 0)})"></div>
      ${logoImg(`position:relative;width:100%;height:100%;object-fit:contain;border-radius:${yuv};${TM.logoYuvarlak === false ? '' : `box-shadow:0 0 0 ${6 * sk}px ${saydam(RK.yuzey, .9)},0 30px 70px -20px var(--golge)`}`)}`;
    const ad = $('div', null, yigin, Array.isArray(TM.logoMetin) ? `${TM.logoMetin[0]} <span style="font-weight:500;letter-spacing:.06em">${TM.logoMetin[1] || ''}</span>` : (TM.logoMetin ?? TM.ad));
    css(ad, { fontSize: 96 * sk * (TM.kapanisAdOlcek || 1) + 'px', fontWeight: 900, letterSpacing: '.02em', lineHeight: 1, color: RK.murekkep, marginTop: (TM.logo ? 70 : 0) * sk + 'px', textAlign: 'center' });
    const slogan = $('div', null, yigin, TM.slogan || '');
    css(slogan, { fontSize: 46 * sk + 'px', fontWeight: 500, color: RK.ikincil, marginTop: 26 * sk + 'px', textAlign: 'center', padding: '0 60px' });
    slogan.querySelectorAll('b').forEach(b => css(b, { fontWeight: 800, color: RK.vurgu2 }));
    const cta = $('div', 'cta', yigin, `${o.cta || TM.cta} ${ikon('arrow-right', RK.ctaYazi || '#fff', 44 * sk, 2.6)}`);
    css(cta, { fontSize: 46 * sk + 'px', marginTop: 96 * sk + 'px' });
    const adres = $('div', null, yigin, ADRES);
    css(adres, { fontSize: 38 * sk + 'px', fontWeight: 700, letterSpacing: '.02em', color: RK.vurgu1, marginTop: 34 * sk + 'px' });
    const parcalar = [amblem, ad, slogan, cta, adres];
    const zemin = TM.koyu ? `radial-gradient(closest-side, ${karis(RK.yuzey, RK.ana, .12)} 0%, ${RK.zemin} 100%)` : `radial-gradient(closest-side, ${RK.yuzey} 0%, ${acik(RK.ana, .95)} 55%, ${acik(RK.ana, .9)} 100%)`;
    return function (t) {
      const gor = t >= t0 - .02;
      k.style.display = gor ? 'block' : 'none';
      logo.style.opacity = 1 - E.ui(P(t, t0, .4));
      if (!gor) return;
      const p = E.inout(P(t, t0, .7)), r = Math.hypot(W, H) * .6 * p;
      css(daire, { left: (W / 2 - r) + 'px', top: (H / 2 - r) + 'px', width: 2 * r + 'px', height: 2 * r + 'px', borderRadius: '50%', background: zemin, boxShadow: `0 0 ${120 * p}px ${40 * p}px ${saydam(RK.ana, .18 * (1 - p))}` });
      parcalar.forEach((e, i) => {
        const g = i === 0 ? E.yay(P(t, t0 + .28, .9)) : E.expo(P(t, t0 + .28 + i * .11, .7));
        css(e, { opacity: clamp(g * 1.4).toFixed(3), transform: i === 0 ? `scale(${.4 + g * .6}) rotate(${(1 - g) * -40}deg)` : `translateY(${(1 - Math.min(1, g)) * 60}px)`, filter: `blur(${((1 - clamp(g)) * 8).toFixed(2)}px)` });
      });
      const nab = Math.max(0, Math.sin((t - t0 - 1.2) * 4.2)) * clamp((t - t0 - 1.2) * 2);
      cta.style.transform += ` scale(${1 + nab * .035})`;
      const pr = P(t, t0 + 1.1, .9);
      cta.style.backgroundImage = pr > 0 && pr < 1 ? `linear-gradient(105deg, ${RK.ana} ${pr * 140 - 30}%, ${karis(RK.ana, '#FFFFFF', .45)} ${pr * 140 - 15}%, ${RK.ana2 || RK.ana} ${pr * 140}%)` : '';
      css(isik, { inset: 0, background: `radial-gradient(circle at 50% 40%, ${saydam(RK.ana, (.16 * (1 - E.ui(P(t, t0 + .25, .5))) * (t > t0 + .25 ? 1 : 0)).toFixed(3))}, ${saydam(RK.ana, 0)} 45%)` });
    };
  }

  window.M = { O, R, W, H, L, D, T, Tson, TEMPO, SES_BAS, ADRES, E, P, clamp, lerp, rng, $, css, tr, ikon, Renk, TEMA: TM,
    Baslik, Tuval, Kapanis, ARKA, icerik, SFX: [] };

  window.addEventListener('load', () => {
    const tanim = window.FILMLER[R];
    if (!tanim) throw new Error('icerik.js içinde FILMLER.' + R + ' yok');
    const ciz = tanim(window.M);
    window.SURE = D;
    window.SES = { tempo: TEMPO, bas: SES_BAS, dosya: `ses/${R}.mp3`, sfx: window.M.SFX, muzik: window.M.MUZIK || {} };
    window.seek = t => { arkaCiz(t); ciz(t); altyaziCiz(t, t >= (window.M.ALTYAZI_SON || 1e9)); };
    window.seek(0);
    document.fonts.ready.then(() => { window.ready = true; });
  });
})();
