'use client';

import Image from 'next/image';
import Button from '../common/Button';
import { ReactNode } from 'react';

const logoSize = {
  small: 24,
  medium: 24,
  large: 28,
};

// Sabit support URL (istersen değiştir)
const SUPPORT_URL = 'https://t.me/yourSupportChannel';
// veya WhatsApp: const SUPPORT_URL = "https://wa.me/1234567890";

const SupportButton = ({
  size = 'medium',
  label = 'Help',
  customText,
}: {
  size?: 'small' | 'medium' | 'large';
  label?: string;
  customText?: ReactNode;
}) => {
  return (
    <Button
      variant="tonal"
      startIcon={
        <Image 
          src="/static/images/telegram_fab.svg"
          alt="support"
          width={logoSize[size]}
          height={logoSize[size]}
        />
      }
      color="blue"
      href={SUPPORT_URL}
      size={size}
      target="_blank"
      sx={{ px: '14px' }}
    >
      {customText ?? label}
    </Button>
  );
};

export default SupportButton;
