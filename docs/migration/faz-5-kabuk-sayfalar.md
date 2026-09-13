# Faz 5 — Kabuk ve sayfalar

**Durum:** Tamamlandı  
**Başlangıç:** 2026-09-09  
**Onay:** Kullanıcının “devam et” talimatı

## Amaç

Her sayfada yüklenen uygulama kabuğunu, Faz 2'den devredilen davranışlı bileşen
zincirini ve mağaza sayfalarını MUI/Emotion'dan Tailwind + mevcut `ui/`
primitiflerine geçirmek. Veri alma, ISR, Formik/Zod ve PayTR davranışı değişmez.

## Değişmezler

- Navigation, hesap, sepet, favori ve ödeme davranışları korunur.
- PDP'deki `DeferUntilVisible`, ISR ve görsel LCP mekanizması korunur.
- PayTR koduna yalnızca görünüm katmanının gerektirdiği prop değişiklikleri yapılır.
- MUI `sx` ile Tailwind aynı elemanda birlikte kullanılmaz.
- Responsive görünüm ayrımı JS yerine `sm:` / `md:` sınıflarıyla yapılır.

## Uygulama sırası

### F5.0 — Sunucu kabuğu ve ana sayfa

- `components/layouts/MainLayout`: MUI `Stack`, `styles.ts` ve gereksiz client sınırı kalkar.
- `app/(shop)/view.tsx`: MUI kutuları ve gereksiz client sınırı kalkar; CMS blok aralıkları statik Tailwind eşlemesine taşınır.
- `components/layouts/TwoColumnLayout`: çağrı yerleriyle birlikte class tabanlı hale gelir.

### F5.1 — Ortak kart ve katman zinciri

- `common/Card` → HTML + `ui/Accordion`; `className`, `headerClassName`,
  `titleClassName`, `bodyClassName` API'si.
- `common/ModalCard` → `ui/Dialog`; `useScreen`, MUI Modal ve Slide kalkar.
- `common/Banner` → HTML + `ui/Accordion` + `ui/Button`.
- Card/ModalCard/Banner kullanan tüm dosyalarda `sx` çağrıları sınıfa çevrilir.

### F5.2 — Global kabuk

- `Navigation/index.tsx`, `AccountMenu.tsx`, `MegaMenu`, `CategoriesDrawer`,
  `MobileSearchOverlay`.
- `Footer`.
- `ShoppingCartButton` ve bağlı popover/menu akışı.
- MUI Menu/Popover/Drawer yerine mevcut Radix `ui/` bileşenleri kullanılır.

### F5.3 — Ana katalog ve ürün

- `ProductCard`, kategori, koleksiyon, arama, `SearchFilters`, `SearchSort`.
- PDP `view.tsx` ve alt bileşenleri.
- `ProductReviews` için `ui/ProgressBar` determinate `value` desteği.

### F5.4 — Sepet ve ödeme

- `ShoppingCart/*`, `features/cart/CartPageView`, checkout görünümü.
- Başarı, ödeme ve sipariş durumu sayfaları.
- PayTR ödeme iş mantığına dokunulmadan üç kırılım ve gerçek test akışı kontrolü.

### F5.5 — Hesap ve kalan sayfalar

- Hesap layout'u, ayarlar, adresler, favoriler ve siparişler.
- Blog, iletişim, hakkımızda, influencer ve yasal/statik sayfalar.

## İlerleme — 2026-09-10

- [x] **F5.0:** `MainLayout`, ana sayfa görünümü ve `TwoColumnLayout` MUI'siz;
  iki gereksiz client sınırı kaldırıldı.
- [x] **F5.1:** `Card`, `ModalCard` ve `Banner` zinciri HTML/Radix tabanlı;
  tüm çağrı yerleri class API'sine geçirildi. Kapalı Banner içeriğinin DOM'da
  kalması ve keep-mounted dialogların kapalıyken sayfa kaymasını kilitlememesi
  regresyon testlerinde düzeltildi.
- [x] **F5.2:** Global kabuk tamamlandı. `Navigation`, `Footer`, menüler,
  drawer/overlay katmanları, mobil hesap/sepet panelleri ve kupon akışı
  Tailwind + Radix tabanlı.
- [x] **F5.3:** Katalog, arama ve PDP tamamlandı. `ProductCard`, filtre/sıralama,
  kategori/koleksiyon sayfaları, PDP alt bileşenleri ve `CustomSlider`
  MUI/Emotion kullanmıyor.
