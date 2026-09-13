# DEVAM — MUI → Tailwind geçişini devralan için

**Son güncelleme:** 2026-09-10
**Dal:** `refactor/tailwind-migration` · **HEAD:** `2916ab9`
**⚠️ HİÇBİR ŞEY COMMİT EDİLMEDİ** — Faz 0–5 işi çalışma ağacında; `git status --short` yaklaşık 195 kayıt gösteriyor.

Bu dosya, işi devralan kişinin/ajanın **tek giriş noktasıdır**. Önce bunu oku, sonra §1'deki dokümanları.

---

## 0. İlk 5 dakika

```bash
cd "~/Desktop/prod projects/cosmetic-website/mitenya"
git branch --show-current          # refactor/tailwind-migration olmalı
git status --short | wc -l         # ~163 kayıt
yarn dev                           # :3000 — CMS için localhost:1337'de Strapi ÇALIŞMALI
yarn vitest run src/components     # 36 test, hepsi yeşil olmalı
npx tsc --noEmit                   # 30 hata çıkar, HEPSİ ÖNCEDEN VARDI (bkz. §7)
```

**Strapi olmadan ana sayfa 404 verir** — CMS verisi `localhost:1337`'den geliyor.

**`yarn build` ile `yarn dev` AYNI ANDA ÇALIŞTIRILAMAZ.** İkisi de `.next`'e yazıyor; build dev'i bozuyor ve sayfalar 500 vermeye başlıyor. Bu tuzağa 3 kez düşüldü. Build gerekiyorsa: dev'i durdur → `rm -rf .next` → build → tekrar `yarn dev`.

---

## 1. Dokümanlar (okuma sırası)

| Dosya | İçerik |
|---|---|
| `docs/adr/0002-mui-to-tailwind-migration.md` | **Ana karar dokümanı.** Gerekçe, fazlar, kabul kriterleri (§7.1), çalışma yöntemi (§10), kod standartları (§11) |
| `docs/migration/konvansiyon.md` | **Dönüşüm kuralları.** Ölçek/renk/kırılım tabloları, ⚠️ §6 katman tuzağı, §7 Grid, §8 form ölçeği |
| `docs/migration/faz-0-altyapi.md` … `faz-4-cms-bloklari.md` | Faz planları ve kapanış notları |
| `docs/perf-baseline.md` | Her fazın ölçümleri — **yeni faz kapanışında sütun eklenir** |

---

## 2. Nerede kalındı

| Faz | Durum |
|---|---|
| **Faz 0** altyapı | ✅ Tailwind v4, token üretici, cn(), lint kuralları |
| **Faz 1** primitifler | ✅ Stack, Typography, Button, Link, Divider + 2 pilot |
| **Faz 2** davranışlı komponentler | ✅ **zincir hariç** (bkz. §4) |
| **Faz 3** formlar | ✅ kod bitti · ⏳ elle uçtan uca test yapılmadı (§5) |
| **Faz 4** CMS blokları | ✅ kod tamamlandı · ⏳ tüm blokların 3 kırılım görsel review'u bekliyor |
| **Faz 5** sayfalar + zincir | 🚧 F5.0–F5.1 tamam; F5.2 sürüyor — `faz-5-kabuk-sayfalar.md` |
| **Faz 6** Emotion söküm | ⏳ |

### Güncel metrikler (2026-09-10, Faz 5 / F5.2 ara durum)

```
'use client' : 111 (uygulama, gerçek direktif) + 12 (ui/ primitifleri)
sx=          : 972
styles.ts    : 52 dosya · 7.058 satır
@mui/ içeren : 95 ts/tsx dosya
CMS katmanı  : 0 @mui · 0 sx= · 0 styles.ts · 0 useScreen
```

Son prod build: paylaşılan **249 kB**, `/uyelik` **307 kB**, `/checkout`
**329 kB**, `/cart` **296 kB**, `/product/[id]` **324 kB**, `/` **335 kB**,
`/search` **327 kB**. Faz 4'e göre `/` −12 kB, checkout −26 kB.

---

## 3. SIRADAKİ İŞ: Faz 5 uygulaması

Faz 5 planı yazıldı ve kullanıcının “devam et” talimatıyla uygulama başladı:
**`docs/migration/faz-5-kabuk-sayfalar.md`**. Sıra:

