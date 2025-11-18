'use client';

import { Stack, Typography } from '@mui/material';
import SupportButton from '../SupportButton';
import useStyles from './styles';


const SupportFab = () => {
  const styles = useStyles();

  return (
    <Stack sx={styles.container}>
      <SupportButton
        size="small"
        customText={
          <Stack sx={styles.text}>
            <Typography fontSize={10} fontWeight={700} lineHeight="normal">
              { 'WhatsApp' }
            </Typography>
            <Typography fontSize={12} fontWeight={600} lineHeight="normal">
              {('contactUs')}
            </Typography>
          </Stack>
        }
      />
    </Stack>
  );
};

export default SupportFab;
