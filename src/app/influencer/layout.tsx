import { ReactNode } from 'react';
import { Box } from '@mui/material';

export default function InfluencerLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', pt: { xs: 2, md: 4 }, pb: 8 }}>
      <Box>{children}</Box>
    </Box>
  );
}