1. ✅ F5.0 sunucu kabuğu ve ana sayfa.
2. ✅ F5.1 `Card` → `ModalCard` → `Banner` bağımlılık zinciri.
3. 🚧 F5.2 ana `Navigation/index.tsx`; Footer ve bağımsız
   menü/popover/drawer parçaları tamamlandı.

Faz 4'ün tüm blokları kapsayan 390 / 768 / 1440 px görsel karşılaştırması
ayrı kapanış maddesi olarak açık kalır.

`ShopBanner` prod HTML'inde mobil/masaüstü ayrı media koşullu preload,
`imageSrcSet`/`imageSizes`, `fetchPriority="high"` ve `loading="eager"` doğrulandı.
Tam genişlik hatası `SectionBase` inline `maxWidth` önceliğinden kaynaklanıyordu;
tam taşan bölümlerde inline sınır kaldırılarak düzeltildi ve kullanıcı kontrol etti.

---

## 4. Faz 4/5'e DEVREDİLEN ZİNCİR (Faz 2'de bilerek bırakıldı)

```
common/Card (18 tüketici, çağrı yerlerinde 35 sx)
   └── common/ModalCard (11 tüketici)
          └── Modal 1 · Drawer 1 · Menu 2 · Popover 2 · MenuItem 28 · Accordion 3
              (Navigation · AccountMenu · CategoriesDrawer · ShoppingCartButton ·
               AddressCard · AddressbookCard · layoutView)
common/Banner (12 tüketici, 5 çağrı yerinde sx) — Card ile aynı sorun
```

**Neden ertelendi:** `Card`'ın `sx` prop'unu kaldırmak 35 çağrı yerini kırar; yani `Card`'ı dönüştürmek 18 dosyayı Faz 4/5'ten öne çeker. Kullanıcı kararı: zincir kendi fazında, sayfalarıyla birlikte dönüşecek.

**Ayrıca bekleyen 2 tekil iş:**
- `ProductReviews`'daki `LinearProgress` **determinate** (puan dağılımı) — `ui/ProgressBar` şu an sadece belirsiz modu destekliyor, `value` desteği eklenmeli.
- `AddressCard`'daki son `Fade` — `smDown` yani `useScreen`'e bağlı, onunla birlikte gitmeli.

---

## 5. YAPILMAMIŞ DOĞRULAMALAR (Faz 3 DoD'unda açık)

Bunlar henüz tamamlanmadı:

- [ ] **PayTR ile gerçek test siparişi** — checkout formu dönüştü, ödeme akışı elle denenmedi
- [ ] Kayıt · giriş · şifre sıfırlama · adres ekleme/düzenleme akışları elle
- [ ] Tarayıcı **otomatik doldurma** ve **şifre yöneticisi** denemesi (`autoComplete` değerleri korundu ama test edilmedi)
- [ ] Tüm CMS bloklarında 3 kırılım görsel karşılaştırması (Playwright CLI ile ana sayfa/banner masaüstü kontrol edildi)
- [ ] **PSI ölçümü** — API anahtarı hiç alınmadı, `docs/perf-baseline.md` §4'teki tablo boş

---

## 6. AÇIK KARARLAR (kullanıcıya sorulacak)

1. **`ShopInlineProducts` ızgarası kanonik `ProductGrid`'e hizalansın mı?**
   Bugün sm'de 2 sütun (diğerleri 3), boşluk 16/32px (diğerleri 20/24px). Görsel değişiklik → ürün kararı. Faz 4.5'te.
2. **PSI API anahtarı** — alınmadan performans kabul kriterleri ölçülemiyor.
3. **Kırık 20 vitest testi** (`src/lib`, önceden kırık) düzeltilsin mi, karantinaya mı alınsın?

---

## 7. ÖNCEDEN VAR OLAN HATALAR (bu geçişin sebep olmadığı)

`npx tsc --noEmit` güncel çalışma ağacında **30 hata** veriyor. CMS dosyalarında hata yok; kalanların tamamı geçiş öncesinden ve `git show HEAD:<dosya>` ile doğrulandı. Karıştırılmasın:

