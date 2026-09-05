import type { SVGProps } from 'react';

export type CartBagIconProps = Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> & {
  size?: number | string;
  /** Sepetteki ürün adedi. 0 ise ikon boş (kontur) hâline geçer. */
  count?: number;
};

/**
 * Alışveriş çantası — sepette ürün varken dolu, boşken kontur.
 *
 * ÖLÇEK NOTU: Bu ikon bilerek kutunun ~%83'ünü dolduruyor (2.4..21.6),
 * setteki kontur ikonlardan (~%75) daha fazla. Sebebi ölçüm: Boyner'in
 * header seti canvas'ta ölçüldüğünde sepet glyph'i 20.04/24 birim mürekkep
 * taşıyor ve üstelik komşulardan büyük render ediliyor (search 24px iken
 * sepet 28px). Aynı kutuya aynı boyutta çizilen çanta, yanındaki kalp/arama
 * ikonlarının yanında optik olarak küçük kalıyor.
 *
 * Bu yüzden ShoppingCartButton bu ikonu 28px verir; komşular 24px'te kalır.
 *
 * Gövde keskin köşeli bir dikdörtgen, sap dar ve alçak — böylece gövdenin
 * tamamı adede kalıyor ve rakam 24px'in altında bile okunur.
 *
 * Adet, gövdeden `mask` ile OYULUYOR; üstüne kontrast renkte basılmıyor.
 * Böylece rakam açık/koyu her zeminde kendiliğinden okunur ve ayrıca bir
 * kontrast rengi yönetmek gerekmez.
 */

/**
 * Çizgi ağırlığı. Komşu ikonlar 1.5 kullanıyor ama bu ikonun gövdesi onlardan
 * büyük (kutunun %83'ü) ve dolu varyantı zaten ağır okunuyor; 1.5'te kontur
 * hâli kalın kalıyordu. Boyner'in sepet glyph'i ölçüldüğünde 1.04 çıkmıştı.
 */
const STROKE = 1.2;

/**
 * Gövdenin hedeflenen MÜREKKEP kutusu (2..22 × 6.7..21.7 = 20 × 15 birim).
 * Boyner'in sepet glyph'i ölçüldüğünde 20.04/24 birim çıkmıştı; hedef bu.
 *
 * Dolu ve boş varyantlar bu kutudan TÜRETİLİYOR, çünkü `fill` ile `stroke`
 * aynı path'ten farklı büyüklükte mürekkep üretir: stroke path'in üstünde
 * ortalanır ve her kenardan yarım kalınlık (0.75) dışarı taşar. Aynı path
 * kullanılsaydı boş sepet ikonu doluya göre her yönde 1.5 birim — 28px'te
 * 1.75px — daha büyük görünürdü.
 */
const INK = { left: 2, right: 22, top: 6.7, bottom: 21.7 };
const HALF_STROKE = STROKE / 2;

/** Kayan nokta artığı path string'ine sızmasın (21.099999999999998 gibi). */
const r = (n: number) => +n.toFixed(3);

/** Dolu gövde: mürekkep kutusunun tamamı. */
const BODY_FILL_PATH = `M${INK.left} ${INK.top}H${INK.right}V${INK.bottom}H${INK.left}Z`;

/** Boş gövde: aynı mürekkep kutusunu vermesi için yarım kalınlık içeri alınır. */
const BODY_STROKE_PATH =
  `M${r(INK.left + HALF_STROKE)} ${r(INK.top + HALF_STROKE)}` +
  `H${r(INK.right - HALF_STROKE)}` +
  `V${r(INK.bottom - HALF_STROKE)}` +
  `H${r(INK.left + HALF_STROKE)}Z`;

/** Dar ve alçak kemer sap; gövdenin üstünde kalır, içine inmez. */
const HANDLE_PATH = 'M9.2 6.9V5.6a2.8 2.8 0 0 1 5.6 0V6.9';

const CartBagIcon = ({
  size = 24,
  color = 'currentColor',
  count = 0,
  ...props
}: CartBagIconProps) => {
  const hasItems = count > 0;
  const label = count > 99 ? '99+' : String(count);
  // Üç haneye çıkınca punto düşer, yoksa rakam gövdeden taşar.
  const fontSize = label.length > 2 ? 9 : 11.5;

  /**
   * Maske id'si adede göre türetiliyor. Aynı adetli iki ikon aynı id'yi
   * paylaşabilir; maske içerikleri de birebir aynı olduğu için bu zararsız
   * (viewBox koordinatları sabit, `size` maskeyi etkilemiyor). Böylece
   * `useId` gerekmiyor ve bileşen sunucu tarafında da kullanılabiliyor.
   */
  const maskId = `cart-bag-count-${label}`;

  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden={props['aria-label'] ? undefined : true}
    >
      {hasItems ? (
        <>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
            <rect width="24" height="24" fill="#fff" />
            <text
              x="12"
              y="17.2"
              textAnchor="middle"
              fontSize={fontSize}
              fontWeight="700"
              letterSpacing="-0.3"
              fontFamily="system-ui, sans-serif"
              fill="#000"
            >
              {label}
            </text>
          </mask>
          <path d={BODY_FILL_PATH} fill={color} mask={`url(#${maskId})`} />
        </>
      ) : (
        <path d={BODY_STROKE_PATH} stroke={color} strokeWidth={STROKE} strokeLinejoin="miter" />
      )}
      <path
        d={HANDLE_PATH}
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CartBagIcon;
