# ADR-0001: Ürün sayfası (PDP) — ISR kabuk + webhook revalidation

- **Durum:** Kabul edildi (uygulama aşamalı)
- **Tarih:** 2026-06-13
- **Kapsam:** `src/app/(shop)/product/[id]/*`, `(shop)/layout.tsx`, `src/lib/api/cms.ts`, CMS `/api/cms/*` route'ları, Supabase ürün veri katmanı

## Bağlam / Problem

PDP mobil LCP ~4,3 s (10-run prod ort.). Kalan en büyük kaldıraç **TTFB ~1 s** — sayfa `force-dynamic` olduğu için her istek sunucuda sıfırdan render ediliyor.

ISR'a (statik kabuk + cache) geçişi iki şey engelliyordu:
1. **Self-fetch anti-pattern:** sayfa kendi `/api/cms/*` route'larına `bring()` ile HTTP atıyor (`127.0.0.1:3000`). Build'de sunucu olmadığı için `ECONNREFUSED` → prerender olamıyor.
2. `headers()` çağrıları (`isPreviewBot`, `isSSR`) — dinamik API'ler, route'u dynamic'e zorluyor (aslında dynamic-render maliyetinden kaçınmak için yazılmış workaround'lar; ISR'da gereksiz).
3. Supabase sorgusu (`supabase-js`) Next data cache'ine girmiyor → cache'siz fetch sinyali.

**Deneyle kanıtlandı (2026-06-13):** Self-fetch'ler kaldırılıp + Supabase `unstable_cache`'lenip + `headers()` çıkıp + `dynamic='force-static'` verilince route `ƒ` (Dynamic) → `○` (Static/ISR) oluyor.

## Karar

**ISR kabuk + SSR'lı fiyat/stok + on-demand webhook revalidation.**

Fiyat ve stok HTML'de ve JSON-LD'de **SSR'lı kalır**; tazelik **olayla** (ürün değişince webhook → `revalidateTag`) sağlanır. `revalidate=300` altta güvenlik ağı olarak durur.

## Neden client island DEĞİL (önemli — ileride cazip görünebilir)

"Fiyat/stok'u client island yap, her zaman canlı olsun" cazip ama **bu site için yanlış.** Gerekçeler:

1. **JSON-LD fiyat/availability SSR'lı** (`src/lib/seo/productJsonLd.ts`). Google Shopping/rich-result bunu okur. Island yaparsak JSON-LD'deki fiyat cache'lenmiş/bayat kalır → yanlış zengin sonuç, Merchant sorunları.
2. **Kişiselleştirilmiş/bölgesel fiyat YOK** (tek para birimi TRY). Client-island'ın *tek gerçek gerekçesi* (kişiye özel fiyat cache'lenemez) burada yok.
3. **CLS:** fiyat satın-alma kutusunda (fold'da). Client-fetch → skeleton→değer kayması = CLS regresyonu (sıfırda tuttuğumuz metriği bozar).
4. **Oversell riski yok:** `checkout/session` → `reserveCheckoutStock` otoriter stok rezervasyonu yapıyor. PDP'deki stok "gösterge"; gerçek kontrol checkout'ta → hafif bayat stok güvenli.

> **Kural:** Client-island'ı yalnızca **gerçekten kişiselleştirilmiş/gerçek-zamanlı** veri için kullan. Bu site fiyatı global → cache + webhook doğru tercih. İleride bölgesel/üyelik fiyatı eklenirse bu karar yeniden değerlendirilmeli.

## Uygulama — aşamalı

**Faz A (güvenli refactor, davranış değişmez, lokal doğrulanabilir):**
1. `pdpBlocks` + `coupon`'u client-fetch'e taşı (below-fold/modal; SEO önemsiz — sadece içerik zenginleştirme). Sayfa render'ından self-fetch çıkar.
2. `(shop)` layout header/footer → doğrudan-Strapi-fetch (sunucu, cache'li) — self-fetch yerine.
3. Supabase ürün sorgusu → `unstable_cache` + `tags: ['product:<slug>']`.

**Faz B (ISR flip — STAGING'de doğrula, prod davranışını değiştirir):**
4. `headers()` gate'lerini kaldır (`isPreviewBot`/`isSSR`) + `dynamic='force-static'` + `revalidate=300`.
5. `/api/revalidate` route'u (secret korumalı) + Supabase webhook (ürün değişince) → `revalidateTag('product:<slug>')`.

## Sonuçlar / Takaslar

**Kazanç:** TTFB ~1 s → ~0,1-0,4 s. LCP düşer. CLS korunur (fiyat SSR'lı). Self-fetch anti-pattern'i kalkar (kod kalitesi artar).

**Riskler / dikkat:**
- **`force-static` kör araç:** ileride biri render ağacına `cookies()`/`headers()` eklerse sessizce boş döner (throw etmez). Bu yüzden lint/yorum uyarısı bırakıldı.
- **Webhook kırılgan parça:** düşerse fiyat bayatlar → `revalidate=300` güvenlik ağı zorunlu.
- **Layout paylaşımlı:** header/footer değişikliği tüm shop sayfalarını etkiler — geniş blast radius, dikkatli test.
- **Lokalde tam doğrulanamaz:** dev env `revalidate:0` + build'de Strapi/sunucu yok. **Faz B staging'de doğrulanmalı.**

## Geri almak istersek

- ISR'ı kapat: `page.tsx`'te `dynamic='force-static'` → `'force-dynamic'`. Anında eski davranış.
- Client-island'a dönmek istersen: bu ADR'deki "neden client island değil" gerekçelerini önce çürüt (özellikle JSON-LD ve CLS).
