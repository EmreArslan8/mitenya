'use client';

import Button from '../common/Button';
import { Headset } from 'lucide-react';

const SUPPORT_URL = "https://t.me/yourSupportChannel";

interface SupportButtonProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  [key: string]: any; 
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
