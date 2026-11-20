# tanitim-videosu

Claude Code skill'i: bir web sitesinin ya da yazılım ürününün **kendi temasında** (renkler, yazı tipi, logo, açık/koyu zemin) animasyonlu tanıtım videoları üretir.

- 15 sn reklam serisi (Google Ads, Instagram Reels, TikTok) — 9:16, 1:1, 16:9
- 1 dakikalık tanıtım filmleri
- Numaralı teslim paketi (klasörler, içerik listesi, kaynaklar, zip)

Siteyi Claude in Chrome eklentisiyle analiz eder, temayı ve ürün iddialarını siteden çıkarır, ElevenLabs ile Türkçe seslendirme ve kelime kelime altyazı ekler. Görüntü HTML/CSS'te belirli (deterministik) bir animasyon olarak çizilir, kurulu Chrome ile kare kare yakalanır, ffmpeg ile MP4'e kodlanır. Müzik ve efektler CC0'dır.

## Gerekenler
- [Claude Code](https://claude.com/claude-code)
- Node 18+, Google Chrome, ffmpeg (NVIDIA ekran kartı varsa NVENC ile daha hızlı)
- Claude in Chrome eklentisi, ElevenLabs bağlayıcısı

## Kurulum
```bash
git clone https://github.com/imkyssa/tanitim-videosu ~/.claude/skills/tanitim-videosu
node ~/.claude/skills/tanitim-videosu/scripts/kurulum.mjs
```
`kurulum.mjs` üretim ajanını (`tanitim-uretici`) `~/.claude/agents/` altına kopyalar ve gerekenleri denetler. Yeni bir Claude Code oturumu açın.

Windows (PowerShell):
```powershell
git clone https://github.com/imkyssa/tanitim-videosu "$HOME\.claude\skills\tanitim-videosu"
node "$HOME\.claude\skills\tanitim-videosu\scripts\kurulum.mjs"
```

## Kullanım
Claude'a doğal dille söyleyin, skill kendiliğinden devreye girer:
- "ornek.com için Instagram ve TikTok'ta kullanacağımız 15 saniyelik reklamlar yap"
- "Bu sitenin temasında 1 dakikalık bir tanıtım filmi istiyorum"
- "Reklam serisine fiyatlandırma için yeni bir reklam ekle"

Akış onay noktalarıyla ilerler: kapsam → tema (siteyle yan yana önizleme) → metin → seslendirme (kredi harcar) → önizleme → video → teslim. Ağır iş `tanitim-uretici` alt ajanında yapılır; ana oturum yalnız sorular, onaylar ve sonuçları taşır.

## Know-how: birlikte büyüyen tuzak listesi
`references/know-how.md`, gerçek projelerde yaşanan tuzakları **belirti → neden → çözüm** olarak tutar. Skill her projeden önce okur, proje sonunda yeni öğrenilenleri ekler (SKILL.md, adım 10).

Paylaşmak için:
```bash
cd ~/.claude/skills/tanitim-videosu
git pull --rebase            # başkalarının eklediklerini al
git add references/know-how.md
git commit -m "know-how: <kısa özet>"
git push                     # ya da fork + pull request
```
Çakışmada iki tarafın maddelerini de koruyun; aynı tuzaksa tek maddede birleştirin.

## Klasörler
| Klasör | İçerik |
|---|---|
| `SKILL.md` | Akış ve kurallar (Claude bunu okur) |
| `motor/` | Tema motoru, sahne kütüphanesi, simgeler |
| `scripts/` | Proje kurulumu, render, ses miksajı, kelime zamanları, teslim, site analizi |
| `references/` | Know-how, tema analizi, sahne kütüphanesi, seslendirme, kalite kontrol |
| `ornek/` | Örnek tema, içerik, ayar |
| `ajan/` | Üretim ajanı tanımı |
| `assets/` | CC0 müzik ve efektler, kaynak listesi |

## Kaynaklar
Müzik ve efektler Freesound/Openverse üzerinden CC0 (liste: `assets/KAYNAKLAR.md`). Simgeler: Tabler Icons (MIT).
