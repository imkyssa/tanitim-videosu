# Know-how: tuzaklar, belirtiler, çözümler

Gerçek projelerde (Fast Müşavir: 21 reklam + 3 film; Deskivy) yaşananlar. Her madde: **belirti → neden → çözüm**. Yeni bir şey öğrendiğinde ilgili başlığa ekle; tarih ve proje adı yaz.

İçindekiler: Kullanıcı ve içerik · Site analizi (Chrome) · Tema · Seslendirme ve kredi · Kelime zamanları · Sahneler ve yerleşim · Render ve ses miksajı · Teslim · Ortam (Windows, kabuk) · Ajan düzeni

## Kullanıcı ve içerik
- **Menü ≠ özellik**: menüde görünen ama içi boş iki şablon sayfadaki özellik reklama girdi, kullanıcı yakaladı, sesler yeniden üretildi. → Her iddiayı çalışan ekrandan/sayfadan doğrula; `urun.md`'de kaynağı yaz. (Fast, 19.11)
- **Bir video, bir konu**: iki ilgisiz modül (e-Arşiv + e-Defter, borç + yapılandırma) tek 15 sn reklama sığdırılınca "alakasız iki konu birbirine geçmiş" denildi; dörde bölündü. → Konular gerçekten tek hikâye değilse ayrı reklam.
- **Koyu/açık kararı sitenindir**: açık temalı ürüne koyu video yapıldı, "futuristic bir SaaS değil bu" diye reddedildi.
- **Nefes payı**: kapanışta öğeler "dip dibe" bulundu. → Geniş aralık; motorun kapanışı buna göre ayarlı, kendi kapanışını yazarsan koru.
- **Metafor gerçeğe benzesin**: büyüteç "ikon geziyor gibi" bulundu. → Gerçek nesne gibi davranan çizim (çerçeve, sap, altındakini büyüten cam).
- **Söz ile görüntü tutarlı olsun**: "Eksikler göndermeden önce işaretlenir" denirken listede dört kişinin hepsi "Hazır"dı, yalnız köşede "1 kişi eksik" kartı vardı; kullanıcı yakaladı. → Söylenen durum listede görünsün (eksik satır işaretsiz, hata rozetli, gönderilmez, söylendiği kelimede vurgulanır, açıklama kartı o satırın yanında). Proje kopyasında `gonder` sahnesine `satirlar[i][3]` (atla metni), `durumCip`, `tEksik` eklendi. (FastPolnet, 23.11)
- **Sorunu keskinleştir, ama kanıtsız ayrıntı verme**: kullanıcı "eksik bildirimlerin çok ağır cezaları var, vurgulansın" dedi; açılış "Eksik bildirim, ağır ceza." oldu, görselde "cezası" kelimesinde kırmızı "Geç bildirim · Ceza" kartı öne çıktı. Tutar ve kanun maddesi yazılmadı (ne sitede ne üründe kaynağı vardı). → Kullanıcıdan gelen sorun iddiasını `urun.md`'ye "kaynak: kullanıcı beyanı, tarih; tutar/madde yok" diye yaz; rakam ancak kaynağıyla. (FastPolnet, 23.11)
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
- **Zemin kart rengi çıktı**: tema-cikar.js zemini #ffffff verdi, sayfa #FCFCFC idi (ekranın ortasında beyaz kart vardı). → `getComputedStyle(document.body).backgroundColor` ile ayrıca bak; Metronic/Bootstrap uygulamalarında --bs-* değişkenleri (primary, success, danger, gray-*) doğrudan eşlenir. (FastPolnet, 23.11)
- **Yerel uygulama (eğitim/demo modu) kaynak olunca**: veriler ancak "Bağlan ve güncelle" gibi ilk akış çalıştırılınca dolar; demo uçlarında yapılan bildirim sayaçları değiştirir (8 işe giriş ← 10). → Önce akışı bir kez çalıştır, ekran görüntülerini ondan sonra `ekran-al.mjs` ile al (localhost'ta giriş yoksa çalışır); sayaçlar gerekirse uygulamayı yeniden başlatıp sıfırla. Yerleşik tarayıcı (mcp__Claude_Browser) localhost için yeterli. (FastPolnet, 23.11)
- **Demo verisinde geçerli T.C.**: demo üreteci sağlama haneleri geçerli 11 haneli numaralar ve yaygın ad-soyadlar üretiyordu. → Bu ekran görüntülerini videoda doğrudan kullanma ya da maskele; sahnelerde kendi kurgusal kayıtlarını yaz. (FastPolnet, 23.11)
- **Uygulamada logo yok**: arayüz yalnız favicon kullanıyordu; logolar klasöründe iki küçük aday (128 ve 64 px). → Adayları listele, en olasıyı geçici koy, kullanıcıya sor; büyük sürüm iste. (FastPolnet, 23.11)

## Tema
- **Koyu temada sabit açık renk**: örnek içerikte `#FFF4B8` sarı not kâğıdı koyu temada okunmaz oldu. → Renkleri anahtarla ver (`zemin: 'dikkat'`), motor temaya göre açar/koyulaştırır.
- **SVG logo kare tuvalde küçük**: 1500×1500 tuvalin ortasında yatay logo. → `svg-kirp.mjs` ile kırp, `logoOran` yaz (Deskivy 3,81), `logoYuvarlak: false`.
- **Ad iki kez görünüyor**: logo zaten adı içeriyorsa kapanışta yazı da çıkar. → `logoMetin: ''`, `logoKoseMetin: false`.
- **Geniş logo sahneye sığmıyor**: `logo`/`merkez` sahneleri artık genişliği sınırlar (`logoGen`); kendi sahnende `SH.logoImg(M, boy, stil, enFazla)` kullan.
- **Küçük PNG logo** (128 px) kapanışta bulanık. → Büyük sürüm ya da SVG iste. Yoksa üst sınır koy: FastPolnet'te (23.11) proje kopyasına `TEMA.logoAzami` eklendi (motor.js Kapanis: logo yüksekliği `min(220·ölçek, logoAzami)`; sahneler.js `logoGen` aynı sınırı uygular), 140 px ile 128 px logo ~1,1× büyür. Kalıcı çözüm için skill'in motoruna taşınmayı bekliyor.

## Seslendirme ve kredi
- **Metin onayı → ses**: onaysız üretme. Uzun gelen sesi sessizce yeniden üretme; kısaltmayı sor, eskiyi `ses/eski-*` altına sakla.
- **`generations_count` varsayılanı 2**: kredi iki katı. → Hep 1.
- **Kesme işareti TTS'te yok**: "Gibden", "Vatsapta", "İnstagramda"; altyazı `tema.yazim` ile düzelir.
- **Ekli okunuş birlesik'e uymaz**: `birlesik` tam kelime eşler; "Fest Polnetle" gibi ekli biçim altyazıda "Fest Polnetle" kalır. Ekli Türkçe biçimler (Polnete → Polnet'e) de `yazim`a tek tek yazılmalı. → Seslendirmede marka adını yalın kullan ya da her ekli biçimi tabloya ekle. (FastPolnet, 23.11)
- **Harf harf kısaltma**: "Se Ge Ka" → `tema.birlesik` ile altyazıda "SGK".
- **Flow kimliği**: aynı flow_id'yi kullan; "You do not have access" gelirse flow_id vermeden üret, yenisini kullan.
- **İndirme bağlantıları saatlerce geçerli**: üretimden hemen sonra `curl` ile indir.
- **Süre**: 15 sn reklam ≈ 23–30 kelime. 33 kelimelik ilk metin 18 sn geldi, kısaltıldı. Ham ses ≤ ~15,7 sn olmalı (motor ≤%10 hızlandırır).
- **Film kısa geldi**: 95 kelime ≈ 48 sn. → `kelimeler.mjs --sahne` ile sahne başlarına ≤1,6 sn boşluk; 59 sn'ye taşındı.
  - **Ama fazla boşluk "ağır" hissettirir**: FastPolnet'te (23.11) 8 × 1,23 sn boşlukla 59,5 sn'ye yayılan film için kullanıcı "cümleler arası süre çok uzun hissettiriyor" dedi. TTS'in kendi cümle arası sessizliği zaten 0,3–0,35 sn (Mustafa); üstüne 1,2 sn eklenince sahne geçişinde ~1,5 sn sessizlik oluyor. → Filmi 60 sn'ye zorla yayma; `--enfazla 0.5` ver, film doğal süresinde kalsın (104 kelime, ham 50,7 sn → 8 × 0,5 → 55,9 sn). Skill'in `kelimeler.mjs` varsayılanı (`enfazla` 1,6) ve seslendirme.md'deki "≤1,6 sn" bu yüzden düşürülmeye aday.
