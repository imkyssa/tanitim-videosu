# Know-how: tuzaklar, belirtiler, çözümler

Gerçek projelerde (Fast Müşavir: 21 reklam + 3 film; Deskivy) yaşananlar. Her madde: **belirti → neden → çözüm**. Yeni bir şey öğrendiğinde ilgili başlığa ekle; tarih ve proje adı yaz.

İçindekiler: Kullanıcı ve içerik · Site analizi (Chrome) · Tema · Seslendirme ve kredi · Kelime zamanları · Sahneler ve yerleşim · Render ve ses miksajı · Teslim · Ortam (Windows, kabuk) · Ajan düzeni

## Kullanıcı ve içerik
- **Menü ≠ özellik**: menüde görünen ama içi boş iki şablon sayfadaki özellik reklama girdi, kullanıcı yakaladı, sesler yeniden üretildi. → Her iddiayı çalışan ekrandan/sayfadan doğrula; `urun.md`'de kaynağı yaz. (Fast, 19.11)
- **Bir video, bir konu**: iki ilgisiz modül (e-Arşiv + e-Defter, borç + yapılandırma) tek 15 sn reklama sığdırılınca "alakasız iki konu birbirine geçmiş" denildi; dörde bölündü. → Konular gerçekten tek hikâye değilse ayrı reklam.
- **Koyu/açık kararı sitenindir**: açık temalı ürüne koyu video yapıldı, "futuristic bir SaaS değil bu" diye reddedildi.
- **Nefes payı**: kapanışta öğeler "dip dibe" bulundu. → Geniş aralık; motorun kapanışı buna göre ayarlı, kendi kapanışını yazarsan koru.
- **Metafor gerçeğe benzesin**: büyüteç "ikon geziyor gibi" bulundu. → Gerçek nesne gibi davranan çizim (çerçeve, sap, altındakini büyüten cam).
- **Teknik ayrıntı az**: "AES-256, anahtar ayrı saklanır" yerine "Şifreleriniz şifreli saklanır". Reklam fayda anlatır.
- **Sitedeki animasyonu kopyalama**: "olduğu gibi kullanmayalım" — aynı fikri sadeleştirip iyileştir.
- **Logo teyidi**: sitede logo sanılan başka bir görsel vardı ("logo bu değil"). → Hangi dosyanın logo olduğunu sor.
- **Okunuşu sor**: marka adları (Fast → "Fest", Deskivy → "Deskivi", iOS → "Ayos") kullanıcıya sorulmadan üretilirse kredi boşa gider.
- **Gerçek veri yok**: test kaydında gerçek kullanıcı adı ekrana sızdı (yönlendirme sahte uca uğramadı). → Kurgusal kayıtlar; ekran görüntülerinde kişisel veri varsa kullanma.

