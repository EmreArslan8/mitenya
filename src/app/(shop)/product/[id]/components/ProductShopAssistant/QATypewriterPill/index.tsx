'use client';

import { Box, Typography } from '@mui/material';
import { ArrowUpRight } from '@/components/icons';
import { Sparkles } from 'lucide-react';
import { openProductQA } from '../events';
import useTypewriter from '@/lib/hooks/useTypewriter';
import styles from './styles';

const QUESTIONS = [
  'Ürün bana uygun mu?',
  'Nasıl kullanmalıyım?',
  'İçeriği ne işe yarar?',
];

const QATypewriterPill = () => {
  const displayed = useTypewriter({ texts: QUESTIONS });

  return (
    <Box component="button" type="button" onClick={openProductQA} sx={styles.root}>
      <Sparkles size={16} strokeWidth={1.9} />
      <Typography component="span" sx={styles.text}>
        {displayed}
        <Box component="span" sx={styles.caret} />
      </Typography>
      <Typography component="span" sx={styles.suffix}>
        · Yapay zekaya sor
      </Typography>
      <ArrowUpRight size={14} />
    </Box>
  );
};

export default QATypewriterPill;
