# ADR-0002 — MUI + Emotion'dan Tailwind + Radix'e geçiş

**Durum:** Uygulanıyor — Faz 5 başladı; Faz 4 genel görsel review'u açık
**Tarih:** 2026-09-08
**İlgili:** [ADR-0001](./0001-pdp-isr-webhook-revalidation.md)

---

## 1. Karar

Storefront'un tüm stil katmanı **MUI v5 + Emotion**'dan **Tailwind v4 + Radix (shadcn deseni)**'e taşınacak.
Geçiş **komponent bazında**, tek bir uzun ömürlü dalda yapılacak; **prod deploy en sonda, tüm proje geçtikten sonra** olacak.

### Amaç

Bu bir metrik düzeltmesi değil, **mimari düzeltme**. Hedef üç başlıkta:

1. **Ölçeklenebilirlik** — yeni sayfa/blok/akış eklemenin maliyeti sabit kalsın. Bugün her yeni ekran, client bundle'ı ve inline CSS'i büyütüyor; yani her özellik bir sonrakini pahalılaştırıyor.
2. **Bütünsel performans** — tek bir sayfanın tek bir metriği değil, **tüm sayfa tiplerinde** gönderilen JS, hydrate edilen ağaç ve etkileşim gecikmesi. Ana sayfa LCP'si bu tablonun yalnızca en görünür hücresi.
3. **Sürdürülebilirlik** — 1.675 `sx` ve 10.816 satır `styles.ts`'in yerine tek kaynaklı bir tasarım sistemi; kütüphane major sürümlerine bağımlı olmayan, sahibi biz olan komponentler.

**LCP bir hedef değil, göstergedir.** §2'deki ölçümler kök nedeni kanıtlamak için var; başarı §7.1'deki geniş kriter setiyle ölçülecek. "LCP düştü ama sayfa başına 400 KiB JS aynı kaldı" başarısızlıktır.

## 2. Gerekçe — semptom ve kök neden

Ana sayfa mobil PSI: **LCP 5,1 s · TBT 730 ms**. LCP dökümü:

| Alt bölüm | Süre |
|---|---|
| TTFB | 40 ms |
| Kaynak yükleme gecikmesi | 170 ms |
| Kaynak yükleme süresi | 60 ms |
| **Öğe oluşturma gecikmesi** | **2.100 ms** |

Yani LCP'nin **%88'i** ağ değil, main thread. Ölçülen sebepler:

- `704a18b2*.js` (Next + react-dom runtime) → **3.534 ms script evaluation**, uzun görevlerin 7'si
- Head'de tek `<style>` → **88 KiB inline Emotion CSS** (223 KiB HTML'in %40'ı), cache'lenmez, her sayfa yüklemesinde yeniden parse edilir
- Style/Layout 622 ms · `mui-*` sınıf örneği 861
- `@mui/material` ~590 KiB parsed / 1.815 KiB kaynak, ~14 chunk'a parçalı ve kısmen duplike

Kök neden mimari: **MUI v5 runtime CSS-in-JS'tir → her stilli eleman client komponentidir.** App Router'da bu bulaşıcıdır (65 client komponent). RSC'nin vaadi (HTML gönder, JS gönderme) bu modelle gerçekleşemez.

Config seviyesindeki tüm kaldıraçlar Haziran 2026'da denendi ve tükendi (`optimizePackageImports` no-op ölçüldü, `modularizeImports` aynı, splitChunks turbopack'te yok). Geriye kalan tek kaldıraç kod seviyesi.

**Bu projeye özel belirleyici bulgu:** 199 davranışlı MUI kullanımının dağılımı → Skeleton 80, TextField 35, CircularProgress 16, Select 11, Snackbar 10, Accordion 8. Gerçekten karmaşık widget'lar (Autocomplete, Slider, Tabs) **birer tane**; DataGrid/DatePicker/TreeView **sıfır**. Proje MUI'nin bedelini tam ödüyor, değerinin ~%5'ini kullanıyor.

