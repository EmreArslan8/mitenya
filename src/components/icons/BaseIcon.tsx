import type { ReactNode, SVGProps } from 'react';

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> & {
  size?: number | string;
};

/**
 * Setteki bütün ikonların paylaştığı tek <svg> sarmalayıcı.
 * 24×24 viewBox, currentColor ve yuvarlatılmış uç — ikonlar yalnızca
 * kendi çizim düğümlerini ve gerekirse varsayılan kalınlıklarını verir.
 */
const BaseIcon = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 1.5,
  children,
  ...props
}: IconProps & { children: ReactNode }) => (
  <svg
    {...props}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={props['aria-label'] ? undefined : true}
  >
    {children}
  </svg>
);

export default BaseIcon;
