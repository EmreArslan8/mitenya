# Faz 0 — Altyapı

**Üst plan:** [ADR-0002](../adr/0002-mui-to-tailwind-migration.md)
**Durum:** Kısmen uygulandı (2026-09-08) — dal: `refactor/tailwind-migration`

| Görev | Durum |
|---|---|
| F0.1 Kırık testler | ⏸️ **Sona bırakıldı** (kullanıcı kararı: testler geçişin sonunda) |
| F0.2 Komponent testleri | ⏸️ **Sona bırakıldı** (aynı karar) |
| F0.3 Görsel baseline | ⛔ Playwright kararı bekliyor |
| F0.4 Performans baseline | 🟡 Kısmi — bağımlılıksız metrikler alındı (`docs/perf-baseline.md`), PSI kısmı anahtar bekliyor |
| F0.5 Tailwind v4 kurulumu | ✅ |
| F0.6 Token köprüsü | ✅ |
| F0.7 Breakpoint eşleştirmesi | ✅ |
| F0.8 `cn()` + cva | ✅ |

⚠️ **Testler sona bırakıldığı için Faz 1-5 boyunca otomatik regresyon koruması YOK.** Bu bilinçli bir karar; bedeli, her fazın elle doğrulanması ve görsel baseline'ın (F0.3) daha da kritik hale gelmesi.
**Tahmini süre:** 2-3 gün
**Kural:** Bu fazda **görünen hiçbir şey değişmez.** Tek bir MUI komponenti bile dönüştürülmez.

---

## Faz 0 neyi garanti eder

Geçişin geri kalanı bu fazın kurduğu üç şeye dayanıyor:

1. **Ölçüm** — sonradan uydurulamayan sayısal ve görsel baseline
2. **Emniyet ağı** — regresyonu yakalayacak testler
3. **Tek kaynaklı token'lar** — iki stil sistemi aynı renkleri okusun, pixel kayması olmasın

Bunlar olmadan Faz 1'e başlamak, 3-5 hafta sonra "iyileşti mi kötüleşti mi" sorusunu cevapsız bırakır.

---

## Ön keşif bulguları (2026-09-08, ölçüldü)

Plan yazılırken kodda üç şey doğrulandı; ikisi planı değiştirdi:

### 🔴 Bulgu 1 — Komponent testi **sıfır**

22 test dosyasının **tamamı** `src/lib/**` altında. `*.test.tsx` sayısı: **0**. `vitest.config.ts:coverage.include` da yalnızca `src/lib/**/*.ts`.

**Sonuç:** 171 dosyalık bir UI yeniden yazımına, UI regresyonunu yakalayacak **hiçbir otomatik korumasız** giriyoruz. Bu, ADR §8'de yazdığımdan daha ciddi. Faz 0'a **F0.2** (komponent test altyapısı) eklendi.

### 🔴 Bulgu 2 — Global CSS dosyası **yok**

`src/` altında 2 adet `*.module.css` var (PDP perf çalışmasından), ama **global stylesheet yok**. Tüm reset/baseline MUI `CssBaseline`'dan geliyor, `<body>` stili bile `app/layout.tsx`'te inline (`style={{ overflowX: "hidden" }}`). `postcss.config.*` de yok.

**Sonuç:** Tailwind'i kuracak boru hattı sıfırdan kurulacak (F0.5). Ayrıca `CssBaseline` sökülünce (Faz 6) kaybolacak reset'in yerini Tailwind preflight alacak — bu yüzden preflight'ın kapalı kalması Faz 6'ya kadar zorunlu.

### 🟡 Bulgu 3 — Token köprüsünde tuzak

`theme/theme.ts` renkleri **hex string olarak birleştiriyor**:

```ts
// theme.ts:163
background: `${palette.secondary.main}10`,   // hex + alpha eki
// theme.ts:174
color: `${(palette as any)[color].main}80`,
```

`palette.main` değeri `var(--color-...)` yapılırsa bu satırlar sessizce bozulur (`var(--x)10` geçersiz renk). MUI'nin `augmentColor`/kontrast hesapları da gerçek hex ister.

