'use client';

import { signOut } from '@/lib/utils/signOut';
import Icon from '../Icon';
import Button from '../common/Button';
import { ComponentProps } from "react";

type LogoutButtonProps = ComponentProps<typeof Button>;

const LogoutButton = (props: LogoutButtonProps) => {
  return (
    <Button
      variant="outlined"
      color="error"
      startIcon={<Icon name="logout" />}
      onClick={signOut}
      {...props}
    >
      {('logout')}
    </Button>
  );
};

export default LogoutButton;