## Site analizi (Chrome eklentisi)
- **Eklenti bağlı değil**: "Claude in Chrome is not connected". → Kullanıcıya Chrome'u açıp eklentide oturum açmasını söyle (bağlantı: chromewebstore … fcoeoabgfenejglbffodgkkbkcdhcgfn); başka tarayıcıya sormadan geçme.
- **Çıktı engellendi** (`[BLOCKED: Cookie/query string data]`): sonuçta `?…` sorgu dizesi olan adres vardı. → `tema-cikar.js` adresleri yola kırpar; kendi sorgularında da `new URL(x).pathname` kullan.
- **Çıktı kesildi** (`[TRUNCATED]`): ~1,5 KB üstü. → Betik iki parça döner (`window.__tema.icerik` ikinci parça); ek sorguları dilimle.
- **Düğme rengi yok sanıldı**: düğmeler `background-color` değil `background-image: linear-gradient(...)` kullanıyordu. → Betik degradenin iki ucunu `bg/bg2` verir (Deskivy: #F59E0B → #D97706).
- **Başlık vurgusu degrade**: h1 içindeki span `background-clip:text` degradesi (Deskivy: #E2E8F0 → #FDE68A → #FBBF24). → `h1Vurgu`'dan `vurgu1/vurgu2`.
- **Google Fonts listesi yanıltıcı**: link'te başka aile (DM Sans) vardı, başlık Bricolage Grotesque'ti (next/font ile gömülü). → Yazı tipini `getComputedStyle(h1).fontFamily`'den al.
- **Çerez bandı ekran görüntüsünde**: `ekran-al.mjs` artık gizliyor; `--cerez` ile kapat.
- **Logo indirme**: dosya indirmedir; adresi göster, onay al.

## Tema
- **Koyu temada sabit açık renk**: örnek içerikte `#FFF4B8` sarı not kâğıdı koyu temada okunmaz oldu. → Renkleri anahtarla ver (`zemin: 'dikkat'`), motor temaya göre açar/koyulaştırır.
- **SVG logo kare tuvalde küçük**: 1500×1500 tuvalin ortasında yatay logo. → `svg-kirp.mjs` ile kırp, `logoOran` yaz (Deskivy 3,81), `logoYuvarlak: false`.
- **Ad iki kez görünüyor**: logo zaten adı içeriyorsa kapanışta yazı da çıkar. → `logoMetin: ''`, `logoKoseMetin: false`.
- **Geniş logo sahneye sığmıyor**: `logo`/`merkez` sahneleri artık genişliği sınırlar (`logoGen`); kendi sahnende `SH.logoImg(M, boy, stil, enFazla)` kullan.
- **Küçük PNG logo** (128 px) kapanışta bulanık. → Büyük sürüm ya da SVG iste.

## Seslendirme ve kredi
- **Metin onayı → ses**: onaysız üretme. Uzun gelen sesi sessizce yeniden üretme; kısaltmayı sor, eskiyi `ses/eski-*` altına sakla.
- **`generations_count` varsayılanı 2**: kredi iki katı. → Hep 1.
- **Kesme işareti TTS'te yok**: "Gibden", "Vatsapta", "İnstagramda"; altyazı `tema.yazim` ile düzelir.
- **Harf harf kısaltma**: "Se Ge Ka" → `tema.birlesik` ile altyazıda "SGK".
- **Flow kimliği**: aynı flow_id'yi kullan; "You do not have access" gelirse flow_id vermeden üret, yenisini kullan.
- **İndirme bağlantıları saatlerce geçerli**: üretimden hemen sonra `curl` ile indir.
- **Süre**: 15 sn reklam ≈ 23–30 kelime. 33 kelimelik ilk metin 18 sn geldi, kısaltıldı. Ham ses ≤ ~15,7 sn olmalı (motor ≤%10 hızlandırır).
- **Film kısa geldi**: 95 kelime ≈ 48 sn. → `kelimeler.mjs --sahne` ile sahne başlarına ≤1,6 sn boşluk; 59 sn'ye taşındı.
- **Kulak kontrolü**: Scribe dökümü telaffuz hatasını yakalamaz; kullanıcıya dinlemesini hatırlat.

## Kelime zamanları
- **Aynı kelimenin ikinci geçişi**: `T('Vergi')` ilk "vergi"yi (vergi borçları, 20. sn) döndürdü, Vergi Link sahnesi erken açıldı, başlıklar üst üste bindi. → `T('Vergi', 1)`. Belirti: önizlemede iki başlık üst üste ya da bir sahne çok uzun.
- **Sahne kelimesi okunuş biçiminde**: `--sahne` ham Scribe kelimeleriyle eşleşir ("Fest", "Se"), ekran yazımıyla değil.
- **Taslak tahmin**: `kelime-tahmin.mjs` ~0,058 sn/harf; Deskivy'de tahmin 12,3 sn, gerçek 12,9 sn.
- **"kelime yok" hatası**: metin değişti ama kod eski kelimeyi arıyor. → Kodu yeni metne göre güncelle.

## Sahneler ve yerleşim
- **9:16'da üç satırlık başlık görsele değiyor**. → Başlığı iki satıra indir ("Tek asistan, kendi dokümanlarınızla." → "Kendi dokümanlarınızla.").
- **Kamera yakınlaşması içeriği taşırdı**: sol üstten yakınlaşma sağ kenarı dışarı itti. → Motor merkezden yakınlaşır (`tv.kamera`).
- **Bitmiş karta yanlış çip**: "Tamamlandı"ya taşınan kartta "Gecikti" çipi kalmıştı. → Taşınan öğenin durumunu da değiştir.
- **Modal ile birlikte kaybolan sonuç**: makbuz pencereyle beraber kayboldu. → Sonuç ayrı katmanda kalsın.
- **Simge yok**: sayfada `ikon yok: …` → `npm i @tabler/icons && node betik/ikon-uret.mjs ad`.
- **Kütüphane yetmezse yerel sahne**: Deskivy'nin sohbet kartı `icerik.js`'te yerel sahne olarak yazıldı; renkleri `M.Renk`'ten al.
- **İmleç koordinatları tuval koordinatıdır** (1000×760), panel içi değil; düğmenin tuvaldeki merkezini hesapla.
- **Önizlemeyi iki oranda al**: 16:9'da görsel sağda, başlık solda; 9:16'da başlık üstte. Bir oranda temiz olan diğerinde çakışabilir.

## Render ve ses miksajı
- **Hız**: `page.screenshot` kare başı ~530 ms; CDP `Page.captureScreenshot` ~120 ms + paralel tarayıcılar ≈ 10× hız. NVIDIA'da `--use-angle=d3d11 --force_high_performance_gpu`.
- **NVENC hatası**: eski sürücüde ("minimum required … 610") çalışmadı. → `ayar.json "kodek": "x264"` (varsayılan); sürücü güncelse `nvenc` (~%20 hızlı, aynı kalite).
- **Müzik filmden kısa**: parça 58,7 sn, film 59,3 sn. → `Film` müziği ≤%10 yavaşlatır (`MUZIK.tempo`); döngü/kesik yok.
- **Tepe seviyesi**: loudnorm sonrası ebur128 tepe -1,0…-1,4 dB; hedef ≤ -1 dB (TP -1,5 ayarlı).
- **Renk**: `tv/bt709` etiketli olmalı (render.mjs ayarlı); farklıysa sosyal medyada soluk görünür.

## Teslim
- **Numaralar kaymasın**: yeni videoyu listenin sonuna ekle; bölünen videonun ilk parçası eski numarasında kalır, yenisi sona.
- **Teslim klasörünü silip yeniden kurar**: `teslim.mjs` hedefteki `<ad>` klasörünü ve zip'i yeniden oluşturur; içine elle dosya koyma.

## Ortam (Windows, kabuk)
- **Git Bash'te tırnak**: içinde `'` geçen metin (WhatsApp'ta, Deskivy'nin) tek tırnaklı `sed`/`node -e`'yi bozdu (`unexpected EOF`, `syntax error near (`). → Dosyaları Write aracıyla yaz ya da betiği dosyaya koyup çalıştır.
- **Heredoc içinde `\\` kaçışları bozulur**; JS'de gerekiyorsa `String.fromCharCode(92)`.
- **Kabuk dizini sıfırlanır**: her komutta `cd <proje> &&` ile başla.
- **npm**: Windows'ta `spawnSync('npm install …', { shell: true })` tek dize (kur.mjs böyle).
- **ffmpeg yolu**: PATH'te yoksa `ortak.mjs` winget klasörünü tarar; olmazsa `ayar.json "ffmpeg"`.

## Ajan düzeni
- Üretim `tanitim-uretici` ajanında; ana oturum yalnız onay ve gösterim. Ajan soru soramaz: görev mesajına onaylı kararları yaz.
- Aynı projede `SendMessage` ile aynı ajana devam et; yeni ajan bağlamı sıfırdan kurar ve aynı hataları tekrarlayabilir.
- Ajanın "hazır" raporunu temas tablosuna ve ölçümlere bakmadan kullanıcıya iletme.