- `src/lib/api/supabaseShop.ts` — `Collection` import ediliyor ama re-export edilmiyor (2 dosyayı etkiliyor)
- `src/app/(shop)/category|collection/*/page.tsx` — `ShopSearchResponse` tip uyuşmazlığı
- `src/app/api/**` — Next 15 async `params` tiplemesi, eksik modül `bfmTypes`, implicit any
- `src/lib/**` — `errors.ts` spread, `helpers.ts` `CategoryData`, `filterCache.ts` export çakışması, `googleAnalytics.ts` `DataLayerEvent`

`yarn vitest run` — **5 dosya kırık, hepsi `src/lib`** (rateLimit/Upstash, supabaseProducts, filterCache, shop constants, formatPrice, hooks). Bunlar da önceden kırıktı. **Yeni yazılan 6 komponent testi (36 test) yeşil.**

`next.config.ts`'te `typescript.ignoreBuildErrors` ve `eslint.ignoreDuringBuilds` **açık** — bu yüzden build geçiyor.

---

## 8. ⚠️ TUZAKLAR — bunları bilmeden dokunma

### 8.1 Emotion, Tailwind'i her zaman yener

Tailwind utility'leri `@layer utilities` içinde; Emotion (MUI `sx`) **katmansız** yazıyor. **Katmansız CSS katmanlıyı her koşulda yener** — özgüllük ve sıra fark etmez.

Sonuç: dönüşmemiş bir MUI bileşenine `className` geçirirsen **sessizce yok sayılır**. İki çıkış yolu:
- Sarmalayıcı `<div>` (Emotion kuralı olmayan bir eleman)
- Emotion'ın SET ETTİĞİ özellik için `!` (ör. `[&_p]:!text-[13.5px]`)

Bu tuzağa **iki kez** düşüldü (`InfoArea`, sonra `ProductDetailTabs`) — ikisi de review'de yakalandı. Detay: `konvansiyon.md` §6.

### 8.2 Barrel import'u bundle'ı şişirir

`@/components/ui` barrel'ından import etmek **tüm Radix'i paylaşılan chunk'a** sokuyordu: 227 → 287 kB. **Her zaman doğrudan yol:** `@/components/ui/Stack`. ESLint bunu `error` yapıyor.

`experimental.optimizePackageImports` denendi — iç alias'lara işlemiyor, işe yaramadı.

### 8.3 ESLint flat config kuralları EZER, birleştirmez

Aynı kural adı (`no-restricted-imports`) iki blokta olursa sonraki öncekini **siler**. Bu yüzden `ui/` bağımlılık yasağı bir süre sessizce ölüydü. Şu an: barrel bloğu `ignores: ["src/components/ui/**"]` ile ui'dan uzak tutuluyor. Kural eklerken **probe dosyasıyla doğrula**:

```bash
printf "import { Box } from '@mui/material';\nexport const X = () => <Box />;\n" > src/components/ui/__probe.tsx
npx eslint src/components/ui/__probe.tsx   # hata VERMELİ
rm src/components/ui/__probe.tsx
```

### 8.4 Çok satırlı JSX'e regex ile dokunma

`<TextField ... />` desenini regex'le değiştirmek **3 kez dosya bozdu** — içerideki `<Icon />` kapanışında erken duruyor. Bunun yerine: metin araması + açık dizin sınırı, ya da satır numarası.

### 8.5 Token adları camelCase korunur

`palette.ts` grup adları **olduğu gibi** kalıyor: `--color-primaryDark`, `--color-accentRed`. Kebab'a çevirirsen çakışma olur (`primary.dark` ile `primaryDark.main` aynı isme düşer). `border-accent-red` yazıp sessizce çalışmayan bir sınıf üretme tuzağına düşüldü — doğrusu `border-accentRed`.

### 8.6 `yarn tokens` üretilen bölgeyi ezer

`globals.css` içindeki `/* --- GENERATED --- */` blokları `scripts/generate-tokens.mjs` tarafından yazılıyor. Elle düzenleme, `palette.ts`'i düzenle ve `yarn tokens` çalıştır. Script çakışma ve değer uyuşmazlığında **hata fırlatır** (sessiz sapma yok).

---

## 9. Çalışma yöntemi (ADR §10 — bağlayıcı)

