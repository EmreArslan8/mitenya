import Link from '@/components/common/Link';
import CMSImage from '@/components/cms/shared/CMSImage';
import type { SharedImageType } from '@/components/cms/shared/cmsTypes';

type BrandHeroProps = {
  name: string;
  tagline?: string | null;
  intro: string;
  logo?: SharedImageType | null;
  facts: Array<{ label: string; value: string }>;
};

const LOGO_HEIGHT = 16;

const BrandHero = ({ name, tagline, intro, logo, facts }: BrandHeroProps) => {
  const logoImage = logo?.data?.attributes;
  const logoWidth =
    logoImage?.width && logoImage.height ? Math.round((LOGO_HEIGHT * logoImage.width) / logoImage.height) : undefined;

  return (
    <div className="flex flex-col gap-3.5 md:gap-5">
      <nav aria-label="Sayfa yolu" className="text-xs text-text-medium-light md:text-[13px]">
        <ol className="flex gap-2">
          <li><Link href="/" className="hover:text-text">Ana Sayfa</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-text">{name}</li>
        </ol>
      </nav>

      <section className="flex flex-col gap-6 rounded-3xl bg-green-light p-6 md:flex-row md:items-center md:gap-14 md:p-14">
        <div className="flex flex-1 flex-col gap-3.5 md:gap-5">
          {logoImage?.url && logoWidth ? (
            <CMSImage
              src={logoImage.url}
              alt=""
              width={logoWidth}
              height={LOGO_HEIGHT}
              sizes={`${logoWidth}px`}
              priority
              style={{ width: logoWidth, height: LOGO_HEIGHT, objectFit: 'contain' }}
            />
          ) : null}
          <h1 className="text-4xl leading-none font-bold tracking-[-0.03em] md:text-6xl">{name}</h1>
          {tagline ? <p className="text-lg font-medium text-green-dark md:text-[22px]">{tagline}</p> : null}
          <p className="max-w-[620px] leading-relaxed text-text-medium md:text-[17px]">{intro}</p>
        </div>

        {facts.length ? (
          <dl className="grid grid-cols-2 gap-2 md:w-[440px] md:shrink-0 md:gap-3">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-0.5 rounded-2xl bg-bg p-3.5 md:p-5">
                <dt className="text-xs text-text-medium-light md:text-[13px]">{fact.label}</dt>
                <dd className="font-semibold md:text-lg">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>
    </div>
  );
};

export default BrandHero;
