# Faz 1 — Primitifler

**Üst plan:** [ADR-0002](../adr/0002-mui-to-tailwind-migration.md) · **Önceki:** [Faz 0](./faz-0-altyapi.md)
**Durum:** Uygulanıyor (2026-09-08) — dal `refactor/tailwind-migration`

| Görev | Durum |
|---|---|
| F1.1 Ölçek eşleştirmesi | ✅ `docs/migration/konvansiyon.md` |
| F1.2 `Stack` | ✅ server component |
| F1.3 `Typography` | ✅ 21 varyant; MUI varsayılanları `createTheme()` çalıştırılarak okundu |
| F1.4 `Button` | ✅ 4 varyant × 5 renk matrisi + `loading` düzeltildi |
| F1.5 `Link`, `Divider` | ✅ (`Link` artık **server component**) |
| F1.5 `Card` | ⛔ **Faz 2'ye ertelendi** — içinde MUI `Accordion` var, Radix gerektiriyor |
| F1.6 Barrel + konvansiyon | ✅ |
| F1.7 Pilot dilim | ✅ 2. pilot (`InfoArea`) iki kırılımda ölçümle doğrulandı |
| Ölü kod temizliği | ✅ 10 komponent, ~790 satır silindi |
**Tahmini süre:** 3-4 gün

---

## Kapsam düzeltmesi (ADR §Faz 1'i güncelliyor)

ADR'de "Faz 1 çıktısı: salt-stil kullanımın ~%70'i geçmiş olur" yazmıştım. **Envanter bunu yanlışladı:**

| | Toplam | `sx` ile | `sx`'siz |
|---|---|---|---|
| `<Stack>` | 808 | **546** | 262 |
| `<Typography>` | 569 | **468** | 101 |

Kullanımların **~%70'i `sx` taşıyor.** `sx` bir stil sözleşmesi değil, serbest CSS objesi — hiçbir şim onu otomatik çeviremez, her biri elle dönüştürülmeli. Dolayısıyla:

> **Faz 1 primitifleri İNŞA eder ve doğrular. Çağrı yerlerini dönüştürmez.**
> Çağrı yeri dönüşümü, o komponentin `sx`'leriyle birlikte Faz 4/5'te yapılır.

Bunun sonucu: **Faz 1 sonunda ölçüm metrikleri neredeyse hiç değişmeyecek.** Bu bir başarısızlık değil, fazın tanımı. Gerçek düşüş Faz 4-5'te gelir. Bunu şimdi yazıyorum ki faz sonunda "işe yaramadı mı?" sorusu çıkmasın.

Buna karşılık Faz 1, primitiflerin gerçekten işe yaradığını kanıtlamadan kapanmaz — bkz. **F1.7 pilot dikey dilim**.

---

## Ölçülen girdi

```
<Stack> propları:      sx 546 · gap 232 · direction 153 · alignItems 143 ·
                       justifyContent 60 · onClick 23 · component 15 · p/px/width/flex...
<Typography> propları: sx 468 · variant 124 · component 74 · color 42 ·
                       fontWeight 32 · fontSize 17 · textAlign 12
Typography variantları: 18 farklı — body2 25, caption 23, h2 14, cardTitle 11, body 8,
                       h6 6, overline 5, warningSemibold 5, infoLabel 5, h1 4, infoValue 4,
                       h5 3, h4 2, h3 2, subtitle1/2, warning 2, body1
Button:                53 dosya · variant 89 (contained 46 / outlined 23 / text 11 / tonal 5)
                       size 58 (small 39, large 2) · color 31 (neutral/primary/error/tertiary/secondary)
                       onClick 62 · sx 41 · disabled 21 · startIcon 17 · loading 16 · href 12 · arrow 12
```

---

## Görevler

### F1.1 — Ölçek eşleştirmesi (önce bu, yoksa her şey kayar)

