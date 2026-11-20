// İçerik: örnek kayıtlar + filmler. Her film M alır, Film(...) ile çizim fonksiyonu döndürür.
// Kayıtlar kurgusaldır (gerçek müşteri verisi kullanma). [ad, kısaltma, avatar rengi]
window.KAYITLAR = [
  ['Akdeniz Mobilya', 'AM', '#1B84FF'], ['Beta Gıda', 'BG', '#17C1A4'], ['Delta Lojistik', 'DL', '#7239EA'],
  ['Ekin Tarım', 'ET', '#F6A700'], ['Kuzey Yazılım', 'KY', '#386F7D'], ['Mavi İnşaat', 'Mİ', '#F1416C']
];

// ---------- R1: 15 sn reklam (sorun → çözüm → sonuç → kapanış) ----------
// Seslendirme (TTS): "Hangi müşterinin ödemesi gecikti? Fest Müşavir tüm müşterilerinizi tek ekranda tarar. Gecikeni anında görün. Ücretsiz demo için hemen başvurun!"
FILMLER.R1 = function (M) {
  const { T } = M, { Film, H, not } = SH;
  const tF = T('Fast'), tGec = T('Gecikeni'), tCta = T('Ücretsiz') - .12;
  return Film(M, tCta, [
    ['Hangi ödeme | !gecikti?!', .1, tF - .04],
    ['Tüm müşteriler | *tek ekranda.*', tF, tGec - .04],
    ['Gecikeni | *anında görün.*', tGec, tCta]
  ], tv => [
    [S.kaos(M, tv, { t0: 0, sars: T('gecikti'), parcalar: [
      { x: 60, y: 80, w: 280, h: 170, r: -6, zemin: 'dikkat', html: not(M, 'dikkat', 'receipt', 'Fatura #214', 'Ödendi mi?') },
      { x: 620, y: 60, w: 300, h: 160, r: 5, html: not(M, 'hata', 'alert-triangle', 'Vadesi geçti', 'Delta · 6.500 ₺') },
      { x: 330, y: 330, w: 320, h: 180, r: -2, html: not(M, 'bilgi', 'file-text', 'tahsilat.xlsx', '3 sürüm') }] }), 0, tF, { s0: .95 }],
    [S.tablo(M, tv, { ik: 'wallet', renk: 'ana', baslik: 'TAHSİLAT', alt: 'Tüm müşteriler', btn: 'Tara', btnIk: 'refresh', btnG: 150,
      kolonlar: [['Müşteri', 40, 320], ['Tutar', 420, 200], ['Durum', 680, 240]],
      satirlar: [[1, '0 ₺', 'Ödendi'], [2, '6.500 ₺', 'Gecikti'], [3, '0 ₺', 'Ödendi'], [5, '3.200 ₺', 'Gecikti']].map(([k, tut, d]) => ({ k, v: d === 'Gecikti' ? 'r' : null,
        h: [H.yazi(M, tut, d === 'Gecikti' ? 'hata' : null), H.cip(M, d === 'Gecikti' ? 'hata' : 'basari', d === 'Gecikti' ? 'alert-triangle' : 'circle-check', d, 18)] })),
      t0: tF, tBtn: T('tek') - .1, tBit: T('tarar') + .5, tVurgu: tGec }), tF, tCta]
  ], { ton: [[0, 3], [tF - .3, 0]] });
};

// ---------- T1: 1 dk film iskeleti (sahne kütüphanesinin çoğunu kullanır) ----------
// Film kodları R ile başlamaz → hızlandırılmaz. Ses kelimeler.mjs --sahne ile sahne aralarına boşluk alır.
// Bkz. references/sahne-kutuphanesi.md ve Fast Müşavir örneği (references/ornek-fast.md).
