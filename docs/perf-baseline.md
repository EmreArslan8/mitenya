# Performans baseline — Tailwind geçişi

**İlgili:** [ADR-0002](./adr/0002-mui-to-tailwind-migration.md) · [Faz 0](./migration/faz-0-altyapi.md)

Her faz sonunda yeni **sütun** eklenir. Satırlar sabit kalır ki trend okunabilsin.
Kabul kriterleri: ADR-0002 §7.1.

---

## 1. Kod metrikleri (ölçeklenebilirlik göstergeleri)

| Metrik | **Baseline** (2026-09-08) | Faz 0 | Faz 1 | Faz 2 | Faz 3 | Faz 4 | Faz 5 | Faz 6 | Hedef |
|---|---|---|---|---|---|---|---|---|---|
| `'use client'` dosya | **134** / 552 | 134 | 131 | | | **122** | **111** | | < 25 |
| `sx=` kullanımı | **1.675** | 1.675 | 1.646 | | | **1.259** | **972** | | 0 |
| `styles.ts` dosya | **102** | 102 | 93 | | | **64** | **52** | | 0 |
| `styles.ts` satır | **10.816** | 10.816 | 10.363 | | | **8.382** | **7.058** | | 0 |
| `@mui` import eden dosya | **171** | 171 | 162 | | | **119** | **95** | | 0 |

> Not: `'use client'` sayısı 134 — Haziran 2026 notundaki "65" değeri yalnızca PDP ağacını kapsıyordu. Proje geneli bunun iki katı.

## 2. Sayfa tipi başına HTML ve stil yükü

Prod, mobil User-Agent, ham `curl` (2026-09-08).

| Sayfa | HTML | **inline CSS** | `<script src>` | `mui-*` sınıf örneği |
|---|---|---|---|---|
| Ana sayfa | 223 KiB | **88 KiB** | 29 | 861 |
| PDP | 306 KiB | **100 KiB** | 28 | 1.256 |
| Arama | 279 KiB | **95 KiB** | 28 | 1.413 |
| Blog listesi | 110 KiB | **48 KiB** | 25 | 368 |
| Sepet | 97 KiB | **44 KiB** | 24 | 340 |

**Okuma:** inline Emotion CSS her sayfada HTML'in **%39-45'i**. Cache'lenmez, her istekte yeniden iner ve parse edilir. Hedef: ~0 (harici, cache'lenen `.css`).

Eksik: kategori, blog detayı — Faz 0 tamamlanırken sabit slug seçilip eklenecek.

## 3. Web Vitals

### Ana sayfa, mobil

| Kaynak | Skor | FCP | LCP | TBT | CLS | SI |
|---|---|---|---|---|---|---|
| **PSI (kullanıcı ekranı, 2026-09-08)** | — | 1,4 s | **5,1 s** | **730 ms** | 0 | 5,8 s |
| Yerel LH (simulated, referans) | 0,90 | 1,3 s | 3,2 s | 90 ms | 0,023 | 4,4 s |

**PSI LCP dökümü (asıl hedef):**

| Alt bölüm | Baseline | Hedef |
|---|---|---|
| TTFB | 40 ms | — |
| Kaynak yükleme gecikmesi | 170 ms | — |
| Kaynak yükleme süresi | 60 ms | — |
| **Öğe oluşturma gecikmesi** | **2.100 ms** | **< 900 ms** |

⚠️ Yerel LH ile PSI arasındaki fark CPU/ağ profilinden; **yerel sayılar mutlak hedef olarak kullanılmaz**, yalnızca aynı makinede önce/sonra karşılaştırması için. Karar PSI sayılarıyla verilir.

### Main thread (yerel LH, ana sayfa)

| Kalem | Baseline |
|---|---|
| Script evaluation | **3.813 ms** |
| Style/Layout | 622 ms |
| GC | 387 ms |
| `704a18b2*.js` (Next+react-dom runtime) | **4.053 ms total / 3.534 ms eval** |
| Toplam ağırlık | 854 KiB (38 script / 490 KiB JS) |

