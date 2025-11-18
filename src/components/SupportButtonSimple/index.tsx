'use client';

import Icon from '../Icon';
import Button from '../common/Button';

const SUPPORT_URL = "https://t.me/yourSupportChannel"; // veya WhatsApp linki

interface SupportButtonProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  [key: string]: any; // props genişlemesi için
}

const SupportButton = ({ size = 'medium', text = 'Contact Support', ...props }: SupportButtonProps) => {
  return (
    <Button
      variant="outlined"
      startIcon={<Icon name="support_agent" />}
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