- **Kulak kontrolü**: Scribe dökümü telaffuz hatasını yakalamaz; kullanıcıya dinlemesini hatırlat. (FastPolnet, 23.11: döküm TTS metniyle harfi harfine aynı geldi, "Fest Polnet", "Se Ge Ka" dahil — bu, okunuşun doğru olduğunu kanıtlamaz.)
- **Harcanan krediyi okuma**: `account_get_usage` "additional permissions" hatası verdi. → Krediyi `creative_get_flow_run_status` sonucundaki `price.credits`'ten oku (F1: 720 karakter → 719,9 kredi; Scribe 0). (FastPolnet, 23.11)
- **Film süresi örneği**: 97 kelime, Aras sesi → ham 45,8 sn; `--sahne` 8 boşluk × 1,57 sn → 58,3 sn. Aynı metin Mustafa sesiyle ham 48,5 sn → 8 × 1,23 sn → 58,3 sn. Ses değişince yalnız kelimeler.js değişir; sahne başı kelimeleri aynıysa icerik.js'e dokunmadan yeniden render yeter (yine de 5–6 kontrol karesi al). (FastPolnet, 23.11)
- **Ses değiştirme**: kullanıcı sesi sonradan değiştirdi ("sesi mustafa yapalım"). → Eski sesi ve kelime dosyalarını `ses/eski/<ses>-*` altına sakla, yeni üretim tek ve onaylı olsun, KAYNAKLAR'ı güncelle. (FastPolnet, 23.11)

