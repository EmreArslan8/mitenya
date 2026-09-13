# Faz 2 — Davranışlı komponentler (Radix)

**Üst plan:** [ADR-0002](../adr/0002-mui-to-tailwind-migration.md) · **Önceki:** [Faz 1](./faz-1-primitifler.md) · **Kurallar:** [konvansiyon.md](./konvansiyon.md)
**Durum:** Uygulanıyor (2026-09-08)

| Görev | Durum |
|---|---|
| F2.1 `Skeleton` (79) | ✅ `ui/Skeleton` — MUI kaynağından birebir stil + kendi `pulse` keyframe'i |
| F2.1 `CircularProgress` (15) | ✅ `ui/Spinner` — 44 viewBox, rotate+dash 1.4s |
| F2.1 `Fade` (6) | ✅ 5/6 — kalan 1 `AddressCard`, `useScreen`'e bağlı (aşağıda) |
| F2.1 `Chip` (6) | ✅ `ui/Chip` — `onDelete` gerçek `<button>` + `aria-label` |
| F2.1 `Badge` (4) | ✅ `ui/Badge` — MUI'nin `showZero=false` davranışı dahil |
| F2.1 `LinearProgress` | ✅ 1/2 — `ui/ProgressBar`; kalan 1 **determinate** (aşağıda) |
| F2.1 `Collapse` (1) | ✅ grid-rows tekniği |
| `ProductGrid` (semantik bileşik) | ✅ 3 kırılımda prod'a karşı doğrulandı |
| F2.2+ Radix | ⏳ |
**Tahmini süre:** 5-7 gün

---

## Envanter (2026-09-08, ölü kod temizliği sonrası)

Toplam **234 davranışlı MUI kullanımı**. ADR §2'deki 199 sayısı `MenuItem`'ı (42 kullanım / 14 dosya) saymıyordu — düzeltildi.

| Komponent | Kullanım | Dosya | | Komponent | Kullanım | Dosya |
|---|---|---|---|---|---|---|
| Skeleton | 79 | 6 | | Menu | 4 | 3 |
| MenuItem | 42 | 14 | | Badge | 4 | 1 |
| CircularProgress | 15 | 10 | | Switch | 4 | 3 |
| Select | 11 | 9 | | Modal | 3 | 3 |
| Snackbar | 10 | 8 | | Popover | 2 | 2 |
| Accordion (+Summary/Details) | 24 | 8 | | Drawer | 2 | 2 |
| Checkbox | 7 | 4 | | LinearProgress | 2 | 2 |
| Chip | 6 | 6 | | Dialog · Tabs · Tab · Slider · Collapse · ToggleButton · Autocomplete | 1'er | — |
| Fade | 6 | 4 | | | | |
| Rating | 6 | 3 | | | | |

### Kritik ayrım: yarısı kütüphane gerektirmiyor

| Grup | Kullanım | Ne gerekiyor |
|---|---|---|
| **A — kütüphanesiz** (Skeleton 79, CircularProgress 15, Chip 6, Fade 6, Badge 4, LinearProgress 2, Collapse 1) | **113** | Sadece CSS + SVG. Yeni bağımlılık **yok**. |
| **B — Radix** (MenuItem 42, Accordion 24, Select 11, Checkbox 7, Menu 4, Switch 4, Modal 3, Popover 2, Drawer 2, Tabs 2, Dialog 1, Slider 1, ToggleButton 1) | **104** | Radix primitifleri, shadcn deseniyle repo'ya kopyalanır. |
| **C — özel** (Snackbar 10, Rating 6) | **16** | Kendi kodumuz. |
| **D — Faz 3'e** (Autocomplete 1) | 1 | Radix'te combobox yok; Formik'e bağlı, formlarla gider. |

**A grubu toplam kullanımın %48'i ve en ucuzu — faz oradan başlıyor.**

---

## Bağımlılık zinciri (sırayı bu belirliyor)

