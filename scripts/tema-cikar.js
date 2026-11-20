// Chrome eklentisinde (javascript_tool) sitenin sayfasında çalıştır. Eklenti ~1,5 KB üstü sonucu kestiği için iki parça:
// 1) bu dosya → tema değerleri (renk, yazı, düğme, köşe); tamamı window.__tema'ya yazılır.
// 2) ardından: JSON.stringify(window.__tema.icerik) → başlıklar, menü, logo, açıklama, CSS değişkenleri.
// JSON döner. Değerler aday — references/tema-analizi.md'deki
// eşlemeyle tema.js'e çevir ve ekran görüntüsüyle doğrula. Sayfa içeriğini değiştirmez, hiçbir yere bir şey göndermez; yalnız okur (window.__tema değişkenini bırakır).
(() => {
  const cs = el => getComputedStyle(el);
  // adreslerden sorgu dizesini at (eklenti sorgu/çerez içeren çıktıyı engeller; tema için gereksiz)
  const url = u => u ? String(u).split(/[?#]/)[0] : u;
  const gfAile = h => decodeURIComponent((String(h).match(/family=([^&]+)/g) || []).map(x => x.slice(7).split(':')[0].replace(/\+/g, ' ')).join(', '));
  const hex = c => { const m = (c || '').match(/[\d.]+/g); if (!m || m.length < 3) return null; const [r, g, b, a = 1] = m.map(Number); if (a < .15) return null; return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join(''); };
  const kanal = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const lum = h => { const [r, g, b] = kanal(h).map(v => v / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * r + .7152 * g + .0722 * b; };
  const doy = h => { const k = kanal(h), mx = Math.max(...k), mn = Math.min(...k); return mx ? (mx - mn) / mx : 0; };
  const gorunur = el => { const r = el.getBoundingClientRect(); const s = cs(el); return r.width > 4 && r.height > 4 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > .1; };
  const zeminOf = el => { while (el) { const h = hex(cs(el).backgroundColor); if (h) return h; el = el.parentElement; } return '#ffffff'; };
  const body = document.body;
  const zemin = zeminOf(document.elementFromPoint(innerWidth / 2, innerHeight * .6) || body);
  const h1 = document.querySelector('h1') || document.querySelector('h2');
  const dugmeler = [...document.querySelectorAll('a,button,[role=button]')].filter(gorunur).map(e => { const r = e.getBoundingClientRect(); const gr = cs(e).backgroundImage.match(/rgba?\([^)]+\)/g); return { bg: hex(cs(e).backgroundColor) || (gr ? hex(gr[0]) : null), bg2: gr && gr[1] ? hex(gr[1]) : null, renk: hex(cs(e).color), kose: cs(e).borderRadius, metin: (e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40), alan: r.width * r.height, ust: Math.round(r.top + scrollY) }; }).filter(b => b.bg && doy(b.bg) > .25);
  const agirlik = {}; dugmeler.forEach(b => { agirlik[b.bg] = (agirlik[b.bg] || 0) + b.alan; });
  const vurguYazi = {}; [...document.querySelectorAll('h1 *, h2 *, a, strong, b, .text-primary, [class*="accent" i], [class*="primary" i]')].filter(gorunur).slice(0, 300).forEach(e => { const c = hex(cs(e).color); if (c && doy(c) > .35) vurguYazi[c] = (vurguYazi[c] || 0) + 1; });
  const h1Vurgu = (document.querySelector('h1') ? [...document.querySelector('h1').querySelectorAll('*')] : []).map(e => ({ metin: e.innerText.slice(0, 24), renk: hex(cs(e).color), degrade: (cs(e).backgroundImage.match(/rgba?\([^)]+\)/g) || []).map(hex) })).filter(x => x.degrade.length || x.renk).slice(0, 3);
  const gradyan = [...document.querySelectorAll('h1,h1 *,h2,h2 *,a,button,section,div')].filter(gorunur).slice(0, 800).map(e => cs(e).backgroundImage).filter(b => b && b.includes('gradient')).slice(0, 6);
  const degisken = {};
  for (const sh of document.styleSheets) { let kurallar; try { kurallar = sh.cssRules; } catch { continue; }
    for (const k of kurallar) if (k.selectorText && /(:root|html|body|\[data-theme|\.dark|\.light)/.test(k.selectorText)) for (const p of k.style) if (p.startsWith('--')) { const v = k.style.getPropertyValue(p).trim(); if (/^(#|rgb|hsl|oklch)/.test(v)) degisken[k.selectorText.slice(0, 30) + ' ' + p] = v; } }
  const kartlar = [...document.querySelectorAll('div,section,article,li,aside')].filter(e => gorunur(e) && (cs(e).boxShadow !== 'none' || cs(e).borderTopWidth !== '0px') && hex(cs(e).backgroundColor)).slice(0, 60);
  const koseler = kartlar.map(e => parseFloat(cs(e).borderTopLeftRadius)).filter(v => v > 0).sort((a, b) => a - b);
  const kartZemin = {}; kartlar.forEach(e => { const h = hex(cs(e).backgroundColor); kartZemin[h] = (kartZemin[h] || 0) + 1; });
  const logo = [...document.querySelectorAll('header img, nav img, a[href="/"] img, img[alt*="logo" i], img[src*="logo" i], img[class*="logo" i], header svg, nav svg, a[class*="logo" i] svg, [class*="logo" i] svg')]
    .filter(gorunur).slice(0, 5).map(e => { const r = e.getBoundingClientRect(); return { tur: e.tagName, src: url(e.currentSrc || e.src || null), alt: e.alt || e.getAttribute('aria-label') || '', w: Math.round(r.width), h: Math.round(r.height), svg: e.tagName.toLowerCase() === 'svg' ? '(satır içi svg: ayrıca outerHTML ile al)' : null }; });
  const sirala = o => Object.entries(o).sort((a, b) => b[1] - a[1]).map(x => x[0]);
  const t = {
    adres: url(location.href), baslik: document.title, aciklama: document.querySelector('meta[name="description"]')?.content || '',
    temaRengi: document.querySelector('meta[name="theme-color"]')?.content || null,
    zemin, koyu: lum(zemin) < .25, kartZemin: sirala(kartZemin).slice(0, 3),
    yazi: { govdeAile: cs(body).fontFamily, baslikAile: h1 ? cs(h1).fontFamily : null, baslikAgirlik: h1 ? cs(h1).fontWeight : null, baslikHarfAraligi: h1 ? cs(h1).letterSpacing : null,
      baslikRenk: h1 ? hex(cs(h1).color) : null, govdeRenk: hex(cs(body).color), googleFonts: [...new Set([...document.querySelectorAll('link[href*="fonts.googleapis"]')].map(l => gfAile(l.href)))] },
    dugmeRenkleri: sirala(agirlik).slice(0, 4), cta: dugmeler.filter(b => b.metin).sort((a, b) => b.alan - a.alan).slice(0, 4).map(({ metin, bg, bg2, renk, kose }) => ({ metin, bg, bg2, renk, kose })),
    vurguYaziRenkleri: sirala(vurguYazi).slice(0, 5), h1Vurgu, gradyanlar: gradyan.map(g => (g.match(/rgba?\([^)]+\)/g) || []).map(hex).join(' → ')).filter(g => g.replace(/[ →]/g, '')).slice(0, 4),
    kartKose: koseler.length ? koseler[Math.floor(koseler.length / 2)] : null,
    cssDegiskenleri: Object.fromEntries(Object.entries(degisken).slice(0, 24)),
    logo, simgeler: [...document.querySelectorAll('link[rel*="icon"], link[rel="apple-touch-icon"]')].map(l => url(l.href)),
    basliklar: [...document.querySelectorAll('h1,h2,h3')].slice(0, 20).map(h => h.innerText.trim().replace(/\s+/g, ' ').slice(0, 70)).filter(Boolean),
    menu: [...document.querySelectorAll('nav a, header a')].filter(gorunur).slice(0, 15).map(a => a.innerText.trim().replace(/\s+/g, ' ')).filter(Boolean)
  };
  window.__tema = { ...t, icerik: { aciklama: t.aciklama, basliklar: t.basliklar, menu: t.menu, logo: t.logo, simgeler: t.simgeler, cssDegiskenleri: t.cssDegiskenleri, gradyanlar: t.gradyanlar, vurguYaziRenkleri: t.vurguYaziRenkleri } };
  return JSON.stringify({ adres: t.adres, zemin: t.zemin, koyu: t.koyu, kartZemin: t.kartZemin, yazi: { ...t.yazi, govdeAile: t.yazi.govdeAile.split(',')[0], baslikAile: (t.yazi.baslikAile || '').split(',')[0] }, dugmeRenkleri: t.dugmeRenkleri,
    cta: [...new Map(t.cta.map(c => [c.metin, c])).values()].slice(0, 3), h1Vurgu: t.h1Vurgu, kartKose: t.kartKose });
})()
