// Tema: sitenin analizinden doldurulur (references/tema-analizi.md). Bu örnek Fast Müşavir'in açık temasıdır.
window.TEMA = {
  ad: 'Fast Müşavir',                       // marka adı (kapanış, telefon bildirimleri)
  logoMetin: ['FAST', 'MÜŞAVİR'],           // köşe logosu ve kapanış yazısı: [kalın, ince] ya da tek metin
  logo: 'marka/logo.png',                   // marka/ altındaki dosya; yoksa null (baş harflerle rozet çizilir)
  logoYuvarlak: true,                       // yuvarlak amblem mi (kare/yatay logolarda false)
  logoOran: 1,                              // genişlik/yükseklik (yatay logo için ör. 3.2)
  slogan: 'Mali müşavirler için <b>dijital ofis</b>',
  cta: 'Ücretsiz demo iste',                // kapanış düğmesi (sitedeki ana çağrıyla aynı olsun)
  adres: 'fastmusavir.com',
  dil: 'tr',
  koyu: false,                              // site koyu temalıysa true (renkleri de koyuya göre seç)
  kose: 24,                                 // kart köşe yarıçapı (sitedeki kart/düğme yarıçapına yakın)
  font: { aile: 'Inter', google: 'Inter:wght@400;500;600;700;800;900', yedek: 'system-ui, sans-serif' },
  // font: { aile: 'Marka Sans', yerel: [{ agirlik: 400, dosya: 'marka/font-400.woff2' }, { agirlik: 800, dosya: 'marka/font-800.woff2' }] },
  renk: {
    zemin: '#F7F9FC',     // sayfa arka planı
    yuzey: '#FFFFFF',     // kart / panel
    murekkep: '#071437',  // başlık ve ana yazı
    ikincil: '#4B5675',   // gövde yazısı
    soluk: '#99A1B7',     // etiket, yardımcı yazı
    cizgi: '#EEF1F5',     // ayraç, kenar
    ana: '#1B84FF',       // birincil düğme rengi (CTA)
    ana2: '#1366D6',      // birincil düğmenin koyu ucu (degrade)
    vurgu1: '#0E8C9C',    // başlık vurgu degradesinin başı
    vurgu2: '#1677F2',    // başlık vurgu degradesinin sonu
    basari: '#0E9F87', hata: '#E02A5A', dikkat: '#B7791F', bilgi: '#1B6FE0', mor: '#7239EA'
    // isteğe bağlı: altyaziZemin, altyaziYazi, altyaziVurgu, telefon, golge, ctaYazi
  },
  // arka plan tonları [koyu uç, açık uç, [3 aurora rengi]]: 0 marka, 1 sakin/gece, 2 sıcak/sabah, 3 sorun/uyarı
  tonlar: [
    ['#F2F6FC', '#FFFFFF', ['rgba(110,200,215,.55)', 'rgba(100,160,255,.45)', 'rgba(150,230,215,.42)']],
    ['#ECEEFB', '#F8F8FF', ['rgba(150,140,240,.36)', 'rgba(120,150,240,.3)', 'rgba(190,180,255,.3)']],
    ['#FFF6EE', '#FFFFFF', ['rgba(255,190,130,.42)', 'rgba(255,214,150,.36)', 'rgba(140,215,225,.3)']],
    ['#FFF3F6', '#FFFFFF', ['rgba(255,150,175,.36)', 'rgba(255,190,200,.3)', 'rgba(180,200,255,.26)']]
  ],
  // seslendirme okunuşu → ekran/altyazı yazımı (TTS metninde okunuş, altyazıda marka yazımı)
  yazim: { 'Fest': 'Fast', 'Vatsap': 'WhatsApp', 'Ayos': 'iOS' },
  birlesik: [['Se', 'Ge', 'Ka', 'SGK']],
  reklamSure: 15
};