## 4. Eksik ölçümler (PSI anahtarı gerekiyor)

Aşağıdakiler `scripts/perf-measure.mjs` ile 10 koşu medyanı olarak alınacak; **PSI API anahtarı beklemede** (anahtarsız çağrı 429 döndü):

- 7 sayfa tipinin tamamı için PSI mobil metrikleri
- Script bazında `bootup-time`
- Sayfa başına JS transfer + istek sayısı
- INP ölçümü

Şu an elde olan tek gerçek PSI verisi: ana sayfa (kullanıcı ekranından). Diğer sayfa tipleri için PSI baseline'ı **anahtar gelir gelmez** alınmalı — geçiş ilerledikçe geriye dönük alınamaz.

## 5. Faz 0 çıktısı (2026-09-08)

Faz 0'ın tanımı gereği kod metrikleri **değişmedi** — tek MUI komponenti dönüştürülmedi.

| | Baseline | Faz 0 sonu |
|---|---|---|
| Harici CSS (Tailwind, sıkıştırılmamış) | 0 | **12,3 KiB** (tema değişkenleri + `@layer properties`; henüz tek utility kullanılmıyor) |
| Inline Emotion CSS | 88 KiB (ana sayfa) | 88 KiB — değişmedi |
| `First Load JS shared` | 227 kB | 227 kB — değişmedi |
| Build | ✓ | ✓ 54/54 statik sayfa |

Doğrulandı:
- `md:` = `min-width: 1000px` (MUI'nin özel kırılımı Tailwind'e doğru taşındı)
- `bg-primaryDark` → `background-color: var(--color-primaryDark)` (token köprüsü uçtan uca çalışıyor)
- Üretilen CSS'te preflight izi **yok** (`box-sizing:border-box` sıfır eşleşme)

## 6. Faz 1 çıktısı (2026-09-08)

Primitifler inşa edildi + 2 pilot dilim + ölü kod temizliği.

| Metrik | Baseline | Faz 0 | **Faz 1** |
|---|---|---|---|
| `'use client'` | 134 | 134 | **131** |
| `sx=` | 1.675 | 1.675 | **1.646** |
| `styles.ts` dosya | 102 | 102 | **93** |
| `styles.ts` satır | 10.816 | 10.816 | **10.363** |
| `@mui` import eden dosya | 171 | 171 | **162** |
| toplam ts/tsx | 552 | 552 | **542** |
| First Load JS shared | 227 kB | 227 kB | **229 kB** |

Düşüşün çoğu **ölü kod silinmesinden** geliyor (10 komponent, ~790 satır), dönüşümden değil — Faz 1'in tanımı gereği beklenen buydu. First Load JS'teki +2 kB clsx + tailwind-merge + cva; Emotion henüz çıkmadığı için şimdilik net artış.

## 7. Faz 2 — F2.1 ara durum (2026-09-08)

A grubunun (kütüphanesiz) büyük kısmı + `ProductGrid` semantik bileşeni.

| Metrik | Dal başı (HEAD) | Faz 1 | **F2.1 sonrası** |
|---|---|---|---|
| `@mui/` import eden dosya | 170 | 162 | **162** *(biri `globals.css`, yorumda MUI yolu geçiyor → gerçek 161)* |
| `'use client'` | 134 | 131 | **128** |
| `sx=` | 1.675 | 1.646 | **1.572** |
| MUI `<Skeleton>` | 79 | 79 | **0** |
| MUI `<CircularProgress>` | 15 | 15 | **0** |
| MUI `<Fade>` | 6 | 6 | **2** |
| MUI `<Grid>` (container+item) | 65 | 65 | **53** |

Doğrulama — `ProductGrid`, prod'daki MUI Grid'e karşı ölçüldü (`/collection/day-care`):

