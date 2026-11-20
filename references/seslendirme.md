# Seslendirme (ElevenLabs bağlayıcısı) ve kelime zamanları

## Ses seçimi
- `creative_list_voices` ile dile ve tona uygun 2–3 ses öner (reklam: enerjik; film: aynı ses ya da biraz daha sakin). Kullanıcı seçsin; voice_id'yi `KAYNAKLAR.md`'ye yaz.
- Model: `eleven_v4`. `generations_count: 1` (varsayılan 2'dir, kredi iki katı).

## Kredi
Her üretim kredi harcar (~1 kredi/karakter). **Metin onayı alınmadan ses üretme.** Aynı metni yeniden denemek ikinci kez ücretlendirir; başarısızlıkta durumu sor, yeniden üretme. Kullanıcıya harcanan krediyi söyle.

## TTS metni (okunuş) ve ekran yazımı
- TTS metninde kesme işareti kullanma ("GİB'den" → "Gibden"); kısaltmaları okunduğu gibi yaz.
- Marka/ürün adları okunuşuyla yazılır, altyazıda marka yazımıyla görünür: `tema.js → yazim { 'Fest': 'Fast' }`. Harf harf okunan kısaltmalar: `birlesik [['Se','Ge','Ka','SGK']]`.
- Okunuşu belirsiz adları kullanıcıya sor (örnek: kullanıcı "Fast"ın "Fest", "iOS"un "Ayos" okunmasını istedi).
- Başlıklar ve ekrandaki yazılar normal yazımla (kesme işareti serbest).

## Akış
1. `creative_generate_speech` (prompt = TTS metni, voice_id, model `eleven_v4`, aynı flow_id'yi tekrar kullan; erişim hatasında flow_id vermeden üret).
2. `creative_get_flow_run_status` → `content_url` → `curl -s -f -o ses/ham/<R>.mp3 "<url>"`.
3. `creative_transcribe_audio` (`eleven_scribe_v1`, `connect_from: [konuşma düğümü]`) → durum → `words_download_url` → `curl -o ses/ham/<R>-kelimeler.json`.
4. `node betik/kelimeler.mjs R1` (reklam) ya da `node betik/kelimeler.mjs T1 --sahne "İlk,Kelimeler,…"` (film).

## Süre
- **Reklam (R…)**: hedef ≤15 sn. Ham ses ~15,7 sn'ye kadar motor ≤%10 hızlandırarak sığdırır. Ham ses 16,5 sn'yi geçerse metni kısalt ve kullanıcıya sor (eski sesi `ses/eski/` altına sakla). Ölçü: ~2,0–2,2 kelime/sn → 15 sn reklam ≈ 25–30 kelime (kapanış cümlesi dahil).
- **Film**: 60 sn için ~95–100 kelime. Sesler genelde 45–50 sn gelir; `kelimeler.mjs --sahne` her sahne başına ≤1,6 sn boşluk ekleyip filmi ~59 sn'ye taşır (ses hızlanmaz).
- Sahne başı kelimeleri ham kelime listesindeki biçimiyle yaz (okunuş: "Fest", ekran yazımı değil).

## Taslak önizleme (kredisiz)
`node betik/kelime-tahmin.mjs R1 "ekran yazımıyla metin"` tahmini zamanlar yazar; sahneleri ses üretmeden önce kurup kullanıcıya gösterebilirsin. Gerçek ses gelince aynı kayıt üzerine yazılır.
