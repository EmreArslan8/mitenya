'use client';

import { ShopFooterData } from '@/lib/api/types';
import { useIsMobileApp } from '@/lib/hooks/useIsMobileApp';
import Image from 'next/image';
import NextLink from 'next/link';
import { ArrowUpRight, BadgeCheck } from '@/components/icons';
import CMSImage from '../cms/shared/CMSImage';
import Card from '../common/Card';
import Link from '../common/Link';
import Markdown from '../common/Markdown';

interface FooterProps {
  data: ShopFooterData | undefined;
}

const ETBIS_PORTAL_URL =
  'https://etbis.ticaret.gov.tr/tr/SiteSorgulamaSonuc?siteId=06415656-3bee-4e41-88a7-e349d350bb8e';

const Footer = ({ data }: FooterProps) => {
  const isMobileApp = useIsMobileApp();
  const target = isMobileApp ? '_self' : '_blank';

  const logoSection = (
    <div className="flex flex-col gap-6">
      <NextLink href="/" aria-label="Mitenya ana sayfa" className="w-fit">
        <Image src="/static/images/logo-white.svg" alt="mitenya" width={125} height={40} unoptimized />
      </NextLink>
      <div className="flex gap-2.5">
        {data?.socials?.map((social) => (
          <Link key={social.platform} href={social.url} target="_blank">
            <Image
              src={`/static/images/socials/${social.platform.toLowerCase()}.svg`}
              alt={`${social.platform} icon`}
              width={20}
              height={20}
              unoptimized
            />
          </Link>
        ))}
      </div>
    </div>
  );

  const linkItems = (children: NonNullable<ShopFooterData['links']>[number]['children']) => (
    <div className="flex w-fit flex-col gap-[7px] pb-3 text-sm font-medium leading-5 text-gray-200 sm:pb-0">
      {children?.map((child) => (
        <Link key={child.label} href={child.url} target={target}>
          {child.label}
        </Link>
      ))}
    </div>
  );

  const etbisSection = (
    <Card className="relative mt-1 flex min-w-[250px] max-w-[280px] flex-col gap-[7px] overflow-hidden rounded-[20px] border border-gray-700 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_20px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:p-3.5">
      <div className="flex w-fit items-center gap-1.5 py-1 text-white">
        <p className="text-[15px] font-bold leading-[1.3] tracking-[0.15px]">Mitenya, ETBİS’e kayıtlıdır</p>
        <BadgeCheck size={18} strokeWidth={2.2} />
      </div>
      <p className="text-[13px] leading-[1.45] tracking-[0.1px] text-gray-200">
        Kayıt durumunu Ticaret Bakanlığı ETBİS sistemi üzerinden doğrulayabilirsiniz.
      </p>
      <Link href={ETBIS_PORTAL_URL} target="_blank">
        <span className="mt-1 flex items-center justify-between rounded-xl border border-gray-500 bg-white/4 px-[9px] py-1.5 text-white transition hover:-translate-y-px hover:border-gray-300 hover:bg-white/8">
          <span className="text-[13px] font-semibold leading-[1.2] tracking-[0.2px]">Resmi kaydı doğrula</span>
          <ArrowUpRight size={14} />
        </span>
      </Link>
    </Card>
  );

  return (
    <footer className="mt-20 w-screen bg-primaryDark-dark px-4 pb-32 pt-8 text-white sm:px-6 sm:pb-16 sm:pt-10">
      <div className="mx-auto flex w-full max-w-[1340px] flex-col gap-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 sm:col-span-4 md:col-span-2">{logoSection}</div>

          <div className="col-span-12 flex flex-col sm:hidden">
            {data?.links?.map((linkGroup) => (
              <Card
                key={linkGroup.label}
                collapsible
                defaultCollapsed
                noDivider
                title={linkGroup.label}
                titleClassName="text-[13px] font-semibold leading-[18px] tracking-[0.3px]"
                headerClassName="px-0 py-2 normal-case text-inherit"
                className="border-b border-white/10 bg-transparent"
              >
                {linkItems(linkGroup.children)}
              </Card>
            ))}
          </div>

          <div className="col-span-8 hidden justify-between gap-8 sm:flex md:col-span-7">
            {data?.links?.map((linkGroup) => (
              <div key={linkGroup.label} className="flex min-w-[132px] flex-1 flex-col gap-2">
                <p className="text-base font-bold leading-[22px] tracking-[0.3px] text-white">{linkGroup.label}</p>
                {linkItems(linkGroup.children)}
              </div>
            ))}
          </div>

          <div className="col-span-12 sm:col-span-4 md:col-span-3 md:flex md:justify-end">{etbisSection}</div>
        </div>

        <div className="mt-2 flex w-full flex-wrap items-center justify-between gap-4 text-gray-300">
          <Markdown
            text={data?.address}
            className="[&_p]:!text-[13px] [&_p]:!leading-[1.65] [&_p]:!text-gray-300 sm:[&_p]:!text-sm sm:[&_p]:!leading-[1.7]"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-4">
          {data?.vendors?.data?.map((image) => (
            <CMSImage
              key={image.attributes.url}
              src={image.attributes.url}
              alt={image.attributes.alternativeText}
              width={48}
              height={30}
              className="object-contain"
            />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
