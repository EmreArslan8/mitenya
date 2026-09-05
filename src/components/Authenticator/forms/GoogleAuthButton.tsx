'use client';

import { Divider, Stack, Typography } from '@mui/material';
import Button from '@/components/common/Button';

/**
 * Google ile devam et — hem giris hem kayit icin ayni akis.
 * Ilk kez gelen kullaniciya AuthContext otomatik musteri kaydi aciyor.
 */
const GoogleAuthButton = ({ returnUrl }: { returnUrl: string }) => {
  const handleClick = () => {
    window.location.href = `/auth/google/login?next=${encodeURIComponent(returnUrl)}`;
  };

  return (
    <Stack gap={3}>
      <Button
        variant="outlined"
        onClick={handleClick}
        fullWidth
        sx={{
          justifyContent: 'center',
          py: 1.5,
          borderRadius: 999,
          fontWeight: 600,
          color: 'common.black',
          backgroundColor: 'common.white',
          borderColor: 'common.black',
          '&:hover': { backgroundColor: 'grey.100', borderColor: 'common.black' },
        }}
      >
        <img
          width="24"
          height="24"
          src="/static/images/socials/google.svg"
          alt="google-logo"
          style={{ marginRight: 12 }}
        />
        Google ile devam et
      </Button>

      <Stack direction="row" alignItems="center" gap={2}>
        <Divider sx={{ flex: 1 }} />
        <Typography variant="body2" color="text.secondary">
          veya
        </Typography>
        <Divider sx={{ flex: 1 }} />
      </Stack>
    </Stack>
  );
};

export default GoogleAuthButton;
