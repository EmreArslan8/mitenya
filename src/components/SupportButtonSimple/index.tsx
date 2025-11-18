'use client';

import Icon from '../Icon';
import Button from '../common/Button';

const SUPPORT_URL = "https://support.example.com"; 

const SupportButton = (props: any) => {

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