### Neden Pigment CSS veya CSS Modules değil

- **Pigment CSS:** doğru uzun vade ama olgunlaşmamış + v5→v7 major migration + dinamik `sx`'ler statik refactor ister. Toplam maliyeti Tailwind'e yakın, kazancı daha belirsiz.
- **CSS Modules:** sıfır bağımlılık, ara çözüm olarak geçerli. Ama Emotion **son `@mui` import'u gidene kadar** bundle'da kalır → yarım çözüm. Tam geçiş kararı verildiği için ilk adımı Tailwind'le atmak tutarlı.
- **Tailwind'i MUI'nin yanına eklemek:** yasak. Yarım kalan migration iki sistemi birden taşır ve bugünkünden **ağırdır**. Bu ADR'nin tamamlanması şart.

## 3. Envanter (2026-09-08, `perf/homepage-faz0-1`)

| | Sayı |
|---|---|
| `@mui` import eden dosya | 171 / 552 |
| `@mui/material`'den doğrudan import | 169 dosya |
| `sx=` kullanımı | 1.675 |
| `styles.ts` dosyası / satır | 102 / 10.816 |
| `withPalette(...)` | 152 kullanım / 76 dosya |
| Salt-stil komponent | 1.986 (Stack 808, Typography 569, Box 280, Button 109, Grid 72, IconButton 36, Link 37, Divider 35, Card 34) |
| Davranışlı komponent | 199 |
| `useMediaQuery` | 22 kullanım / 5 dosya |
| `theme.breakpoints` | 21 kullanım / 5 dosya |
| `styled()` | **0** |
| `@mui/icons-material` import | **2** (ikonlar zaten `lucide-react`'e geçmiş) |

**İki iyi haber:**
1. `styled()` hiç kullanılmamış → tüm stil ya `sx` ya da `styles.ts` içinde düz obje. İkisi de mekanik olarak class'a çevrilir.
2. İkonlar zaten `lucide-react`. `@mui/icons-material` sadece 2 yerde.

## 4. Strapi uyumu

**CMS hiç değişmeyecek.** Sözleşme iki yerde tanımlı:

- `src/components/cms/blocks/index.tsx` → `componentMap`, Strapi'nin `__component` anahtarlarıyla eşleşir (`blocks.shop-banner`, `blocks.faq`, …)
- `src/components/cms/shared/cmsTypes.ts` → blokların prop tipleri

**Kural:** Bir bloğun *içi* tamamen yeniden yazılabilir; **`componentMap` anahtarı ve prop imzası değişemez.** Bu korunduğu sürece Strapi tarafında tek satır değişiklik gerekmez, içerik editörleri geçişi fark etmez.

`CMSImage`, `SectionBase` gibi `cms/shared` primitifleri önce geçirilir; 21 blok bunları tüketir.

## 5. Geçiş sırasında birlikte yaşama kuralları

Geçiş 3-5 hafta sürecek; iki sistem bu süre boyunca aynı anda çalışacak.

1. **Tek renk kaynağı:** `theme/palette.ts` → CSS değişkenlerine (`--color-*`) çevrilir. Hem Tailwind `@theme` bloğu hem MUI `createTheme` **aynı değişkenleri** okur. Pixel kayması böyle engellenir.
2. **Preflight kapalı:** Tailwind preflight, MUI `CssBaseline` ile çakışır. Geçiş boyunca **kapalı** kalır, Faz 6'da `CssBaseline` sökülürken açılır.
3. **Aynı elemanda `sx` ve `className` karıştırma.** Bir komponent ya tamamen geçmiştir ya hiç.
   Bu bir üslup tercihi DEĞİL, doğruluk şartı: Tailwind utility'leri `@layer utilities` içinde,
   Emotion ise katmansız yazar; katmansız CSS katmanlıyı **her zaman** ezer (özgüllük ve sıra
   fark etmez). Karıştırılan yerde Tailwind sınıfı sessizce yok sayılır. Ölçülmüş örnek ve
   çıkış yolları: `docs/migration/konvansiyon.md` §6.
4. **Yaprak → kök yönünde ilerle.** Geçmiş bir yaprak, MUI ebeveynin içinde sorunsuz çalışır (`className` her yerde geçerli). Tersi de doğru. Bu yüzden sıra bağımlılığa göre kurulur.
5. **Her komponent tek commit.** Geri alınabilirlik ve görsel karşılaştırma bunu gerektirir.

## 6. Fazlar

### Faz 0 — Altyapı (görsel değişiklik yok)

- `tailwindcss@4` + `@tailwindcss/postcss` kur (Next 15.5 + turbopack ile uyumlu)
- `palette.ts` → `globals.css` içinde `@theme` + `--color-*` değişkenleri üret; `theme.ts` bu değişkenleri okusun
- `theme/theme.ts:91-99` özel breakpoint değerlerini Tailwind `@theme` içine taşı (`sm/md/lg/xl` sayıları birebir aynı olmalı)
- `preflight: false`
- `cn()` yardımcısı + `class-variance-authority` (Button varyantları için)
- **Görsel baseline:** tüm sayfaların 3 kırılımda (390 / 768 / 1440) ekran görüntüsü alınır, `docs/visual-baseline/` altına konur
- **Performans baseline (§7.1 tablosunun tamamı):** 7 sayfa tipi × her metrik ölçülür ve `docs/perf-baseline.md`'ye yazılır. Sonradan baseline uydurulamaz — bu adım atlanırsa geçişin kazancı kanıtlanamaz.
- Kırık 20 vitest testi ayıklanır (§8) — yoksa geçişin kırdıkları ayırt edilemez
- Ölçüm scripti `scripts/perf-measure.mjs` yazılır (PSI API + `yarn analyze` + client komponent sayacı), her faz sonunda çalıştırılır

**Çıktı:** Tailwind çalışıyor, görünen hiçbir şey değişmiyor, elimizde sayısal baseline var.

### Faz 1 — Primitifler (en yüksek kaldıraç)

Sırasıyla:

| Hedef | Yerine | Etkilenen |
|---|---|---|
| `<Stack>` (808) | `<Stack>` — sıfır-runtime **server** komponenti, flex utility'leri üretir | tüm proje |
| `<Typography>` (569) | `<Typography>` (kendi primitifimiz) — cva ile varyantlar (h1/h2/body/caption) | tüm proje |
| `<Box>` (280) | düz `<div>` + class | tüm proje |
| `common/Button` (47 dosya) | cva varyantları (`theme.ts:132-210`'daki 4 varyant birebir taşınır) | 47 dosya |
| `common/Card` (15), `common/Link` (37), `<Divider>` (35), `<Grid>` (72) | düz HTML + grid/flex utility | — |

`Stack` ve `Typography` şim'leri MUI API'sini taklit eder ama **server komponentidir ve runtime'ı yoktur** — 1.377 kullanımın elle dönüştürülmesini engelledikleri için değerlidir. Kalıcıdırlar, geçici değil.

**Çıktı:** Salt-stil kullanımın ~%70'i geçmiş olur.

### Faz 2 — Davranışlı komponentler (Radix)

Her biri `components/ui/` altına, shadcn deseniyle (kod repo'da, bağımlılık değil):

| MUI | Sayı | Yerine |
|---|---|---|
| Skeleton | 80 | düz `<div>` + `animate-pulse` |
| CircularProgress | 16 | inline SVG spinner |
| Snackbar | 10 | `sonner` veya kendi toast'ımız |
| Select | 11 | Radix Select |
| Accordion | 8 | Radix Accordion |
| Checkbox 7 / Switch 4 / Slider 1 | 12 | Radix karşılıkları |
| Rating | 6 | özel (5 SVG + input) |
| Menu 4 / Popover 2 | 6 | Radix DropdownMenu / Popover |
| Modal 3 / Dialog 1 / Drawer 2 | 6 | Radix Dialog (Drawer = yandan açılan varyantı) |
| Fade 6 / Collapse 1 | 7 | CSS transition |
| Tabs | 1 | Radix Tabs |
| Autocomplete | 1 | Radix Combobox |

**En ucuz 96'sı (Skeleton + CircularProgress) buradan çıkar** — önce onlar.

### Faz 3 — Formlar (en yüksek risk)

- `common/inputs/`: `FormikTextField`, `FormikDropdown`, `FormikPhoneNumberInput`, `FormikAutoComplete`, `OTPcomponent`
- 35 `TextField` kullanımı bu 5 sarmalayıcıdan geçiyor → sarmalayıcıları çevirmek 35 çağrı yerinin çoğunu halleder
- **Formik + Zod korunur.** react-hook-form'a geçiş ayrı bir karardır, bu ADR'nin kapsamı dışında — iki değişikliği aynı anda yapmak regresyonu teşhis edilemez kılar.
- Etkilenen akışlar: üyelik/giriş, adres defteri, checkout, iletişim. **Her biri elle uçtan uca test edilir.**

### Faz 4 — CMS blokları (paralelleştirilebilir, düşük risk)

21 blok + 13 `cms/shared` primitifi. Önce `shared` (`CMSImage`, `SectionBase`, `ShopBannerItem`, `BlogCard`, `InfoArea`, …), sonra bloklar.

Bloklar birbirinden bağımsız → sıra serbest, paralel gidilebilir.
**Ek kazanç:** Çoğu blok saf içerik. Geçerken `'use client'` kaldırılıp **Server Component**'e çevrilir → hydrate edilen ağaç bu fazda ciddi küçülür.

Değişmez: `componentMap` anahtarları, `cmsTypes.ts` imzaları.

### Faz 5 — Kabuk ve sayfalar

Sıra:

1. `layouts/MainLayout`, `Navigation` (+ `MegaMenu`, `CategoriesDrawer`, `MobileSearchOverlay`), `Footer` — **her sayfada var, en yüksek getiri**
2. Ana sayfa (`app/(shop)/page.tsx`) + `HeroContentBlock` → LCP'nin ölçüleceği yer
3. PDP (`product/[id]`) — `view.tsx` 649 satır / 63 MUI elemanı; ADR-0001'deki `DeferUntilVisible` ve ISR korunur
4. `ProductCard`, kategori, koleksiyon, arama (`SearchFilters`, `SearchSort`)
5. Sepet + checkout (`ShoppingCart/*`, `payment/PayTRPortal`) — **PayTR akışına dokunma, sadece stil**
6. Hesap sayfaları (`settings/*`, `orders/*`, `AddressCard`, `AddressSelector`)
7. Statik sayfalar (KVKK, sözleşmeler, hakkımızda, iletişim) — en kolay, en sona

`useMediaQuery` (22 kullanım / 5 dosya) bu fazda **silinir**, yerine Tailwind kırılımları gelir. Bu sadece stil değil davranış düzeltmesidir: JS ile cihaz dallanması SSR/hydration uyumsuzluğu kaynağıydı (ADR-0001'de PDP'de aynı sebeple `galleryViewport` silinmişti).

### Faz 6 — Emotion'ı sök

Ancak son `@mui` import'u gittikten sonra:

- `theme/ThemeRegistry.tsx`, `theme/EmotionCache.tsx`, `theme/theme.ts` sil
- `palette.ts` yalnızca CSS değişkeni üreten kaynağa indirgenir
- `CssBaseline` çıkar → **Tailwind preflight açılır** (görsel farkları burada bekle, baseline ile karşılaştır)
- Bağımlılık sil: `@mui/material`, `@mui/lab`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `@emotion/cache`
- `yarn analyze` ile bundle karşılaştır

### Faz 7 — Ölçüm ve deploy

1. **Staging'e** (Coolify preview) al, prod'a değil
2. Faz 0 baseline'ıyla aynı yöntemle **7 sayfa tipinin tamamı** yeniden ölçülür
3. §7.1'deki kabul kriterleri kontrol edilir
4. Uçtan uca manuel test: kayıt/giriş, sepete ekle, kupon, adres, **PayTR ödeme (gerçek test siparişi)**, sipariş görüntüleme, favoriler, arama, çerez onayı
5. Prod deploy → 5 dk edge cache bekle → ölçüm tekrarlanır
6. Search Console / CrUX: veri **haftalar sonra** gelir; mitenya trafik eşiğinin altında olduğu için saha verisi hiç gelmeyebilir. Karar lab verisiyle verilecek.

### 7.1 Kabul kriterleri

Ölçüm 7 sayfa tipinde yapılır: **ana sayfa · PDP · kategori · arama · sepet · blog listesi · blog detayı**. Tek sayfaya bakarak karar verilmez.

| # | Kriter | Nasıl ölçülür | Hedef |
|---|---|---|---|
| 1 | **Sayfa başına client JS** | `yarn analyze` + ağ transferi | Her sayfa tipinde **azalmış**; hiçbirinde artmamış |
| 2 | **Client komponent sayısı** | `grep -c "'use client'"` | 65 → **< 25** |
| 3 | **Inline CSS (HTML içi `<style>`)** | HTML byte ölçümü | 88 KiB → **~0** (harici, cache'lenen `.css`) |
| 4 | **Script evaluation** | PSI `bootup-time` | Her sayfa tipinde **azalmış** |
| 5 | **TBT** | PSI mobil, 10 koşu medyanı | 730 ms → **< 250 ms** |
| 6 | **INP** (etkileşim) | Lab + manuel (varyant seçimi, sepete ekle, filtre, mega menü) | Regresyon yok, tercihen iyileşme |
| 7 | **LCP alt-bölümü** — öğe oluşturma gecikmesi | PSI LCP dökümü, ana sayfa | 2.100 ms → **< 900 ms** |
| 8 | **CLS** | PSI, tüm sayfa tipleri | **0** korunur (regresyon kabul edilmez) |
| 9 | **`@mui` / `@emotion` bağımlılığı** | `package.json` | **Sıfır** |
| 10 | **`sx=` ve `styles.ts`** | grep | **Sıfır** |
| 11 | **Görsel eşdeğerlik** | 3 kırılımda baseline diff | Kasıtlı olmayan fark yok |
| 12 | **Testler** | `yarn test:run` | Faz 0'daki sayıdan **fazla** kırık test yok |

Kriter 1-4 ölçeklenebilirliği, 5-8 performansı, 9-12 sürdürülebilirliği ve regresyonsuzluğu ölçer. **Tek metrik başarı sayılmaz; 5-8 iyileşip 1-4 iyileşmediyse geçiş hedefine ulaşmamıştır.**

Not: Toplam LCP kasıtlı olarak kriter listesinde tek başına yok — tek koşuda ±723-899 ms gürültülüdür (Haziran 2026 ölçümü). Yerine alt-bölümü (kriter 7) ve onu üreten mekanizmalar (1-4) izlenir.

## 7. Her komponent için tanımlı bitiş (DoD)

- [ ] `@mui` import'u kalmadı
- [ ] `sx=` kalmadı, `styles.ts` silindi
- [ ] Renkler `--color-*` değişkenlerinden geliyor, hard-coded hex yok
- [ ] Mümkünse `'use client'` kaldırıldı
- [ ] 3 kırılımda ekran görüntüsü baseline ile karşılaştırıldı
- [ ] Varsa testi güncellendi
- [ ] Tek commit

## 8. Riskler

| Risk | Etki | Önlem |
|---|---|---|
| **Uzun ömürlü dal** (3-5 hafta) main'den sapar | Merge cehennemi | Haftalık rebase; geçiş süresince main'e sadece kritik fix |
| **Tek seferde büyük release** | Prod'da toplu regresyon | Staging'de tam doğrulama (Faz 7) — "prod'a en sonda" kuralı korunur ama körlemesine değil |
| Preflight açılınca görsel kayma | Her sayfada ufak farklar | Baseline ekran görüntüleri; preflight'ı Faz 6'da tek adımda aç |
| **Emotion katmansız CSS'i Tailwind'i eziyor** | Dönüşen sınıf sessizce etkisiz kalır — görsel hata, hata mesajı yok | §5.3 kuralına uy; dönüşmemiş MUI komponentine sınıf gerekiyorsa sarmalayıcı `<div>` kullan (konvansiyon.md §6). Faz 6'da kendiliğinden kalkar |
| Checkout / PayTR regresyonu | **Gelir kaybı** | Faz 3 ve 5.5'te gerçek test siparişi; ödeme mantığına dokunulmaz |
| Testler | 20 vitest testi **zaten kırık** (Upstash / supabaseProducts / hooks) | Geçişten önce kırıkları ayıkla ki yeni kırıklar ayırt edilebilsin |
| Geçiş yarım kalırsa | Bugünkünden **ağır** bundle | Ara durumda prod'a çıkılmaz — kural bu ADR'nin dayanağı |
| `704a18b2` chunk'ı küçülmez | Beklenti yönetimi | De-MUI o chunk'ı silmez, **yaptığı işi** azaltır. LCP 1 sn'ye inmez; en büyük tek kalem kalkar |

## 9. Kapsam dışı

- Formik → react-hook-form
- MUI v5 → v7 / Pigment CSS
- Tasarım değişikliği — geçiş **birebir görsel eşdeğerlik** hedefler, redesign değil
- ADR-0001'de kurulan ISR / webhook / `DeferUntilVisible` mimarisi (korunur)

## 10. Çalışma yöntemi

Bu ADR **büyük plan**. Her faz kod yazılmadan önce kendi küçük planına ayrıştırılır. Sıra istisnasız şu:

```
1. BÜYÜK PLAN     → bu doküman (ADR-0002). Bir kez yazılır, faz bitişlerinde güncellenir.
2. FAZ PLANI      → docs/migration/faz-N-<ad>.md
                    · dosya dosya envanter · dönüşüm kararları · sıra · riskler
                    · ONAY ALINMADAN KOD YAZILMAZ
3. KOMPONENT      → her komponent için checklist (§7 DoD) faz planında işaretlenir
   CHECKLIST
4. KOD            → tek komponent = tek commit. Toplu "hepsini çevirdim" commit'i yok.
5. REVIEW         → her faz sonunda `/code-review high`
                    · ayrıca görsel diff (3 kırılım, baseline karşılaştırması)
                    · review çıktısı faz planına "bulgular" olarak işlenir, sonra kapanır
6. ÖLÇÜM          → `scripts/perf-measure.mjs` → §7.1 tablosunun ilgili satırları
                    · **PROD BUILD ZORUNLU**: `yarn build` çıktısındaki First Load JS
                      okunur. Dosya/komponent sayısı gibi vekil metrikler YANILTIR —
                      Faz 2'de `'use client'` sayısı iyi görünürken paylaşılan bundle
                      227 -> 287 kB büyümüştü (barrel sızıntısı, bkz. perf-baseline §10).
                    · sayılar docs/perf-baseline.md'ye faz sütunu olarak eklenir
                    · bir metrik KÖTÜLEŞTİYSE sebebi bulunmadan faz kapanmaz
7. FAZ KAPANIŞI   → ADR-0002'de fazın durumu güncellenir, öğrenilenler yazılır
```

**Kural:** Bir faz tamamen kapanmadan bir sonraki faz başlamaz. Fazlar arası "yarım bırakıp devam" yok — birlikte yaşama kurallarının (§5) geçerliliği buna bağlı.

**Kural:** Faz planı yazılırken önce mevcut kod okunur, sonra plan çıkar. Tahminle plan yazılmaz; §3'teki envanter gibi her sayı ölçülür.

## 11. Kod ve mimari standartları

Bu bölüm bu geçişe özel değildir; **projedeki tüm yeni kod** için bağlayıcıdır.
Amaç "temiz görünen kod" değil, **merkezî kontrol**: her kararın tek bir yeri olsun,
değişiklik tek dosyadan yayılsın, kural dokümanda değil **mekanizmada** yaşasın.

### 11.0 Soyutlama testi (her yeni bileşen için)

Bir bileşen yazmadan önce tek soru sorulur:

> **Bu bileşen, değişebilecek bir KARARI saklıyor mu?**

| Tür | Saklar | Karar |
|---|---|---|
| **Semantik bileşik** (`ProductGrid`, `PageHeader`) | Tasarım kararı — tasarım değişince tek dosya düzenlenir | ✅ yaz |
| **Kısıtlayıcı primitif** (`Stack`, `Typography`) | Karar değil, **sözlük**: izinli değer kümesini daraltır, kaçak yolu kapatır | ⚠️ yalnızca kullanım yoğunsa (100+) ve sözlük gerçekten kısıtlıysa |
| **Anemik geçirgen** (`<Grid xs={6} md={3}>`) | Hiçbir şey — prop'u sınıfa çevirir | ❌ yazma |

**Rule of Three:** aynı somut düzen/desen 3+ yerde tekrar ediyorsa isimlendirilmiş bileşene çıkarılır. 2 kez tekrar = henüz desen değil.

**İsim mekanizmayı değil niyeti anlatır.** `ProductGrid` ✅ · `TwoColGrid` ❌.

### 11.1 Tek kaynak (merkezî kontrol)

Her tanım **tam olarak bir yerde** yaşar. Aynı bilgi iki yerde duruyorsa, ikisi zamanla ayrışır.

| Karar | Tek yeri | Kopyalanması yasak |
|---|---|---|
| Renk / gradyan | `theme/palette.ts` → `yarn tokens` | Hard-coded hex, ikinci palet dosyası |
| Kırılım | `theme.ts:breakpoints` → `@theme` | Elle yazılmış `@media` |
| Ölçek (boşluk) | konvansiyon.md §1 (MUI×2) | Gelişigüzel `p-[13px]` |
| Bileşen varyantı | komponentin yanındaki `variants.ts` (`cva`) | Çağrı yerinde koşullu class dizisi |
| Düzen deseni | semantik bileşen | Kopyalanmış `grid-cols-*` zinciri |
| CMS sözleşmesi | `cmsTypes.ts` + `componentMap` | — |

**Kural: sapma sessiz olmamalı.** Üretilen şeyin doğrulayıcısı olur (`generate-tokens.mjs` çakışma ve değer uyuşmazlığında **hata fırlatıyor**). Yeni bir "tek kaynak" eklendiğinde doğrulayıcısı da eklenir.

### 11.2 Bağımlılık yönü

```
components/ui/**      → yalnızca lib/utils, React, Radix     (domain bilmez)
components/<domain>/  → components/ui/**                     (ters yön YASAK)
app/**                → her ikisi
lib/**                → hiçbir komponent import etmez
```

`ui/` hiçbir zaman `contexts/`, `lib/api/`, CMS tiplerini import etmez. Ederse primitif olmaktan çıkar, taşınamaz hâle gelir.

### 11.3 Dağınıklık yasağı (colocation)

- Varyantlar komponentin **yanında** (`Foo/variants.ts`), uzakta bir tema dosyasında değil.
- Bir komponentin stili başka bir komponentin dosyasında tanımlanmaz. (Geçiş sırasında oluşan `infoItemClass` gibi yerel haritalar **borçtur**, `TODO(faz-N)` ile işaretlenir.)
- Tek kullanımlık yardımcı, kullanıldığı dosyada kalır; `utils/` çöplüğe çevrilmez.

### 11.4 Sözleşme

- Prop arayüzü **dar ve açık**. `any` yok, `...rest` yayılımı yok, `slotProps` gibi "her şeyi geçir" kapıları yok.
- **Kompozisyon > konfigürasyon:** boolean prop yığını yerine `children`/slot. `isCompact + isSmall + hasBorder` üçlüsü görünce dur.
- Stil geçirgen prop'ları (`labelClassName`, `valueClassName`) **son çare**. İki taneyi geçtiğinde bileşen ya varyanta ya slot'a dönüşmelidir.
- Sunum ile veri çekme ayrı. Komponent kendi verisini çekmez.
- 150 satırı geçen komponent bölünür.

### Server-first

- **Varsayılan Server Component.** `'use client'` bir *karardır*, gerekçesi commit mesajında belirtilir.
- `'use client'` yalnızca şunlar için: state, effect, event handler, browser API, context tüketimi.
- Client sınırı **mümkün olan en yaprak noktaya** itilir. Bir butonun interaktif olması, sayfanın client olmasını gerektirmez.
- Interaktif ada, statik içeriği `children` (slot) olarak alır — böylece içerik server'da kalır.

### Komponent sözleşmesi

- Her komponentin **açık, dar bir prop arayüzü** olur. `any`, `...rest` yayılımı ve "her şeyi geçir" desenleri yok.
- Sunum (presentational) ve veri çekme ayrılır. Komponent kendi verisini çekmez; veri sayfadan/loader'dan iner. (ADR-0001'de PDP'de yapılan ayrımın aynısı.)
- Bir komponent bir iş yapar. 649 satırlık `view.tsx` tekrar üretilmez — 150 satırı geçen komponent bölünür.
- Bileşenler **kompozisyonla** kurulur, boolean prop yığınıyla değil (`isCompact` + `isSmall` + `variant` üçlüsü yerine tek `variant`).

### Stil

- Renk, aralık, tipografi, kırılım: **yalnızca token'lardan** (`--color-*`, Tailwind `@theme`). Hard-coded hex / px yok.
- Varyantlar `cva` ile **tek yerde** tanımlanır; çağrı yerlerinde uzun koşullu class stringi kurulmaz.
- Uzun utility zincirleri okunabilirlik sınırını aşarsa komponent bölünür — `cn()` ile 15 class'ı tek satıra dizmek çözüm değil.
- Responsive **CSS ile** yapılır. `useMediaQuery` ile dallanma yasaktır (§Faz 5).

### Erişilebilirlik

- Semantik HTML önce gelir: `<button>`, `<nav>`, `<h1..h6>`, `<ul>`. `div`+`onClick` yok.
- Radix'in verdiği focus trap / aria / klavye desteği **elle geçersiz kılınmaz**.
- Görsellerde `alt`, formlarda `<label>` bağlantısı zorunlu.

### Performans

- Yeni bağımlılık eklemek **karardır**: neden gerektiği ve bundle etkisi faz planında yazılır.
- Görseller `aspect-ratio` ile rezerve edilir (CLS 0 korunacak).
- Below-fold ağır bloklar `DeferUntilVisible` ile ertelenir (ADR-0001'deki mevcut mekanizma).
- Her faz sonunda `yarn analyze` çalıştırılır; bundle **büyüdüyse** gerekçesi yazılır.

### Adlandırma ve yapı

- Klasör deseni korunur: `ComponentName/index.tsx`. `styles.ts` **silinir**, yerine hiçbir şey gelmez (class'lar `index.tsx` içinde ya da `cva` tanımında).
- Paylaşılan primitifler `components/ui/` (shadcn deseni, kod bizim), domain komponentleri mevcut yerlerinde kalır.
- Türkçe iş terimleri (kupon, kargo, sipariş) kod içinde İngilizce; kullanıcıya görünen metinler Türkçe.

### Test

- Geçiş öncesi **20 kırık vitest testi ayıklanır** (§8) — yoksa yeni kırıklar ayırt edilemez.
- Testler DOM yapısına değil, kullanıcı görünür davranışına bağlanır (`getByRole`, `getByLabelText`) — böylece stil değişimi testi kırmaz.
- Kritik akışlar (checkout, auth, adres) için testler geçişten **önce** yazılır, sonra değil.

### Commit

- Tek satır, kısa, İngilizce.
- Bir komponent = bir commit. Karışık commit yok (stil + mantık aynı commit'te olmaz).
