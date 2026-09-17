# ADR-0003 — Marka sayfası (`/brand/[slug]`): ISR + etiket bazlı revalidation

**Durum:** Uygulanıyor — Faz 1 ve Faz 3 tamam (feature/brand-page), Faz 0/4/5 açık
**Tarih:** 2026-09-17
**İlgili:** [ADR-0001](./0001-pdp-isr-webhook-revalidation.md), [ADR-0002](./0002-mui-to-tailwind-migration.md)
**Tasarım:** Claude artifact "mitenya Marka Sayfası" → "Birleşik · Masaüstü / Mobil" artboard'ları

---

## 1. Bağlam

- Bugün marka için ayrı bir sayfa yok; marka linkleri `/search?brand=<slug>` filtresine gidiyor. Bu adres indekslenecek bir sayfa değil, yani "<marka> güneş kremi", "<marka> orijinal" gibi aramalardan trafik alınamıyor.
- Katalog küçük (marka başına 1–3 ürün). Sadece ürün ızgarası olan bir sayfa Google gözünde ince içerik olur; sayfanın değeri markaya özel metinden gelir.
- **Kısıt:** Sayfa veritabanına ziyaretçi sayısıyla orantılı yük bindirmemeli.

## 2. Karar

1. **Rota:** `src/app/(shop)/brand/[slug]/`, mevcut `/product`, `/category`, `/collection` ile tutarlı.
2. **Render:** ADR-0001 deseni. `dynamic = 'force-static'`, `revalidate = 3600`. PDP gibi `generateStaticParams` YOK: sayfa ilk istekte üretilip cache'lenir. Böylece build Strapi/Supabase erişimine bağlanmaz (veri katmanı hata durumunda fırlatır; build'de fırlatsaydı tüm build düşerdi).
3. **Veri kaynakları (tek sorumluluk):**
   | Veri | Kaynak | Nasıl |
   |---|---|---|
   | Marka kimliği (id, ad, slug) | Supabase `brands` | Mevcut `filterCache` (Redis), **ek sorgu yok** |
   | Ürün listesi, fiyat, puan | Supabase `products` (+ prices/images/benefits embed; **stok yok**) | **Marka başına tek sorgu**, `unstable_cache` + tag `brand:<brand_id>` |
   | Marka metinleri, SSS, karşılaştırma, içerik kartları, SEO | Strapi `brand` collection type | Doğrudan Strapi fetch (ADR-0001 Faz A deseni, self-fetch yok), tag `brand-content:<slug>` |
   | Marka etiketli blog yazıları | Strapi `blog` → `brands` ilişkisi | Aynı Strapi isteğinde populate |
4. **Tazelik:** Olay bazlı. `/api/revalidate` ürün etiketinin yanında `brand:<record.brand_id>` ve `brand:<old_record.brand_id>` etiketlerini de düşürür (ürünün markası değişirse eski sayfa da yenilenir). Strapi'de marka/blog yayınlanınca Strapi webhook'u `brand-content:<slug>` etiketini düşürür. `revalidate = 3600` yalnızca güvenlik ağıdır.
5. **Liste üst sınırı:** Statik sayfada en fazla `BRAND_PAGE_PRODUCT_LIMIT = 24` ürün gösterilir; fazlası için "Tümünü gör" → `/search?brand=<slug>`. Sayfalama için yeni dinamik rota açılmaz.
6. **Satın alma ürün detayında (2026-09-17):** Marka sayfasında sepete ekle yok, stok gösterilmez; her ürün "Ürünü incele" ile PDP'ye gider. Gerekçe: stok değişikliği webhook'u tetiklemiyor (Faz 0) → 1 saatlik cache'te bayat stok; ayrıca sayfa tamamen server component kalır (client island yok).
7. **Türetilmiş veri ek sorgu yapmaz:** Ürün sayısı, içerik etiketleri ve JSON-LD aynı ürün listesinden hesaplanır.

### DB yükü (hesap, ölçüm değil)

