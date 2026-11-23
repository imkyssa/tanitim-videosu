---
name: tanitim-videosu
description: Bir web sitesinin ya da yazılım ürününün temasına (renk, yazı tipi, logo, açık/koyu zemin) birebir uyan animasyonlu tanıtım videoları üretir — 15 sn reklam serisi (Google Ads, Instagram, TikTok için 9:16, 1:1, 16:9), 1 dakikalık tanıtım filmi ve numaralı teslim paketi. Siteyi Chrome eklentisiyle analiz eder, temayı ve ürün iddialarını siteden çıkarır, ElevenLabs ile Türkçe seslendirme ve altyazı ekler, HTML/CSS animasyonunu kare kare MP4'e çevirir. Kullanıcı bir site/ürün/uygulama için reklam, tanıtım videosu, promo, demo videosu, sosyal medya videosu, "Reels/TikTok videosu", "1 dakikalık tanıtım" ya da "bu sitenin temasında video" istediğinde, bir siteyi videoya dönüştürmekten söz ettiğinde ya da mevcut reklam serisine yeni bir reklam eklemek istediğinde mutlaka bu skill'i kullan.
---

# Tanıtım videosu

Sitenin kendi görsel diliyle konuşan, iddiaları doğrulanmış, kısa ve akıcı tanıtım videoları. Görüntü HTML/CSS'te belirli (deterministik) bir animasyon olarak çizilir, Chrome ile kare kare yakalanır, ffmpeg ile kodlanır; ses ElevenLabs'ten gelir, müzik ve efektler CC0'dır.

Bu skill bir iş akışıdır: her aşamada kullanıcının onayı alınır, çünkü iki şey geri alınamaz ya da para harcar — yanlış iddia içeren bir reklamın yayına çıkması ve seslendirme kredisi.

**Başlamadan önce** skill bir git deposuysa en güncel know-how için `git -C ~/.claude/skills/tanitim-videosu pull --ff-only` çalıştır (yerel değişiklik varsa çekme, kullanıcıya söyle). Sonra **`references/know-how.md`'yi oku**: önceki projelerde yaşanmış tuzaklar ve çözümleri orada (yanlış kelime zamanı, eklenti çıktı sınırı, logo kırpma, koyu temada sabit renk…). Yeni bir tuzak bulduğunda oraya ekle.

## Çalışma düzeni: ana oturum ve üretim ajanı
Kullanıcı video istediğinde üretimi `tanitim-uretici` alt ajanına yaptır (Agent aracı, `subagent_type: "tanitim-uretici"`; tanımın kaynağı `ajan/tanitim-uretici.md`, `scripts/kurulum.mjs` onu `~/.claude/agents/` altına kopyalar). Neden: site analizi, sahne kodu, önizleme kareleri ve render logları on binlerce token tutar; bunlar ajanın bağlamında kalır, ana oturum yalnız kısa raporları ve kullanıcıyla konuşmayı taşır.

- **Ana oturumda kalanlar**: kapsam soruları, tema/metin/ses/okunuş/logo indirme onayları, kredi onayı, temas tablolarını (Read ile tek görsel) ve son videoyu kullanıcıya göstermek (SendUserFile), teslimden sonra kısa özet.
- **Ajana verilenler**: aşama aşama iş — `analiz` → `senaryo` → `ses` → `sahne` → `video` (ayrıntı ajan tanımında). Her görev mesajı proje klasörünü, aşamayı ve **o ana kadar kullanıcının onayladığı kararları** açıkça içersin; ajan kullanıcıya soru soramaz.
- **Aynı proje = aynı ajan**: ilk aşamayı Agent ile başlat, sonraki aşamaları `SendMessage` ile aynı ajana gönder (proje bağlamı onda kalır). Yeni proje = yeni ajan.
- Ajan raporu bir iddiadır: temas tablosuna ve çıktı ölçümlerine bakmadan "hazır" deme.
- `tanitim-uretici` bulunamazsa (ajan tanımları oturum başında yüklenir; yeni kurulumda ya da başka makinede olabilir): `subagent_type: "general-purpose"` kullan ve görev mesajının başına "Önce `~/.claude/agents/tanitim-uretici.md`'yi oku, oradaki rol ve sınırlarla çalış." yaz.
- Ajan aracı kullanılamıyorsa (ör. ajanın içindeysen) akışı doğrudan uygula.

