# Geçiş konvansiyonları

**Üst plan:** [ADR-0002](../adr/0002-mui-to-tailwind-migration.md) · [Faz 1](./faz-1-primitifler.md)

Bu dosya geçiş boyunca **değişmez referans**. Bir `sx` bloğunu Tailwind'e çevirirken buraya bakılır.

---

## 1. Ölçek eşleştirmesi

MUI `spacing` birimi **8px** (theme.ts'te override yok → MUI varsayılanı).
Tailwind v4 `--spacing` birimi **4px**.

> **Kural: MUI değeri × 2 = Tailwind değeri.**

| MUI | px | Tailwind |
|---|---|---|
| `0.5` | 4 | `1` |
| `0.75` | 6 | `1.5` |
| `1` | 8 | `2` |
| `1.5` | 12 | `3` |
| `2` | 16 | `4` |
| `2.5` | 20 | `5` |
| `3` | 24 | `6` |
| `3.5` | 28 | `7` |
| `4` | 32 | `8` |
| `5` | 40 | `10` |
| `6` | 48 | `12` |
| `8` | 64 | `16` |
| `10` | 80 | `20` |

`gap`, `p`, `px`, `py`, `m`, `mt`, `mb` … hepsi aynı kurala tabi.
`gap={3}` → `gap-6` · `p={0.75}` → `p-1.5` · `px={2}` → `px-4`

**Köşe yarıçapı:** `shape.borderRadius: 8` → `rounded-lg`.

## 2. Kırılımlar

`theme.ts:91-99`'daki özel değerler `globals.css` `@theme` bloğuna taşındı:

| | MUI | Tailwind |
|---|---|---|
| xs | 0 | taban (prefix yok) |
| sm | 600 | `sm:` |
| md | 1000 | `md:` |
| lg | 1200 | `lg:` |
| xl | 1920 | `xl:` |

**Yön farkı — mekanik dönüşüm yoktur:**

```
MUI  theme.breakpoints.up('md')    →  Tailwind  md:        (min-width, birebir)
MUI  theme.breakpoints.down('md')  →  Tailwind  taban stil + md: ile EZME
                                      (mantık tersine çevrilir; max-width kullanılmaz)
```

`useMediaQuery` ile JS tarafında dallanma **yasak** (ADR §11). Responsive davranış CSS ile kurulur.

## 3. Renk

Tek kaynak `src/theme/palette.ts`; CSS değişkenleri `yarn tokens` ile üretilir.
Kod içinde **hard-coded hex yok.**

| palette.ts | CSS değişkeni | Tailwind |
|---|---|---|
| `primary.main` | `--color-primary` | `bg-primary` |
| `primary.light` | `--color-primary-light` | `bg-primary-light` |
| `primaryDark.main` | `--color-primaryDark` | `bg-primaryDark` |
| `text.disabled` | `--color-text-disabled` | `text-text-disabled` |
| `gray[500]` | `--color-gray-500` | `bg-gray-500` |

Grup adları `palette.ts`'teki haliyle korunur (camelCase dahil), varyantlar kebab olur — gerekçe `scripts/generate-tokens.mjs` başındaki nota bakın.

**Alfa ekleri:** eski kod `${color.main}20` gibi hex'e alfa ekliyordu. Bunlar **onaltılık**:

| hex eki | gerçek alfa | Tailwind |
|---|---|---|
| `10` | 6,27% | `/[6.27%]` |
| `20` | 12,5% | `/[12.5%]` |
| `40` | 25,1% | `/[25.1%]` |
| `60` | 37,6% | `/[37.6%]` |
| `80` | 50,2% | `/[50.2%]` |

`bg-secondary/[6.27%]` — `/10` yazmak **yanlış olur** (o %10 demek, %6,27 değil).

## 4. Komponent yazım kuralları

- Varsayılan **server component**. `'use client'` bir karardır, commit mesajında gerekçelenir.
- Varyantlar `cva` ile komponentin yanındaki `variants.ts`'te; çağrı yerinde koşullu class stringi kurulmaz.
- `cn()` yalnızca dışarıdan gelen `className`'i birleştirmek için.
- **Class adları literal olmak zorunda.** Tailwind kaynağı statik tarar; `` `gap-${n}` `` derlenmez. Eşleme tabloları (`const GAP = { 1: 'gap-2' }`) kullanılır.
- `sx` propu kabul eden komponent yazılmaz — Emotion'ı geri getirir.
- Semantik HTML: `div`+`onClick` yerine `<button>`; başlıklar `h1..h6`.

## 5. `sx` dönüştürme sırası

Bir komponenti çevirirken:

1. `styles.ts` dosyasını aç, kullanılan her anahtarı bul
2. Ölçek (§1) ve renk (§3) tablolarıyla utility'lere çevir
3. Responsive blokları §2'ye göre çevir — `down()` görünce **tersine çevir**
4. `styles.ts`'i **sil**, `sx` propunu kaldır
5. 3 kırılımda görsel karşılaştır

## 6. ⚠️ Katman önceliği — Emotion, Tailwind'i her zaman ezer

**2026-09-08'de pilot dilimde ölçülerek bulundu.** Geçişin en önemli teknik kısıtı bu.

Tailwind v4 utility'leri `@layer utilities` içinde üretilir. Emotion (MUI `sx`, `styled`) ise **katmansız** CSS yazar. CSS kademelendirmesinde **katmansız kurallar katmanlı kuralları her zaman yener** — özgüllük ve kaynak sırası fark etmez.

Gözlenen örnek:

```
<article class="hidden ... MuiBox-root mui-8gt7rj">
  .mui-8gt7rj { display: flex }      <- Emotion, katmansız  → KAZANIR
  .hidden      { display: none }     <- Tailwind, @layer utilities → kaybeder
```

`hidden` sınıfı hiçbir şey yapmadı; öğe mobilde gizlenmesi gerekirken görünür kaldı.

**Sonuçları:**

1. ADR §5.3'teki "aynı elemanda `sx` ve `className` karıştırma" kuralı bir üslup tercihi değil, **doğruluk şartıdır**. Karıştırırsan Tailwind sınıfın sessizce yok sayılır.
2. Henüz dönüşmemiş bir MUI komponentine sınıf geçirmek gerekiyorsa **sarmalayıcı `<div>` kullan** — sarmalayıcıda Emotion kuralı olmadığı için Tailwind çalışır.
3. `!important` (`!hidden`) işe yarar ama **son çare**; kalıcı hâle gelirse dönüşüm bittiğinde temizlenmesi gereken borç bırakır.
4. Bu kısıt Faz 6'da son `@mui` import'u gidince kendiliğinden ortadan kalkar.

**Kontrol yöntemi:** bir sınıf beklendiği gibi çalışmıyorsa tarayıcı konsolunda

```js
[...document.styleSheets].flatMap(s => { try { return [...s.cssRules] } catch { return [] } })
  .filter(r => r.selectorText && el.matches(r.selectorText))
```

ile hangi kuralın eşleştiğine bak; `mui-*` seçicisi görüyorsan sebebi budur.

## 7. `Grid` neden şim'lenmiyor

**Ölçüm (2026-09-08):** 19 dosya · 22 `container` · 43 `item` · özel `columns` propu **0 kez** · `offset` **hiç yok** · `order` 1 kez.

En sık item kombinasyonları: `xs=12` (7) · `xs=6 sm=4 md=3` (6) · `xs=12 sm=6` (4) · `xs=6` (4) · `xs=6 sm=4 md=4` (3)

Üç sebeple düz `<div>` + grid utility'leri yeterli:

1. **Özel `columns` hiç kullanılmamış** → her yerde 12 sütun varsayılanı. `xs=6` = yarım, `md=3` = çeyrek. Bunlar doğrudan `grid-cols-2` / `grid-cols-4` demek.
2. **Bir container'daki item'lar çoğunlukla aynı genişlikte** → tüm düzen **tek bir sınıf dizisiyle ebeveynde** ifade ediliyor, çocukların hiçbir prop'a ihtiyacı kalmıyor. 43 `<Grid item>` elemanı sade çocuklara dönüşüyor:

   ```tsx
   // ÖNCE
   <Grid container spacing={2}>
     {items.map(x => <Grid item xs={6} sm={4} md={3} key={x.id}>{...}</Grid>)}
   </Grid>

   // SONRA — çocuklarda sınıf yok
   <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
     {items.map(x => <div key={x.id}>{...}</div>)}
   </div>
   ```

3. **Şim yazmanın maliyeti yüksek:** Tailwind dinamik sınıf üretemez, yani `xs..xl × 1..12` için **60 span + 60 cols literal**'i elle tabloya yazmak gerekirdi — hem de Tailwind'in ihtiyaç duymadığı 12 sütunluk zihinsel modeli kalıcılaştırarak.

**Karışık genişlikli container'larda** (bir çocuk `xs=12`, diğeri `xs=6`) çocuk `col-span-*` alır. Bu istisna, kural değil.

### ⚠️ Fidelity tuzağı: MUI Grid CSS grid DEĞİL

MUI Grid v1 **negatif margin + padding** ile çalışır: `spacing={2}` container'a `margin:-16px`, item'lara `padding:16px` verir. Tailwind `gap` bunu yapmaz — dönüşümde **dış kenarlardaki negatif margin kaybolur**, yani ızgara kenarları spacing kadar kayabilir.

Bu yüzden her Grid dönüşümü **3 kırılımda gözle karşılaştırılır**; hizalama kaydıysa ebeveyne telafi edici `-mx-*` değil, doğru `px-*` verilir.

### 12 sütun → grid-cols dönüşüm tablosu

| MUI item | oran | Tailwind (ebeveynde) |
|---|---|---|
| `12` | tam | `grid-cols-1` |
| `6` | 1/2 | `grid-cols-2` |
| `4` | 1/3 | `grid-cols-3` |
| `3` | 1/4 | `grid-cols-4` |
| `2` | 1/6 | `grid-cols-6` |
| karışık | — | çocukta `col-span-*` (ebeveyn `grid-cols-12`) |

## 8. Form alanı ölçeği — tek karar

Dönüşüm sırasında "form alanı nasıl görünür" kararı **6 dosyaya dağılmıştı**
(52px / 48px / 36px yükseklik, 11px / 8px köşe, üç farklı kenarlık rengi).
Bu MUI'den devralınan bir tutarsızlıktı; birebir taşındığı için görünür oldu.

**2026-09-08'de tek yere alındı** — `ui/Input`:

| eksen | değerler |
|---|---|
| `size` | `small` 36px · `medium` 46px · **`large` 48px (form standardı)** |
| `variant` | `outlined` (beyaz + kenarlık) · `soft` (gray-50 dolgulu form alanı) |

Çağrı yerlerinde artık `size="large" variant="soft"` yazılır; dosya içi
`*_FIELD_CLASS` sabitleri kaldırıldı.

**Bu adımda yapılan üç bilinçli görsel değişiklik:**

1. Ayarlar sayfası alanları **52px → 48px** (4px), köşe 11px → 8px.
2. `#F7F7F8` → `gray-50` (#F5F5F7) — 2 birim fark, hard-coded hex gitti.
3. **Odak rengi her yerde `primary`.** MUI'de bazı form alanları odaklanınca
   kırmızıya (`#C1121F` = error) dönüyordu. Kırmızı "hata" demektir, "odak"
   değil — düzeltildi.