**Sonuç:** Köprü **tek yönlü** olacak — `palette.ts` hex kaynağı olarak kalır, CSS değişkenleri **ondan üretilir** (F0.6). MUI hex okumaya devam eder, Tailwind değişken okur, değerler aynı yerden gelir.

---

## Görev listesi

Sıra bağlayıcı: F0.1 → F0.2 → F0.3/F0.4 (paralel) → F0.5 → F0.6 → F0.7 → F0.8 → F0.9

---

### F0.1 — Kırık testleri ayıkla

**Mevcut durum (ölçüldü):** `20 failed / 272 passed`, 6 dosya:

| Dosya | Kırık |
|---|---|
| `src/lib/hooks/hooks.test.ts` | dosya seviyesinde çöküyor (import/collect hatası) |
| `src/lib/api/supabaseProducts.test.ts` | 8 |
| `src/lib/cache/filterCache.test.ts` | 8 |
| `src/lib/api/rateLimit.test.ts` | 2 (Upstash) |
| `src/lib/constants/shop.test.ts` | 1 |
| `src/lib/utils/utils.test.ts` | 1 (`formatPrice` TRY) |

**Not:** Hepsi `lib` testi — **hiçbiri UI değil**, yani geçişin doğrudan dokunacağı yerler değil. Ama "kırık test normaldir" durumu sürerse, geçişin kırdığı ilk gerçek test de gözden kaçar.

**Yapılacak:**
- Her birinin sebebi teşhis edilir (env eksikliği mi, gerçek regresyon mu, eskimiş mock mu)
- Ucuz olanlar düzeltilir
- Düzeltmesi Faz 0'ı uzatacak olanlar `it.skip` + `// TODO(migration): sebep` ile **karantinaya** alınır
- **Hedef: `yarn test:run` yeşil.** Bundan sonra kırılan her test geçişin sorumluluğudur.

**Karar gerekiyor:** Düzeltme mi, karantina mı? Önerim: 30 dakikada çözülmeyen karantinaya, çünkü Faz 0'ın amacı test borcunu kapatmak değil, **sinyali temizlemek**.

---

### F0.2 — Komponent test altyapısı (Bulgu 1 nedeniyle eklendi)

Altyapı zaten hazır: `vitest` + `jsdom` + `@testing-library/react` + `jest-dom` kurulu, `include` `.tsx` kapsıyor. Eksik olan tek şey: yazılmış test.

**Yapılacak:**
- `vitest.config.ts` → `coverage.include`'a `src/components/**/*.tsx` eklenir
- Geçişin dokunacağı **en kritik interaktif yüzeyler** için duman testleri yazılır (baseline davranış):

| Test | Neyi korur |
|---|---|
| `common/Button` | 4 varyant render + disabled + onClick |
| `QuantitySelector` | artır/azalt/sınır davranışı |
| `ShoppingCart/ShoppingCartButton` | sepet sayacı, açılış |
| `common/inputs/FormikTextField` | hata mesajı, label bağlantısı |
| `Navigation` | menü açılır, linkler doğru href |
| `CookieConsent/CookieConsentBanner` | kabul/ret state'i |

**Kural (ADR §11):** Testler DOM yapısına değil davranışa bağlanır — `getByRole`, `getByLabelText`. `.MuiButton-root` gibi selector kullanılırsa test geçişte kırılır ve işe yaramaz.

Bu 6 test kapsamlı bir suite değil; **geçişin en çok kıracağı yerlerde alarm** kurmak için. Faz 3 ve 5'te akışa özel testler eklenecek.

---

### F0.3 — Görsel baseline

