# Faz 3 — Formlar

**Üst plan:** [ADR-0002](../adr/0002-mui-to-tailwind-migration.md) · **Önceki:** [Faz 2](./faz-2-davranisli-komponentler.md) · **Kurallar:** [konvansiyon.md](./konvansiyon.md)
**Durum:** Onaylandı (2026-09-08), uygulanıyor
**Tahmini süre:** 4-6 gün

> **Geçişin en riskli fazı budur.** Dokunulan akışlar: üyelik/giriş, şifre sıfırlama, adres, **checkout**. Bir regresyon doğrudan gelir kaybı demek.

---

## Envanter (2026-09-08, ölçüldü)

| | Sayı |
|---|---|
| `<TextField>` | **34 kullanım / 18 dosya** |
| Formik kullanan dosya | 9 |
| `InputAdornment` | 3 |
| `FormControl` | 1 |
| `Autocomplete` | 1 |
| `Select` (kalan) | 1 — `FormikDropdown` |

**TextField propları:** `value` 32 · `onChange` 28 · `size` 22 · `label` 15 · `type` 15 · `autoComplete` 7 · `placeholder` 6 · `name` 6 · `error` 6 · `helperText` 5 · `InputProps` 4 · `onBlur` 4 · `sx` 2

### Dosya dağılımı

| Dosya | TextField | Akış |
|---|---|---|
| `settings/AccountCard` | 9 | hesap bilgileri |
| `ProductReviews` | 3 | yorum formu |
| `settings/SecurityCard` | 3 | şifre değiştirme |
| `SearchFilters/FilterCard` | 3 | fiyat aralığı girdileri |
| `order-status/view` | 2 | sipariş sorgulama |
| `Authenticator/forms/SignUpForm` | 2 | **üyelik** |
| `checkout/view` | 1 | **checkout** |
| `ShoppingCart/CheckoutCard` | 1 | kupon kodu |
| `Navigation` + `MobileSearchOverlay` | 2 | arama |
| `orders/[id]/view` | 1 | sipariş iptali |
| `Authenticator/*` (PasswordField, SignIn, ForgotPassword, Verification) | 4 | **auth** |
| `common/inputs/*` (3 sarmalayıcı) | 3 | altyapı |

---

## Kapsam

**Dahil:** `TextField`, `InputAdornment`, `FormControl`, `Autocomplete` ve 4 Formik sarmalayıcısı.

**Hariç (bilinçli):**
- **Formik → react-hook-form geçişi.** ADR §9'da kapsam dışı. İki değişikliği aynı anda yapmak regresyonu teşhis edilemez kılar; stil geçişi bittikten sonra ayrı bir karar (ADR-0003 adayı).
- Zod şemaları — API route'larında (17 dosya), forma dokunmuyor.
- `PayTRPortal` — ödeme iframe'i, Faz 5.

---

## Görevler

### F3.1 — `ui/Input` + `ui/Field` (temel)

MUI `TextField` aslında üç şeyin birleşimi: **etiket + girdi + yardım/hata metni**, ve bunları `aria` ile birbirine bağlar. Elle yazarken en kolay kaybedilen şey bu bağ.

```
ui/Input     salt girdi (<input>), varyant/boyut, hata durumu
ui/Field     etiket + girdi + hata/yardım metni sarmalayıcısı
             - <label htmlFor> ↔ input id
             - aria-invalid, aria-describedby ↔ hata metni id'si
             - required göstergesi (mevcut Asterisk ikonu)
```

Ölçüler `theme.ts:295-345`'ten birebir:

| | MUI | Tailwind |
|---|---|---|
| small yükseklik | 36px, input padding `8px 14px` | `h-9 px-3.5 py-2` |
| medium yükseklik | 46px | `h-[46px]` |
| kenarlık | `palette.text.light` | `border-text-light` |
| yazı | `fontWeight 500` | `font-medium` |
| placeholder | `text.light`, opacity 1 | `placeholder:text-text-light` |
| disabled | metin `text.light` + `WebkitTextFillColor` | `disabled:text-text-light` |

**Mobil zorunluluğu:** girdi yazı boyutu **≥16px** olmalı — küçükse iOS Safari odaklanınca sayfayı zoomlar. MUI'nin `small` varyantı 14px kullanıyordu; bu davranış korunacaksa `text-[16px] sm:text-[14px]` deseniyle mobilde 16'ya çıkarılmalı. **Karar gerekiyor** (aşağıda).

### F3.2 — `FormikTextField`