## Kelime zamanları
- **Aynı kelimenin ikinci geçişi**: `T('Vergi')` ilk "vergi"yi (vergi borçları, 20. sn) döndürdü, Vergi Link sahnesi erken açıldı, başlıklar üst üste bindi. → `T('Vergi', 1)`. Belirti: önizlemede iki başlık üst üste ya da bir sahne çok uzun.
  - **Metin değişince sıra numaraları kayar** (FastPolnet, 23.11): açılışa "eksik ya da geç bildirimin cezası" eklenip 4. sahneden "hemen" çıkınca 7. sahnenin `T('eksik')` vurgusu 1. sahneye, `T('Hemen', 2)` (CTA) ise "kelime yok" hatasına düşecekti → `T('eksik', 1)`, `T('Hemen', 1)`. `T` tam kelime eşler (küçük harf, noktalama atılır): "Eksikler" ≠ "eksik", "cezası" ≠ "cezaya" kaymaz. → Metin her değiştiğinde icerik.js'teki tüm `T('…', n)` çağrılarını yeni metinde sayarak denetle; ilgili sahnenin vurgu karesini önizlemede gör.
- **Sahne kelimesi okunuş biçiminde**: `--sahne` ham Scribe kelimeleriyle eşleşir ("Fest", "Se"), ekran yazımıyla değil.
- **Taslak tahmin**: `kelime-tahmin.mjs` ~0,058 sn/harf; Deskivy'de tahmin 12,3 sn, gerçek 12,9 sn.
- **"kelime yok" hatası**: metin değişti ama kod eski kelimeyi arıyor. → Kodu yeni metne göre güncelle.