```
Accordion (8 yer)
   └── common/Card ............................ 18 tüketici
          └── common/ModalCard ................ 11 tüketici
                 ├── QuickAddModal · WelcomeCouponModal · CookiePreferencesModal
                 ├── AddressCard/modals (Edit + New) · LegalDocumentModal
                 ├── AddedToCartModal · ShopCartProductCard · ProductSizeGuide
                 └── Navigation · CartPageView · orders/[id]
```

`ModalCard` ayrıca `Modal` + `Slide` + `useScreen` kullanıyor. Yani **Dialog ailesi ile Accordion aynı düğümde birleşiyor**; ikisi bitmeden 11 modal tüketicisine dokunulamaz.

`common/Card` Faz 1'den ertelenmişti — yeri burası.

---

## 🔴 Faz dışı ama Faz 2'yi doğrudan etkileyen bulgu: `useScreen`

`src/lib/hooks/useScreen.ts` **29 dosyada** kullanılıyor (ADR §3'teki "useMediaQuery 5 dosya" sayısı yalnızca doğrudan çağrıları sayıyordu; sarmalayıcıyı kaçırmış).

Hook **her çağrıda 11 ayrı `useMediaQuery`** çalıştırıyor (isMobile, isTablet, xs/sm/md/lg/xl × down/up). Yani:

- 29 komponent × 11 media query listener ≈ **319 matchMedia aboneliği**
- Hepsi client-side → 29 komponentin tamamı zorunlu `'use client'`
- `defaultMatches: false` **açıkça** verilmiş → SSR daima "false" dalını basıyor, mount sonrası gerçek değere dönüyor → mobilde her tüketicide **düzen sıçraması** (ADR-0001'de PDP galerisinde aynı sebeple `galleryViewport` silinmişti)

ADR bunu Faz 5'e koymuştu. **Öneri: olduğu yerde kalsın ama Faz 2 dokunduğu komponentlerde (ModalCard, ShoppingCartButton, SearchFilters, QuickAddModal) `useScreen` sökülsün** — zaten yeniden yazılıyorlar. Geri kalan ~25 dosya için Faz 5'te ayrı süpürme.

---

## Görevler

Sıra bağlayıcı: F2.1 → F2.2 → F2.3 → F2.4 → F2.5 → F2.6 → F2.7 → F2.8 → F2.9

### F2.1 — A grubu: kütüphanesiz olanlar (113 kullanım)

Yeni bağımlılık yok, risk düşük, kazanç yüksek. Önce bu.

| MUI | Kullanım | Yerine |
|---|---|---|
| `Skeleton` | 79 | `<div className="animate-pulse bg-black/[11%] rounded-[2px]">` — ölçülmüş değerler (`theme.ts:355` rectangular → 2px yarıçap). Faz 1 pilotunda `InfoItem`'da zaten uygulandı, oradaki sınıf tekrar kullanılır. |
| `CircularProgress` | 15 | Inline SVG spinner — Faz 1'de `ui/Button` içine yazıldı, `ui/Spinner`'a çıkarılır. |
| `LinearProgress` | 2 | `<div>` + `animate-pulse` / genişlik animasyonu |
| `Chip` | 6 | `ui/Chip` — cva ile varyant |
| `Badge` | 4 | `ui/Badge` — `absolute` konumlu sayaç (hepsi `Navigation`'da, sepet/favori sayacı) |
| `Fade` | 6 | CSS `transition-opacity` + `data-*` durum sınıfı |
| `Collapse` | 1 | `grid-rows-[0fr]/[1fr]` tekniği (JS'siz yükseklik animasyonu) |

**Çıktı:** 113 kullanım, ~10 dosyada MUI import'u tamamen kalkabilir.

### F2.2 — Radix kurulumu ve `ui/` deseni

- `yarn add @radix-ui/react-dialog @radix-ui/react-accordion @radix-ui/react-select @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-checkbox @radix-ui/react-switch @radix-ui/react-slider @radix-ui/react-tabs @radix-ui/react-toggle-group`
- Her biri `src/components/ui/<Ad>/` altına **kod olarak** yazılır (shadcn deseni — bağımlılık primitif, görünüm bizim)
- Animasyonlar `data-[state=open]` / `data-[state=closed]` ile CSS

**Bağımlılık gerekçesi (ADR §11):** Radix erişilebilirlik (focus trap, aria, klavye, Escape, scroll lock) sağlıyor; bunu elle yazmak hem pahalı hem hataya açık. Her paket ~5-15 KB ve yalnızca kullanıldığı sayfaya giriyor — MUI'nin ~590 KB'lık monolitiyle kıyaslanamaz.

### F2.3 — Dialog ailesi (`Dialog` 1 + `Modal` 3 + `Drawer` 2 + `ModalCard`)

Hepsi tek Radix primitifine dayanır: `Dialog`.

| Mevcut | Yeni |
|---|---|
| `Dialog` (QuickAddModal) | `ui/Dialog` |
| `Modal` (LoadingOverlay, ModalCard) | `ui/Dialog` |
| `Drawer` (CategoriesDrawer, MobileFilters) | `ui/Dialog` + yan panel varyantı (`side="left"/"bottom"`) |
| `Slide` geçişi (ModalCard) | CSS `data-[state]` animasyonu |
| `useScreen` ile `dialog` / `bottom-sheet` seçimi | **CSS** — `md:` altında bottom-sheet, üstünde ortalanmış dialog |

**`Modal` (PayTRPortal) BU FAZDA DEĞİL.** Ödeme iframe'ini taşıyor; gelir riski en yüksek dosya. Faz 5'te sepet/checkout ile, gerçek test siparişiyle birlikte dönüşecek. Faz 2'de dokunulmaz.

### F2.4 — `Accordion` (24) + `common/Card` (18 tüketici)

1. `ui/Accordion` (Radix) yazılır
2. `common/Card` yeniden yazılır → `ui/Card` (collapsible varyantı Radix Accordion kullanır, sticky header CSS ile)
3. 8 Accordion çağrı yeri: `ProductBenefits`, `ProductDescription`, `ProductFaq`, `AddressCard`, `cms/blocks/FAQ`, `cms/blocks/ProductDetailTabs`, `common/Banner`, `common/Card`

`Card`'ın 18 tüketicisi bu adımda **dönüşmez** — sadece `Card`'ın kendisi. Tüketiciler kendi fazlarında (4/5) geçer; `Card`'ın prop sözleşmesi korunur (`sx` hariç → `className`).

### F2.5 — `Select` (11) + `MenuItem` (42)

`MenuItem`'ların çoğu `Select` seçeneği. `ui/Select` (Radix) + `SelectItem`.

Çağrı yerleri: `SearchSort`, `AddressSelector`, `settings/AccountCard` (3), kategori/koleksiyon görünümleri (3), `ProductReviews`, `FormikDropdown`.

**`FormikDropdown` Faz 3'e bırakılır** — Formik'e bağlı; form katmanı tek seferde dönüşmeli.

### F2.6 — `Menu` (4) + `Popover` (2)

`ui/DropdownMenu` (Radix) → `AccountMenu`, `Navigation` (2), `AddressCard`, `AddressLine`
`ui/Popover` (Radix) → `ShoppingCartButton`, `AccountMenu`

`ShoppingCartButton` ayrıca `useScreen` kullanıyor → burada sökülür.

### F2.7 — `Checkbox` (7) + `Switch` (4) + `Slider` (1) + `ToggleButton` (1)

Radix karşılıkları. Dikkat: `checkout/view.tsx`'teki 4 Checkbox sözleşme onayları — **Faz 3'te form akışıyla birlikte test edilecek**, burada yalnızca görünüm dönüşür, `onChange` sözleşmesi aynen korunur.

`ToggleButton` → `common/CheckButton`, tek kullanım, düz `<button aria-pressed>`.

### F2.8 — `Tabs` (1)

`cms/blocks/FAQ` içinde. Radix Tabs. Tek kullanım ama klavye/aria kazancı için primitif kullanılır.

### F2.9 — C grubu: `Snackbar` (10) + `Rating` (6)

**Snackbar → `ui/Toast`.** Mevcut desen: her çağrı yerinde yerel `useState` + `<Snackbar open autoHideDuration anchorOrigin>` + içinde `<Banner variant title>`.

Öneri: **aynı yerel-state API'si korunarak** `ui/Toast` yazılsın (`open`, `duration`, `onClose`, `position`). Merkezi bir toast provider'a geçmek daha temiz olurdu ama bu bir **davranış değişikliği** ve 8 dosyayı aynı anda etkiler; geçiş sırasında yapılmamalı. Provider'a geçiş ayrı bir karar (ADR-0003 adayı).

Alternatif: `sonner` paketi (~5 KB, kaliteli). Yeni bağımlılık + davranış değişikliği getirdiği için önerilmiyor.

**Rating → `ui/Rating`.** 5 SVG yıldız; `ProductRatingStars` ve `ProductCard`'da salt-okunur, `ProductReviews`'da (4 kullanım) girdi. Salt-okunur olan **server component** olabilir — kazanç burada.

---

## Faz 2 DoD

- [ ] A grubunun tamamı (113 kullanım) dönüştü, yeni bağımlılık eklenmedi
- [ ] Radix primitifleri `components/ui/` altında, kod repo'da
- [ ] `Dialog` ailesi tek primitife indi; `ModalCard` `useScreen`'siz, layout seçimi CSS ile
- [ ] `PayTRPortal`'a **dokunulmadı** (Faz 5)
- [ ] `common/Card` dönüştü, 18 tüketicisinin prop sözleşmesi bozulmadı
- [ ] `FormikDropdown`, `FormikAutoComplete`, `TextField` **dokunulmadı** (Faz 3)
- [ ] Klavye ve erişilebilirlik elle test edildi: Escape ile kapanma, focus trap, sekme sırası, `aria-expanded`
- [ ] Her dönüşen komponent 3 kırılımda görsel karşılaştırıldı
- [ ] konvansiyon.md §6 kontrolü: dönüşen komponentlerde MUI ebeveynden gelen katmansız kural ezilmesi yok
- [ ] `docs/perf-baseline.md`'ye Faz 2 sütunu eklendi
- [ ] `/code-review high` temiz

## Kabul kriterleri (ölçülecek)

| Metrik | Faz 1 | Faz 2 hedefi |
|---|---|---|
| `'use client'` | 131 | **< 115** |
| `@mui` import eden dosya | 162 | **< 135** |
| `sx=` | 1.646 | < 1.500 |
| `styles.ts` dosya | 93 | < 80 |
| First Load JS | 229 kB | artmamalı (Radix girer, MUI kullanımı azalır) |

---

## Riskler

| Risk | Etki | Önlem |
|---|---|---|
| **PayTRPortal** ödeme iframe'i | Gelir kaybı | Faz 2'de **dokunulmuyor** |
| Focus trap / scroll lock regresyonu | Modal açıkken arka plan kaydırılır, klavye kaçar | Radix bunu veriyor; elle geçersiz kılma yok, her modal klavyeyle test edilir |
| `ModalCard` 11 tüketiciyi birden kırabilir | Geniş yüzey | Prop sözleşmesi korunur; `sx` → `className` dışında imza değişmez |
| Emotion katmansız CSS'i ezmesi | Sınıf sessizce etkisiz | konvansiyon.md §6; dönüşmemiş MUI ebeveynlerde sarmalayıcı |
| `Card` 18 tüketici + `Accordion` 8 yer aynı düğümde | Zincirleme kırılma | Sıra F2.4'te sabit: önce Accordion, sonra Card, tüketiciler sonraki fazda |
| Radix animasyonları MUI geçişleriyle birebir olmayabilir | Görsel fark | Süre/eğri değerleri MUI'den ölçülüp taşınır; "yaklaşık" bırakılmaz |
| Otomatik test yok (Faz 0'da ertelendi) | Regresyon geç fark edilir | Her adımda elle klavye + 3 kırılım kontrolü; DoD'de zorunlu |

---

## Cevap bekleyen sorular

1. **Toast:** yerel-state API'sini koruyan kendi `ui/Toast`'umuz mu (önerim), yoksa merkezi provider'a mı geçelim? İkincisi daha temiz ama davranış değişikliği ve 8 dosyayı birden etkiliyor.
2. **`useScreen`:** Faz 2'nin dokunduğu 4 dosyada sökülsün mü (önerim: evet), yoksa 29 dosyanın tamamı Faz 5'te tek seferde mi?
3. **Sıra:** A grubuyla mı başlayalım (önerim: evet — %48'i, sıfır bağımlılık, hızlı kazanç), yoksa doğrudan Dialog/Accordion zincirine mi girelim?


---

## F2.1 kapanışı (2026-09-08)

**A grubu tamamlandı** — 113 kullanımın tamamı, **sıfır yeni bağımlılık**.

| MUI | Önce | Sonra | Karşılığı |
|---|---|---|---|
| `Skeleton` | 79 | **0** | `ui/Skeleton` |
| `CircularProgress` | 15 | **0** | `ui/Spinner` |
| `Chip` | 6 | **0** | `ui/Chip` |
| `Fade` | 6 | **1** | CSS `transition-opacity` |
| `Badge` | 4 | **0** | `ui/Badge` |
| `LinearProgress` | 2 | **1** | `ui/ProgressBar` |
| `Collapse` | 1 | **0** | `grid-rows-[0fr]/[1fr]` |

Tüm animasyonlar MUI kaynağından **birebir** alındı (göz kararı değil):
`skeleton-pulse` (2.1s'lik değil, `2s ease-in-out 0.5s`, opacity 0.4 — Tailwind'in
`animate-pulse`u farklıdır), `spinner-rotate/dash` (1.4s), `progress-indeterminate1/2`
(2.1s, iki farklı cubic-bezier + 1.15s gecikme). Fade'de Tailwind'in `ease-in-out`u
MUI `easeInOut` ile aynı eğri çıktı (`cubic-bezier(0.4,0,0.2,1)`).

### Bilerek bırakılan 2 kullanım

1. **`ProductReviews` `LinearProgress`** — **determinate** (puan dağılımı çubuğu),
   `ui/ProgressBar` şu an yalnızca belirsiz modu destekliyor. PDP bileşeni olduğu
   için Faz 5'te `value` desteğiyle birlikte dönüşecek.
2. **`AddressCard` `Fade`** — `smDown` (yani `useScreen`) koşuluna bağlı. `useScreen`
   sökümüyle birlikte ele alınmalı, tek başına çevrilirse JS dallanması kalır.

### Plandan sapma: `Chip` "kütüphanesiz" ama trivial değildi

Planda A grubuna koymuştum (doğru — Radix gerekmiyor), ama 6 kullanımın 3'ü
etkileşimli: 1 `onClick`, 2 `onDelete`. MUI `onDelete`'i `<svg>` üzerinde
tıklanabilir yaparak veriyordu; yeni bileşende gerçek `<button aria-label>` —
klavyeyle erişilebilir hâle geldi (erişilebilirlik iyileştirmesi).

### API kararı: `labelClassName` eklenmedi

`SearchFilters` çipleri MUI'de `.MuiChip-label` iç boşluğunu eziyordu. Karşılığı
olarak `labelClassName` geçirgen prop'u eklemek yerine (ADR §11.4: "stil geçirgen
prop son çaredir") **yapı sadeleştirildi**: iç boşluk kök elemana taşındı, böylece
dışarıdan gelen `className` twMerge ile doğal olarak eziyor.


---

## Faz 2 kapanışı (2026-09-08) — zincir Faz 4/5'e devredildi

### Planda bulunan çelişki

F2.4'te *"`Card`'ın 18 tüketicisi bu adımda dönüşmez, prop sözleşmesi korunur (`sx` hariç)"* yazıyordu. **Bu kendi içinde tutarsızdı:** `Card` çağrı yerlerinde **35 `sx`** var; `sx`'i kaldırmak sözleşmeyi korumak değil, 35 çağrı yerini birden kırmak demek.

Yani `Card`'ı dönüştürmek zorunlu olarak 18 dosyayı Faz 4/5'ten öne çeker; `Card` bitmeden `ModalCard` (11 tüketici) ve ona bağlı `Modal`/`Drawer`/`Dialog`/`Menu`/`Popover` de bitmez.

**Karar (kullanıcı, 2026-09-08): zincir Faz 4/5'e bırakıldı.** Gerekçe: bu 35 `sx` zaten o dosyaların kendi stilleriyle iç içe; tek tek çevirmek Faz 4/5'te yapılacak işin aynısı — burada yapmak yalnızca faz sınırlarını bozar.

### Faz 4/5'e devredilen zincir

```
common/Card (18 tüketici, 35 sx)
   └── common/ModalCard (11 tüketici)
          └── Modal 1 · Drawer 1 · Menu 2 · Popover 2 · MenuItem 29
              (Navigation · AccountMenu · CategoriesDrawer · ShoppingCartButton ·
               AddressCard · AddressbookCard · layoutView)
   └── Accordion 3 (Card · AddressCard · Banner)
```

`Banner` da devredildi: 12 tüketicisi var ve 5 çağrı yerinde `sx` alıyor — `Card` ile aynı sorun.

### Faz 2'de tamamlananlar

| MUI | Önce | Sonra | Karşılığı |
|---|---|---|---|
| Skeleton · CircularProgress · Chip · Badge · Collapse | 113 | **0** | A grubu, kütüphanesiz |
| Snackbar | 10 | **0** | `ui/Toast` |
| Select | 11 | **1** | `ui/Select` (+`renderValue` slot'u); kalan `FormikDropdown` → Faz 3 |
| Accordion | 24 | **3** | `ui/Accordion` (Radix) |
| Checkbox · Switch · Slider · ToggleButton | 13 | **0** | Radix + `CheckButton` |
| Rating | 6 | **0** | `ui/Rating` (server) + `RatingInput` (client) |
| Tabs | 2 | **0** | `ui/Tabs` |
| Modal · Drawer · Dialog | 6 | **3** | `ui/Dialog` (tek primitif, 5 yerleşim) |
| Fade | 6 | **1** | CSS geçişi |

### Kabul kriteri düzeltmesi

ADR §7.1'de `'use client'` hedefi **< 25** yazıyordu. Bu ölçüm yanıltıcı: Radix sarmalayıcıları zorunlu olarak client'tır ve `components/ui/` altında **12 dosya** eklendi. Doğru ölçüm **uygulama kodu** üzerinden yapılmalı:

| | Dal başı | Faz 2 sonu |
|---|---|---|
| `'use client'` (uygulama kodu) | 134 | **128** |
| `'use client'` (ui primitifleri) | 0 | 12 (Radix, kaçınılmaz) |
| `sx=` | 1.675 | **1.476** |
| `@mui/` içeren dosya | 170 | **157** |

Uygulama tarafındaki asıl düşüş Faz 4/5'te gelecek: `sx`'lerin %90'ı hâlâ sayfa ve blok dosyalarında.

### Faz 2'de ortaya çıkan mimari kararlar

1. **`AddressSelector` bir `Select` değildi** — açılır listede bir eylem düğmesi vardı, Radix Select buna izin vermez. `DropdownMenu`'ye taşındı; semantik olarak da doğrusu bu.
2. **Açık/kapalı ikonu artık CSS'te** — MUI'de `expanded` state'iyle ikon değişiyordu, Radix'te `data-[state]` ile. FAQ, ProductDescription, ProductFaq, ProductBenefits'te JS dallanması kalktı.
3. **`ProductBenefits` ve `ProductDescription` server component oldu** — tek client sebepleri accordion state'iydi.
4. **`ui/Select`'e `renderValue` slot'u eklendi** — MUI'nin aynı adlı prop'unun karşılığı. Stil geçirgen prop değil, içerik slot'u (ADR §11.4).
