// Sahne kütüphanesi: temadan bağımsız, veriyle beslenen sahneler + Film akışı. API: references/sahne-kutuphanesi.md
// Her sahne { k (katman), ciz(t) } döndürür. Renk anahtarları ('ana', 'basari', 'hata', 'dikkat', 'bilgi', 'mor', 'vurgu1', 'vurgu2')
// ya da doğrudan #hex kabul edilir. Kayıt: window.KAYITLAR içindeki sıra numarası ya da [ad, kısaltma, renk].
(function () {
  'use strict';
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const set = (el, html) => { if (el.dataset.h !== html) { el.dataset.h = html; el.innerHTML = html; } };
  const basma = (t, tk) => Math.max(0, 1 - Math.abs(t - tk - .08) / .15);
  const S = {};

  // ---------- temel parçalar ----------
  const rk = (M, k) => (k && k[0] === '#') ? k : (M.Renk[k] || M.Renk.ana);
  const kayit = k => Array.isArray(k) ? k : (window.KAYITLAR || [])[k] || ['?', '?', '#888888'];
  function kapGor(M, el, t, t0, t1, o = {}) {
    const gd = o.gd || .7, cd = o.cd || .45, s0 = o.s0 == null ? .92 : o.s0, y0 = o.y0 == null ? 50 : o.y0;
    const g = M.E.expo(M.P(t, t0, gd)), c = t1 == null ? 0 : M.E.cik(M.P(t, t1 - cd, cd));
    const gor = g > .001 && c < .999;
    el.style.display = gor ? 'block' : 'none';
    if (!gor) return 0;
    M.css(el, { opacity: (Math.min(1, g * 1.3) * (1 - c)).toFixed(3), transform: `translateY(${(1 - g) * y0 - c * 30}px) scale(${s0 + (1 - s0) * g - c * .06})`,
      filter: (1 - g) + c > .01 ? `blur(${((1 - g) * 10 + c * 8).toFixed(2)}px)` : 'none' });
    return g * (1 - c);
  }
  function katman(M, tv) { const e = M.$('div', 'abs', tv.el); M.css(e, { left: 0, top: 0, width: '1000px', height: '760px', transformOrigin: '500px 380px' }); return e; }
  const kutu = (M, eb, x, y, w, h, cls = 'kart', html = '') => { const e = M.$('div', cls, eb, html); M.css(e, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' }); return e; };
  // cip: renk anahtarı ya da hex; zemin otomatik açılır
  const cip = (M, renk, ik, metin, fs = 24, dolu = false) => { const r = rk(M, renk), z = dolu ? r : M.Renk.acik(r), y = dolu ? '#fff' : r;
    return `<div style="display:inline-flex;align-items:center;gap:${fs * .38}px;height:${fs * 2.1}px;padding:0 ${fs * .8}px;border-radius:999px;background:${z};color:${y};font-weight:800;font-size:${fs}px;white-space:nowrap">${ik ? M.ikon(ik, y, fs * 1.05, 2.4) : ''}${metin}</div>`; };
  const ikonKutu = (M, ik, renk, boy = 64, ib = 34, r = 18) => { const c = rk(M, renk); return `<div style="width:${boy}px;height:${boy}px;border-radius:${r}px;background:${M.Renk.acik(c)};display:flex;align-items:center;justify-content:center;flex:none">${M.ikon(ik, c, ib, 2.2)}</div>`; };
  const avatar = (k, b = 56) => { const m = kayit(k); return `<div style="width:${b}px;height:${b}px;border-radius:50%;background:${m[2]};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:${b * .4}px;flex:none">${m[1]}</div>`; };
  const yay = (M, t, t0, d = .6) => M.E.yay(M.P(t, t0, d));
  function Imlec(M, eb) {
    const R = M.Renk;
    const e = M.$('div', 'abs', eb); M.css(e, { width: 0, height: 0, zIndex: 30 });
    const halka = M.$('div', 'abs', e); M.css(halka, { borderRadius: '50%', border: `4px solid ${R.ana}` });
    const ok = M.$('div', 'abs', e, `<svg width="60" height="60" viewBox="0 0 24 24"><path d="M5 2.5v17.2l4.7-4.4 3.1 6.9 2.9-1.3-3.1-6.8h6.3z" fill="${M.TEMA.koyu ? '#FFFFFF' : '#0B1020'}" stroke="${M.TEMA.koyu ? '#0B1020' : '#fff'}" stroke-width="1.5" stroke-linejoin="round"/></svg>`);
    M.css(ok, { left: '-14px', top: '-6px', filter: 'drop-shadow(0 8px 12px rgba(0,0,0,.35))', transformOrigin: '14px 6px' });
    return function (t, yol, tiklar, gor) {
      let x = yol[0][1], y = yol[0][2];
      for (let j = 1; j < yol.length; j++) if (t >= yol[j - 1][0]) { const q = M.E.kam(M.P(t, yol[j - 1][0], yol[j][0] - yol[j - 1][0])); x = M.lerp(yol[j - 1][1], yol[j][1], q); y = M.lerp(yol[j - 1][2], yol[j][2], q); }
      e.style.display = gor > .01 ? 'block' : 'none';
      M.css(e, { left: x + 'px', top: y + 'px', opacity: gor });
      let bas = 1, rp = -1;
      tiklar.forEach(tk => { const p = (t - tk) / .45; if (p >= 0 && p <= 1) { rp = p; bas = 1 - Math.sin(Math.min(1, p * 2.2) * Math.PI) * .18; } });
      ok.style.transform = `scale(${bas})`;
      if (rp >= 0) M.css(halka, { display: 'block', left: -rp * 46 + 'px', top: -rp * 46 + 'px', width: rp * 92 + 'px', height: rp * 92 + 'px', opacity: (1 - rp) * .9 }); else halka.style.display = 'none';
    };
  }
  function telefon(M, eb, x, y, w, h, zemin) {
    const R = M.Renk;
    const g = kutu(M, eb, x, y, w, h, 'abs');
    M.css(g, { borderRadius: w * .16 + 'px', background: R.telefon || '#0B1020', padding: w * .035 + 'px', boxShadow: '0 40px 80px -30px var(--golge)' });
    const ekran = M.$('div', null, g);
    M.css(ekran, { position: 'relative', width: '100%', height: '100%', borderRadius: w * .13 + 'px', background: zemin || `linear-gradient(180deg, ${R.acik(R.ana, .93)}, ${R.yuzey})`, overflow: 'hidden' });
    const centik = M.$('div', 'abs', ekran); M.css(centik, { left: '50%', top: w * .03 + 'px', width: w * .32 + 'px', height: w * .075 + 'px', marginLeft: -w * .16 + 'px', borderRadius: '999px', background: R.telefon || '#0B1020' });
    return { g, ekran };
  }
  // TEMA.logoAzami: logo yüksekliği üst sınırı (tuval px; küçük raster logo bulanık büyümesin)
  const logoGen = (M, boy, enFazla = 9e9) => Math.min(Math.min(boy, M.TEMA.logoAzami || 9e9) * (M.TEMA.logoOran || 1), enFazla);
  const logoImg = (M, boy, stil = '', enFazla = 9e9) => M.TEMA.logo ? `<img src="${M.TEMA.logo}" style="width:${logoGen(M, boy, enFazla)}px;height:${logoGen(M, boy, enFazla) / (M.TEMA.logoOran || 1)}px;object-fit:contain;border-radius:${M.TEMA.logoYuvarlak === false ? '18%' : '50%'};${stil}">`
    : `<div style="width:${boy}px;height:${boy}px;border-radius:50%;background:var(--cta-grad);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:${boy * .4}px;${stil}">${(M.TEMA.ad || '?').slice(0, 2)}</div>`;
  function panel(M, eb, x, y, w, h, ik, renk, baslik, alt) {
    const e = kutu(M, eb, x, y, w, h, 'kart');
    e.innerHTML = `<div style="position:absolute;left:32px;top:24px;display:flex;align-items:center;gap:14px">${ikonKutu(M, ik, renk, 58, 32, 16)}<div><div style="font-weight:800;font-size:28px;letter-spacing:.04em;color:${M.Renk.murekkep};white-space:nowrap">${baslik}</div><div style="font-size:19px;color:${M.Renk.soluk};font-weight:500;white-space:nowrap">${alt || ''}</div></div></div>`;
    return e;
  }
  function basliklar(M, eb, y, kol) {
    const e = kutu(M, eb, 0, y, 960, 40, 'abs');
    e.innerHTML = kol.map(([b, x, w, h]) => `<div class="kb" style="position:absolute;left:${x}px;width:${w}px;top:8px;font-size:17px;font-weight:800;letter-spacing:.05em;color:${M.Renk.soluk};text-align:${h || 'left'};text-transform:uppercase;white-space:nowrap">${b}</div>`).join('');
    return [...e.querySelectorAll('.kb')];
  }
  function satir(M, eb, y, h, k, alt) {
    const e = kutu(M, eb, 20, y, 920, h, 'abs'); M.css(e, { borderTop: `1px solid ${M.Renk.cizgi}`, borderRadius: '12px' });
    const m = kayit(k);
    e.innerHTML = `<div style="position:absolute;left:20px;top:${(h - 48) / 2}px;display:flex;align-items:center;gap:14px">${avatar(m, 48)}<div><b style="font-size:25px;color:${M.Renk.murekkep};white-space:nowrap">${m[0]}</b>${alt ? `<div style="font-size:17px;color:${M.Renk.soluk};font-weight:600">${alt}</div>` : ''}</div></div>`;
    return e;
  }
  const hucre = (M, eb, x, w, h, hiza = 'center') => { const e = M.$('div', 'abs', eb); M.css(e, { left: x - 20 + 'px', width: w + 'px', top: 0, height: h + 'px', display: 'flex', alignItems: 'center', justifyContent: hiza === 'right' ? 'flex-end' : hiza === 'center' ? 'center' : 'flex-start', fontSize: '23px', fontWeight: 700, color: M.Renk.murekkep, whiteSpace: 'nowrap', gap: '8px' }); return e; };
  const dugme = (M, eb, x, y, w, metin, ik = 'search', h = 56) => { const e = kutu(M, eb, x, y, w, h, 'abs'); M.css(e, { borderRadius: '14px', background: 'var(--cta-grad)', color: '#fff', fontWeight: 800, fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', whiteSpace: 'nowrap' }); e.innerHTML = `${M.ikon(ik, '#fff', 22, 2.6)}${metin}`; return e; };
  const cubuk = (M, eb, y) => { const e = kutu(M, eb, 32, y, 896, 10, 'abs'); M.css(e, { borderRadius: '5px', background: M.Renk.cizgi, overflow: 'hidden' }); e.innerHTML = `<div style="height:100%;width:0;background:linear-gradient(90deg,${M.Renk.basari},${M.Renk.ana});border-radius:5px"></div>`; return e.firstChild; };
  const bekle = M => `<span style="color:${M.Renk.cizgi};font-weight:800;filter:brightness(.85)">···</span>`;
  // hazır hücre içerikleri
  const H = {
    tik: M => `<span style="width:40px;height:40px;border-radius:50%;background:${M.Renk.acik(M.Renk.basari)};display:inline-flex;align-items:center;justify-content:center">${M.ikon('check', M.Renk.basari, 24, 3)}</span>`,
    yazi: (M, m, renk) => `<span style="color:${renk ? rk(M, renk) : M.Renk.murekkep};font-weight:800">${m}</span>`,
    soluk: (M, m) => `<span style="color:${M.Renk.soluk};font-weight:800">${m}</span>`,
    cip: (M, renk, ik, m, fs = 16) => cip(M, renk, ik, m, fs)
  };
  const cizgiler = (M, ws) => ws.map(w => `<div style="height:11px;width:${w}%;border-radius:6px;background:${M.Renk.cizgi};margin-top:12px"></div>`).join('');
  // not kartı içeriği (kaos sahnesinde)
  const not = (M, renk, ik, bas, ic) => `<div style="font-weight:800;font-size:19px;color:${rk(M, renk)};display:flex;align-items:center;gap:8px">${M.ikon(ik, rk(M, renk), 22, 2.4)}${bas}</div><div style="font-weight:700;font-size:22px;color:${M.Renk.murekkep};margin-top:10px;line-height:1.3">${ic}</div>`;
  // tarayıcı penceresi içeriği (kaos sahnesinde, pad: 0 ile)
  const pencere = (M, baslik, ik, renk, govde) => `<div style="height:44px;background:${M.Renk.acik(M.Renk.soluk, .8)};display:flex;align-items:flex-end;padding:0 14px;gap:7px"><div style="display:flex;gap:6px;align-self:center">${`<span style="width:10px;height:10px;border-radius:50%;background:${M.Renk.cizgi}"></span>`.repeat(3)}</div><div style="margin-left:10px;display:flex;align-items:center;gap:8px;background:${M.Renk.yuzey};border-radius:10px 10px 0 0;padding:8px 14px;font-weight:800;font-size:16px;color:${M.Renk.murekkep};white-space:nowrap">${M.ikon(ik, rk(M, renk), 18, 2.4)}${baslik}</div></div><div style="padding:14px 20px">${govde || cizgiler(M, [80, 60, 70])}</div>`;

  // ---------- sahneler ----------
  // kaos: saçılan kartlar. o: t0, parcalar [{x,y,w,h,r,zemin,pad,html}], ara, sars (sarsılma anı)
  S.kaos = function (M, tv, o) {
    const k = katman(M, tv);
    const ps = o.parcalar.map((p, i) => { const e = kutu(M, k, p.x, p.y, p.w, p.h, 'kart'); M.css(e, { borderRadius: '16px', padding: p.pad == null ? '18px 20px' : p.pad, background: !p.zemin ? M.Renk.yuzey : p.zemin[0] === '#' ? p.zemin : M.Renk.acik(rk(M, p.zemin), M.TEMA.koyu ? .78 : .82), overflow: 'hidden' }); e.innerHTML = p.html; return { el: e, r: p.r || 0, t: o.t0 + .05 + i * (o.ara || .16) }; });
    M.SFX.push(...ps.map(p => ['swosh-swoosh-whoosh-air-sound-free-high-', p.t, -22]));
    if (o.sars) M.SFX.push(['light-ping-hits', o.sars, -18]);
    return { k, ciz(t) {
      const s = o.sars && t > o.sars ? Math.max(0, 1 - (t - o.sars) / .6) : 0;
      ps.forEach((p, i) => { const g = M.E.yay(M.P(t, p.t, .7)), sx = Math.sin(t * 40 + i * 2) * 10 * s;
        M.css(p.el, { opacity: clamp(g * 2), transform: `translate(${sx}px, ${(1 - Math.min(1, g)) * -240 + Math.sin(t * 1.6 + i) * 6}px) rotate(${p.r + Math.sin(t * 2 + i) * 2 + sx * .4}deg)` }); });
    } };
  };
  // logo: marka halkalarla gelir, o.ucan çipleri merkeze toplanır. o: t0, ucan [[ik, renk, ad]]
  S.logo = function (M, tv, o) {
    const k = katman(M, tv);
    const lg = M.$('div', 'abs', k, `<div style="position:absolute;inset:-70px;border-radius:50%;background:radial-gradient(closest-side,${M.Renk.saydam(M.Renk.ana, .25)},${M.Renk.saydam(M.Renk.ana, 0)})"></div>${logoImg(M, 280, `position:relative;${M.TEMA.logoYuvarlak === false ? '' : `box-shadow:0 0 0 10px ${M.Renk.yuzey},0 40px 80px -30px var(--golge)`}`, 760)}`);
    const lgw = logoGen(M, 280, 760); M.css(lg, { left: 500 - lgw / 2 + 'px', top: 360 - lgw / (M.TEMA.logoOran || 1) / 2 + 'px', zIndex: 3 });
    const halka = [0, 1].map(() => { const h = M.$('div', 'abs', k); M.css(h, { borderRadius: '50%', border: `4px solid ${M.Renk.saydam(M.Renk.ana, .4)}` }); return h; });
    const YER = [[60, 60], [700, 50], [40, 560], [720, 580], [380, 20], [400, 660]];
    const ucan = (o.ucan || []).map(([ik, renk, ad], i) => { const e = M.$('div', 'abs', k, cip(M, renk, ik, ad, 24)); M.css(e, { zIndex: 2 }); return { el: e, x: YER[i % 6][0], y: YER[i % 6][1] }; });
    M.SFX.push(['whoosh-boom-wav', o.t0 - .2, -12]);
    return { k, ciz(t) {
      const g = M.E.yay(M.P(t, o.t0 - .05, .9)); M.css(lg, { transform: `scale(${.5 + .5 * g}) rotate(${(1 - g) * -30}deg)` });
      halka.forEach((h, i) => { const p = clamp((t - o.t0 - i * .3) / 1); const r = 140 + p * 300; M.css(h, { left: 500 - r + 'px', top: 360 - r + 'px', width: 2 * r + 'px', height: 2 * r + 'px', opacity: p > 0 && p < 1 ? (1 - p) * .7 : 0 }); });
      ucan.forEach((u, i) => { const q = M.E.inout(M.P(t, o.t0 + .25 + i * .1, .8)); M.css(u.el, { left: M.lerp(u.x, 430, q) + 'px', top: M.lerp(u.y, 340, q) + 'px', opacity: q < .85 ? 1 : (1 - q) / .15, transform: `scale(${1 - q * .5})` }); });
    } };
  };
  // tablo: toplu sorgu / liste ekranı.
  // o: ik, renk, baslik, alt, kolonlar [[ad, x, w, hiza]], satirlar [{k: kayıt, h: [html…], v: 'r'|'a'|null, alt}], t0
  //    btn (metin), btnIk, btnG, tBtn, tBit (satır satır dolar) | kolT [sütun başına an] (sütun sütun dolar), tVurgu, sh (satır yüksekliği), bildirim {t, baslik, metin}
  S.tablo = function (M, tv, o) {
    const R = M.Renk;
    const k = katman(M, tv);
    const p = panel(M, k, 20, 0, 960, 760, o.ik, o.renk || 'ana', o.baslik, o.alt);
    const bw = o.btnG || 200, btn = o.btn ? dugme(M, p, 960 - 30 - bw, 30, bw, o.btn, o.btnIk) : null;
    const ilerleme = o.tBtn != null ? cubuk(M, p, 108) : null;
    const ust = 128, sh = o.sh || 112;
    const kol = basliklar(M, p, ust, o.kolonlar);
    const n = o.satirlar.length;
    const rs = o.satirlar.map((s, i) => { const e = satir(M, p, ust + 44 + i * sh, sh - 4, s.k, s.alt);
      const hs = o.kolonlar.slice(1).map(([, x, w, h]) => hucre(M, e, x, w, sh - 4, h || 'center'));
      return { el: e, hs, h: s.h, v: s.v, ta: o.kolT ? null : o.tBtn + .2 + i * (o.tBit - o.tBtn - .3) / n }; });
    let bil = null;
    if (o.bildirim) { bil = M.$('div', 'abs', k, `<div style="display:flex;align-items:center;gap:14px;background:${R.yuzey};border-radius:20px;padding:16px 20px;box-shadow:0 26px 50px -18px var(--golge),0 0 0 1px ${R.cizgi}">${ikonKutu(M, 'bell', 'hata', 52, 28, 14)}<div><div style="font-weight:800;font-size:22px;color:${R.murekkep}">${o.bildirim.baslik}</div><div style="font-size:18px;color:${R.ikincil};font-weight:600">${o.bildirim.metin}</div></div></div>`); M.css(bil, { left: '470px', top: '-30px', zIndex: 6 }); }
    const im = btn ? Imlec(M, k) : null;
    if (btn) M.SFX.push(['ui-button-click', o.tBtn + .02, -6], ['swipe-whoosh', o.tBtn + .1, -20], ['light-ping-hits', o.tBit, -18]);
    if (o.bildirim) M.SFX.push(['notification', o.bildirim.t, -14]);
    if (o.tVurgu) M.SFX.push(['the-best-bubble-pop-sound-for-game-and-u', o.tVurgu, -16]);
    const bx = 20 + 960 - 30 - bw / 2 - 10;
    return { k, ciz(t) {
      if (btn) btn.style.transform = `scale(${1 - basma(t, o.tBtn) * .06})`;
      if (ilerleme) ilerleme.style.width = M.E.ui(M.P(t, o.tBtn + .1, o.tBit - o.tBtn)) * 100 + '%';
      if (o.kolT) kol.forEach((kb, i) => { if (!i) return; const q = Math.max(0, 1 - Math.abs(t - o.kolT[i - 1] - .25) / .5); kb.style.color = q > .05 ? R.ana : R.soluk; kb.style.opacity = q > .05 ? .4 + .6 * q : 1; kb.style.transform = `scale(${1 + q * .1})`; });
      rs.forEach((r, i) => {
        const g = M.E.expo(M.P(t, o.t0 + .15 + i * .07, .6)); M.css(r.el, { opacity: g, transform: `translateX(${(1 - g) * 40}px)` });
        r.hs.forEach((h, j) => { const tj = o.kolT ? o.kolT[j] + i * .08 : r.ta + j * .06, gec = t >= tj; set(h, gec ? r.h[j] : bekle(M)); if (h.firstChild && h.firstChild.style) h.firstChild.style.transform = `scale(${gec ? yay(M, t, tj, .4) : 1})`; });
        const tv0 = o.tVurgu && r.v ? o.tVurgu + i * .05 : Infinity, v = t >= tv0 ? M.E.ui(M.P(t, tv0, .4)) : 0, nb = v ? Math.sin((t - tv0) * 7) * .5 + .5 : 0;
        const vr = r.v === 'a' ? R.dikkat : R.hata;
        const parla = r.ta != null ? Math.max(0, 1 - Math.abs(t - r.ta - .1) / .25) : 0;
        r.el.style.background = v ? R.acik(vr, 1 - .12 * v) : parla ? R.acik(R.ana, 1 - .1 * parla) : 'transparent';
        r.el.style.boxShadow = v ? `0 0 0 ${2 + nb * 4}px ${R.saydam(vr, .3 * v)}` : 'none';
      });
      if (bil) { const q = yay(M, t, o.bildirim.t, .6); M.css(bil, { opacity: clamp(q * 2), transform: `translateY(${(1 - Math.min(1, q)) * -60}px)` }); }
      if (im) im(t, [[o.tBtn - .6, 700, 760], [o.tBtn - .05, bx, 58], [o.tBtn + .6, 900, 320]], [o.tBtn], clamp((t - o.tBtn + .6) * 3) * (1 - clamp((t - o.tBtn - .5) * 3)));
    } };
  };
  // profil: bir kaydın kartı ve üç bölüm. o: t0, k (kayıt), baslik, alt, rozet [renk, ik, metin], bolumler [{ik, renk, baslik, tur: 'alanlar'|'izgara'|'dosyalar', ogeler}], tB [3 an], tVurgu
  //   alanlar: [[etiket, değer]] · izgara: [ad] (yeşil tikle onaylanır) · dosyalar: [ad]
  S.profil = function (M, tv, o) {
    const R = M.Renk;
    const k = katman(M, tv);
    const kr = kutu(M, k, 110, 20, 780, 720, 'kart');
    kr.innerHTML = `<div style="position:absolute;left:36px;top:30px;display:flex;align-items:center;gap:18px">${avatar(o.k, 76)}<div><div style="font-weight:900;font-size:36px;color:${R.murekkep};letter-spacing:-.02em">${o.baslik || kayit(o.k)[0]}</div><div style="font-size:19px;color:${R.soluk};font-weight:600;margin-top:2px">${o.alt || ''}</div></div></div>${o.rozet ? `<div style="position:absolute;right:36px;top:44px">${cip(M, o.rozet[0], o.rozet[1], o.rozet[2], 18)}</div>` : ''}`;
    const YB = [[140, 150], [308, 196], [522, 170]];
    const bol = o.bolumler.slice(0, 3).map((b, i) => { const [y, h] = YB[i]; const e = kutu(M, kr, 32, y, 716, h, 'abs'); M.css(e, { borderRadius: '20px', background: R.acik(R.soluk, .9), border: `1px solid ${R.cizgi}` });
      e.innerHTML = `<div style="position:absolute;left:22px;top:18px;display:flex;align-items:center;gap:12px">${ikonKutu(M, b.ik, b.renk, 44, 24, 12)}<b style="font-size:22px;color:${R.murekkep}">${b.baslik}</b></div><div class="ic" style="position:absolute;left:22px;right:22px;top:76px"></div>`;
      const ic = e.querySelector('.ic'), ku = `background:${R.yuzey};border:1px solid ${R.cizgi};border-radius:12px`;
      if (b.tur === 'alanlar') ic.innerHTML = `<div style="display:flex;gap:12px">${b.ogeler.map(([a, d]) => `<div class="og" style="flex:1;${ku};padding:8px 12px"><div style="font-size:13px;font-weight:800;color:${R.soluk};letter-spacing:.05em">${a.toLocaleUpperCase('tr')}</div><div style="font-size:17px;font-weight:800;color:${R.murekkep};white-space:nowrap;overflow:hidden">${d}</div></div>`).join('')}</div>`;
      else if (b.tur === 'izgara') ic.innerHTML = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${b.ogeler.map(x => `<div class="og" style="height:44px;${ku};display:flex;align-items:center;justify-content:space-between;padding:0 14px;font-weight:800;font-size:19px;color:${R.murekkep}"><span>${x}</span><span class="tk" style="display:inline-flex"></span></div>`).join('')}</div>`;
      else ic.innerHTML = `<div style="display:flex;gap:12px">${b.ogeler.map(d => `<div class="og" style="flex:1;height:58px;${ku};display:flex;align-items:center;gap:8px;padding:0 12px;font-weight:800;font-size:17px;color:${R.murekkep};white-space:nowrap;overflow:hidden">${M.ikon(b.dosyaIk || 'file-text', rk(M, b.renk), 24, 2.2)}${d}</div>`).join('')}</div>`;
      return { el: e, tur: b.tur, og: [...ic.querySelectorAll('.og')] }; });
    M.SFX.push(...o.tB.map(x => ['the-best-bubble-pop-sound-for-game-and-u', x, -18]));
    return { k, ciz(t) {
      const kg = M.E.expo(M.P(t, o.t0, .6)), vz = o.tVurgu && t > o.tVurgu ? Math.max(0, 1 - Math.abs(t - o.tVurgu - .3) / .5) : 0;
      M.css(kr, { opacity: kg, transform: `translateY(${(1 - kg) * 40}px) scale(${.96 + .04 * kg + vz * .015})`, boxShadow: vz ? `0 0 0 ${vz * 6}px ${R.saydam(R.ana, .25)}, 0 40px 80px -30px var(--golge)` : '' });
      bol.forEach((b, i) => { const tb = o.tB[i], g = M.E.expo(M.P(t, tb - .1, .5)); M.css(b.el, { opacity: .35 + .65 * g, transform: `translateY(${(1 - g) * 16}px)`, background: g > .5 ? R.yuzey : R.acik(R.soluk, .9), boxShadow: g > .5 ? '0 14px 30px -18px var(--golge)' : 'none' });
        b.og.forEach((x, j) => { if (b.tur === 'izgara') { const tj = tb + .3 + j * .08, ok = t >= tj, tk = x.querySelector('.tk'); set(tk, ok ? M.ikon('circle-check', R.basari, 24, 2.4) : M.ikon('lock', R.cizgi, 20, 2.2)); tk.style.transform = `scale(${ok ? yay(M, t, tj, .4) : 1})`; }
          else { const q = yay(M, t, tb + .05 + j * .08, .45); M.css(x, { opacity: clamp(q * 2), transform: `translateY(${(1 - Math.min(1, q)) * 16}px)` }); } }); });
    } };
  };
  // aktar: dosyalar/kaynaklar listeye akar. o: t0, kaynaklar [{ik, renk, ad, alt, t}], liste {ik, baslik, alt}, kayitlar [k…], tAkt, sayac(n) → metin, rozet (eklenen satır çipi)
  S.aktar = function (M, tv, o) {
    const R = M.Renk;
    const k = katman(M, tv);
    const ks = o.kaynaklar.slice(0, 3).map((s, i) => { const y = o.kaynaklar.length === 1 ? 280 : 170 + i * (440 / Math.max(1, o.kaynaklar.length - 1)); const e = kutu(M, k, 30, y, 330, 150, 'kart'); M.css(e, { borderRadius: '22px', display: 'flex', alignItems: 'center', gap: '16px', padding: '0 24px' }); e.innerHTML = `${ikonKutu(M, s.ik, s.renk, 70, 38, 18)}<div><div style="font-weight:900;font-size:27px;color:${R.murekkep}">${s.ad}</div><div style="font-size:17px;color:${R.soluk};font-weight:600">${s.alt || ''}</div></div>`;
      const ok = M.$('div', 'abs', k, M.ikon('arrow-right', rk(M, s.renk), 54, 3)); M.css(ok, { left: '365px', top: y + 48 + 'px' }); return { el: e, ok, t: s.t }; });
    const p = panel(M, k, 420, 20, 560, 720, o.liste.ik || 'users', 'ana', o.liste.baslik, o.liste.alt);
    const say = M.$('div', 'abs', p); M.css(say, { right: '28px', top: '34px' });
    const rs = o.kayitlar.slice(0, 6).map((kk, i) => { const m = kayit(kk); const e = kutu(M, p, 20, 120 + i * 96, 520, 88, 'abs'); M.css(e, { borderTop: `1px solid ${R.cizgi}`, display: 'flex', alignItems: 'center', gap: '14px', padding: '0 16px' }); e.innerHTML = `${avatar(m, 46)}<b style="font-size:24px;color:${R.murekkep};flex:1">${m[0]}</b>${cip(M, 'basari', 'check', o.rozet || 'Eklendi', 16)}`; return e; });
    M.SFX.push(...ks.map(s => ['ui-series-hollow-pop', s.t, -16]), ...rs.map((_, i) => ['ui-series-hollow-pop', o.tAkt + i * .12, -24]));
    return { k, ciz(t) {
      ks.forEach(s => { const g = yay(M, t, s.t - .15, .6); M.css(s.el, { opacity: clamp(g * 2), transform: `translateX(${(1 - Math.min(1, g)) * -60}px) scale(${1 + Math.max(0, 1 - Math.abs(t - s.t - .2) / .3) * .04})` });
        const a = M.E.ui(M.P(t, s.t + .1, .4)); M.css(s.ok, { opacity: a, transform: `translateX(${(1 - a) * -20 + Math.sin(t * 6) * 3 * a}px)` }); });
      const pg = M.E.expo(M.P(t, o.t0 + .1, .6)); M.css(p, { opacity: pg, transform: `translateX(${(1 - pg) * 40}px)` });
      let n = 0; rs.forEach((r, i) => { const ti = o.tAkt + i * .12, g = M.E.expo(M.P(t, ti, .45)); if (t >= ti) n++; M.css(r, { opacity: g, transform: `translateX(${(1 - g) * -80}px)` }); });
      set(say, cip(M, 'ana', o.liste.ik || 'users', o.sayac ? o.sayac(n) : String(n), 18));
    } };
  };
  // zamanli: ay → güneş, telefonda sonuç bildirimi (gece/zamanlanmış otomasyon). o: t0, tSabah, tRapor, isler [metin…], rapor {baslik, metin}, saat ['02', '07:30']
  S.zamanli = function (M, tv, o) {
    const R = M.Renk;
    const k = katman(M, tv);
    const ay = M.$('div', 'abs', k, M.ikon('moon', R.karis(R.mor || R.ana, R.yuzey, .35), 150, 0, true)); M.css(ay, { left: '110px', top: '80px' });
    const gunes = M.$('div', 'abs', k, `<div style="position:absolute;inset:-70px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,190,90,.55),rgba(255,190,90,0))"></div>${M.ikon('sun', '#FFB547', 170, 0, true)}`); M.css(gunes, { left: '720px', top: '70px' });
    const tel = telefon(M, k, 330, 40, 340, 700);
    const saat = M.$('div', 'abs', tel.ekran, `<div class="s" style="font-weight:300;font-size:86px;letter-spacing:-.04em;color:${R.murekkep};text-align:center">02:00</div>`); M.css(saat, { left: 0, right: 0, top: '70px' });
    const bil = M.$('div', 'abs', tel.ekran, `<div style="display:flex;align-items:center;gap:10px">${logoImg(M, 40, 'border-radius:10px')}<div style="font-size:18px;font-weight:700;color:${R.ikincil}">${(M.TEMA.ad || '').toLocaleUpperCase('tr')}</div></div><div style="font-weight:800;font-size:26px;color:${R.murekkep};margin-top:10px">${o.rapor.baslik}</div><div style="font-size:20px;color:${R.ikincil};margin-top:6px">${o.rapor.metin}</div>`);
    M.css(bil, { left: '14px', right: '14px', top: '240px', borderRadius: '26px', background: R.yuzey, boxShadow: '0 20px 40px -16px var(--golge)', padding: '18px' });
    const is = M.$('div', 'abs', tel.ekran, `<div style="display:flex;flex-direction:column;gap:10px">${(o.isler || []).map(x => `<div class="tr" style="display:flex;align-items:center;gap:10px;background:${R.saydam(R.yuzey, .8)};border-radius:14px;padding:10px 14px;font-size:18px;font-weight:700;color:${R.ikincil}">${M.ikon('refresh', R.mor || R.ana, 20, 2.4)}${x}</div>`).join('')}</div>`);
    M.css(is, { left: '18px', right: '18px', top: '200px' });
    const trs = [...is.querySelectorAll('.tr')];
    const [s1, s2] = o.saat || ['02', '07:30'];
    M.SFX.push(['swipe-whoosh', o.t0 - .15, -12], ['notification', o.tRapor - .1, -16]);
    return { k, ciz(t) {
      const sb = M.E.inout(M.P(t, o.tSabah - .3, .9));
      M.css(ay, { opacity: 1 - sb, transform: `translateY(${sb * 120}px)` }); M.css(gunes, { opacity: sb, transform: `translateY(${(1 - sb) * 160}px) rotate(${t * 15}deg)` });
      saat.firstChild.textContent = t < o.tSabah - .1 ? s1 + ':' + String(Math.floor(M.P(t, o.t0, 1.5) * 59)).padStart(2, '0') : s2;
      trs.forEach((e, i) => { const g = M.E.expo(M.P(t, o.t0 + .2 + i * .2, .4)); M.css(e, { opacity: g * (1 - sb), transform: `translateX(${(1 - g) * 30}px)` }); });
      const b = M.E.yay(M.P(t, o.tRapor - .1, .8)); M.css(bil, { transform: `translateY(${(1 - b) * -150}px)`, opacity: clamp(b * 1.6) });
    } };
  };
  // kanban: üç sütunlu pano, ilk kart son sütuna taşınır. o: t0, kolonlar [[ad, renk]×3], isler [[kolon, sıra, ad, alt, kişi [kısaltma, renk]]], tTasi, tekrar {t, metin} (ikinci kart), alarm {t, baslik, metin}, bitti (taşınan karta çip metni)
  S.kanban = function (M, tv, o) {
    const R = M.Renk;
    const k = katman(M, tv);
    const gen = o.alarm ? 640 : 960, kg = (gen - 40) / 3;
    const kols = o.kolonlar.map(([ad, r], i) => { const e = kutu(M, k, 20 + i * (kg + 10), 20, kg, 700, 'abs'); M.css(e, { borderRadius: '22px', background: R.saydam(R.acik(R.soluk, .8), .85), border: `1px solid ${R.cizgi}` });
      e.innerHTML = `<div style="position:absolute;left:18px;top:16px;display:flex;align-items:center;gap:8px;font-weight:800;font-size:20px;color:${R.murekkep}"><span style="width:12px;height:12px;border-radius:50%;background:${rk(M, r)}"></span>${ad}</div>`; return e; });
    const kartlar = o.isler.map(([c, s, ad, alt, kisi]) => { const e = kutu(M, k, 20 + c * (kg + 10) + 12, 66 + s * 150, kg - 24, 136, 'kart'); M.css(e, { borderRadius: '18px', padding: '16px 18px' });
      e.innerHTML = `<div style="font-weight:800;font-size:21px;color:${R.murekkep};white-space:nowrap;overflow:hidden">${ad}</div><div style="font-size:16px;color:${R.soluk};font-weight:600;margin-top:4px;white-space:nowrap;overflow:hidden">${alt || ''}</div><div style="display:flex;align-items:center;gap:8px;margin-top:14px">${kisi ? avatar(['', kisi[0], kisi[1]], 30) : ''}<span class="cp"></span></div>`;
      return { el: e, cp: e.querySelector('.cp') }; });
    const ts = kartlar[0];
    let tel = null, alarm = null;
    if (o.alarm) { tel = telefon(M, k, 680, 60, 300, 640); alarm = M.$('div', 'abs', tel.ekran, `<div style="display:flex;align-items:center;gap:8px">${logoImg(M, 32, 'border-radius:8px')}<b style="font-size:15px;color:${R.ikincil}">${(M.TEMA.ad || '').toLocaleUpperCase('tr')}</b></div><div style="font-weight:800;font-size:20px;color:${R.murekkep};margin-top:8px">${M.ikon('alarm', R.hata, 20, 2.4)} ${o.alarm.baslik}</div><div style="font-size:16px;color:${R.ikincil};margin-top:4px">${o.alarm.metin}</div>`);
      M.css(alarm, { left: '12px', right: '12px', top: '90px', borderRadius: '20px', background: R.yuzey, padding: '14px', boxShadow: '0 16px 30px -12px var(--golge)' }); }
    const im = Imlec(M, k);
    M.SFX.push(...kartlar.map((_, i) => ['ui-series-hollow-pop', o.t0 + .2 + i * .08, -24]), ['ui-button-click', o.tTasi, -10], ['the-best-bubble-pop-sound-for-game-and-u', o.tTasi + .7, -16]);
    if (o.tekrar) M.SFX.push(['ui-series-hollow-pop', o.tekrar.t, -14]);
    if (o.alarm) M.SFX.push(['notification', o.alarm.t, -12]);
    const [c0, s0] = o.isler[0], x0 = 20 + c0 * (kg + 10) + 12, y0 = 66 + s0 * 150, hx = 20 + 2 * (kg + 10) + 12, hy = 66 + o.isler.filter(x => x[0] === 2).length * 150;
    return { k, ciz(t) {
      kols.forEach((c, i) => { const g = M.E.expo(M.P(t, o.t0 + i * .08, .6)); M.css(c, { opacity: g, transform: `translateY(${(1 - g) * 30}px)` }); });
      kartlar.forEach((x, i) => { const g = yay(M, t, o.t0 + .2 + i * .08, .5); M.css(x.el, { opacity: clamp(g * 2), transform: `scale(${.9 + .1 * Math.min(1, g)})` }); });
      const q = M.E.kam(M.P(t, o.tTasi, .7));
      M.css(ts.el, { left: M.lerp(x0, hx, q) + 'px', top: M.lerp(y0, hy, q) - Math.sin(q * Math.PI) * 60 + 'px', zIndex: 5, transform: `rotate(${Math.sin(q * Math.PI) * 4}deg) scale(${1 + Math.sin(q * Math.PI) * .05})`, boxShadow: q > 0 && q < 1 ? '0 40px 70px -24px var(--golge)' : '' });
      set(ts.cp, q >= 1 ? cip(M, 'basari', 'circle-check', o.bitti || 'Tamamlandı', 15) : '');
      if (o.tekrar && kartlar[1]) { const tk = kartlar[1]; set(tk.cp, t >= o.tekrar.t ? cip(M, 'mor', 'repeat', o.tekrar.metin, 15) : ''); if (tk.cp.firstChild) tk.cp.firstChild.style.transform = `scale(${yay(M, t, o.tekrar.t, .4)})`; }
      if (tel) { const g = M.E.expo(M.P(t, o.t0 + .2, .7)); M.css(tel.g, { opacity: g, transform: `translateY(${(1 - g) * 120}px)` }); const a = M.E.yay(M.P(t, o.alarm.t, .7)); M.css(alarm, { opacity: clamp(a * 2), transform: `translateY(${(1 - Math.min(1, a)) * -80}px)` }); }
      im(t, [[o.tTasi - .5, x0 + 150, 400], [o.tTasi, x0 + 120, y0 + 60], [o.tTasi + .7, hx + 120, hy + 60], [o.tTasi + 1.2, hx + 160, hy + 260]], [o.tTasi], clamp((t - o.tTasi + .5) * 3) * (1 - clamp((t - o.tTasi - 1) * 3)));
    } };
  };
  // sayaclar: üstte üç sayaç, altta durum listesi; bir satır güncellenir, sayaçlar ona göre değişir; isteğe bağlı makbuz/fiş
  // o: t0, sayaclar [[ad, değer, renk, ik]], birim (' ₺'), panel {ik, baslik, alt}, satirlar [[kayıt, değer metni, durum, renk]],
  //    guncelle {satir, t, deger, durum, renk, fark: [Δsayaç0, Δ1, Δ2]}, fis {t, baslik, alt, tutar}
  S.sayaclar = function (M, tv, o) {
    const R = M.Renk;
    const k = katman(M, tv);
    const say = o.sayaclar.map(([ad, n, r, ik], i) => { const e = kutu(M, k, 20 + i * 327, 10, 306, 160, 'kart'); M.css(e, { borderRadius: '22px', padding: '20px 22px' }); e.innerHTML = `<div style="display:flex;align-items:center;gap:12px">${ikonKutu(M, ik, r, 46, 26, 12)}<span style="font-size:18px;font-weight:700;color:${R.soluk}">${ad}</span></div><div class="n" style="font-weight:900;font-size:40px;color:${rk(M, r)};margin-top:14px;letter-spacing:-.02em"></div>`; return { el: e, n: e.querySelector('.n'), deg: n }; });
    const p = panel(M, k, 20, 190, 960, 560, o.panel.ik, 'ana', o.panel.baslik, o.panel.alt);
    const rs = o.satirlar.slice(0, 4).map(([kk, d, du, r], i) => { const e = satir(M, p, 110 + i * 108, 104, kk); return { el: e, hb: hucre(M, e, 470, 200, 104, 'right'), hd: hucre(M, e, 720, 200, 104), d, du, r }; });
    const g = o.guncelle, gs = g ? rs[g.satir] : null;
    let fis = null;
    if (o.fis) { fis = kutu(M, k, 690, 330, 260, 300, 'kart'); M.css(fis, { borderRadius: '8px', padding: '22px', zIndex: 5 });
      fis.innerHTML = `<div style="font-weight:900;font-size:22px;letter-spacing:.1em;color:${R.murekkep};text-align:center">${o.fis.baslik}</div><div style="font-size:15px;color:${R.soluk};text-align:center;font-weight:600">${o.fis.alt || ''}</div>${cizgiler(M, [90, 70, 80])}<div style="font-weight:900;font-size:30px;color:${R.basari};text-align:right;margin-top:22px">${o.fis.tutar}</div>`; }
    if (g) M.SFX.push(['ui-button-click', g.t, -8], ['the-best-bubble-pop-sound-for-game-and-u', g.t + .3, -16]);
    if (o.fis) M.SFX.push(['swipe-whoosh', o.fis.t, -16]);
    M.SFX.push(...say.map((_, i) => ['ui-series-hollow-pop', o.t0 + .1 + i * .1, -22]));
    const fmt = n => M.tr(n) + (o.birim ?? '');
    return { k, ciz(t) {
      say.forEach((s, i) => { const gg = M.E.expo(M.P(t, o.t0 + .1 + i * .1, .6)), q = M.E.ui(M.P(t, o.t0 + .2, 1.2)); let n = s.deg * q; if (g && g.fark && t >= g.t + .3) n += (g.fark[i] || 0) * M.E.ui(M.P(t, g.t + .3, .6)); s.n.textContent = fmt(n); M.css(s.el, { opacity: gg, transform: `translateY(${(1 - gg) * 30}px)` }); });
      const pg = M.E.expo(M.P(t, o.t0 + .2, .6)); M.css(p, { opacity: pg, transform: `translateY(${(1 - pg) * 30}px)` });
      rs.forEach((r, i) => { const gg = M.E.expo(M.P(t, o.t0 + .3 + i * .07, .6)); M.css(r.el, { opacity: gg, transform: `translateX(${(1 - gg) * 40}px)` });
        const yeni = r === gs && t >= g.t + .3;
        set(r.hb, `<span style="font-weight:900;color:${rk(M, yeni ? g.renk : r.r)}">${yeni ? g.deger : r.d}</span>`);
        set(r.hd, yeni ? cip(M, g.renk, 'circle-check', g.durum, 18) : cip(M, r.r, null, r.du, 18));
        if (r === gs) { const v = Math.max(0, 1 - Math.abs(t - g.t - .4) / .6); r.el.style.background = v ? R.acik(R.basari, 1 - .1 * v) : 'transparent'; } });
      if (fis) { const q = M.E.expo(M.P(t, o.fis.t, .8)); M.css(fis, { opacity: q > 0 ? 1 : 0, clipPath: `inset(0 0 ${(1 - q) * 100}% 0)`, transform: `translateY(${(1 - q) * -40}px) rotate(3deg)` }); }
    } };
  };
  // gonder: liste satırları seçilir, kanal düğmelerine basılır, simgeler satırlara uçar.
  // o: t0, panel {ik, baslik, alt}, kolonlar [['Belge'], ['Tutar']] başlıkları, satirlar [[kayıt, belge, tutar]], kanallar [[ik, ad, renk]] (1–2), tSec, tKanal [an…]
  S.gonder = function (M, tv, o) {
    const R = M.Renk;
    const k = katman(M, tv);
    const p = panel(M, k, 20, 0, 960, 760, o.panel.ik || 'send', 'ana', o.panel.baslik, o.panel.alt);
    const [kb1, kb2] = o.kolonlar || ['Belge', 'Tutar'];
    basliklar(M, p, 112, [['', 36, 30], [o.kayitBaslik || 'Kayıt', 84, 300], [kb1, 400, 200], [kb2, 600, 150, 'right'], [o.kanalBaslik || 'Kanal', 790, 140, 'center']]);
    const K = o.kanallar;
    // satır: [kayıt, belge, tutar, atla] — atla (ör. 'Eksik') verilirse satır seçilmez, gönderilmez, durumu hata çipiyle görünür; o.tEksik'te vurgulanır.
    // o.durumCip: true ise tutar sütunu başarı çipi olarak çizilir (ör. 'Hazır').
    const rs = o.satirlar.slice(0, 5).map(([kk, tur, tutar, atla], i) => { const e = satir(M, p, 156 + i * 84, 82, kk); e.firstChild.style.left = '64px';
      const kut = M.$('div', 'abs', e); M.css(kut, { left: '16px', top: '27px', width: '28px', height: '28px', borderRadius: '8px', border: `2px solid ${R.cizgi}`, display: 'flex', alignItems: 'center', justifyContent: 'center' });
      hucre(M, e, 400, 200, 82, 'left').innerHTML = `<span style="padding:6px 12px;border-radius:999px;background:${R.acik(R.soluk, .85)};color:${R.ikincil};font-size:18px;font-weight:800">${tur}</span>`;
      const hd = hucre(M, e, 600, 150, 82, 'right');
      if (atla) hd.innerHTML = cip(M, 'hata', 'alert-triangle', atla, 17); else if (o.durumCip) hd.innerHTML = cip(M, 'basari', 'circle-check', tutar, 17); else hd.textContent = tutar;
      const gk = hucre(M, e, 790, 140, 82);
      gk.innerHTML = K.map(([ik]) => `<span class="kn" style="width:30px;height:30px;border-radius:50%;background:${R.acik(R.soluk, .85)};display:inline-flex;align-items:center;justify-content:center">${atla ? '' : M.ikon(ik, R.soluk, 17, 2.4)}</span>`).join('').replace(atla ? /background:[^;]+;/g : /$^/, atla ? `border:2px dashed ${R.cizgi};` : '');
      return { el: e, kut, atla: !!atla, kn: [...gk.querySelectorAll('.kn')] }; });
    const dw = K.length === 1 ? 880 : 430;
    const dg = K.map(([ik, ad, r], i) => { const e = kutu(M, p, 40 + i * 450, 600, dw, 110, 'abs'); M.css(e, { borderRadius: '20px', border: `2px solid ${R.saydam(rk(M, r), .2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', fontWeight: 800, fontSize: '30px' }); return { el: e, ik, ad, r: rk(M, r) }; });
    const ucan = K.map(([ik, , r]) => rs.map(() => { const e = M.$('div', 'abs', k, `<div style="width:42px;height:42px;border-radius:50%;background:${rk(M, r)};display:flex;align-items:center;justify-content:center">${M.ikon(ik, '#fff', 22, 2.4)}</div>`); M.css(e, { zIndex: 6 }); return e; }));
    const im = Imlec(M, k), tK = o.tKanal;
    M.SFX.push(['ui-button-click', o.tSec, -10], ...tK.map(x => ['ui-button-click', x, -8]), ...tK.map(x => ['hi-speed-electronic-whoosh-1-wav', x + .15, -18]));
    return { k, ciz(t) {
      rs.forEach((r, i) => { const g = M.E.expo(M.P(t, o.t0 + .15 + i * .07, .6)); M.css(r.el, { opacity: g, transform: `translateX(${(1 - g) * 40}px)` });
        if (r.atla) { const tv0 = o.tEksik == null ? Infinity : o.tEksik, v = t >= tv0 ? M.E.ui(M.P(t, tv0, .4)) : 0, nb = v ? Math.sin((t - tv0) * 7) * .5 + .5 : 0;
          r.kut.style.background = 'transparent'; r.kut.style.borderColor = R.cizgi; set(r.kut, '');
          r.el.style.background = v ? R.acik(R.hata, 1 - .12 * v) : 'transparent'; r.el.style.boxShadow = v ? `0 0 0 ${2 + nb * 4}px ${R.saydam(R.hata, .3 * v)}` : 'none'; return; }
        const sec = t >= o.tSec + i * .05; r.kut.style.background = sec ? R.ana : 'transparent'; r.kut.style.borderColor = sec ? R.ana : R.cizgi; set(r.kut, sec ? M.ikon('check', '#fff', 20, 3.2) : '');
        r.el.style.background = sec ? R.acik(R.ana, .93) : 'transparent';
        r.kn.forEach((x, j) => { const ok = t >= tK[j] + .45 + i * .05; x.style.background = ok ? rk(M, K[j][2]) : R.acik(R.soluk, .85); set(x, M.ikon(K[j][0], ok ? '#fff' : R.soluk, 17, 2.4)); }); });
      dg.forEach((d, i) => { const g = M.E.expo(M.P(t, o.t0 + .3 + i * .1, .5)), ak = t >= tK[i]; M.css(d.el, { opacity: g, transform: `translateY(${(1 - g) * 30}px) scale(${1 - basma(t, tK[i]) * .05})`, background: ak ? d.r : R.yuzey, color: ak ? '#fff' : d.r }); set(d.el, `${M.ikon(d.ik, ak ? '#fff' : d.r, 40, 2.2)}${d.ad}`);
        ucan[i].forEach((u, j) => { if (rs[j].atla) { u.style.opacity = 0; return; } const q = M.P(t, tK[i] + .1 + j * .06, .45), qq = M.E.inout(q); const sx = 20 + 40 + i * 450 + dw / 2, sy = 660, hx = 20 + 20 + 790 + 50, hy = 156 + j * 84 + 41; M.css(u, { left: M.lerp(sx, hx, qq) - 21 + 'px', top: M.lerp(sy, hy, qq) - 21 - Math.sin(qq * Math.PI) * 120 + 'px', opacity: q > 0 && q < 1 ? 1 : 0, transform: `scale(${1 - qq * .4})` }); }); });
      const yol = [[o.tSec - .5, 500, 760], [o.tSec - .05, 70, 197], ...tK.map((x, i) => [x - .05, 60 + i * 450 + dw / 2, 670]), [tK.at(-1) + .6, 860, 760]];
      im(t, yol, [o.tSec, ...tK], clamp((t - o.tSec + .5) * 3) * (1 - clamp((t - tK.at(-1) - .5) * 3)));
    } };
  };
  // mesaj: telefonda gelen istek, solda belgeler seçilir, düğmeyle iletilir. o: t0, kisi [ad, kısaltma, renk], metin, belgeler [[ad, ik, renk]], secilen (adet), dugme, tMesaj, tGonder, yanit (dosya adları)
  S.mesaj = function (M, tv, o) {
    const R = M.Renk;
    const k = katman(M, tv);
    const tel = telefon(M, k, 600, 20, 340, 720);
    const [kad, kk, kr] = o.kisi;
    const msj = M.$('div', 'abs', tel.ekran, `<div style="display:flex;align-items:flex-start;gap:10px">${avatar(['', kk, kr], 40)}<div style="background:${R.yuzey};border-radius:6px 20px 20px 20px;padding:12px 16px;box-shadow:0 12px 24px -14px var(--golge)"><div style="font-size:15px;font-weight:800;color:${kr}">${kad}</div><div style="font-size:20px;font-weight:600;color:${R.murekkep};line-height:1.3">${o.metin}</div></div></div>`);
    M.css(msj, { left: '14px', right: '14px', top: '80px' });
    const sec = o.secilen ?? 2;
    const yanit = M.$('div', 'abs', tel.ekran, `<div style="margin-left:auto;background:${R.acik(R.basari, .82)};border-radius:20px 6px 20px 20px;padding:12px 14px;display:flex;flex-direction:column;gap:8px;width:240px">${o.belgeler.slice(0, sec).map(([d]) => `<div style="display:flex;align-items:center;gap:8px;font-weight:800;font-size:16px;color:${R.murekkep}">${M.ikon('file-text', R.hata, 22, 2.2)}${d}</div>`).join('')}<div style="font-size:13px;color:${R.basari};font-weight:800;text-align:right">✓✓ ${o.iletildi || 'iletildi'}</div></div>`);
    M.css(yanit, { left: '14px', right: '14px', top: '300px', display: 'flex' });
    const ev = o.belgeler.slice(0, 3).map(([ad, ik, r], i) => { const e = kutu(M, k, 40, 80 + i * 150, 480, 130, 'kart'); M.css(e, { borderRadius: '22px', display: 'flex', alignItems: 'center', gap: '18px', padding: '0 24px' }); e.innerHTML = `${ikonKutu(M, ik, r, 64, 34, 16)}<b style="font-size:27px;color:${R.murekkep};flex:1">${ad}</b><span class="d"></span>`; return { el: e, d: e.querySelector('.d') }; });
    const gb = dugme(M, k, 40, 560, 480, o.dugme, 'send', 64);
    const im = Imlec(M, k);
    M.SFX.push(['notification', o.tMesaj, -14], ['ui-button-click', o.tGonder, -8], ['hi-speed-electronic-whoosh-1-wav', o.tGonder + .15, -18], ['chime-notification', o.tGonder + .6, -16]);
    return { k, ciz(t) {
      const tg = M.E.expo(M.P(t, o.t0, .7)); M.css(tel.g, { opacity: tg, transform: `translateY(${(1 - tg) * 120}px)` });
      const mm = M.E.yay(M.P(t, o.tMesaj, .6)); M.css(msj, { opacity: clamp(mm * 2), transform: `translateX(${(1 - Math.min(1, mm)) * -40}px)` });
      ev.forEach((e, i) => { const g = M.E.expo(M.P(t, o.tMesaj + .2 + i * .1, .5)); M.css(e.el, { opacity: g, transform: `translateX(${(1 - g) * -40}px)` }); set(e.d, i < sec && t >= o.tGonder - .4 + i * .1 ? H.tik(M) : ''); });
      const g = M.E.expo(M.P(t, o.tMesaj + .5, .5)); M.css(gb, { opacity: g, transform: `scale(${1 - basma(t, o.tGonder) * .05})` });
      const y = M.E.yay(M.P(t, o.tGonder + .4, .6)); M.css(yanit, { opacity: clamp(y * 2), transform: `translateY(${(1 - Math.min(1, y)) * 30}px)` });
      im(t, [[o.tGonder - .6, 300, 760], [o.tGonder - .05, 300, 592], [o.tGonder + .5, 340, 760]], [o.tGonder], clamp((t - o.tGonder + .6) * 3) * (1 - clamp((t - o.tGonder - .4) * 3)));
    } };
  };
  // baglan: hizmet/portal kartları, birine tıklanır → bağlanıyor → bağlandı; isteğe bağlı kilit + güvenlik etiketi.
  // o: t0, kartlar [[ad, ik, renk]] (4), tTik, metinler ['Bağlanıyor…', 'Bağlandı'], kilit {t, etiket}
  S.baglan = function (M, tv, o) {
    const R = M.Renk;
    const k = katman(M, tv);
    const gen = o.kilit ? 600 : 960, kw = (gen - 20) / 2;
    const ks = o.kartlar.slice(0, 4).map(([ad, ik, r], i) => { const e = kutu(M, k, 20 + (i % 2) * (kw + 20), 60 + Math.floor(i / 2) * 330, kw, 300, 'kart'); M.css(e, { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '18px', textAlign: 'center' });
      e.innerHTML = `${ikonKutu(M, ik, r, 90, 48, 24)}<b style="font-size:26px;color:${R.murekkep};padding:0 14px">${ad}</b><span class="d" style="height:40px;display:inline-flex;align-items:center"></span>`; return { el: e, d: e.querySelector('.d') }; });
    const hd = ks[0], [m1, m2] = o.metinler || ['Bağlanıyor…', 'Bağlandı'];
    let kilit = null, etiket = null;
    if (o.kilit) { kilit = M.$('div', 'abs', k, `<div style="width:260px;height:260px;border-radius:50%;background:${R.yuzey};display:flex;align-items:center;justify-content:center;box-shadow:0 40px 80px -30px var(--golge)"></div>`); M.css(kilit, { left: '680px', top: '150px' });
      etiket = M.$('div', 'abs', k, cip(M, 'basari', 'shield-check', o.kilit.etiket, 24)); M.css(etiket, { left: '660px', top: '450px' }); }
    const im = Imlec(M, k);
    M.SFX.push(...ks.map((_, i) => ['ui-series-hollow-pop', o.t0 + .15 + i * .08, -22]), ['ui-button-click', o.tTik, -8], ['light-ping-hits', o.tTik + .8, -16]);
    if (o.kilit) M.SFX.push(['ui-button-click', o.kilit.t, -10]);
    return { k, ciz(t) {
      ks.forEach((x, i) => { const g = yay(M, t, o.t0 + .15 + i * .08, .5); M.css(x.el, { opacity: clamp(g * 2), transform: `scale(${(.85 + .15 * Math.min(1, g)) * (x === hd ? 1 - basma(t, o.tTik) * .04 : 1)})` }); });
      set(hd.d, t >= o.tTik + .8 ? cip(M, 'basari', 'circle-check', m2, 20) : t >= o.tTik ? cip(M, 'bilgi', 'refresh', m1, 20) : '');
      hd.el.style.boxShadow = t >= o.tTik + .8 ? `0 0 0 4px ${R.saydam(R.basari, .3)}, 0 40px 80px -30px var(--golge)` : '';
      if (kilit) { const g = yay(M, t, o.t0 + .3, .6), kap = t >= o.kilit.t; M.css(kilit, { opacity: clamp(g * 2), transform: `scale(${Math.min(1, g) * (1 + basma(t, o.kilit.t) * .06)})` }); set(kilit.firstChild, M.ikon(kap ? 'lock' : 'lock-open', kap ? R.basari : R.soluk, 130, 2)); const e = yay(M, t, o.kilit.t + .2, .5); M.css(etiket, { opacity: clamp(e * 2), transform: `scale(${e})` }); }
      im(t, [[o.tTik - .6, 500, 760], [o.tTik - .05, 20 + kw / 2, 260], [o.tTik + .6, 300, 760]], [o.tTik], clamp((t - o.tTik + .6) * 3) * (1 - clamp((t - o.tTik - .5) * 3)));
    } };
  };
  // cep: telefon yükselir, uygulama listesi, bildirim; isteğe bağlı mağaza rozetleri. o: t0, liste [[ik, ad, değer]], bildirim, tBildirim, magaza {tIos, tAndroid, ios: ['App Store\'dan', 'iOS'], android: [...]}
  S.cep = function (M, tv, o) {
    const R = M.Renk;
    const k = katman(M, tv);
    const tel = telefon(M, k, o.magaza ? 120 : 330, 30, 340, 700);
    const ust = M.$('div', 'abs', tel.ekran, `<div style="display:flex;align-items:center;gap:10px">${logoImg(M, 40)}<b style="font-size:20px;color:${R.murekkep}">${(M.TEMA.ad || '').toLocaleUpperCase('tr')}</b></div>`); M.css(ust, { left: '20px', top: '60px' });
    const ls = o.liste.slice(0, 6).map(([ik, ad, d], i) => { const e = M.$('div', 'abs', tel.ekran, `<div style="display:flex;align-items:center;gap:12px;background:${R.yuzey};border-radius:16px;padding:12px 14px;box-shadow:0 10px 20px -14px var(--golge)">${ikonKutu(M, ik, 'ana', 40, 22, 10)}<b style="font-size:18px;color:${R.murekkep};flex:1">${ad}</b><span style="font-size:15px;font-weight:800;color:${R.ikincil}">${d}</span></div>`); M.css(e, { left: '16px', right: '16px', top: 120 + i * 78 + 'px' }); return e; });
    const bil = M.$('div', 'abs', tel.ekran, `<div style="display:flex;align-items:center;gap:8px">${logoImg(M, 30, 'border-radius:8px')}<b style="font-size:14px;color:${R.ikincil}">${(M.TEMA.ad || '').toLocaleUpperCase('tr')} · ${o.simdi || 'şimdi'}</b></div><div style="font-weight:800;font-size:18px;color:${R.murekkep};margin-top:6px">${o.bildirim}</div>`);
    M.css(bil, { left: '10px', right: '10px', top: '14px', borderRadius: '18px', background: R.saydam(R.yuzey, .97), padding: '12px', boxShadow: '0 16px 30px -12px var(--golge)', zIndex: 3 });
    let rozet = null;
    if (o.magaza) { const mz = o.magaza; rozet = [['brand-apple', mz.ios || ["App Store'dan", 'iOS'], mz.tIos], ['brand-google-play', mz.android || ["Google Play'den", 'Android'], mz.tAndroid]].map(([ik, [a, b], tt], i) => { const e = M.$('div', 'abs', k, `<div style="display:flex;align-items:center;gap:16px;background:#0B1020;color:#fff;border-radius:22px;padding:18px 30px;box-shadow:0 26px 50px -20px rgba(0,0,0,.6)">${M.ikon(ik, '#fff', 54, 2)}<div><div style="font-size:16px;opacity:.75;font-weight:600">${a}</div><div style="font-size:30px;font-weight:800">${b}</div></div></div>`); M.css(e, { left: '540px', top: 220 + i * 170 + 'px' }); return { el: e, t: tt }; });
      M.SFX.push(...rozet.map(r => ['ui-series-hollow-pop', r.t, -14])); }
    M.SFX.push(['whoosh-1', o.t0, -14], ['notification', o.tBildirim, -12]);
    return { k, ciz(t) {
      const g = M.E.yay(M.P(t, o.t0, .8)); M.css(tel.g, { transform: `translateY(${(1 - Math.min(1, g)) * 700}px) rotate(${(1 - Math.min(1, g)) * 6}deg)` });
      ls.forEach((e, i) => { const q = M.E.expo(M.P(t, o.t0 + .4 + i * .08, .5)); M.css(e, { opacity: q, transform: `translateY(${(1 - q) * 20}px)` }); });
      const b = M.E.yay(M.P(t, o.tBildirim, .6)); M.css(bil, { opacity: clamp(b * 2), transform: `translateY(${(1 - Math.min(1, b)) * -80}px)` });
      if (rozet) rozet.forEach(r => { const q = yay(M, t, r.t, .5); M.css(r.el, { opacity: clamp(q * 2), transform: `scale(${q})` }); });
    } };
  };
  // durum: kayıt listesi, durum rozetleri söylendiği anda. o: t0, panel {ik, baslik, alt}, kayitlar [k…] (≤6), durumlar {anahtar: [ad, renk, ik]}, atama [anahtar…], tD {anahtar: an}, sorun (vurgulanacak anahtar)
  S.durum = function (M, tv, o) {
    const R = M.Renk;
    const k = katman(M, tv);
    const p = panel(M, k, 20, 0, 960, 760, o.panel.ik, 'ana', o.panel.baslik, o.panel.alt);
    const rs = o.kayitlar.slice(0, 6).map((kk, i) => { const e = satir(M, p, 110 + i * 106, 102, kk, o.altMetin); return { el: e, h: hucre(M, e, 640, 290, 102, 'right'), d: o.atama[i] }; });
    M.SFX.push(...Object.values(o.tD).map(x => ['ui-series-hollow-pop', x, -16]));
    return { k, ciz(t) {
      rs.forEach((r, i) => { const g = M.E.expo(M.P(t, o.t0 + .15 + i * .07, .6)); M.css(r.el, { opacity: g, transform: `translateX(${(1 - g) * 40}px)` });
        const td = o.tD[r.d] + (i % 2) * .08, ok = t >= td, [ad, c, ik] = o.durumlar[r.d]; set(r.h, ok ? cip(M, c, ik, ad, 20) : bekle(M)); if (r.h.firstChild && r.h.firstChild.style) r.h.firstChild.style.transform = `scale(${ok ? yay(M, t, td, .4) : 1})`;
        const v = o.sorun && r.d === o.sorun && t >= o.tD[o.sorun] ? M.E.ui(M.P(t, o.tD[o.sorun], .4)) : 0; r.el.style.background = v ? R.acik(R.hata, 1 - .1 * v) : 'transparent'; });
    } };
  };
  // belge: bir belge kartı ve gönderim kanalları. o: t0, baslik (belge başlığı), k (kayıt), kanallar [[ik, ad, renk]], tGonder
  S.belge = function (M, tv, o) {
    const R = M.Renk;
    const k = katman(M, tv);
    const lv = kutu(M, k, 80, 60, 400, 600, 'kart'); M.css(lv, { borderRadius: '12px', overflow: 'hidden' });
    lv.innerHTML = `<div style="height:96px;background:var(--vurgu-grad);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:30px;letter-spacing:.1em;text-align:center;padding:0 16px">${o.baslik}</div><div style="padding:26px 30px"><div style="display:flex;align-items:center;gap:12px">${avatar(o.k, 44)}<b style="font-size:24px;color:${R.murekkep}">${kayit(o.k)[0]}</b></div>${cizgiler(M, [62, 74, 48, 56, 68])}<div style="margin-top:30px;font-size:14px;font-weight:700;color:${R.soluk};letter-spacing:.05em">${o.kod || 'BELGE NO'}</div><div style="font-weight:900;font-size:22px;color:${R.murekkep}">••••-••••</div></div>`;
    const kan = o.kanallar.map(([ik, ad, r], i) => { const c = rk(M, r); const e = M.$('div', 'abs', k, `<div style="display:flex;align-items:center;gap:14px;background:${c};color:#fff;border-radius:22px;padding:20px 28px;font-weight:800;font-size:28px;box-shadow:0 22px 40px -18px ${c}">${M.ikon(ik, '#fff', 36, 2.2)}${ad}<span class="d" style="margin-left:10px"></span></div>`); M.css(e, { left: '560px', top: 200 + i * 150 + 'px' }); return { el: e, d: e.querySelector('.d') }; });
    M.SFX.push(['ui-series-hollow-pop', o.t0 + .2, -16], ['hi-speed-electronic-whoosh-1-wav', o.tGonder, -16], ['chime-notification', o.tGonder + .5, -16]);
    return { k, ciz(t) {
      const g = M.E.yay(M.P(t, o.t0, .7)); M.css(lv, { opacity: clamp(g * 2), transform: `rotate(${-3 + (1 - Math.min(1, g)) * -6}deg) scale(${.9 + .1 * Math.min(1, g)})` });
      kan.forEach((x, i) => { const q = M.E.expo(M.P(t, o.t0 + .3 + i * .12, .5)); M.css(x.el, { opacity: q, transform: `translateX(${(1 - q) * 50}px)` }); set(x.d, t >= o.tGonder + .4 + i * .1 ? '✓' : ''); });
    } };
  };
  // merkez: logo + çevresinde dört modül, kesik bağlarla (kapanıştan önce). o: t0, moduller [[ik, renk, ad]×4]
  S.merkez = function (M, tv, o) {
    const R = M.Renk;
    const k = katman(M, tv);
    const lw = logoGen(M, 220, 330); const lg = M.$('div', 'abs', k, logoImg(M, 220, M.TEMA.logoYuvarlak === false ? '' : `box-shadow:0 0 0 8px ${R.yuzey},0 30px 60px -24px var(--golge)`, 330)); M.css(lg, { left: 500 - lw / 2 + 'px', top: 380 - lw / (M.TEMA.logoOran || 1) / 2 + 'px', zIndex: 2 });
    const YER = [[60, 60], [640, 60], [60, 520], [640, 520]];
    const oz = o.moduller.slice(0, 4).map(([ik, r, ad], i) => { const [x, y] = YER[i]; const e = kutu(M, k, x, y, 300, 170, 'kart'); M.css(e, { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }); e.innerHTML = ikonKutu(M, ik, r, 76, 42, 20) + `<div style="font-weight:800;font-size:27px;color:${R.murekkep};text-align:center">${ad}</div>`; return { el: e, x, y }; });
    const bag = M.$('div', 'abs', k, `<svg width="1000" height="760" viewBox="0 0 1000 760">${o.moduller.slice(0, 4).map(([, r], i) => `<line x1="500" y1="380" x2="${YER[i][0] + 150}" y2="${YER[i][1] + 85}" stroke="${rk(M, r)}" stroke-width="3" stroke-dasharray="8 10" opacity=".4"/>`).join('')}</svg>`); M.css(bag, { left: 0, top: 0 }); k.insertBefore(bag, k.firstChild);
    M.SFX.push(['transition-swoosh', o.t0 - .2, -12], ...oz.map((_, i) => ['ui-series-hollow-pop', o.t0 + .25 + i * .12, -16]));
    return { k, ciz(t) {
      const l = M.E.yay(M.P(t, o.t0 - .05, .8)); M.css(lg, { transform: `scale(${.5 + .5 * l})` });
      oz.forEach((x, i) => { const g = M.E.expo(M.P(t, o.t0 + .2 + i * .12, .7)); M.css(x.el, { transform: `translate(${(500 - x.x - 150) * (1 - g)}px, ${(380 - x.y - 85) * (1 - g)}px) scale(${.4 + .6 * g})`, opacity: g }); });
      bag.style.opacity = M.E.ui(M.P(t, o.t0 + .6, .6));
    } };
  };
  // ekran: sitenin gerçek ekran görüntüsü tarayıcı çerçevesinde, yavaş kaydırma + isteğe bağlı vurgu kutusu.
  // o: t0, gorsel ('marka/ekran-1.png'), adres ('ornek.com/panel'), gorselYukseklik (px, 1000 genişlikte), kaydir [an0, an1], vurgu {t, x, y, w, h, etiket}
  S.ekran = function (M, tv, o) {
    const R = M.Renk;
    const k = katman(M, tv);
    const pen = kutu(M, k, 20, 20, 960, 720, 'kart'); M.css(pen, { overflow: 'hidden', borderRadius: '20px' });
    pen.innerHTML = `<div style="height:52px;background:${R.acik(R.soluk, .8)};display:flex;align-items:center;gap:8px;padding:0 18px">${`<span style="width:12px;height:12px;border-radius:50%;background:${R.cizgi}"></span>`.repeat(3)}<div style="margin-left:14px;flex:1;height:32px;border-radius:9px;background:${R.yuzey};display:flex;align-items:center;gap:8px;padding:0 12px;font-size:17px;color:${R.ikincil}">${M.ikon('lock', R.basari, 16, 2.4)}${o.adres || M.TEMA.adres || ''}</div></div><div class="g" style="position:absolute;left:0;top:52px;right:0;bottom:0;overflow:hidden"><img src="${o.gorsel}" style="position:absolute;left:0;top:0;width:100%"></div>`;
    const img = pen.querySelector('img');
    let vb = null;
    if (o.vurgu) { vb = M.$('div', 'abs', pen, o.vurgu.etiket ? `<div style="position:absolute;left:0;top:-46px">${cip(M, 'ana', null, o.vurgu.etiket, 18, true)}</div>` : ''); M.css(vb, { left: o.vurgu.x + 'px', top: 52 + o.vurgu.y + 'px', width: o.vurgu.w + 'px', height: o.vurgu.h + 'px', borderRadius: '14px', border: `4px solid ${R.ana}`, boxShadow: `0 0 0 9999px ${R.saydam('#000000', .25)}` }); M.SFX.push(['ui-series-hollow-pop', o.vurgu.t, -16]); }
    return { k, ciz(t) {
      const g = M.E.expo(M.P(t, o.t0, .7)); M.css(pen, { opacity: g, transform: `translateY(${(1 - g) * 40}px)` });
      if (o.kaydir && o.gorselYukseklik) { const q = M.E.inout(M.P(t, o.kaydir[0], o.kaydir[1] - o.kaydir[0])); img.style.transform = `translateY(${-q * Math.max(0, o.gorselYukseklik - 668)}px)`; }
      if (vb) { const v = M.E.ui(M.P(t, o.vurgu.t, .4)); M.css(vb, { opacity: v, transform: `scale(${1.08 - .08 * v})` }); }
    } };
  };

  // ---------- film akışı ----------
  // basliklar: [[metin, t0, t1]]; kur(tv) → [[sahne, t0, t1, kapGor seçenekleri]]. o: muzik {dosya, kazanc}, ton (M.ARKA.ton)
  function Film(M, tCta, basliklar, kur, o = {}) {
    M.ALTYAZI_SON = tCta;
    if (o.ton) M.ARKA.ton = o.ton;
    const bs = basliklar.map(([m, a, z]) => [M.Baslik(m), a, z]);
    const tv = M.Tuval();
    const sahneler = kur(tv);
    const kapanis = M.Kapanis(tCta - .2, o.kapanis || {});
    M.SFX.push(['whoosh-boom-wav', tCta - .25, -14]);
    sahneler.slice(1).forEach(([, a]) => M.SFX.push(['transition-swoosh', a - .15, -14]));
    const mz = o.muzik || {};
    M.MUZIK = { dosya: mz.dosya || 'corporate-company-introduction-video', bas: mz.bas || 0, kazanc: mz.kazanc ?? (/^R/.test(M.R) ? -2 : -3), sure: mz.sure || 58.66 };
    if (M.D > M.MUZIK.sure) M.MUZIK.tempo = Math.max(.9, (M.MUZIK.sure - .3) / M.D);
    return function (t) {
      bs.forEach(([b, a, z]) => b.ciz(t, a, z));
      tv.kamera(0, 0, 1);
      sahneler.forEach(([s, a, z, ko]) => { if (kapGor(M, s.k, t, a - .1, z + .1, ko || {})) s.ciz(t); });
      kapanis(t);
    };
  }

  window.S = S;
  window.SH = { Film, kapGor, katman, kutu, cip, ikonKutu, avatar, Imlec, telefon, yay, panel, basliklar, satir, hucre, dugme, cubuk, H, not, pencere, cizgiler, logoImg, kayit, rk, set };
  window.FILMLER = window.FILMLER || {};
})();
