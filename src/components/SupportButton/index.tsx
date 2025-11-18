'use client';

import { Locale } from '@/i18n';
import useLocale from '@/lib/hooks/useLocale';
import { getSupportUrl } from '@/lib/utils/supportChat';
import Image from 'next/image';
import Button from '../common/Button';
import { ReactNode } from 'react';

const logoSize = {
  small: 24,
  medium: 24,
  large: 28,
};

const getBrandProps = (locale: Locale) => {
  switch (locale) {
    case 'he':
      return {
        logo: '/static/images/whatsapp_fab.svg',
        color: 'green',
        href: getSupportUrl(locale),
      };
    case 'en':
    case 'uz':
    case 'ru':
    default:
      return {
        logo: '/static/images/telegram_fab.svg',
        color: 'blue',
        href: getSupportUrl(locale),
      };
  }
};

const SupportButton = ({
  size = 'medium',
  text = 'help',
  customText,
}: {
  size?: 'small' | 'medium' | 'large';
  text?: 'help' | 'contactUs';
  customText?: ReactNode;
}) => {
  const t = useTranslations('common');
  const { locale } = useLocale();
  const props = getBrandProps(locale);

  return (
    <Button
      variant="tonal"
      startIcon={
        <Image src={props.logo} alt="support" width={logoSize[size]} height={logoSize[size]} />
      }
      color={props.color}
      href={props.href}
      size={size}
      target="_blank"
      sx={{ px: '14px' }}
    >
      {customText ?? t(text)}
    </Button>
  );
};

export default SupportButton;
