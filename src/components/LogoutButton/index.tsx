'use client';

import { LogOut } from 'lucide-react';
import { signOut } from '@/lib/utils/signOut';
import Button from '../common/Button';

const LogoutButton = (props: any) => {
  return (
    <Button
      variant="outlined"
      color="error"
      startIcon={<LogOut size={18} strokeWidth={2} />}
      onClick={signOut}
      {...props}
    >
      Çıkış Yap
    </Button>
  );
};

export default LogoutButton;
