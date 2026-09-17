'use client';

import { Button, type ButtonProps } from '@/components/ui/Button';
import { Headset } from '@/components/icons';

const SUPPORT_URL = "https://t.me/yourSupportChannel";

interface SupportButtonProps extends Omit<ButtonProps, 'children' | 'href' | 'target' | 'startIcon'> {
  text?: string;
}

const SupportButton = ({ size = 'medium', text = 'İletişime Geçin', ...props }: SupportButtonProps) => {
  return (
    <Button
      variant="outlined"
      startIcon={<Headset size={18} />}
      href={SUPPORT_URL}
      target="_blank"
      size={size}
      {...props}
    >
      {text}
    </Button>
  );
};

export default SupportButton;
