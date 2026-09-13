# Faz 4 — CMS blokları

**Üst plan:** [ADR-0002](../adr/0002-mui-to-tailwind-migration.md) · **Önceki:** [Faz 3](./faz-3-formlar.md) · **Kurallar:** [konvansiyon.md](./konvansiyon.md)
**Durum:** Kod tamamlandı — tüm blokların 3 kırılım görsel karşılaştırması ve faz review'u bekliyor
**Tahmini süre:** 5-7 gün

---

## Envanter (2026-09-09, ölçüldü)

| | blocks | shared | toplam |
|---|---|---|---|
| komponent | 22 | 11 | **33** |
| `sx=` | 124 | 61 | **185** |
| `'use client'` | 15 | 2 | **17** |
| `styles.ts` | 16 | 9 | **25** |

En ağır bloklar: `ShopFeatureBanner` (237 satır / 23 sx) · `ProductDetailBanner` (129/17) · `ShopBanner` (171/10) · `ShopInlineProducts` (253/9) · `ShopBrandShowcase` (146/9)

---

## Bu fazın kilidi: `SectionBase`

**21 blok bunu tüketiyor** — CMS katmanının tek gerçek çatalı.

```
SectionBase (266 satır, 9 sx, useScreen + useWindowSize)
   ├── 16 blok  {...section} ile yayıyor      (sözleşme: SectionBaseProps)
   └──  9 blok  ayrıca doğrudan `sx` geçiyor  ← Card ile aynı tuzak
```

`SectionBase`'in `sx` prop'unu kaldırmak 9 çağrı yerini kırar. Faz 2'de `Card`'da
bu tuzağa düşmüştük; **bu kez sıralamayı buna göre kuruyoruz**: `SectionBase`
dönüşürken o 9 blok da aynı adımda dönüşür, ayrı iş sayılmaz.

`SectionBase` ayrıca **tam-taşma (full bleed)** mantığı taşıyor: `100vw` +
`ml: calc(50% - 50vw)` ile kabın dışına çıkıyor ve bunu `useScreen().smUp` ile
JS'te karar veriyor. Bu, CSS'e çevrilebilir ve çevrilmeli (aşağıda).

---

## 🔴 `useScreen` — bu fazın ikinci büyük işi

CMS katmanındaki **11 dosya** `useScreen` kullanıyor:

```
SectionBase · ShopBanner · ShopBrandShowcase · ShopFeatureBanner
ShopInfoAreas · ShopInlineProducts · ShopRibbon · ShopSliderCards
ProductDetailBanner · ShopSliderCard · ShopBadgeButton
```

Hatırlatma (Faz 2 bulgusu): `useScreen` **her çağrıda 11 `useMediaQuery`**
çalıştırıyor ve `defaultMatches: false` verildiği için SSR daima "false" dalını
basıp mount sonrası gerçek değere dönüyor — yani bu 11 bileşenin **hepsinde
mobilde düzen sıçraması** var.

Bunlar CSS kırılımlarına çevrilince:
- 11 dosya client olmaktan çıkma adayı olur
- ~121 matchMedia aboneliği düşer
- mobil sıçrama biter

**Bu, Faz 4'ün metrik açısından en değerli parçası.**

---

## Strapi sözleşmesi (değişmez)

- `blocks/index.tsx` içindeki `componentMap` anahtarları (`blocks.shop-banner`, …)
- `shared/cmsTypes.ts` prop tipleri

Bir bloğun *içi* tamamen yeniden yazılabilir; **anahtar ve prop imzası değişemez.**
İçerik editörleri geçişi fark etmemeli.

---

## Sıra (bağımlılığa göre)

### F4.1 — `cms/shared` temeli (önce bu)

Tüketilme sırasına göre: `SectionBase` (21) → `CMSImage` (6) → tekil kart
bileşenleri (`ShopBannerItem`, `BlogCard`, `ShopCategoryBlock`, `ShopFeatureCard`,
`ShopPromoCard`, `ShopSliderCard`, `ShopBadgeButton`, `ShopBrand` — her biri 1).

`SectionBase` dönüşürken:
- `sx` prop'u → `className`; **9 çağrı yeri aynı adımda** güncellenir
- tam-taşma JS'ten CSS'e: `w-screen ml-[calc(50%-50vw)]` + `sm:` kırılımı
- `useScreen`/`useWindowSize` sökülür → **server component adayı**