MUI `spacing` birimi **8px** (theme.ts'te override yok → varsayılan). Tailwind v4 `--spacing` **4px**.

| MUI | px | Tailwind |
|---|---|---|
| `gap={0.5}` | 4 | `gap-1` |
| `gap={0.75}` | 6 | `gap-1.5` |
| `gap={1}` | 8 | `gap-2` |
| `gap={2}` | 16 | `gap-4` |
| `gap={3}` | 24 | `gap-6` |
| `gap={5}` | 40 | `gap-10` |

**Kural: MUI değeri × 2 = Tailwind değeri.** Aynısı `p`, `px`, `m`, `mt` için geçerli.
`shape.borderRadius: 8` → `rounded-lg`.

Bu tablo `docs/migration/` altında kalır; Faz 4-5'te her `sx` dönüşümünde referans alınır.

### F1.2 — `<Stack>` (server, sıfır runtime)

`src/components/ui/Stack/index.tsx` — MUI'nin **yapısal** proplarını birebir karşılar, `sx` KARŞILAMAZ:

```tsx
type StackProps = {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  gap?: SpacingToken;              // F1.1 ölçeği
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  as?: 'div' | 'section' | 'ul' | 'li' | 'nav' | 'header' | 'footer';
  className?: string;
  children?: React.ReactNode;
};
```

Kararlar:
- **`sx` yok.** Bilinçli: `sx` kabul eden bir şim, Emotion'ı geri getirmenin kapısıdır. Ek stil `className` ile gelir.
- **`alignItems`/`justifyContent` → `align`/`justify`** olarak kısaltıldı. MUI adlarını korumak mekanik dönüşümü kolaylaştırırdı ama `justifyContent="space-between"` → `justify="between"` eşlemesi zaten elle yapılacak; yarım taklit yerine temiz API.
- `component` → `as` (React konvansiyonu).
- Server component — `'use client'` **yok**. `onClick` alan 23 kullanım bu şimi kullanamaz; onlar zaten interaktif ada, kendi client sarmalayıcılarını alacak.

### F1.3 — `<Typography>` (kendi primitifimiz) (Typography yerine)

`src/components/ui/Typography/index.tsx` + `variants.ts` (cva).

18 varyantın tamamı `theme.ts:474-560`'tan **birebir** taşınır — px ve lineHeight değerleri dahil, responsive olanların `sm:` kırılımıyla:

```
h1          700 / 24px / 29px      → sm: 28px / 34px
h2          700 / 18px / 22px      → sm: 20px / 24px
h3          700 / 16px / 20px      → sm: 18px / 22px
cardTitle   700 / 14px / 16.8px
body        500 / 16px / 20px
warning     400 / 15px / 20px
warningSemibold 500 / 15px / 20px
infoLabel   400 / 14px / 16.8px    → sm: 15px / 18px
infoValue   600 / 15px / 19px      → sm: 16px / 20px
progressLabel / progressLabelBold / progressNumber  (13-14px)
+ MUI'nin kendi varyantları: body1, body2, caption, overline, subtitle1, subtitle2, h4, h5, h6
```

**Dikkat:** son gruptaki `body2`(25) ve `caption`(23) MUI'nin **varsayılan** değerlerini kullanıyor — theme.ts'te override edilmemişler. Gerçek px değerleri çalışan sayfadan `getComputedStyle` ile okunup sabitlenecek; MUI varsayılanına güvenip tahmin yazılmayacak.

`as` propu semantiği belirler (`variant="h2"` + `as="h3"` mümkün) — mevcut 74 `component=` kullanımının karşılığı.

### F1.4 — `<Button>`

`src/components/ui/Button/` — `variants.ts` (cva) + `index.tsx`.

- 4 varyant × 5 renk × 3 boyut matrisi `theme.ts:126-236`'dan taşınır (hover/disabled/focus durumları dahil)
- Mevcut davranış korunur: `dataLayerEventId` → GA olayı, `href` → `router.push`, `arrow` → Chevron ikonu
- `'use client'` **kalır** — `onClick` + router kullanıyor (62 çağrı yerinde `onClick` var)

**İki düzeltme:**

1. **`props: any` gidiyor.** Mevcut imza `({ ...props }: any)` — ADR §11'e aykırı. Ölçülen gerçek kullanım (variant/color/size/onClick/disabled/startIcon/endIcon/href/target/type/arrow/dataLayerEventId/loading/className) tiplenecek.
2. **`loading` propu bugün SESSİZCE YOK SAYILIYOR.** `index.tsx:22` → `loading: _loading` diye destructure edilip hiç kullanılmıyor. **16 çağrı yeri** yükleniyor durumu gösterdiğini sanıyor, göstermiyor. (`@mui/lab` bağımlılıkta duruyor — muhtemelen eskiden `LoadingButton` kullanılıyordu.) Yeni Button'da gerçekten uygulanacak: spinner + `disabled` + `aria-busy`.

Bu ikincisi geçişten bağımsız bir hata; bu fazda düzeltilmesi doğru çünkü Button zaten baştan yazılıyor.

### F1.5 — Küçük primitifler

`Card` (34), `Divider` (35), `Link` (37) → `components/ui/` altına, düz HTML + token'lar.
`Box` (280) için **şim yazılmaz** — düz `<div className>`'e dönüşür, ayrı bir komponente gerek yok.
`Grid` (72) için de şim yazılmaz — Tailwind `grid`/`flex` utility'leri doğrudan kullanılır. MUI Grid'in 12 sütunlu `item xs={6} md={3}` API'si Faz 4-5'te `grid-cols-*` ile değiştirilecek; taklit edilmesi yeni bir soyutlama borcu olur.

### F1.6 — Barrel ve konvansiyon

- `src/components/ui/index.ts` — tek import noktası
- `docs/migration/konvansiyon.md`: cva nerede durur, `cn()` ne zaman kullanılır, `as` propu, className sırası

### F1.7 — Pilot dikey dilim (fazın kabul kanıtı)

Primitifleri boşlukta doğrulamak yetmez. **Bir gerçek yaprak komponent** uçtan uca dönüştürülür:

**Aday: `src/components/InfoItem/`** — küçük, yapraktır, CMS'e bağlı değil, birden çok sayfada kullanılıyor.
(Seçim, F1.7'ye gelindiğinde `sx` sayısı ve bağımlılıklarına bakılarak kesinleşir.)

Bu dilim şunları kanıtlar:
- Primitif API'si gerçek kodda yetiyor mu, yoksa `sx` kaçağı gerekiyor mu
- Görsel çıktı birebir aynı mı
- MUI ebeveyn içinde Tailwind çocuk sorunsuz çalışıyor mu (birlikte yaşama kuralı §5.4)

**Yetmezse Faz 1 kapanmaz** — API düzeltilir, tekrar denenir. Bu, 1.377 kullanımı yanlış API'yle dönüştürmeden önceki tek çıkış kapısı.

---

## Faz 1 DoD

- [ ] Ölçek eşleştirme tablosu yazıldı (F1.1)
- [ ] `Stack`, `Typography`, `Button`, `Card`, `Divider`, `Link` yazıldı; hepsi `components/ui/` altında
- [ ] `Stack` ve `Typography` **server komponenti** (`'use client'` yok)
- [ ] Hiçbirinde `sx` propu **yok**
- [ ] 18 Typography varyantı theme.ts ile birebir eşleşiyor (responsive olanlar dahil); `body2`/`caption` gerçek değerleri ölçülerek sabitlendi
- [ ] Button'da `any` yok, `loading` **gerçekten çalışıyor**
- [ ] Pilot dikey dilim dönüştürüldü, görsel fark yok
- [ ] `yarn build` geçiyor
- [ ] `/code-review high` temiz
- [ ] `docs/perf-baseline.md`'ye Faz 1 sütunu eklendi (**değişim beklenmiyor**, kayıt için)

---

## Riskler

| Risk | Önlem |
|---|---|
| Şim API'si yetersiz çıkar, `sx` kaçağı zorunlu olur | F1.7 pilotu tam olarak bunu yakalamak için var; kapanış kriteri |
| Ölçek eşleştirmesi hatalı (×2 kuralı) → tüm boşluklar kayar | F1.1 önce yapılır, pilotta gözle doğrulanır |
| `body2`/`caption` gerçek değerleri tahmin edilir | Tarayıcıdan `getComputedStyle` ile ölçülecek, kural olarak yazıldı |
| Şimler zamanla MUI taklidine dönüşür (prop şişmesi) | `sx` yasağı + prop listesi bu dosyada sabit; genişletmek faz planı değişikliği gerektirir |
| Faz 1 metrik iyileştirmediği için "işe yaramadı" algısı | Kapsam düzeltmesi bu dosyanın başında yazılı |

---

## Cevap bekleyen sorular

1. **`Stack`/`Typography` şimleri yazılsın mı, yoksa doğrudan düz HTML + utility mi?**
   Şim lehine: 1.377 kullanımın yapısal kısmı tek yerden yönetilir, tutarlılık zorlanır.
   Aleyhine: yeni bir soyutlama katmanı; kötü yönetilirse "MUI'nin küçük kopyası" olur.
   **Önerim: şim yazılsın**, ama bu dosyadaki prop listesiyle sınırlı kalsın ve `sx` asla eklenmesin.

2. **Button'daki `loading` düzeltilsin mi?** Geçiş kapsamı dışında bir hata ama Button zaten baştan yazılıyor. Önerim: evet, ayrı commit.

---

## Uygulama notları (2026-09-08)

### `Card` Faz 2'ye ertelendi

`components/common/Card` bir sunum kartı değil: içinde MUI `Accordion`/`AccordionSummary`/`AccordionDetails`, sticky header ve `sx.header` alt anahtarı var. Radix Accordion'a bağımlı olduğu için Faz 1 primitifi değil, **Faz 2 işi**. Plan buna göre düzeltildi.

### Pilot dilim: doğrulanamadı — pilot seçimi hatalıydı

`InfoItem` dönüştürüldü (MUI'siz, Emotion'sız, server component) ve API'si `slotProps` → açık `labelClassName`/`valueClassName`/`*Variant` olarak daraltıldı. Üç tüketicisi vardı:

| Tüketici | Durum |
|---|---|
| `product/[id]/components/ProductAttributes` | **ÖLÜ KOD** — hiçbir yerden import edilmiyor |
| `features/cart/CartPageView` | Sadece **ölü import**, kullanılmıyor (silindi) |
| `orders/OrderListItemCard` | Canlı ama **giriş arkasında** (`/orders`) |

Yani pilotun görünür bir yüzeyi yok; "görsel fark yok" kriteri kanıtlanamadı.
**Faz 1, görünür bir pilot doğrulanmadan kapanmamalı.**

Doğrulanabilen kısım (derlenmiş CSS üzerinden, `getComputedStyle` yerine):
- `sm:` → `min-width:600px`, `md:` → `min-width:1000px` (özel kırılımlar gerçek kullanımda çalışıyor)
- Alfa dönüşümleri birebir: `6.27% / 12.5% / 25.1% / 37.6% / 50.2%`
- `letter-spacing:.45px`, `border-radius:2px`, `line-height:1.2/1.3`, `font-size:17px` — hepsi üretildi
- `yarn build` ✓ 54/54 · `tsc --noEmit` bizim dosyalarda temiz
- First Load JS 227 kB → **229 kB** (clsx + tailwind-merge + cva; Emotion henüz çıkmadığı için net artış)

### Bulgu: ölü kod (geçiş maliyetini doğrudan etkiler)

121 komponent klasörü tarandı; **12'sine hiçbir import'tan ulaşılamıyor** (~790 satır):

```
app/(shop)/product/[id]/components/ProductAttributes   (40)
app/(shop)/product/[id]/components/ProductFeatures     (101)
components/FreeShippingBar                             (113)
components/HeroContentBlock                            (182)
components/LanguageSwitcher                            (9)
components/LogoutButton                                (22)
components/SupportFab                                  (56)
components/cms/shared/ShopFaetureBannerItem            (65)   ← isimde yazım hatası
components/common/CircularProgressWithLabel            (35)
components/common/inputs/OTPcomponent                  (134)
components/_template · components/cms/blocks/_template  (33)  ← kasıtlı iskelet
```

İlk tarama 19 sonucu vermişti; `../../shared/X` gibi çok segmentli göreli import'ları kaçırdığı için **yanlıştı**, düzeltilmiş tarama 12 diyor.

**Öneri:** Faz 4/5'e girmeden ölü kod temizliği yapılmalı. Ölü komponenti dönüştürmek saf israf — pilotta tam olarak bu oldu.

---

## 2. pilot dilim: `cms/shared/InfoArea` — DOĞRULANDI ✅

Ana sayfada `blocks.shop-info-areas` olarak gerçekten render edilen, görünür bir komponent seçildi.

**Yöntem:** dönüşümden ÖNCE çalışan sayfada `getComputedStyle` ile taban değerler ölçüldü, dönüşümden SONRA aynı ölçüm tekrarlandı.

| | Önce | Sonra |
|---|---|---|
| kart `gap` (500px) | 8px | 8px ✓ |
| ikon çerçevesi | 72×72, %50 yarıçap, `rgb(245,245,247)` | aynı ✓ |
| etiket | 12.5px / 600 / lh 16.875px / `rgba(0,0,0,.87)` / ls −0.0625px | aynı ✓ |
| açıklama (mobil) | `display:none`, 13px, lh 19.5px, `rgb(58,58,60)` | aynı ✓ |
| kart `gap` (1280px) | md:1.5 → 12px | 12px ✓ |
| ikon çerçevesi (1280px) | 60×60, yarıçap 0, saydam | aynı ✓ |
| etiket (1280px) | 17px / lh 23.8px | aynı ✓ |
| açıklama (1280px) | `block`, 14px, lh 21px | aynı ✓ |
| metin bloğu | max-w 300px, gap 4px | aynı ✓ |

**Kazanç:** `useRouter` + `<Stack onClick>` gitti → **server component**; gezinti artık gerçek `<a>` (klavyeyle erişilebilir). `styles.ts` silindi.

**Etiket rengi bilerek token değil:** eski `color: 'text.primary'` MUI'nin varsayılanına (`rgba(0,0,0,.87)`) düşüyordu — `palette.ts`'te `text.primary` anahtarı yok. Token'a çevirmek rengi kaydırırdı; `text-black/[87%]` kullanıldı.

### Bu pilotun ortaya çıkardığı kritik kısıt

Açıklama mobilde gizlenmedi: `hidden` sınıfı işe yaramadı. Sebep **Tailwind `@layer utilities` vs Emotion katmansız CSS** — katmansız her zaman kazanır. Tam açıklama ve çıkış yolları: `konvansiyon.md` §6, ADR §5.3 ve risk tablosu güncellendi.

Bu, geçişin geri kalanını doğrudan etkileyen bir kısıt ve ancak pilot sayesinde ortaya çıktı.

## Ölü kod temizliği (tamamlandı)

10 komponent klasörü silindi (~790 satır). `_template` iskeletleri kasıtlı olduğu için korundu.
Silmeden önce her biri tüm repoda arandı; yalnızca iki **yorum satırı** atfı vardı (`ProductFeatures`, `FreeShippingBar`), kod atfı yoktu.

Etkisi: `@mui` import eden dosya 171 → 162 · `styles.ts` 102 → 93 · toplam ts/tsx 552 → 542