## Sahneler ve yerleşim
- **9:16'da üç satırlık başlık görsele değiyor**. → Başlığı iki satıra indir ("Tek asistan, kendi dokümanlarınızla." → "Kendi dokümanlarınızla.").
- **Kamera yakınlaşması içeriği taşırdı**: sol üstten yakınlaşma sağ kenarı dışarı itti. → Motor merkezden yakınlaşır (`tv.kamera`).
- **Bitmiş karta yanlış çip**: "Tamamlandı"ya taşınan kartta "Gecikti" çipi kalmıştı. → Taşınan öğenin durumunu da değiştir.
- **Modal ile birlikte kaybolan sonuç**: makbuz pencereyle beraber kayboldu. → Sonuç ayrı katmanda kalsın.
- **Simge yok**: sayfada `ikon yok: …` → `npm i @tabler/icons && node betik/ikon-uret.mjs ad`.
- **Kütüphane yetmezse yerel sahne**: Deskivy'nin sohbet kartı `icerik.js`'te yerel sahne olarak yazıldı; renkleri `M.Renk`'ten al. FastPolnet'te (23.11) `gonder` sahnesi "eksik, gönderilmez" satırı gösteremediği için aynı zaman aralığına ikinci bir yerel katman (köşe uyarı kartı) eklendi; iki sahne aynı anda çizilebilir. Kartı panel başlığının üstüne koyma (x ≥ 540 tuval).
- **Sahne seçeneklerinin sınırları** (kodda, belgede yok): `aktar` en çok 3 kaynak; `baglan` yalnız ilk karta "Bağlandı" yazar (dört kartın sırayla bağlanması için değil); `durum`da `altMetin` tüm satırlara aynıdır (satır başına alt yazı için `tablo` + `satirlar[].alt`); `tablo` düğmesiz kullanılsa da `tBtn`/`tBit` verilmeli, yoksa hücreler hiç dolmaz ("···" kalır). (FastPolnet, 23.11)
- **16:9'da başlık 3 satıra taşar**: 16:9 başlık kutusu 760 px / 90 px; "Sözleşme ve kimlik" (18 harf) taştı, 9:16'da sığıyordu. → Satır başına ≤ ~15 harf; üç oranı da önizle. (FastPolnet, 23.11)
- **İmleç koordinatları tuval koordinatıdır** (1000×760), panel içi değil; düğmenin tuvaldeki merkezini hesapla.
- **Önizlemeyi iki oranda al**: 16:9'da görsel sağda, başlık solda; 9:16'da başlık üstte. Bir oranda temiz olan diğerinde çakışabilir.

## Render ve ses miksajı
- **Hız**: `page.screenshot` kare başı ~530 ms; CDP `Page.captureScreenshot` ~120 ms + paralel tarayıcılar ≈ 10× hız. NVIDIA'da `--use-angle=d3d11 --force_high_performance_gpu`.
- **NVENC hatası**: eski sürücüde ("minimum required … 610") çalışmadı. → `ayar.json "kodek": "x264"` (varsayılan); sürücü güncelse `nvenc` (~%20 hızlı, aynı kalite).
- **Müzik filmden kısa**: parça 58,7 sn, film 59,3 sn. → `Film` müziği ≤%10 yavaşlatır (`MUZIK.tempo`); döngü/kesik yok.
- **Tepe seviyesi**: loudnorm sonrası ebur128 tepe -1,0…-1,4 dB; hedef ≤ -1 dB (TP -1,5 ayarlı).
- **Renk**: `tv/bt709` etiketli olmalı (render.mjs ayarlı); farklıysa sosyal medyada soluk görünür.
  - FastPolnet (23.11, ffmpeg 9.0.2): `-color_primaries/-color_trc bt709` verilmesine rağmen parçalar ve son MP4'te `color_transfer/color_primaries=unknown` çıktı (yalnız matris ve aralık etiketliydi; `-vf format=` filtresi kare özelliğini ezip çıktı seçeneğini geçersiz kılıyor olabilir). → Kayıpsız düzeltme: `ffmpeg -i in.mp4 -map 0 -c copy -bsf:v h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0 out.mp4`. Kalıcı çözüm için render.mjs/ses.mjs'e eklenmeli; ffprobe ile dördünü de kontrol et.
