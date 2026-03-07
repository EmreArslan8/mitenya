'use client';

import { Box, Button, Stack, Typography } from '@mui/material';
import { ArrowUpRight, MessageCircleQuestion, Sparkles } from 'lucide-react';
import useStyles from './styles';
import { openProductQA } from './events';

type ProductQAEntryCardProps = {
  variant?: 'sidebar' | 'faq';
  productName?: string;
};

export default function ProductQAEntryCard({
  variant = 'sidebar',
  productName,
}: ProductQAEntryCardProps) {
  const styles = useStyles();
  const isSidebar = variant === 'sidebar';

  return (
    <Box sx={[styles.entryCard, isSidebar ? styles.entrySidebar : styles.entryFaq]}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
        <Stack gap={1.2} minWidth={0}>
          <Box sx={styles.entryBadge}>
            <Sparkles size={12} />
            <Typography component="span" sx={styles.entryBadgeText}>
              AI yardim
            </Typography>
          </Box>

          <Stack gap={0.8}>
            <Typography sx={styles.entryTitle}>
              {isSidebar ? 'Bu urun icin hizli soru sor' : 'Aradiginiz cevap FAQ’da yoksa sorun'}
            </Typography>
            <Typography sx={styles.entryDescription}>
              {isSidebar
                ? `${productName ?? 'Bu urun'} hakkinda icerik, kullanim ve uygunluk sorularini dogrudan sorabilirsiniz.`
                : `${productName ?? 'Bu urun'} icin daha ozel bir ihtiyaciniz varsa urun asistani size daha hizli ve net yonlendirme yapabilir.`}
            </Typography>
          </Stack>
        </Stack>

        <Box sx={styles.entryIconWrap}>
          <MessageCircleQuestion size={22} />
        </Box>
      </Stack>

      <Button
        type="button"
        onClick={openProductQA}
        variant={isSidebar ? 'contained' : 'outlined'}
        endIcon={<ArrowUpRight size={16} />}
        sx={isSidebar ? styles.entryPrimaryButton : styles.entrySecondaryButton}
      >
        {isSidebar ? 'Urun asistanini ac' : 'Asistana sor'}
      </Button>
    </Box>
  );
}