`InfoArea` ve `CMSImage` zaten dönüşmüş durumda (Faz 1 pilotu / zaten MUI'siz).

### F4.2 — Ürün detay blokları (4)

`ProductDetailBanner` · `ProductDetailIngredients` · `ProductDetailClinicalStats` ·
`ProductDetailTabs` (accordion kısmı Faz 2'de dönüştü, kalan kabuk).

Neden önce: PDP'de görünür, ölçüm sayfamız orası.

### F4.3 — Ana sayfa blokları (yüksek trafik)

`ShopBanner` (LCP elemanı burada) → `ShopInfoAreas` → `ShopInlineProducts` →
`ShopPromoCards` → `ShopBrandShowcase` → `ShopBrands` → `ShopBlogCards`

**`ShopBanner` özel dikkat:** LCP görselini o basıyor. Dönüşüm sonrası
`preload` + `fetchPriority` + `aspect-ratio` korunmalı; ADR-0001'de kurulan
mekanizma bozulmamalı.

### F4.4 — Kalan bloklar (7)

`ShopFeatureBanner` (en ağır, 23 sx) · `ShopFeatureBox` · `ShopFeatureCards` ·
`ShopCategoryBlocks` · `ShopBadgeButtons` · `ShopRibbon` · `ShopSliderCards` ·
`FreeText`

### F4.5 — Sapma düzeltmesi

Faz 2'de tespit edilen ürün ızgarası sapması: `ShopInlineProducts` 2/2/4 sütun ve
16/32px boşlukla, kanonik `ProductGrid` ise 2/3/4 ve 20/24px. **Bu bir ürün
kararı** — F4.3'te sorulacak, sessizce hizalanmayacak.

---

## Faz 4 DoD

- [x] 33 CMS bileşeninde `@mui/material` import'u **sıfır**
- [x] `sx=` 185 → **0**, `styles.ts` 25 → **0**
- [x] `useScreen` CMS katmanında **sıfır** (11 dosya)
- [x] `componentMap` anahtarları ve `cmsTypes.ts` imzaları **değişmedi**
- [ ] Strapi'de içerik değiştirilmeden tüm bloklar aynı görünüyor
- [x] `ShopBanner`: LCP preload/fetchPriority/aspect-ratio korunuyor (prod HTML'den doğrulandı)
- [ ] Her blok 3 kırılımda karşılaştırıldı
- [x] `yarn build` → First Load JS + `/product/[id]` + `/` ölçüldü (ADR §10 adım 6)
- [ ] `/code-review high` temiz

## Kabul kriterleri

| Metrik | Faz 3 | Faz 4 hedefi |
|---|---|---|
| `'use client'` (uygulama kodu) | 128 | **< 110** |
| `sx=` | ~1.290 | **< 1.110** |
| `@mui/` içeren dosya | 152 | **< 120** |
| Ana sayfa First Load JS | ölçülecek | azalmalı |

> Plan hedefleri Faz 3'teki yaklaşık envanterle yazılmıştı. Uygulama öncesi gerçek
> sayı `sx=` için 1.444 olduğundan CMS kapsamındaki 185 kullanımın tamamı silinse de
> proje sonucu 1.259 oldu. Benzer şekilde CMS client direktifleri 17 → 10 inerken
> uygulama toplamı 122'de kaldı. `@mui/` hedefi 119 ile karşılandı.

---

## Riskler

| Risk | Etki | Önlem |
|---|---|---|
| **`SectionBase` 21 bloğu birden kırar** | CMS'in tamamı | `sx` geçen 9 blok aynı adımda; tek commit değil, blok blok doğrulama |
| **`ShopBanner` LCP mekanizması bozulur** | Ölçtüğümüz metrik geriler | Dönüşüm sonrası HTML'de preload + fetchPriority + srcset kontrolü |
| Tam-taşma CSS'e çevrilirken yatay kaydırma | Her sayfada görünür | `overflow-clip` korunacak; 3 kırılımda kontrol |
| `useScreen` sökümü davranış değiştirir | Mobil/masaüstü dalları | Her dosyada `down()` → taban+`md:` ezme dönüşümü (konvansiyon §2) |
| Strapi sözleşmesi kazara değişir | İçerik editörleri etkilenir | `componentMap` ve `cmsTypes.ts` diff'i her commit'te kontrol |

---

## Cevap bekleyen soru

**`ShopInlineProducts` ızgarası kanonik `ProductGrid`'e hizalansın mı?**
Bugün sm kırılımında 2 sütun (diğerleri 3) ve boşluk 16/32px (diğerleri 20/24px).
Hizalamak görsel bir değişiklik — ürün kararı, senin onayın gerekiyor.

---

## Uygulama sonucu (2026-09-09)

- CMS ağacında doğrudan `@mui/`, `sx=`, `styles.ts`, `useScreen` ve `useWindowSize`: **0**.
- `SectionBase` sunucu kabuğuna dönüştü. Dönen başlık yalnızca
  `DynamicTitleSection` client island'ında ölçüm/zamanlayıcı çalıştırıyor.
- CMS client dosyaları **17 → 10**. Kalanlar slider, accordion, istemci veri
  çekimi veya pathname davranışı taşıyor.
- `ShopBanner` tam taşma mantığı CSS'e geçti. Mobil/masaüstü görsel ve hedef URL
  seçimi hydration beklemeden `media` kurallarıyla yapılıyor.
- LCP için mobil ve masaüstü ayrı `media` koşullu preload alıyor. Prod HTML'de
  `imageSrcSet`, `imageSizes`, `fetchPriority="high"` ve `loading="eager"`
  doğrulandı; iki viewport aynı anda preload edilmiyor.
- `ShopInlineProducts` ürün kararı verilmediği için mevcut **2/2/4** sütun ve
  **16/32px** boşluk düzeninde bırakıldı.

### Ölçüm

| Metrik | Faz 3 | Faz 4 kod sonu |
|---|---:|---:|
| `sx=` (proje) | 1.444 | **1.259** |
| `styles.ts` dosya | 89 | **64** |
| `@mui/` içeren ts/tsx | 152 | **119** |
| First Load JS shared | 242 kB | **249 kB** |
| `/product/[id]` | 329 kB | **330 kB** |
| `/` | ölçülmemiş | **347 kB** |

Paylaşılan +7 kB'nin içinde CMS utility'leriyle büyüyen global Tailwind CSS
(build tablosunda 16,5 kB) de var. PDP toplamı yalnızca +1 kB olduğu için sayfaya
özel yük aynı anda küçüldü. Ana sayfanın Faz 3 sayısı kaydedilmediğinden `/` için
önce/sonra hükmü verilemiyor; bu ölçüm eksikliği geriye dönük giderilemez.

### Açık kapanış işleri

- Tüm CMS bloklarını 390 / 768 / 1440 px'te baseline ile karşılaştırma. Ana sayfa
  masaüstü ve tam geniş banner kullanıcı tarafından kontrol edildi.
- Faz sonu yüksek ayrıntılı code review.
- PSI anahtarı geldikten sonra performans kabul kriterlerinin ölçülmesi.