- **Ses yüksekliği filmde düşük kaldı**: tek geçişli `loudnorm=I=-14` 59,5 sn filmde -15,1 LUFS verdi (tepe -1,3 dB); reklamlarda -14'e yakın. → Hedefe tam oturtmak için iki geçişli loudnorm (ölç → `measured_*` ile uygula) gerekir; tepe payı az olduğundan basit kazanç ekleme tepeyi -1 dB'nin üstüne çıkarır. Fark ≤ ~1 LU ise uyarı olarak raporla. (FastPolnet, 23.11) Mustafa sesiyle aynı karışım -14,1 LUFS / -1,4 dBTP verdi, yani sapma sese bağlı. Proje kopyasında `betik/son-isle.mjs`: ölçer; hedefteyse (±0,3 LU, tepe ≤ -1) sesi kopyalar, değilse iki geçişli doğrusal loudnorm uygular; her durumda bt709 etiketlerini kayıpsız yazar. Skill'e taşınmaya aday.
- **Ses akışı 0,18–0,2 sn geç başlıyordu**: ffprobe'da ses `start_time=0.178`. Neden: ses.mjs'te `amix` çıktısı, `adelay`li seslendirmenin başladığı andan (SES_BAS ≈ 0,2 sn) itibaren üretiliyordu; ilk 0,2 sn (müziğin girişi, 0,05 sn'deki efekt) düşüyordu. Zamanlar doğruydu, yani senkron kaymıyordu, ama baştaki boşluk kimi oynatıcıda sorun çıkarabilir. → `amix…atrim` sonrasına `aresample=async=1:first_pts=0` eklendi (proje kopyası ses.mjs), ses 0'dan başlıyor. Skill'in ses.mjs'ine eklenmeli. (FastPolnet, 23.11)
- **Render süresi**: 12 çekirdek, 6 işçi, x264: 1785 karelik film oran başına ~40–60 sn + ses birkaç sn; üç oran ~3 dk. (FastPolnet, 23.11)

## Teslim
- **Numaralar kaymasın**: yeni videoyu listenin sonuna ekle; bölünen videonun ilk parçası eski numarasında kalır, yenisi sona.
- **Teslim klasörünü silip yeniden kurar**: `teslim.mjs` hedefteki `<ad>` klasörünü ve zip'i yeniden oluşturur; içine elle dosya koyma.
- **ICERIK.md yalnız tablo**: seslendirme metni ve sahne listesi yoktu. → FastPolnet'te (23.11) proje kopyasındaki teslim.mjs, proje kökünde `ICERIK-EK.md` varsa ICERIK.md'nin sonuna ekliyor (metin, sahneler, kurgusal veri notu). Skill'in betiğine taşınabilir. ICERIK.md'deki "ses -14 LUFS" sabit metni ölçümle uyuşmayabilir.

## Ortam (Windows, kabuk)
- **Git Bash'te tırnak**: içinde `'` geçen metin (WhatsApp'ta, Deskivy'nin) tek tırnaklı `sed`/`node -e`'yi bozdu (`unexpected EOF`, `syntax error near (`). → Dosyaları Write aracıyla yaz ya da betiği dosyaya koyup çalıştır. Aynı tür: markdown tablosunda `\|` içeren satırı `sed` ile değiştirmek satırı bozdu, heredoc içindeki `node -e` ters tırnaklı kod parçalarını kabuk komutu sanıp sildi (FastPolnet, 23.11) → Edit aracı.
- **Heredoc içinde `\\` kaçışları bozulur**; JS'de gerekiyorsa `String.fromCharCode(92)`.
- **Kabuk dizini sıfırlanır**: her komutta `cd <proje> &&` ile başla.
- **npm**: Windows'ta `spawnSync('npm install …', { shell: true })` tek dize (kur.mjs böyle).
- **ffmpeg yolu**: PATH'te yoksa `ortak.mjs` winget klasörünü tarar; olmazsa `ayar.json "ffmpeg"`.

## Ajan düzeni
- Üretim `tanitim-uretici` ajanında; ana oturum yalnız onay ve gösterim. Ajan soru soramaz: görev mesajına onaylı kararları yaz.
- Aynı projede `SendMessage` ile aynı ajana devam et; yeni ajan bağlamı sıfırdan kurar ve aynı hataları tekrarlayabilir.
- Ajanın "hazır" raporunu temas tablosuna ve ölçümlere bakmadan kullanıcıya iletme.
