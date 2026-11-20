# Site analizi (Chrome eklentisi) → tema.js + ürün notları

Amaç: video, tanıtılan sitenin kendi ürünüymüş gibi görünsün — aynı renkler, yazı tipi, köşe yuvarlaklığı, açık/koyu zemin, logo ve çağrı metni. Ayrıca videoda söylenecek her iddia sitenin kendisinden (ya da kullanıcının verdiği koddan) gelsin.

## Başlamadan
- `anthropic-skills:chrome-browser` skill'ini yükle ve kurallarına uy (araçları tek ToolSearch'te yükle, yeni sekmede çalış, kullanıcının sekmelerini kapatma).
- Sitenin kullanıcıya ya da onun müşterisine ait olduğunu teyit et. Başka bir markanın görünümünü taklit eden reklam yapılmaz.
- Giriş gerektiren paneller: kullanıcı kendi tarayıcısında açık oturumla gösterebilir; şifre yazma. Panel ekranının görüntüsü lazımsa kullanıcıdan `marka/` altına kaydetmesini iste.

## Adımlar
1. **Sayfaları seç**: ana sayfa, özellikler/ürün sayfası, fiyatlandırma (çağrı metni için), varsa panel. 3–5 sayfa yeter.
2. **Her sayfada**:
   - `navigate` → `computer` ile ekran görüntüsü al (gözle doğrulama için; açık mı koyu mu, vurgu nerede, düğme şekli).
   - `javascript_tool` ile `scripts/tema-cikar.js` dosyasının içeriğini olduğu gibi çalıştır → kısa JSON (zemin, kart rengi, yazı tipi, düğme ve CTA renkleri, başlık vurgusu, köşe). Ardından `JSON.stringify(window.__tema.icerik)` → başlıklar, menü, logo, açıklama, CSS değişkenleri.
     - Eklenti ~1,5 KB'tan uzun sonucu keser ve sorgu dizesi (`?…`) içeren adresleri engeller; betik bu yüzden iki parça döner ve adresleri kırpar. Kendi ek sorgularını da kısa tut (dilimle, adreslerin yolunu al).
     - Düğmeler çoğu sitede düz renk değil degradedir; betik degradenin iki ucunu `bg`/`bg2` olarak verir → `ana`/`ana2`.
   - `get_page_text` ile metni oku → özellik iddialarını not al (aşağıda).
   - Site koyu/açık tema değiştiriyorsa varsayılan görünümü esas al; kullanıcıya hangisinin istendiğini sor.
3. **Eşle** (aşağıdaki tablo) ve `tema.js`'i yaz. Kararsız kaldığın değeri ekran görüntüsüne bakarak seç; JSON yalnız adaydır.
4. **Doğrula**: `node betik/ekran-al.mjs https://site marka/site-ana.png` (çerez bandını görüntüde gizler) ile sitenin görüntüsünü al; `kelime-tahmin.mjs` + `render.mjs … onizleme` ile 3–4 kare üret, sitenin ekran görüntüsüyle yan yana koy (`temas.mjs`), kullanıcıya göster: "Renkler ve yazı tipi siteye uyuyor mu?" Onaysız sese geçme.

## Eşleme
| tema.js | Kaynak (tema-cikar.js) | Not |
|---|---|---|
| `koyu` | `koyu` (zemin parlaklığı) + ekran görüntüsü | Koyu sitede bütün renkleri koyuya göre seç; açık sitede koyu video yapma. |
| `renk.zemin` | `zemin` | Sayfa arka planı. |
| `renk.yuzey` | `kartZemin[0]` | Kart/panel rengi; zeminle aynıysa koyu temada 4–6 % açık, açık temada beyaz. |
| `renk.murekkep` | `yazi.baslikRenk` | Başlık rengi. Zeminle kontrast ≥ 7:1 olsun. |
| `renk.ikincil` / `soluk` | `yazi.govdeRenk`, bir ton daha soluğu | Gövde ve etiket yazısı. |
| `renk.cizgi` | kart kenarı / ayraç | Zeminle yüzey arasında hafif bir ton. |
| `renk.ana`, `ana2` | `dugmeRenkleri[0]`, aynı rengin %15 koyusu | Birincil düğme = CTA rengi. |
| `renk.vurgu1/2` | `gradyanlar` varsa uçları; yoksa `vurguYaziRenkleri` | Başlıktaki vurgulu kelimenin degradesi. Tek renkli sitede ikisi de `ana` olabilir. |
| `renk.basari/hata/dikkat/bilgi/mor` | sitedeki durum rengi varsa o; yoksa varsayılanlar | Rozetler, satır vurguları. |
| `kose` | `kartKose` | Düğme 999 px olsa da kart yarıçapını al. |
| `font.aile` | `yazi.baslikAile` ilk aile | Google Fonts'ta varsa `font.google` (ör. `Plus+Jakarta+Sans:wght@400;500;600;700;800`). Ücretli/özel yazı tipi ise kullanıcıdan dosya iste (`font.yerel`) ya da en yakın serbest yazı tipini öner. |
| `cta` | `cta[0].metin` | Sitedeki ana çağrının aynısı ("Ücretsiz dene", "Demo iste"). |
| `adres` | alan adı | Kullanıcıya teyit ettir. |
| `slogan` | hero alt başlığı / meta açıklama | Kısalt; bir kelimeyi `<b>` ile vurgula. |
| `tonlar` | zemin + ana/vurgu renklerinden | 0 marka (ana+vurgu auroraları), 1 sakin (mavi-mor), 2 sıcak (turuncu), 3 sorun (hata rengi). Koyu temada tonları da koyu tut. |
| `logo` | `logo[0].src` | Aşağıya bak. |

## Logo
- Logo dosyasını indirmek dosya indirmedir: kullanıcıya adresi göster, onay al ya da dosyayı kendisinin `marka/` altına koymasını iste. Hangi dosyanın logo olduğunu mutlaka teyit ettir (sitedeki her yuvarlak görsel logo değildir).
- SVG logo ise `svg` alanındaki işaretlemeyi `marka/logo.svg` olarak kaydedip kullanabilirsin (onaydan sonra).
- SVG logolar çoğu zaman geniş boş kenarlı kare tuvaldedir: `node betik/svg-kirp.mjs marka/logo.svg` → `marka/logo-kirpik.svg` ve oranı yazdırır.
- Yatay logoda `logoYuvarlak: false`, `logoOran: genişlik/yükseklik`, `logoKoseMetin: false` ve `logoMetin: ''` (logo zaten adı içeriyorsa; yoksa ad iki kez görünür).
- Küçük (<256 px) logo kapanışta bulanık görünür; kullanıcıdan büyük sürüm iste.

## Ürün notları (urun.md)
Videoda söylenecek her özellik için kaynak tut: `- Toplu fatura sorgulama — https://site/ozellikler ("Tüm müşterilerin faturalarını tek tıkla…")`.
- Yalnız sitede açıkça yazan ya da kullanıcının gösterdiği çalışan ekrandaki özellikleri kullan. "Yakında", şablon ya da boş sayfadaki özellikler iddia değildir.
- Kullanıcı kod deposu verdiyse çalışan denetleyici/sayfadan doğrula; menüde görünen her başlık çalışan özellik değildir.
- Sayı ve ölçü (ör. "%40 daha hızlı") ancak sitede yazıyorsa.
