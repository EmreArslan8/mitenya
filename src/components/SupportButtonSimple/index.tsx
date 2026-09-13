'use client';

import { Button, type ButtonProps } from '@/components/ui/Button';
import { Headset } from 'lucide-react';

const SUPPORT_URL = "https://t.me/yourSupportChannel";

interface SupportButtonProps extends Omit<ButtonProps, 'children' | 'href' | 'target' | 'startIcon'> {
  text?: string;
}

const SupportButton = ({ size = 'medium', text = 'İletişime Geçin', ...props }: SupportButtonProps) => {
  return (
    <Button
      variant="outlined"
      startIcon={<Headset size={18} strokeWidth={2} />}
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
