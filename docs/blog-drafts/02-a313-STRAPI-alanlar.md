# A313 rehberi — Strapi `blogs` alan listesi

Kod referansı: `src/app/api/blogs/[slug]/route.ts` (populate: `cover`, `seo`) ·
`src/app/(shop)/blog/[slug]/view.tsx` · `src/app/(shop)/blog/[slug]/page.tsx`

---

## Kök alanlar

### `title`
```
A313 Krem Nedir, Ne İşe Yarar? Kullanım Rehberi ve Sonuçları
```

### `slug`
```
a313-krem-nedir-nasil-kullanilir
```

### `content`
`02-a313-STRAPI-content.html` dosyasının tamamı. Strapi rich text alanı HTML
saklıyorsa doğrudan yapıştır; WYSIWYG ise **kaynak/HTML görünümüne geçip** öyle
yapıştır, aksi halde editör etiketleri yeniden yazar.

### `excerpt`
```
Fransız eczanelerinin retinol klasiği A313 Pommade'ın ne olduğu, ilaç mı kozmetik mi olduğu, doğru kullanımı, yan etkileri ve sahtesinin nasıl ayırt edildiği.
```

### `publishDate`
```
2026-09-14
```

### `cover`  *(medya — EKSİK)*
Hero görseli. `view.tsx` bunu yazının üstünde kullanıyor; `seo.metaImage` boşsa
Open Graph görseli de buradan geliyor.
**Gerekli:** A313 Pommade tüpünün (200.000 U.I. ibareli olan) yatay çekimi.
`alternativeText` alanını boş bırakma.

---

## `seo` bileşeni

### `metaTitle`
```
A313 Krem Ne İşe Yarar? Nasıl Kullanılır, Zararları Var mı?
```
> ⚠️ **Sonuna `| Mitenya` YAZMA.** Layout şablonu zaten ekliyor. Canlıdaki
> retinol yazısında başlık `... | Mitenya | Mitenya` görünüyor; sebebi bu.

### `metaDescription`
```
A313 Pommade nedir, ne işe yarar, nasıl kullanılır? İlaç mı kozmetik mi, kaç U.I. içerir, sahtesi nasıl anlaşılır, yan etkileri neler? Tüm sorular tek rehberde.
```

### `keywords`
```
a313 krem ne işe yarar, a313 nasıl kullanılır, a313 nedir, a313 sahtesi nasıl anlaşılır, a313 yüzde kaç retinol, a313 ilaç mı, a313 yan etkileri
```

### `canonicalURL`
Boş bırak — `page.tsx:48` otomatik `https://mitenya.com/blog/<slug>` üretiyor.

### `metaImage`
Boş bırakılabilir — `cover`'a düşüyor.

### `structuredData`
`02-a313-STRAPI-structuredData.json` dosyasının tamamı.
`page.tsx:81` bunu okuyup `<script type="application/ld+json">` olarak basıyor.
**Şu an canlı yazıda bu alan boş, o yüzden hiç şema çıkmıyor.**

---

## Elle yapılmayacak olanlar

| Ne | Nasıl oluyor |
|---|---|
| Başlık `id`'leri ve içindekiler | `article.ts` `prepareArticle()` — `h2`'lerden otomatik |
| Tablo mobil kaydırma | `prepareArticle()` her `<table>`'ı sarıyor |
| Görsel `srcset` / `lazy` | `enhanceArticleImages()` — CDN loader'ından |
| Okuma süresi | kelime sayısı / 200 |
| **İlgili ürünler rafı** | `products.ts` — yazının metnini Supabase ürün adı/marka/kategorisiyle eşleştiriyor. A313, Celimax ve Mary May adları metinde geçtiği için raf kendiliğinden dolar. |

---

## Yayın öncesi kalan 2 fotoğraf

Ürün galerisindeki mevcut kareler incelendi:

| Mevcut dosya | İçerik | Kullanım |
|---|---|---|
| `products/.../2.webp` | Mavi tüp, "200.000 U.I. pour cent · POMMADE" okunuyor | ✅ **Kullanıldı** — tüp baskısı kontrolü (içerikte bağlı) |
| `products/.../3.webp` | Pomad sıkılırken yakın çekim | ✅ `cover` alanı için uygun |
| `products/.../main.webp`, `1.webp` | **Crème au palmitate de rétinyle** tüpü | ❌ Farklı ürün — Pommade rehberinde kullanılamaz |

Hâlâ çekilmesi gereken **2 kare**:

```
cdn.mitenya.com/blog/a313/sahte-kontrol-1-uretici.webp  → kutu ARKASI, "Pharma Developpement" satırı
cdn.mitenya.com/blog/a313/sahte-kontrol-3-kod.webp      → barkod + parti (lot) no + SKT
```

İkisi de `width="1200" height="900"` (4:3) ile yazılı. Farklı orana çekersen
HTML'deki bu iki değeri güncelle, yoksa CLS rezervasyonu yanlış olur.

> ⚠️ `main.webp` ve `1.webp` ürün sayfasından da çıkarılmalı: rehber "tüpte
> 200.000 U.I. yazmalı" diyor, o iki karede bu ibare yok — okuyucu kendi
> aldığı ürünü sahte sanabilir.