Mevcut sorumlulukları (korunacak): etiket + zorunluluk yıldızı, **karakter sayacı** (`limit` prop'u, kalan karakter `InputAdornment`'ta, 0'a inince `error` rengi), `helperText`, `formik.touched/errors` ile hata durumu.

Temizlenecek: `formik: any` ve `props: any` → tiplenecek (ADR §11.4).

### F3.3 — `FormikDropdown`

Faz 2'de yazılan `ui/Select`'i kullanacak. Tek iş: Formik bağlantısı + hata durumu.

### F3.4 — `FormikPhoneNumberInput`

**En hassas dosya.** İçinde maskeleme var: `formatPhone` (`5XX) XXX XX XX`), `countDigitsBeforePos`, `caretPosForDigits` — yani **imleç konumu korunuyor**. Bu mantık **aynen taşınacak**, yeniden yazılmayacak; yalnızca `TextField` → `ui/Input` değişecek.

Ek: `inputMode="tel"` + `autoComplete="tel"` korunacak/eklenecek.

### F3.5 — `FormikAutoComplete` (⚠️ Radix karşılığı YOK)

Radix'te combobox primitifi yok. Üç seçenek:

| | Artı | Eksi |
|---|---|---|
| **a) Radix Popover + liste** (elle) | Yeni bağımlılık yok | Klavye gezinmesi, tip-ahead, `aria-activedescendant` elle yazılır — hataya açık |
| **b) `downshift`** (~12 KB) | Erişilebilirlik kanıtlanmış, headless | Yeni bağımlılık |
| **c) `<datalist>`** | Sıfır JS | Görünüm kontrol edilemez, tarayıcıya göre değişir |

**Önerim: (b) `downshift`.** Tek kullanım yeri var (adres formunda şehir/ilçe) ama combobox erişilebilirliğini elle doğru yapmak pahalı ve sessizce bozulur. ADR §11.2'ye göre bağımlılık kararı gerekçesiyle yazılacak.

### F3.6 — Bağımsız `TextField` çağrı yerleri (18 dosya)

Risk sırasına göre gruplanmış — **düşük riskliden başlanır**:

1. **Arama girdileri** (`Navigation`, `MobileSearchOverlay`) — Formik yok, salt kontrollü input
2. **Filtre girdileri** (`FilterCard` fiyat aralığı) — sayısal, izole
3. **Sipariş sorgulama** (`order-status`) — giriş gerektirmiyor, kolay test
4. **Yorum formu** (`ProductReviews`) — `RatingInput` ile birlikte
5. **Ayarlar** (`AccountCard` 9, `SecurityCard` 3) — giriş arkasında
6. **Auth** (`SignIn`, `SignUp`, `ForgotPassword`, `Verification`, `PasswordField`, `reset-password`) — **kritik**
7. **Adres** (`AddressForm`) — **kritik**
8. **Checkout** (`checkout/view`, `CheckoutCard` kupon) — **en kritik, en son**

### F3.7 — Temizlik

`InputAdornment` (3) → `ui/Input`'un `startSlot`/`endSlot` prop'ları.
`FormControl` (1) → `ui/Field`.
Faz 3 bitince `@mui/material`'den form ithalatı **sıfır** olmalı.

---

## Erişilebilirlik gereksinimleri (MUI'nin bedavaya verdikleri)

Elle yazarken kaybedilmesi en kolay olanlar — her girdi için zorunlu:

- [ ] `<label htmlFor>` ↔ `<input id>` bağı (placeholder etiket YERİNE geçmez)
- [ ] `aria-invalid={hata}` ve hata metnine `aria-describedby`
- [ ] `aria-required` / `required`
- [ ] `autoComplete` değerleri **korunacak** (7 yerde var — şifre yöneticileri ve tarayıcı otomatik doldurma buna bağlı)
- [ ] `type` doğru (`email`, `tel`, `password`) → mobil klavye
- [ ] Hata metni renkle DEĞİL metinle de belirtilmeli
- [ ] Odak halkası görünür (`focus-visible:ring`)

---

## Faz 3 DoD

- [ ] `ui/Input` + `ui/Field` yazıldı, ölçüler `theme.ts` ile birebir
- [ ] 4 Formik sarmalayıcısı dönüştü; `formik: any` ve `props: any` kalktı
- [ ] Telefon maskesi ve **imleç konumu mantığı aynen korundu**
- [ ] 34 `TextField` kullanımının tamamı dönüştü
- [ ] `@mui/material`'den form bileşeni import'u **sıfır**
- [ ] Erişilebilirlik listesi her girdi için işaretlendi
- [ ] **Elle uçtan uca test:** kayıt · giriş · şifre sıfırlama · adres ekleme/düzenleme · kupon · **PayTR ile gerçek test siparişi**
- [ ] Tarayıcı otomatik doldurma ve şifre yöneticisi denendi
- [ ] `yarn build` → First Load JS ölçüldü ve `docs/perf-baseline.md`'ye yazıldı (ADR §10 adım 6)
- [ ] `/code-review high` temiz

---

## Riskler

| Risk | Etki | Önlem |
|---|---|---|
| **Checkout regresyonu** | Gelir kaybı | En sona bırakıldı; gerçek test siparişi zorunlu |
| **Auth regresyonu** | Kullanıcı giremez | Auth grubu ayrı adım, her form tek tek elle test |
| Telefon maskesi imleç mantığı bozulur | Sessiz veri hatası | Mantık taşınır, yeniden yazılmaz |
| `autoComplete` kaybı | Şifre yöneticileri çalışmaz, dönüşüm düşer | Erişilebilirlik listesinde madde; grep ile doğrulanır |
| iOS zoom (girdi < 16px) | Mobilde her odakta sayfa zıplar | Karar maddesi (aşağıda) |
| **Otomatik test yok** | Regresyon geç fark edilir | Aşağıdaki karar maddesi |

