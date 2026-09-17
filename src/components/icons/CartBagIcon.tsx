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
 * Gövde üst iki köşesi yuvarlatılmış bir dikdörtgen. Boş sepette sapın
 * kolları gövdenin içine biraz iner; dolu sepette gövdenin üstünde biter ki
 * adet rakamının üstüne çizgi düşmesin ve rakam 24px'in altında da okunsun.
 *
 * Adet, gövdeden `mask` ile OYULUYOR; üstüne kontrast renkte basılmıyor.
 * Böylece rakam açık/koyu her zeminde kendiliğinden okunur ve ayrıca bir
 * kontrast rengi yönetmek gerekmez.
 */

/**
 * Çizgi ağırlığı. Setin geri kalanı 1.5 ama bu ikonun gövdesi onlardan büyük
 * (kutunun %83'ü); 1.5'te header'da kaba duruyordu. İnce çizgi + düz uç, büyük
 * gövdeyi hafif gösteriyor.
 */
const STROKE = 1;

/**
 * Gövdenin hedeflenen MÜREKKEP kutusu (2..22 × 6..22 = 20 × 16 birim).
 * Boyner'in sepet glyph'i ölçüldüğünde 20.04/24 birim çıkmıştı; hedef bu.
 *
 * Dolu ve boş varyantlar bu kutudan TÜRETİLİYOR, çünkü `fill` ile `stroke`
 * aynı path'ten farklı büyüklükte mürekkep üretir: stroke path'in üstünde
 * ortalanır ve her kenardan yarım kalınlık (STROKE / 2) dışarı taşar. Aynı path
 * kullanılsaydı boş sepet ikonu doluya göre her yönde bir kalınlık kadar
 * daha büyük görünürdü.
 */
const INK = { left: 2, right: 22, top: 6, bottom: 22 };
const HALF_STROKE = STROKE / 2;

/** Üst köşelerin yarıçapı (mürekkep kutusunun dış kenarında). */
const CORNER_RADIUS = 3;

/** Kayan nokta artığı path string'ine sızmasın (21.099999999999998 gibi). */
const r = (n: number) => +n.toFixed(3);

/** Üst köşeleri yuvarlak dikdörtgen; `inset` kenarları ve yarıçapı içeri alır. */
const bodyPath = (inset: number) => {
  const left = r(INK.left + inset);
  const right = r(INK.right - inset);
  const top = r(INK.top + inset);
  const bottom = r(INK.bottom - inset);
  const radius = r(CORNER_RADIUS - inset);

  return (
    `M${left} ${r(top + radius)}` +
    `A${radius} ${radius} 0 0 1 ${r(left + radius)} ${top}` +
    `H${r(right - radius)}` +
    `A${radius} ${radius} 0 0 1 ${right} ${r(top + radius)}` +
    `V${bottom}H${left}Z`
  );
};

/** Dolu gövde: mürekkep kutusunun tamamı. */
const BODY_FILL_PATH = bodyPath(0);

/**
 * Boş gövde: aynı mürekkep kutusunu vermesi için yarım kalınlık içeri alınır.
 * Yarıçap da aynı miktar küçülür ki kontürün dış kenarı dolu gövdeyle çakışsın.
 */
const BODY_STROKE_PATH = bodyPath(HALF_STROKE);

/** Dar kemer sap. Boş sepette kollar gövdenin içine iner. */
const HANDLE_PATH = 'M9 10V5.4a3 3 0 0 1 6 0V10';

/** Dolu sepette kollar gövdenin üst kenarında biter (bkz. dosya başı). */
const HANDLE_PATH_FILLED = 'M9 6.2V5.4a3 3 0 0 1 6 0V6.2';

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
              y="17"
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
        <path d={BODY_STROKE_PATH} stroke={color} strokeWidth={STROKE} strokeLinejoin="round" />
      )}
      <path
        d={hasItems ? HANDLE_PATH_FILLED : HANDLE_PATH}
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="butt"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CartBagIcon;
