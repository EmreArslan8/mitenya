import NextLink from 'next/link';
import { cn } from '@/lib/utils/cn';

/**
 * Bağlantı — `components/common/Link` yerine.
 *
 * Eskisi `'use client'` idi ama SEBEBİ YOKTU: tek client bağımlılığı
 * `useStyles()` (Emotion) çağrısıydı. Stil artık statik class olduğu için
 * bu SERVER COMPONENT — her link için gönderilen JS ortadan kalkıyor.
 *
 * `href` null/undefined ise eski davranış korunuyor: bağlantı değil,
 * yalnızca içerik render edilir (CMS'ten boş url gelen durumlar için).
 */
export type LinkProps = {
  href?: string | null;
  children?: React.ReactNode;
  target?: '_self' | '_blank';
  rel?: string;
  className?: string;
  /** Marka rengiyle vurgulu bağlantı; varsayılan renk metinden miras alınır. */
  colored?: boolean;
  'aria-label'?: string;
  prefetch?: boolean;
};

export function Link({
  href,
  children,
  target,
  rel,
  className,
  colored,
  prefetch,
  'aria-label': ariaLabel,
}: LinkProps) {
  if (!href) return <>{children}</>;

  return (
    <NextLink
      href={href}
      target={target}
      // Yeni sekmede açılan bağlantılarda güvenlik varsayılanı.
      rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
      prefetch={prefetch}
      aria-label={ariaLabel}
      className={cn(
        'no-underline',
        colored
          ? 'text-primary visited:text-primary-dark hover:text-primary active:text-primary-dark'
          : 'text-inherit',
        className,
      )}
    >
      {children}
    </NextLink>
  );
}

export default Link;