| genişlik | prod (MUI Grid) | lokal (ProductGrid) |
|---|---|---|
| 500 px | 2 sütun · içerik 220px · boşluk 20/24 | 2 sütun · **220px** · 20/24 ✓ |
| 800 px | 3 sütun · içerik 232px | 3 sütun · **232px** ✓ |
| 1280 px | 4 sütun · içerik 289px | 4 sütun · **289px** ✓ |

MUI'nin negatif margin'i (container −20px, item padding 20px) ile CSS grid `gap` farklı mekanizmalar ama **görünen sonuç birebir aynı** — konvansiyon.md §7'deki uyarı bu vakada sorun çıkarmadı.

## 8. F2.1 kapanışı (2026-09-08)

| Metrik | Dal başı | Faz 1 | **F2.1 sonu** |
|---|---|---|---|
| `'use client'` | 134 | 131 | **128** |
| `sx=` | 1.675 | 1.646 | **1.562** |
| `@mui/` içeren ts/tsx | 170 | — | **163** |
| MUI `<Grid>` | 65 | 65 | **53** |
| A grubu (Skeleton+Spinner+Chip+Badge+Fade+Progress+Collapse) | 113 | 113 | **2** |
| `@mui/icons-material` | 2 | 2 | **1** |

## 9. Faz 2 kapanışı (2026-09-08)

| Metrik | Dal başı | Faz 1 | F2.1 | **Faz 2 sonu** |
|---|---|---|---|---|
| `'use client'` (uygulama kodu) | 134 | 131 | 128 | **128** |
| `'use client'` (ui/ primitifleri) | 0 | 6 | 6 | **12** |
| `sx=` | 1.675 | 1.646 | 1.562 | **1.476** |
| `@mui/` içeren dosya | 170 | — | 163 | **157** |
| MUI `<Grid>` | 65 | 65 | 53 | **53** |
| Davranışlı MUI kullanımı | 234 | 234 | 121 | **~40** (hepsi Card/ModalCard zinciri) |

Kalan davranışlı kullanımların tamamı Faz 4/5'e devredilen zincirde:
`MenuItem 29 · Accordion 3 · Menu 2 · Popover 2 · Modal 1 · Drawer 1 · Fade 1 · LinearProgress 1 (determinate) · Select 1 (FormikDropdown → Faz 3)`

## 10. 🔴 Bundle regresyonu ve düzeltmesi (2026-09-08)

Faz 2 sonunda **prod bundle ölçüldü** (`'use client'` dosya sayısı yanıltıcı bir vekildi — MUI'nin client bileşenleri `node_modules`'da olduğu için o sayıma hiç girmiyordu).

| | Dal başı | Faz 2 (barrel) | Faz 2 (düzeltme sonrası) |
|---|---|---|---|
| **First Load JS (paylaşılan)** | 227 kB | **287 kB** 🔴 | **241 kB** |
| `/product/[id]` | 324 kB | 369 kB | **344 kB** |
| `/cart` | — | 347 kB | **316 kB** |
| `/search` | — | 365 kB | **361 kB** |

**Kök neden:** `src/components/ui/index.ts` barrel'ı. `Navigation` yalnızca `Badge` import ediyordu ama barrel üzerinden **tüm Radix paketleri** paylaşılan chunk'a giriyordu — yani her sayfa, hiç kullanmadığı Dialog/Select/Accordion/Slider kodunu indiriyordu.

Kanıt: `b5ddc7e84042dc67.js` (paylaşılan listede 56,5 kB) içinde 64 `@radix-ui` eşleşmesi.

**Denenen ve işe yaramayan:** `experimental.optimizePackageImports: ['@/components/ui']` — bu ayar `node_modules` paketleri için, iç alias'lara işlemiyor (build çıktısı değişmedi, geri alındı).

**Uygulanan çözüm:** 48 dosyada barrel import'u doğrudan yola çevrildi
(`@/components/ui` → `@/components/ui/Stack`). Radix artık paylaşılan chunk'ta değil.

**Kural mekanizmaya bağlandı:** `eslint.config.mjs` barrel'dan import'u `error` yapıyor.