- [x] **F5.4:** Sepet, checkout, ödeme, başarı ve misafir sipariş durumu
  görünümleri tamamlandı. PayTR/veri akışı değiştirilmedi.
- [x] **F5.5:** Üyelik ve auth ekranları; hesap, siparişler, blog, influencer,
  çerez, yasal/statik sayfalar ve kalan ortak bileşenler tamamlandı.

Ara envanter: uygulama kodunda 111 `use client` + `ui/` içinde 12;
972 `sx=`; 52 `styles.ts` / 7.058 satır; 95 MUI import eden dosya.

Ara production build: shared 249 kB; `/` 335 kB; PDP 324 kB; `/cart` 296 kB;
`/checkout` 329 kB; `/search` 327 kB. Faz 4'e göre ana sayfa −12 kB, PDP
−6 kB, sepet −6 kB, checkout −26 kB; shared değişmedi.

Doğrulama: odaklı ESLint temiz, `git diff --check` temiz, komponent paketi
6 dosya / 36 test yeşil, 54/54 production sayfası üretildi. Tam TypeScript
taraması yalnızca geçiş öncesinden kayıtlı 30 hatayı veriyor.

### Ara güncelleme — 2026-09-11

- F5.2–F5.4 kapsamlarında kod belirteci taraması temiz (`@mui`, `@emotion`,
  `sx=`, aktif `styles.ts` import'u yok; yorumlardaki tarihsel atıflar hariç).
- Auth paketi: 19/19 test yeşil; F5.4 checkout paketi: 6/6 test yeşil;
  odaklı ESLint ve `git diff --check` temiz.
- Production build `Creating an optimized production build ...` adımında üç
  dakikadan uzun süre çıktı vermediği için kontrollü sonlandırıldı. Bu koşu
  başarılı doğrulama olarak sayılmıyor; F5.5 sonunda yeniden çalıştırılacak.

### Kod kapanışı — 2026-09-11

- Uygulama ve bağımlılık envanterinde gerçek `@mui/*` / `@emotion/*` import'u,
  `sx=` kullanımı ve `styles.ts` dosyası kalmadı. Kaynak yorumlarındaki tarihsel
  MUI atıfları çalışma zamanı bağımlılığı değildir.
- `ThemeRegistry`, Emotion cache/tema katmanı ve eski ortak MUI Button kaldırıldı;
  global kabuk Tailwind preflight ile çalışıyor.
- `package.json` ve `yarn.lock` içinden altı MUI/Emotion paketi kaldırıldı.
- Son envanter: 131 `use client`; 0 gerçek MUI/Emotion import'u; 0 gerçek `sx=`;
  0 `styles.ts`.
- Webpack production build yaklaşık 20 saniyede tamamlandı ve 54/54 statik sayfa
  üretildi. Turbopack production derlemesi iki kez optimize aşamasında takıldığı
  için `build` komutu kararlı Next.js Webpack yoluna alındı; geliştirme sunucusu
  Turbopack kullanmaya devam ediyor.
- Son bundle ölçümü: shared 102 kB; `/` 231 kB; PDP 219 kB; `/cart` 188 kB;
  `/checkout` 257 kB; `/search` 214 kB.
- Tam test koşusu: 28 dosyanın 23'ü ve 332 testin 312'si geçti. Kalan 20 hata
  geçiş kapsamı dışındaki mevcut rate-limit/Supabase mock, filtre cache sabiti ve
  TRY biçimlendirme beklentilerinde; göç ettirilen UI paketlerinin odaklı testleri
  yeşil.

## Her paket sonrası doğrulama

1. Değişen kapsam için ESLint ve `git diff --check`.
2. İlgili komponent testleri; paket sonunda `yarn vitest run src/components`.
3. 390 / 768 / 1440 px görsel ve etkileşim kontrolü.
4. Faz sonunda production build ve `/`, PDP, kategori, arama, sepet JS ölçümü.
5. Faz 5 sonunda proje envanteri: `@mui`, `sx=`, `styles.ts`, `use client`.

## Açık ürün kararı

`ShopInlineProducts` mevcut 2/2/4 sütun ve 16/32 px boşluk düzeninde kalır;
kanonik ürün ızgarasına hizalama ayrı görsel karar olarak bekler.
