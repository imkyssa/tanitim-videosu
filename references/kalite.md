# Kalite kontrolü ve öğrenilen dersler

## Her video teslimden önce
- [ ] İddialar `urun.md`'de kaynağıyla var; sitede/çalışan ekranda olmayan özellik yok.
- [ ] Gerçek müşteri verisi yok: ad, vergi no, telefon, e-posta kurgusal ya da maskeli (`12••••••90`).
- [ ] Önizleme temas tablosu (9:16 ve 16:9, sahne başına bir kare) kullanıcıya gösterildi.
- [ ] Başlıklar üst üste binmiyor, metin kart dışına taşmıyor, son karede altyazı kapanışla çakışmıyor.
- [ ] Süre: reklam ≤ ~15,7 sn, film ~58–60 sn (`ffprobe`).
- [ ] Ses: ~-14 LUFS, tepe ≤ -1 dB (`ffmpeg -af ebur128=peak=true`); renk `tv/bt709`.
- [ ] Teslim paketi denetimi temiz (`teslim.mjs` "denetim temiz").
- [ ] Seslendirmeyi kulakla dinlemesini kullanıcıya hatırlat (yazıya dökümle kontrol telaffuzu yakalamaz).

## Dersler
Tuzaklar ve çözümleri `references/know-how.md`'de (kullanıcı geri bildirimleri dahil).
