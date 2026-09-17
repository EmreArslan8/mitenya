import type { ReactNode } from 'react';

type BrandSectionProps = {
  /** Sayfa içi gezinme hedefi (SectionNav). */
  id?: string;
  title: string;
  subtitle?: string | null;
  action?: ReactNode;
  children: ReactNode;
};

/** Marka sayfası bölümlerinin ortak başlık düzeni (H2 + opsiyonel alt başlık/aksiyon). */
const BrandSection = ({ id, title, subtitle, action, children }: BrandSectionProps) => (
  <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className="flex scroll-mt-24 flex-col gap-4 md:gap-7">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-col gap-1.5">
        <h2 id={id ? `${id}-title` : undefined} className="text-2xl leading-tight font-semibold tracking-[-0.02em] md:text-4xl">
          {title}
        </h2>
        {subtitle ? <p className="text-text-medium-light md:text-base">{subtitle}</p> : null}
      </div>
      {action}
    </div>
    {children}
  </section>
);

export default BrandSection;
