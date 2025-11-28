'use client';

import Icon from '@/components/Icon';
import SupportButton from '@/components/SupportButtonSimple';
import Button from '@/components/common/Button';
import Markdown from '@/components/common/Markdown';
import { Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

const NotFoundPage = () => {
  const router = useRouter();

  return (
    <Stack gap={2} textAlign="center" alignItems="center" overflow="hidden">
      <Icon name="search_off" fontSize={80} />
      <Typography variant="h2">Sayfa Bulunamadı</Typography>
      <Markdown text={"ANA SAYAFAYA DÖNÜN"} />
      <Stack direction={{ sm: 'row' }} gap={1} width="100%" maxWidth={450} sx={{ mt: 1 }}>
        <SupportButton variant="outlined" color="secondary" sx={{ flex: 1 }} />
        <Button
          variant="contained"
          startIcon={<Icon name="home" />}
          onClick={() => router.push('/')}
          sx={{ flex: 1 }}
        >
          TEKRAR DENEYİN
        </Button>
      </Stack>
    </Stack>
  );
};

export default NotFoundPage;