## Gerekenler
- Node 18+, kurulu Google Chrome, ffmpeg (PATH'te ya da `ayar.json → "ffmpeg"`). NVIDIA varsa `ayar.json → "kodek": "nvenc"` daha hızlı.
- Chrome eklentisi (site analizi) — `anthropic-skills:chrome-browser` skill'ini yükleyip kurallarına uy.
- ElevenLabs bağlayıcısı (seslendirme ve kelime zamanları).

## Akış

### 1. Kapsam
Kullanıcıyla netleştir (AskUserQuestion uygun): hangi site/ürün, hangi videolar (15 sn reklam serisi, 1 dk film, ikisi), hangi formatlar, hangi konular/modüller, çağrı (CTA) ve adres. Sitenin kullanıcıya ya da onun müşterisine ait olduğunu teyit et; başka bir markayı taklit eden video yapılmaz.

### 2. Proje
`node <skill>/scripts/kur.mjs <proje-klasörü>` — motoru, sahne kütüphanesini, simgeleri, CC0 müzik/efektleri, şablon `tema.js`, `icerik.js`, `ayar.json` ve betikleri (`betik/`) kopyalar, playwright-core kurar. Sonraki tüm komutlar proje klasöründen çalışır.

### 3. Site analizi → tema ve iddialar
`references/tema-analizi.md`'yi oku ve uygula: Chrome'da 3–5 sayfa gez, ekran görüntüsü al, `scripts/tema-cikar.js`'i `javascript_tool` ile çalıştır, metni oku. Çıktılar:
- `tema.js` (renkler, yazı tipi, köşe, açık/koyu, logo, slogan, CTA, okunuş→yazım tablosu),
- `urun.md` (her özellik iddiası ve kaynak adresi),
- `marka/` (logo — indirmeden önce onay al ya da kullanıcıdan iste; gerekirse `node betik/ekran-al.mjs <adres> marka/ekran-1.png`).

Ardından tema doğrulaması: `kelime-tahmin.mjs` ile taslak zamanlar → `ornek/icerik.js`'teki R1'i ya da ilk senaryonun bir sahnesini önizle → sitenin ekran görüntüsüyle yan yana göster. Kullanıcı "uyuyor" demeden devam etme.

### 4. Senaryo
`SENARYO.md`'ye her video için tablo yaz: **Başlık** (ekranda, `*vurgu*`) · **Görüntü** (hangi sahne, ne olur) · **Seslendirme** (TTS okunuşuyla).
- 15 sn reklam: sorun → çözüm → sonuç → kapanış ("… için hemen başvurun!" gibi çağrı). 25–30 kelime, 3 sahne.
- 1 dk film: 9 sahne, ~105–112 kelime (sahne arası boşluk kısa, ≤0,5 sn); açılışta sorun, ortada 5–6 özellik, sonda marka sahnesi + çağrı.
- Bir video bir konu. Fayda anlat, teknik ayrıntıya girme. Her iddia `urun.md`'de olsun.
Metinleri kullanıcıya göster ve onay al.

### 5. Seslendirme
`references/seslendirme.md`: ses seçimi (kullanıcı seçer), kredi uyarısı, TTS kuralları (kesme işareti yok, okunuşla yaz), üretim → indirme → Scribe → `node betik/kelimeler.mjs <KOD>` (film: `--sahne "…"`). Reklam ham sesi 16,5 sn'yi geçerse kısaltmayı sor.

### 6. Sahneler
`references/sahne-kutuphanesi.md`'yi oku. `icerik.js`'e `window.KAYITLAR` (kurgusal örnek kayıtlar) ve her video için `FILMLER.<KOD> = M => SH.Film(...)` yaz. Kod adı `R…` reklam (≤15 sn), diğerleri film. Hazır sahneler: kaos, logo, tablo, profil, aktar, zamanli, kanban, sayaclar, gonder, mesaj, baglan, cep, durum, belge, merkez, ekran. Renkleri hep tema anahtarlarıyla ver.

### 7. Önizleme
`node betik/render.mjs R1 9x16 onizleme 1.5,6,11` → `onizleme/`; `node betik/temas.mjs onizleme/temas.png 4 300 <kareler…>` ile tek görsel yap, Read ile bak. Her sahneden bir kare, en az iki oran (9:16 ve 16:9). Hataları düzelt (üst üste binen başlıklar çoğu zaman aynı kelimenin ikinci geçişini `T('kelime', 1)` ile almamaktan olur), sonra kullanıcıya göster.

### 8. Video
Her video × oran: `node betik/render.mjs <KOD> <oran> video 6` → `node betik/ses.mjs <KOD> <oran>` (sonunda `son-isle.mjs` kendiliğinden çalışır: ses yüksekliği -14 LUFS'e oturur, bt709 renk etiketleri yazılır). Uzun işlerde arka planda çalıştır. Sonra `references/kalite.md` kontrol listesi (süre, LUFS, renk, iddialar).

### 9. Teslim
`ayar.json → teslim.liste`'ye videoları yapılış sırasıyla ekle (yeni olan sona), `node betik/teslim.mjs`. Numaralı klasörler, `ICERIK.md` (proje kökünde `ICERIK-EK.md` varsa sonuna eklenir: seslendirme metni, sahneler, kurgusal veri notu), `KAYNAKLAR.md`, isteğe bağlı masaüstü kopyası + zip. Kullanıcıya bir dikey örneği `SendUserFile` ile gönder; seslendirmeleri kulakla dinlemesini hatırlat.

### 10. Know-how'ı güncelle (her projenin son adımı)
Bu projede ne ters gitti, kullanıcı neyi düzeltti, hangi çözüm işe yaradı? Her birini `references/know-how.md`'de ilgili başlığa **belirti → neden → çözüm** olarak, tarih ve proje adıyla ekle. Zaten varsa yeni madde açma, mevcut maddeye örnek ekle. Bir tuzak tekrarlanıyorsa betiğe/motora kalıcı çözüm koymayı düşün ve maddeye "çözüldü: …" yaz. Kullanıcıya teslim özetinde "know-how'a eklenenler" satırını göster. Yeni bir şey yoksa bunu da söyle. Skill bir git deposuysa ortak know-how'a göndermeyi öner; kullanıcı onaylarsa: `git pull --rebase`, `git add references/know-how.md`, `git commit -m "know-how: …"`, `git push`. Onaysız commit/push yapma.

## Kurallar ve nedenleri
- **İddia = kanıt**: reklamda söylenen her şey sitede ya da çalışan üründe olmalı; yanlış vaat markaya zarar verir ve kullanıcı yakalar.
- **Gerçek veri yok**: örnek kayıtlar kurgusal; ekran görüntülerinde kişisel veri varsa kullanma ya da maskele.
- **Onay noktaları**: kapsam → tema → metin → (kredi) ses → önizleme → teslim. Kullanıcı istemeden commit/push yapma, yayınlama.
- **Sitenin dili**: açık/koyu, köşe, yazı tipi, ton sitenin; "daha havalı" bir şey yapma isteğine kapılma.
- **Belirli çizim**: sahneler t'nin saf fonksiyonu; render paralel ve sırasızdır, rastgelelik ve gerçek zamanlı animasyon kullanma.

## Dosyalar
- `motor/` — index.html, motor.js (tema, yerleşim, başlık, altyazı, kapanış), sahneler.js (kütüphane + Film), ikonlar.js
- `scripts/` — kur, render, ses, son-isle, kelimeler, kelime-tahmin, temas, teslim, ekran-al, svg-kirp, ikon-uret, tema-cikar.js (tarayıcıda çalışır)
- `references/` — **know-how** (tuzaklar ve çözümler, her projede okunur ve büyür), tema-analizi, sahne-kutuphanesi, seslendirme, kalite
- `ajan/tanitim-uretici.md` — üretim ajanı tanımı (`scripts/kurulum.mjs` ile `~/.claude/agents/`a kopyalanır; ajanı değiştirirsen burada değiştir ve kurulumu yeniden çalıştır)
- `README.md` — insanlar için kurulum ve paylaşım
- `ornek/` — tema.js (açık tema örneği, alan açıklamalı), icerik.js (çalışan R1), ayar.json
- `assets/` — CC0 müzik ve efektler, KAYNAKLAR.md şablonu
- Koyu tema örneği (Deskivy, sohbet sahnesi yerel sahne olarak): ilk sınamada geçici klasördeydi; teslim çıktısı Masaüstü/deskivy-tanitim
- Tam örnek proje (Fast Müşavir, 21 reklam + 3 film; yalnız skill'in ilk yazıldığı makinede): `FastMukellef/Tools/ReklamVideo/seri` (eski motor; sahne fikirleri için bak, kodu bu skill'in motoruyla yaz)
