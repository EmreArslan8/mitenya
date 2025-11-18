'use client';

import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import styles from './styles';


const TopBanner = () => {

  return (
    <Box sx={styles.wrapper}>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: '-100%' }}
        transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
        style={styles.marquee}
      >
        <Typography variant="body2" sx={styles.text}>
          🚚 599 TL ve üzeri alışverişlerinizde <strong>Kargo Bedava</strong> •
          2 iş gününde hızlı gönderim • Orijinal Kore kozmetiği
        </Typography>
      </motion.div>
    </Box>
  );
};

export default TopBanner;
