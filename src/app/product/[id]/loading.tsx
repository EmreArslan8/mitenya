'use client';

import { Divider, Skeleton, Stack } from '@mui/material';
import Image from 'next/image';

const Loading = () => {
  return (
    <Stack sx={{ flexDirection: { sm: 'row' }, gap: { sm: 3 } }}>
      <Stack sx={{ width: { xs: '100vw', sm: '100%' }, alignSelf: 'center', p: { sm: 3 } }}>
        <Stack
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: 468, sm: 440, md: 600 },
            borderRadius: { sm: 1 },
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              zIndex: 1,
              borderRadius: { sm: 1 },
            }}
          />
          <Image
            src="/static/images/logo_white.webp"
            alt="bringist"
            width={104.625}
            height={30}
            style={{ zIndex: 2 }}
          />
        </Stack>
      </Stack>
      <Stack sx={{ width: '100%', gap: 2, pt: 3 }}>
        <Stack>
          <Skeleton variant="text" width={150} sx={{ fontSize: 20, lineHeight: 'normal' }} />
          <Skeleton variant="text" width={200} sx={{ fontSize: 16, lineHeight: 'normal' }} />
        </Stack>
        <Skeleton variant="text" width={100} sx={{ fontSize: 20, lineHeight: 'normal' }} />
        <Divider />
        <Stack direction="row" gap={1}>
          <Skeleton variant="rectangular" width={64} height={36} sx={{ borderRadius: 99 }} />
          <Skeleton variant="rectangular" width={64} height={36} sx={{ borderRadius: 99 }} />
          <Skeleton variant="rectangular" width={64} height={36} sx={{ borderRadius: 99 }} />
        </Stack>
        <Divider />
        <Skeleton variant="rectangular" height={46} sx={{ borderRadius: 99 }} />
      </Stack>
    </Stack>
  );
};

export default Loading;
