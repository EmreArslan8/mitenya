'use client';

import { Stack } from '@mui/material';
import { ReactNode } from 'react';
import useStyles from './styles';
import dynamic from 'next/dynamic';

//const CrispWithNoSSR = dynamic(() => import('@/components/CrispChat'), { ssr: false });

const MainLayout = ({ children }: { children: ReactNode }) => {
  const styles = useStyles();

  return (
    <Stack sx={styles.container}>
      <Stack sx={styles.content}>{children}</Stack>
    {/* <CrispWithNoSSR /> */}
    </Stack>
  );
};

export default MainLayout;