```
1. BÜYÜK PLAN     ADR-0002 (var)
2. FAZ PLANI      docs/migration/faz-N-*.md — ONAY ALINMADAN KOD YAZILMAZ
3. CHECKLIST      her komponent için DoD
4. KOD            tek komponent = tek commit
5. REVIEW         faz sonunda /code-review high + görsel diff
6. ÖLÇÜM          PROD BUILD ZORUNLU (yarn build → First Load JS).
                  Dosya/komponent sayısı gibi vekil metrikler YANILTIR:
                  Faz 2'de 'use client' iyi görünürken bundle 60 kB büyümüştü.
7. FAZ KAPANIŞI   ADR + perf-baseline güncellenir
```

**Kullanıcının açık talebi:** commit **sadece istendiğinde** atılır.

---

## 10. Kod standartları özeti (ADR §11 — tamamı orada)

- **Soyutlama testi:** bileşen *değişebilecek bir kararı* saklamıyorsa yazma (anemik geçirgen yasak). Rule of Three: aynı desen 3+ yerde → isimlendirilmiş semantik bileşen.
- **Tek kaynak:** renk `palette.ts`, kırılım `theme.ts`, ölçek `konvansiyon.md §1`, varyant `variants.ts`, form ölçeği `ui/Input`. Kopyalanan sözlük ayrışır.
- **Bağımlılık yönü:** `ui/` domain bilmez (contexts, lib/api, cms, theme yasak — lint zorluyor).
- **`sx` yasak** `ui/` içinde (lint zorluyor).
- **Kompozisyon > konfigürasyon**, dar prop sözleşmesi, `any`/`...rest`/`slotProps` yok.
- Varsayılan **server component**; `'use client'` gerekçesi commit mesajında.

---

## 11. Bu geçişte düzeltilen gerçek hatalar (regresyon sanılmasın)

Aşağıdakiler **eski koddaki hatalardı**, dönüşümde düzeltildi:

1. **Etiketler girdilere bağlı değildi** — `FormikTextField`/`Dropdown`/`AutoComplete`/`SecurityCard` `htmlFor` vermiyordu. Ekran okuyucu alanları adlandıramıyordu.
2. **`Button`'ın `loading` prop'u sessizce yok sayılıyordu** — 16 çağrı yeri yükleniyor sandığı hâlde göstermiyordu.
3. **`Chip`'in silme ikonu klavyeyle erişilemezdi** (tıklanabilir `<svg>` → gerçek `<button>`).
4. **`Spinner` ekran okuyucudan gizliydi** — `/success` ve `/payment`'ta ekrandaki tek öğe.
5. **Çakışan DOM id'leri** — checkout'ta iki adres formu aynı id'leri üretiyordu.
6. **10 komponent ölü koddu** (~790 satır), silindi.
7. **Ürün ızgarası 3 yerde ayrışmıştı** → `ProductGrid` semantik bileşeni.

**Bilinçli görsel değişiklikler** (konvansiyon.md §8): mobilde girdi 14→16px (iOS zoom), odak rengi her yerde `primary` (eskiden bazı alanlar kırmızıya dönüyordu), ayarlar alanları 52→48px, `#F7F7F8` → `gray-50`.

---

## 12. Faydalı komutlar

```bash
yarn tokens                        # palette.ts -> globals.css token üretimi + doğrulama
yarn vitest run src/components     # yeni komponent testleri (36, yeşil olmalı)
npx tsc --noEmit                   # 64 önceden var olan hata (§7)
yarn lint                          # 158 önceden var olan sorun; ui/ katmanı temiz olmalı

# Kalan MUI kullanımını saymak:
python3 - <<'EOF'
import os,re,collections
c=collections.Counter()
for r,d,fs in os.walk('src'):
    for f in fs:
        if not f.endswith('.tsx'): continue
        p=os.path.join(r,f)
        if '/components/ui/' in p.replace(os.sep,'/'): continue
        s=open(p,encoding='utf8').read()
        m=re.search(r"import\s*\{([^}]*)\}\s*from\s*'@mui/material';",s,re.S)
        for t in [x.strip() for x in (m.group(1).split(',') if m else [])]:
            c[t]+=len(re.findall(r'<'+t+r'[\s/>]',s))
print(c.most_common(20))
EOF
```