Marka başına saatte en fazla 1 regenerasyon + ürün değişikliği başına 1 → 5 marka için günde ≤ ~120 sorgu artı webhook kaynaklı sorgular. **Ziyaretçi sayısından bağımsız.** `fetchProductsSupabase` (facet + 7 paralel sorgu) bu sayfada **kullanılmaz**.

## 3. Strapi şeması (mitenya-cms, Strapi 4.10.7)

Yeni collection type **`brand`** (draftAndPublish) — **uygulandı (mitenya-cms, yerel SQLite)**:

| Alan | Tip | Not |
|---|---|---|
| `name` | string, required | |
| `slug` | uid(name), required, unique | Supabase `brands.slug` ile eşleşme anahtarı |
| `logo` | media (image) | |
| `tagline` | string | Hero alt başlığı |
| `intro` | text | Hero kısa tanıtım |
| `about` | text | Uzun marka metni (sayfa altı); düz metin, paragraflar boş satırla ayrılır (projede Markdown çözücü yok) |
| `facts` | repeatable `shared.brand-fact` (yeni: `label`, `value`) | Menşei, uzmanlık, güvence |
| `productNotes` | repeatable `shared.brand-product-note` (yeni: `productSlug`, `note`) | Ürün kartı kısa açıklaması |
| `ingredients` | repeatable `shared.ingredient-item` (mevcut) | İçerik kartları |
| `comparison` | `shared.comparison-table` (yeni: `title`, `subtitle`, `columnA/B/C`, `rows` → repeatable `shared.comparison-row`: `label`, `valueA/B/C`) | En fazla 3 sütun; `columnC` boşsa 2 sütun |
| `routine` | repeatable `shared.routine-step` (yeni: `title`, `timing` enum sabah/aksam/sabah_aksam, `productSlugs` virgüllü slug listesi (regex'li), `fallbackLabel`, `fallbackUrl`) | Opsiyonel |
| `faqs` | repeatable `shared.accordion-item` (mevcut: `title`, `description`) | `faq-item` değil: o `categories` alanını zorunlu tutuyor |
| `seo` | `shared.seo` (mevcut) | metaTitle/metaDescription/canonical |
| `blogs` | relation manyToMany ↔ `blog.brands` | Marka etiketli rehberler |

`blog` tipine `brands` (manyToMany, `inversedBy: blogs`) ilişkisi eklendi.

**Prod notu:** Strapi prod Neon Postgres kullanıyor; deploy additive migration yapar (yeni tablolar). Prod `STRAPI_BEARER` token'ı custom scope'luysa `brand` için `find`/`findOne` izni verilmeli.

**Kural:** Opsiyonel her bölüm veri yoksa **hiç render edilmez** (boş başlık yok). Strapi kaydı hiç yoksa sayfa yine üretilir (sadece ürünler + otomatik açıklama) ama `noindex` alır; ince içerik indekslenmez.

## 4. SEO

- H1 = marka adı; slogan H1 değil.
- `generateMetadata`: Strapi `seo` → yoksa şablon metin; canonical `/brand/<slug>`.
- JSON-LD: `Brand`, `ItemList` (ürün URL'leri), `BreadcrumbList`. `src/lib/seo/` altına `brandJsonLd.ts` (`productJsonLd` deseninde). FAQ JSON-LD eklenmez (Google 2023'ten beri çoğu sitede göstermiyor); SSS metni sayfada durur.
- `sitemap.ts`'e marka sayfaları eklenir (mevcut `NEXT_PUBLIC_ALLOW_INDEXING` benzeri bir bayrak varsa ona uyar).
- `/search?brand=<slug>` → marka sayfası canonical'ı değil; arama sayfası zaten indekslenmemeli (kontrol edilecek). Site içi marka linkleri (`ShopBrand`, `ShopBrands`, `ShopBrandShowcase`, PDP marka adı) `/brand/<slug>`'a çevrilir.
- "Devamını oku" metni CSS ile kısaltılır; metin HTML'de tam kalır.

## 5. Kod yapısı

```
src/app/(shop)/brand/[slug]/
  page.tsx          # server; force-static, revalidate, generateStaticParams, generateMetadata
  data.ts           # getBrandPageData(slug): unstable_cache + react cache() (PDP data.ts deseni)
  sections/         # BrandHero, BrandProducts, BrandIngredients, BrandComparison,
                    # BrandRoutine, BrandFaq, BrandGuides, BrandAbout, OtherBrands
src/lib/api/supabaseBrand.ts      # fetchBrandProducts(brandId, limit) — tek sorgu, mapShopProductRow
src/lib/api/cmsBrand.ts           # fetchBrandContent(slug) — doğrudan Strapi
src/lib/cache/tags.ts             # productTag / brandTag / brandContentTag / ALL_BRAND_CONTENT_TAG — TEK kaynak
src/lib/shop/brandPath.ts         # /brand/<slug> — TEK kaynak
src/lib/hooks/useQuickAdd.ts      # sepete ekle akışı (ProductCard ile ortak)
src/lib/seo/brandJsonLd.ts
```

- Bölümler **server component**; sayfada client island yok ("Devamını oku" ve SSS saf CSS/`<details>`). MUI yok, ADR-0002 konvansiyonları.
- Cache tag string'leri tek dosyada (`tags.ts`); hem `data.ts` hem `/api/revalidate` buradan import eder. PDP'deki `productCacheTag` da oraya taşınır (sessiz sapma olmasın).

## 6. Fazlar

| Faz | İş | Doğrulama |
|---|---|---|
| **0** | Supabase kontrolleri — **bulgular (2026-09-17):** `products(brand_id)`, `product_prices(product_id)`, `product_stock(product_id)` indeksleri yoktu → **eklendi**. `product_prices`'ta iki sync tetikleyicisi var (`sync_price_to_product`, `sync_prices_to_main_product`; tanımları doğrulanacak, çift iş şüphesi). `product_stock` değişikliği `products`'a dokunmuyor → `pdp-revalidate` webhook'u tetiklenmiyor (PDP 5 dk bayat stok) → çözüm: [`docs/sql/2026-09-17-product-stock-touch-product.sql`](../sql/2026-09-17-product-stock-touch-product.sql) | SQL / panel kontrolü |
| **1** | `tags.ts`, `supabaseBrand.ts` + test, `/api/revalidate` brand etiketi + test | Vitest |
| **2** | Strapi şeması (mitenya-cms) + Beauty of Joseon için örnek içerik | Strapi lokal |
| **3** | Rota + bölümler (tasarıma göre, masaüstü + mobil) | Lokal görsel karşılaştırma |
| **4** | JSON-LD, metadata, sitemap, site içi linklerin `/brand`'e çevrilmesi | Rich Results Test, build çıktısında `○`/`●` |
| **5** | Staging: ISR + webhook uçtan uca, `/code-review high` | Fiyat değiştir → sayfa saniyeler içinde güncellenir |

## 7. Riskler

- **Webhook kapsamı:** Fiyat/stok ayrı tablolarda. Webhook sadece `products`'ı dinliyorsa fiyat değişikliği hem PDP'de hem marka sayfasında 1 saate kadar gecikir → Faz 0'da doğrulanmalı; gerekirse iki tabloya da webhook (payload'da `product_id` → brand_id çözümü gerekir).
- **`force-static` kör araç:** render ağacına `cookies()`/`headers()` eklenmemeli (ADR-0001 ile aynı uyarı).
- **İçerik bağımlılığı:** Trafik tasarımdan değil markaya özel metinden gelir; Strapi içeriği girilmeden sayfa `noindex` kalır.
- **Karar (2026-09-17):** Ürün kartındaki kısa açıklama ("pitch") Strapi `brand.productNotes` içinde, ürün slug'ına bağlı tutulur (repeatable `shared.brand-product-note`: `productSlug`, `note`). Eşleşmeyen ürünün notu yoksa kart açıklamasız render edilir.