**Kalan +14 kB (227 → 241)** geçiş dönemi maliyeti: hem MUI/Emotion hem yeni `ui/` katmanı aynı anda yükleniyor. Faz 6'da Emotion sökülünce bu kalem ters yöne dönecek.

> **Ders:** dosya/komponent sayısı gibi vekil metrikler yanıltır. Her faz sonunda **prod build ölçülmeli** — ADR §10 adım 6'ya bu eklendi.

## 11. Faz 3 sonu (2026-09-08)

| Metrik | Dal başı | Faz 2 sonu | **Faz 3 sonu** |
|---|---|---|---|
| **First Load JS (paylaşılan)** | 227 kB | 241 kB | **242 kB** |
| `/product/[id]` | 324 kB | 344 kB | **329 kB** |
| `/cart` | — | 316 kB | **301 kB** |
| `/checkout` | — | 376 kB | **355 kB** |
| `/uyelik` | — | 372 kB | **310 kB** |
| MUI `TextField` | 34 | 34 | **0** |
| MUI `Autocomplete` · `InputAdornment` · `FormControl` | 5 | 5 | **0** |
| `@mui/` içeren dosya | 170 | 157 | **152** |

Sayfa bazında düşüş belirgin: `/uyelik` −62 kB, `/checkout` −21 kB, `/cart` −15 kB.
Paylaşılan chunk 1 kB arttı (`downshift` girdi) ama sayfa bundle'ları küçüldü —
form ağırlığı MUI'den çıkıp yalnızca kullanan sayfaya taşındı.

## 12. Faz 4 kod sonu (2026-09-09)

| Metrik | Faz 3 | **Faz 4 kod sonu** |
|---|---:|---:|
| `sx=` | 1.444 | **1.259** |
| `styles.ts` dosya | 89 | **64** |
| `styles.ts` satır | — | **8.382** |
| `@mui/` içeren ts/tsx | 152 | **119** |
| CMS `'use client'` | 17 | **10** |
| First Load JS shared | 242 kB | **249 kB** |
| `/product/[id]` | 329 kB | **330 kB** |
| `/` | ölçülmedi | **347 kB** |

`yarn build` 54/54 sayfayı üretti. Build sırasında Strapi kapalı olduğunda ana
sayfa CMS isteği `ECONNREFUSED` kaydı verdi; dinamik rota olduğu için build yine
başarıyla tamamlandı. Ölçümde global Tailwind CSS 16,5 kB. Paylaşılan toplam +7
kB artarken PDP toplamı yalnızca +1 kB arttı; sayfaya özel JS bu farkı büyük
ölçüde telafi etti. Faz 3 ana sayfa değeri kaydedilmediği için ana sayfa yönü
hesaplanamıyor.

Prod HTML doğrulaması: ilk `ShopBanner` görseli için iki ayrı preload üretildi
(`min-width:600px` masaüstü, `max-width:599.95px` mobil). Her ikisi doğru
`imageSrcSet`/`imageSizes` taşıyor; render edilen ilk görsel ayrıca
`fetchPriority="high"` ve `loading="eager"` içeriyor.

## 13. Faz 5 — F5.2 ara durum (2026-09-10)

| Metrik | Faz 4 | **F5.2 ara** | Fark |
|---|---:|---:|---:|
| First Load JS shared | 249 kB | **249 kB** | 0 |
| `/` | 347 kB | **335 kB** | −12 kB |
| `/product/[id]` | 330 kB | **324 kB** | −6 kB |
| `/cart` | 302 kB | **296 kB** | −6 kB |
| `/checkout` | 355 kB | **329 kB** | −26 kB |
| `/search` | — | **327 kB** | — |

Build 54/54 sayfayı üretti. F5.0 sunucu kabuğu, F5.1 Card/ModalCard/Banner
zinciri ve F5.2'nin bağımsız global kabuk parçaları bu ölçüme dahil. Ana
`Navigation/index.tsx` hâlâ MUI kullandığı için shared pakette düşüş henüz yok;
sayfaya özel paketler şimdiden küçüldü.