---

## Alınan kararlar (2026-09-08)

1. **Testler öne çekildi.** `auth` + `checkout` + `adres` için testler Faz 3'ün **ilk adımı** (F3.0). Yöntem: testler **dönüşümden ÖNCE, mevcut MUI davranışına karşı** yazılır ve yeşil olduğu görülür (karakterizasyon testi); dönüşümden sonra aynı testlerin yeşil kalması beklenir. Seçiciler role/label tabanlı olacak ki stil değişimi testi kırmasın (konvansiyon.md).

2. **Mobilde 16px.** Girdiler mobilde `text-[16px]`, `sm:` ve üstünde MUI'deki 14px'e döner. Gerekçe: iOS Safari 16px altındaki girdiye odaklanınca sayfayı zoomluyor — mevcut davranış bir hataydı, düzeltiliyor. Bu **bilinçli bir görsel sapma**, görsel karşılaştırmada fark beklenir.

3. **`downshift`** kullanılacak (combobox). Gerekçe (ADR §11.2): tek kullanım yeri var ama tip-ahead, `aria-activedescendant` ve klavye gezinmesini elle doğru yapmak pahalı ve sessizce bozulur.

---

## F3.0 — Emniyet ağı (dönüşümden ÖNCE)

Kapsam: yalnızca para ve hesap güvenliğine dokunan akışlar.

| Test dosyası | Neyi korur |
|---|---|
| `Authenticator/forms/SignInForm.test.tsx` | e-posta/şifre girişi, doğrulama hataları, submit çağrısı |
| `Authenticator/forms/SignUpForm.test.tsx` | zorunlu alanlar, sözleşme onayı olmadan submit engeli |
| `Authenticator/forms/ForgotPasswordForm.test.tsx` | e-posta doğrulaması, submit |
| `AddressCard/AddressForm.test.tsx` | zorunlu alanlar, telefon maskesi, kaydetme |
| `ShoppingCart/CheckoutCard.test.tsx` | kupon kodu girişi ve uygulama |

**Kural:** seçiciler `getByRole` / `getByLabelText`. `.MuiOutlinedInput-root` gibi yapı seçicisi kullanılırsa test dönüşümde kırılır ve hiçbir şey korumamış olur.

**Kabul:** bu 5 dosya dönüşümden önce **yeşil**; dönüşümden sonra da yeşil.


---

## Faz 3 kapanışı (2026-09-08)

**MUI form bileşenleri sıfırlandı:** `TextField` 34→0, `Autocomplete` 1→0,
`InputAdornment` 3→0, `FormControl` 1→0.

### Düzeltilen erişilebilirlik hataları

1. **Etiketler girdilere bağlı değildi.** `FormikTextField` etiketi
   `<Typography component="label">` basıp `htmlFor` vermiyordu; aynı sorun
   `FormikDropdown`, `FormikAutoComplete` ve `SecurityCard`'da da vardı.
   Ekran okuyucu alanları adlandıramıyor, etikete tıklamak odaklamıyordu.
   `ui/TextField` artık `htmlFor`↔`id`, `aria-describedby`↔hata metni,
   `aria-invalid` ve hata metninde `role="alert"` kuruyor — testle sabit.
2. **`autoComplete` eksikleri tamamlandı:** `given-name`, `family-name`,
   `tel-national`, `current-password`, `new-password`, `one-time-code`.
   Şifre yöneticileri ve tarayıcı otomatik doldurma buna bağlı.
3. **Göster/gizle düğmesi** gerçek `<button aria-label>` oldu.

### Bilinçli sapmalar

| | Eski | Yeni | Gerekçe |
|---|---|---|---|
| Mobil yazı boyutu | 14px | **16px** (`sm:` üstü 14) | iOS Safari 16px altında odakta zoomluyordu |
| Odak göstergesi | 2px kenarlık | kenarlık rengi + `ring` | 2px kenarlık 1px düzen kayması yapıyordu |
| Combobox | MUI Autocomplete | **downshift** | Radix'te combobox yok; a11y'yi elle yazmak sessizce bozulur |

### Emniyet ağı işe yaradı

Telefon girdisini dönüştürürken maskeleme testleri kırıldı (`ui/TextField` ref
almıyordu, imleç konumlandırma çalışmıyordu). Test yakaladı, `inputRef` eklendi.
Auth formlarının 19 testi dönüşüm boyunca hiç kırılmadı.

### Faz 4/5'e kalan

`MenuItem` 28 — hepsi Faz 2'de devredilen `Card`/`ModalCard`/`Navigation`
zincirinde. Faz 3 kapsamında MUI form bileşeni kalmadı.
