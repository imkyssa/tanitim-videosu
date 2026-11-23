# Sahne kütüphanesi (motor/sahneler.js)

İçindekiler: Temel kavramlar · Film() · Sahneler · Yardımcılar · Zamanlama tuzakları · Yeni sahne yazmak

## Temel kavramlar
- **Tuval**: her sahne 1000×760 tasarım alanında çizilir; motor bunu oranın görsel kutusuna sığdırır (9:16 altta, 16:9 sağda). Koordinatlar hep bu alana göre.
- **Zaman**: `T('kelime', n)` seslendirmedeki kelimenin başladığı saniye (n: aynı kelimenin kaçıncı tekrarı, 0'dan). `Tson` bitişi. Noktalama yok sayılır, büyük/küçük harf duyarsız. Kelime yoksa sayfa "kelime yok" hatası verir.
- **Kayıt**: örnek müşteri/ürün satırı. `window.KAYITLAR` içindeki sıra numarası ya da `[ad, kısaltma, renk]`. Kurgusal olmalı.
- **Renk**: `'ana' | 'ana2' | 'vurgu1' | 'vurgu2' | 'basari' | 'hata' | 'dikkat' | 'bilgi' | 'mor'` ya da `#hex`. Rozet zeminleri temadan otomatik açılır (koyu temada koyu ton). Sahne koduna sabit açık renk yazma; koyu temada bozulur.
- **Kod adı**: `R…` reklam (≤15 sn hedefi, ses gerekirse ≤%10 hızlanır), diğerleri film (hızlanmaz).

## Film(M, tCta, basliklar, kur, o)
```js
FILMLER.R3 = function (M) {
  const { T } = M, { Film, H, not } = SH;
  const tF = T('Marka'), t2 = T('Toplu'), tCta = T('Ücretsiz') - .12;
  return Film(M, tCta, [
    ['Sorun cümlesi | !kırmızı vurgu.!', .1, tF - .04],   // [metin, giriş, çıkış]; | satır sonu, *…* marka vurgusu
    ['Çözüm | *tek ekranda.*', tF, t2 - .04],
    ['Sonuç | *anında.*', t2, tCta]
  ], tv => [
    [S.kaos(M, tv, {...}), 0, tF, { s0: .95 }],            // [sahne, başlangıç, bitiş, kapGor seçenekleri]
    [S.tablo(M, tv, {...}), tF, t2],
    [S.belge(M, tv, {...}), t2, tCta]
  ], { ton: [[0, 3], [tF - .3, 0]] });                     // arka plan tonu: [an, ton]; 3 sorun → 0 marka
};
```
- Kapanış (logo, ad, slogan, CTA, adres) ve geçiş sesleri otomatik. Altyazı tCta'da kaybolur.
- `o.muzik`: `{ dosya, kazanc, sure }` (muzik/<dosya>.mp3). Film parçadan uzunsa müzik ≤%10 yavaşlatılır.
- `o.kapanis.cta`: bu filme özel çağrı metni.

## Sahneler (S.ad(M, tv, o))
| Sahne | Ne gösterir | Önemli seçenekler |
|---|---|---|
| `kaos` | Saçılmış kartlar/pencereler (sorun) | `parcalar [{x,y,w,h,r,zemin,pad,html}]`, `sars` (sarsılma anı), `ara`. İçerik: `SH.not(M, renk, ik, başlık, metin)`, `SH.pencere(M, başlık, ik, renk, gövde)` (pad: 0 ile) |
| `logo` | Marka gelir, çipler merkeze toplanır (çözüm anı) | `t0`, `ucan [[ik, renk, ad]]` |
| `tablo` | Liste + toplu sorgu, hücreler dolar, satır vurgusu | `kolonlar [[ad, x, w, hiza]]` (x: 40–930), `satirlar [{k, h:[html], v:'r'|'a'}]`, `btn,tBtn,tBit` satır satır ya da `kolT` sütun sütun, `tVurgu`, `bildirim`, `sh` |
| `profil` | Bir kaydın kartı, 3 bölüm | `bolumler [{ik, renk, baslik, tur:'alanlar'|'izgara'|'dosyalar', ogeler}]`, `tB [3 an]`, `tVurgu` |
| `aktar` | Dosyalar/kaynaklar listeye akar | `kaynaklar [{ik, renk, ad, alt, t}]`, `liste`, `kayitlar`, `tAkt`, `sayac(n)` |
| `zamanli` | Gece → sabah, telefonda rapor | `isler [metin]`, `rapor {baslik, metin}`, `tSabah`, `tRapor` (ton 1→2 ile kullan) |
| `kanban` | Pano, kart son sütuna taşınır | `kolonlar [[ad, renk]]`, `isler [[kolon, sıra, ad, alt, [kısaltma, renk]]]`, `tTasi`, `tekrar`, `alarm` |
| `sayaclar` | 3 sayaç + durum listesi, bir satır güncellenir | `sayaclar [[ad, değer, renk, ik]]`, `birim`, `satirlar`, `guncelle {satir, t, deger, durum, renk, fark}`, `fis` |
| `gonder` | Satırlar seçilir, kanal düğmeleri, simgeler uçar | `satirlar [[k, belge, tutar, atla]]` (atla verilirse — ör. `'Eksik'` — satır seçilmez, gönderilmez, hata çipiyle görünür), `durumCip` (tutar sütunu başarı çipi, ör. `'Hazır'`), `tEksik` (atlanan satırın vurgulandığı an), `kanallar [[ik, ad, renk]]` (1–2), `tSec`, `tKanal [an]` |
| `mesaj` | Telefonda istek, belgeler iletilir | `kisi`, `metin`, `belgeler`, `dugme`, `tMesaj`, `tGonder` |
| `baglan` | Hizmet kartları → bağlandı; isteğe bağlı kilit | `kartlar [[ad, ik, renk]]` (4), `tTik`, `metinler`, `kilit {t, etiket}` |
| `cep` | Telefon + uygulama listesi + bildirim (+ mağaza) | `liste [[ik, ad, değer]]`, `bildirim`, `tBildirim`, `magaza {tIos, tAndroid}` |
| `durum` | Kayıt listesi, durum rozetleri | `durumlar {anahtar: [ad, renk, ik]}`, `atama`, `tD {anahtar: an}`, `sorun` |
| `belge` | Belge kartı + gönderim kanalları | `baslik`, `k`, `kanallar`, `tGonder` |
| `merkez` | Logo çevresinde 4 modül (kapanış öncesi) | `moduller [[ik, renk, ad]]` |
| `ekran` | Sitenin gerçek ekran görüntüsü, kaydırma, vurgu kutusu | `gorsel`, `gorselYukseklik`, `kaydir [a, b]`, `vurgu {t, x, y, w, h, etiket}` |

Simgeler Tabler adlarıdır (tabler.io/icons); temel set `ikonlar.js`'te. Eksik simge sayfada `ikon yok` hatası verir → `npm i @tabler/icons && node betik/ikon-uret.mjs ad1 ad2`.

## Yardımcılar (window.SH)
`H.tik(M)`, `H.yazi(M, metin, renk)`, `H.soluk(M, metin)`, `H.cip(M, renk, ik, metin, fs)`, `cip`, `ikonKutu`, `avatar`, `kutu`, `katman`, `panel`, `satir`, `hucre`, `dugme`, `telefon`, `Imlec`, `yay`, `logoImg`, `kayit`, `rk`.

## Zamanlama tuzakları (gerçek hatalardan)
- **Aynı kelime iki kez geçiyorsa** `T('vergi')` ilki döner. Sahne başı ikinci geçişse `T('vergi', 1)` yaz; yoksa sahne yanlış anda açılır, başlıklar üst üste biner.
- Sahne sınırları başlık sınırlarıyla aynı kelimelerden gelsin; aralarında boşluk bırakma.
- Bir eylemi söylendiği kelimeye bağla (düğmeye basma, rozet, satır vurgusu). 1 sn'den fazla kayma göze batar.
- 15 sn reklamda 3 sahne yeter; 60 sn filmde 8–9 sahne (her biri ~5–7 sn).
- Önizlemeyi en az iki oranda al (9:16 ve 16:9): başlık uzunluğu ve kart yerleşimi oranla değişir.

## Yeni sahne yazmak
Kütüphane yetmezse `icerik.js` içinde yerel bir sahne yaz: `{ k: SH.katman(M, tv), ciz(t) {…} }`. Kurallar: renkleri `M.Renk`'ten al, `M.css`, `M.E.*` yumuşamaları, her şeyi t'nin saf fonksiyonu olarak çiz (aynı t → aynı kare; render paralel ve sırasız), SFX'i `M.SFX.push([ad, an, kazanç])` ile ekle.
