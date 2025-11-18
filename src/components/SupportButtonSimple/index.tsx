'use client';

import Icon from '../Icon';
import Button, { ButtonProps } from '../common/Button';

const SUPPORT_URL = "https://support.example.com"; 

const SupportButton = (props: Omit<ButtonProps, "children">) => {
  return (
    <Button
      variant="outlined"
      startIcon={<Icon name="support_agent" />}
      href={SUPPORT_URL}
      target="_blank"
      {...props}
    >
      {('contactSupport')}
    </Button>
  );
};

export default SupportButton;