**Yapılacak:**
- `playwright` **devDependency** olarak eklenir (prod bundle'a etkisi yok; 3-5 hafta boyunca her faz sonunda çalışacağı için elle ekran görüntüsü almak sürdürülemez)
- `scripts/visual-baseline.mjs` → 7 sayfa tipi × 3 kırılım = **21 ekran görüntüsü**

| Sayfa tipi | URL |
|---|---|
| Ana sayfa | `/` |
| PDP | `/product/celimax-retinol-shot-tightening-serum-30ml` |
| Kategori | `/category/<sabit-slug>` |
| Arama | `/search?q=serum` |
| Sepet | `/cart` (1 ürün eklenmiş durumda) |
| Blog listesi | `/blogs` |
| Blog detayı | `/blog/<sabit-slug>` |

Kırılımlar: **390** (mobil) · **768** (tablet) · **1440** (masaüstü)

- Çıktı: `docs/visual-baseline/<sayfa>-<genişlik>.png`
- Tam sayfa (`fullPage: true`), animasyonlar dondurulmuş, lazy görseller için scroll-to-bottom
- Karşılaştırma **staging/prod'a karşı değil, lokal build'e karşı** yapılır ki CMS içerik değişikliği fark üretmesin

**Not:** Blok/kategori slug'ları sabitlenecek — Strapi'de içerik değişirse baseline yanıltır. Seçilen slug'lar bu dosyaya yazılır.

---

### F0.4 — Performans baseline

**Yapılacak:** `scripts/perf-measure.mjs` — ADR §7.1 tablosunu üreten tek komut.

Ölçtükleri:

| Metrik | Kaynak |
|---|---|
| LCP / TBT / CLS / FCP / SI + **LCP alt-bölüm dökümü** | PSI API, mobil, **10 koşu medyanı** |
| Script evaluation, bootup-time (script bazında) | PSI `bootup-time` |
| Sayfa başına JS transfer + istek sayısı | PSI `resource-summary` |
| HTML boyutu + **inline `<style>` byte'ı** | doğrudan `curl` + parse |
| `'use client'` sayısı | `grep -rc` |
| `sx=` / `styles.ts` sayısı | `grep` |
| Bundle paket dağılımı | `ANALYZE=true yarn build` çıktısı parse |

- Çıktı: `docs/perf-baseline.md` — sayfa tipleri satır, fazlar **sütun**. Her faz sonunda yeni sütun eklenir, böylece trend görünür.
- 10 koşu ve medyan zorunlu: tek koşu ±723-899 ms gürültülü (Haziran 2026 ölçümü).
- PSI cache'i için koşular arası bekleme konur (Haziran'da 5 çağrının 4'ü cached geldi).

**Blokaj:** **PSI API anahtarı gerekiyor.** Anahtarsız çağrı bugün `429` döndü. Ücretsiz, 25k/gün. Haziran'da alınan anahtar sohbette açığa çıktığı için yenisi alınmalı ve IP/referrer ile kısıtlanmalı. Anahtar `.env.local`'a (`PAGESPEED_API_KEY`), **repoya değil**.

---

### F0.5 — Tailwind v4 kurulumu

**Neden v4:** CSS-first config (`@theme`), token'ları F0.6'daki CSS değişkeni yaklaşımıyla doğal uyum, `tailwind.config.js` JS dosyasına ihtiyaç yok.

**Yapılacak:**
- `yarn add -D tailwindcss@4 @tailwindcss/postcss`
- `postcss.config.mjs` **oluşturulur** (şu an yok)
- `src/app/globals.css` **oluşturulur** (şu an yok) ve `app/layout.tsx`'te import edilir
- **Preflight KAPALI:** `@import "tailwindcss"` yerine katmanlar ayrı alınır — `theme.css` + `utilities.css` alınır, `preflight.css` **alınmaz**. Gerekçe: MUI `CssBaseline` ile çakışır (ADR §5.2). Faz 6'da `CssBaseline` sökülürken açılacak; bu dosyada `TODO(faz-6)` yorumu bırakılır.
- `next build --turbopack` ile uyum doğrulanır

**Doğrulama:** Tek bir throwaway `<div className="bg-red-500">` ile çalıştığı görülür, sonra **geri alınır**. Faz 0'dan görünür değişiklik çıkmaz.

---

### F0.6 — Token köprüsü (fazın en kritik adımı)

**Kaynak:** `src/theme/palette.ts` — 192 satır, **20 token grubu**, **111 hex**, **27 gradient**
Gruplar: `primary, primaryDark, bg, blue, info, green, success, successVivid, accentRed, error, warning, secondary, gray, tertiary, neutral, text, white, gradient` (+ `logo`, `logoWhite` — bunlar renk değil, asset; **dışarıda bırakılır**)

**Yön (Bulgu 3 nedeniyle tek yönlü):**

```
palette.ts (hex — TEK KAYNAK)
       │
       ├──► MUI createTheme        → hex okumaya devam eder (hex+alpha birleştirmeleri bozulmaz)
       │
       └──► scripts/generate-tokens.mjs
                    │
                    └──► globals.css  @theme { --color-primary: #111111; ... }
                                       → Tailwind buradan okur
```

**Yapılacak:**
- `scripts/generate-tokens.mjs`: `palette.ts` → `globals.css` içindeki `@theme` bloğu (üretilen bölge `/* GENERATED — do not edit */` işaretleri arasında)
- Adlandırma: `primary.main` → `--color-primary`, `primary.light` → `--color-primary-light`, `text.disabled` → `--color-text-disabled`
- 27 gradient → `--gradient-*` değişkenleri
- `yarn tokens` script'i eklenir; `palette.ts` değişince yeniden çalıştırılır
- **Doğrulama:** üretilen 111 değişkenin değeri `palette.ts`'teki hex ile birebir eşleşiyor mu — script kendi kendini test eder

**Yasak:** `palette.ts` içindeki hex'leri `var(--...)` ile değiştirmek. `theme.ts:163` ve `:174` sessizce bozulur.

---

### F0.7 — Breakpoint eşleştirmesi

MUI'nin **özel** değerleri (`theme.ts:91-99`) Tailwind varsayılanlarından farklı — birebir taşınmazsa tüm responsive davranış kayar:

| | MUI | Tailwind varsayılan | **Kullanılacak** |
|---|---|---|---|
| xs | 0 | — | taban (prefix yok) |
| sm | 600 | 640 | **600** |
| md | 1000 | 768 | **1000** |
| lg | 1200 | 1024 | **1200** |
| xl | 1920 | 1280 | **1920** |

`globals.css` `@theme` içine: `--breakpoint-sm: 600px;` …

**Tuzak — yön farkı:** MUI'de `theme.breakpoints.down('md')` = `max-width: 999.95px`. Tailwind mobile-first, yani `md:` = `min-width: 1000px`. Dönüşüm mekanik değildir:

```
MUI  down('md')  →  Tailwind: taban stil + md: ile ezme (mantık TERSİNE çevrilir)
MUI  up('md')    →  Tailwind: md:
```

21 `theme.breakpoints` kullanımı (5 dosya) Faz 5'te bu tabloya göre çevrilecek. Tablo burada kalır.

---

### F0.8 — Yardımcılar

- `yarn add clsx tailwind-merge class-variance-authority`
- `src/lib/utils/cn.ts` → `cn()` (clsx + twMerge)
- `cva` konvansiyonu belirlenir: varyantlar komponentin yanında `variants.ts`'te, çağrı yerinde koşullu string kurulmaz (ADR §11)

`class-variance-authority` prod bağımlılığıdır ama çalışma zamanı maliyeti ihmal edilebilir (~1 KB); Emotion'ın yerine geçtiği için net kazanç.

---

### F0.9 — Faz kapanışı

- `yarn build` geçer
- `yarn test:run` **yeşil**
- 21 görsel baseline alınmış, `docs/visual-baseline/` altında
- `docs/perf-baseline.md` 7 sayfa tipi için dolu
- `docs/perf-baseline.md`'ye Faz 0 sütunu eklenir → **Tailwind kurulumu bundle'ı büyütmedi** kanıtlanır (henüz tek class kullanılmadığı için CSS ~0 olmalı)
- ADR-0002'de Faz 0 durumu güncellenir

---

## Faz 0 DoD

- [ ] `yarn test:run` yeşil (karantinalar `TODO(migration)` ile işaretli)
- [ ] 6 komponent duman testi yazıldı, role-based selector kullanıyor
- [ ] 21 görsel baseline üretildi
- [ ] `docs/perf-baseline.md` 7 sayfa × §7.1 metrikleri ile dolu
- [ ] Tailwind v4 kurulu, preflight **kapalı**, `TODO(faz-6)` notu var
- [ ] `globals.css` üretilmiş 111 renk + 27 gradient + 4 breakpoint değişkeni içeriyor
- [ ] `yarn tokens` çalışıyor, çıktı `palette.ts` ile birebir doğrulandı
- [ ] `cn()` + cva konvansiyonu yazılı
- [ ] **Görsel diff: sıfır fark** (Faz 0'ın tanımı bu)
- [ ] `/code-review high` temiz
- [ ] Faz 0 sütunu `docs/perf-baseline.md`'ye eklendi

---

## Riskler

| Risk | Önlem |
|---|---|
| Tailwind v4 + turbopack uyumsuzluğu | F0.5'te erken doğrulanır; sorun çıkarsa v3 + `tailwind.config.ts`'e düşülür (token yaklaşımı aynı kalır) |
| Preflight yanlışlıkla açık kalır | F0.9 görsel diff'i bunu yakalar — sıfır fark kriteri tam olarak bunun içindir |
| `generate-tokens` ile `palette.ts` zamanla ayrışır | Script kendi doğrulamasını yapar; `yarn tokens` her palette değişikliğinde çalışır |
| PSI anahtarı gecikirse baseline alınamaz | Faz 0 **bloke olur** — F0.4 opsiyonel değildir. Anahtar ilk gün alınmalı |
| Playwright kurulumu (tarayıcı indirmesi) CI'da yavaş | Baseline lokalde üretilir, CI zorunluluğu yok |

---

## Cevap bekleyen sorular

1. **PSI API anahtarı** — yenisini alıp `.env.local`'a koyacak mısın? F0.4 buna bağlı, faz bloke.
2. **Kırık 20 test** — düzeltme mi, karantina mı? (Önerim: 30 dk'yı aşan karantinaya.)
3. **Playwright** devDependency olarak eklensin mi, yoksa görsel baseline'ı MCP tarayıcı araçlarıyla elle mi alalım? (Önerim: Playwright — 3-5 hafta boyunca her faz sonunda tekrarlanacak.)

---

## Açık bulgular (geçişle ilgisiz, kapanmadı)

Faz 0 doğrulaması sırasında bulundu. **İkisi de bu geçişin sebep olduğu şeyler değil** — `globals.css` import'u kaldırılıp test edildi, hatalar aynen duruyor. Sunucudan iki kez çekilen HTML birebir aynı, yani SSR kararlı.

### B1 — `ShopBanner` çakışan `key={null}` (kök neden kesin)

`src/components/cms/blocks/ShopBanner/index.tsx:91` → `key={banner.url}`.
Ana sayfa CMS verisinde **iki banner'ın `url` alanı `null`** → ikisi de `key={null}` alıyor → React "two children with the same key `null`" hatası (her yüklemede 3 kez).

Önemi: çakışan key React'in çocukları atlamasına/kopyalamasına yol açar ve bu blok **LCP elemanının bulunduğu hero carousel'i**. Düzeltme tek satır (kararlı bileşik anahtar). Aynı payload'da `shop-info-areas` ve `shop-brands` bloklarında da null url var ama onlar `key={index}` kullandığı için etkilenmiyor.

### B2 — Footer hydration uyuşmazlığı (kök neden BULUNMADI)

`NotFoundError: removeChild ... clearHydrationBoundary`, iz `Footer > Grid > MuiStack` zincirini gösteriyor; farklı olan düğüm `mui-1wml595-MuiStack-root` — bu sınıf **yalnızca client'ta** üretilmiş.

Elenen hipotezler:
- ❌ `useMediaQuery` (Footer:28-29) — MUI'nin varsayılanı SSR-güvenli: ilk client render'ında da `false` döner, gerçek değeri effect'te alır. Hydration'ı bozmaz, sadece mount sonrası yeniden çizim (titreme) yapar.
- ❌ `useIsMobileApp` (Footer:24) — `useState(false)` + effect, güvenli.
- ❌ Sunucu tarafı değişkenlik — iki SSR isteği birebir aynı.

Kalan şüpheli: Emotion'ın sunucu/client'ta farklı sınıf adı üretmesi, muhtemelen `useStyles()`/`withPalette` zinciri. **Kanıtlanmadı.** Hata aralıklı; 500 px ve varsayılan genişlikte tekrar üretilemedi.

Not: Footer Faz 5'te zaten yeniden yazılacak. Uyuşmazlık o zaman kendiliğinden kalkabilir — ama kök neden bilinmeden kalkarsa, aynı desen başka yerde tekrar eder. Faz 5'e girmeden önce bir kez daha bakılmalı.
