'use client';

import { Box, Stack, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ChevronDown } from '@/components/icons';
import { Sparkles } from 'lucide-react';
import { withPalette } from '@/theme/ThemeRegistry';

type BenefitItem = { icon?: string; text: string };

const useStyles = withPalette((palette) => ({
  accordion: {
    background: 'transparent',
    boxShadow: 'none',
    border: 'none',
    borderTop: `1px solid ${palette.gray?.[100] ?? '#E5E5EA'}`,
    borderRadius: '0 !important',
    pt: '12px',
    '&::before': { display: 'none' },
    '&.Mui-expanded': { margin: 0 },
  },
  summary: {
    px: 0,
    minHeight: '0 !important',
    '& .MuiAccordionSummary-content': { margin: 0 },
    '& .MuiAccordionSummary-content.Mui-expanded': { margin: 0 },
    '&.Mui-expanded': { minHeight: 0 },
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6px',
    py: '2px',
  },
  titleIcon: {
    color: palette.primary.main,
    opacity: 0.85,
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: '0.07em',
    textTransform: 'uppercase' as const,
    color: palette.primary.main,
    lineHeight: 1,
  },
  chevron: {
    color: palette.primary.main,
    opacity: 0.7,
    transition: 'transform 0.2s ease',
  },
  details: {
    px: 0,
    pt: '12px',
    pb: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '10px',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10px',
  },
  emoji: {
    fontSize: 15,
    lineHeight: 1,
    flexShrink: 0,
  },
  text: {
    fontSize: 14,
    lineHeight: 1.45,
    color: palette.text.main,
    fontWeight: 500,
  },
}));

const ProductBenefits = ({
  benefits,
  title = 'Öne Çıkan Faydalar',
}: {
  benefits: BenefitItem[];
  title?: string;
}) => {
  const styles = useStyles();

  if (!benefits.length) return null;

  return (
    <Accordion disableGutters defaultExpanded sx={styles.accordion}>
      <AccordionSummary
        expandIcon={<ChevronDown size={15} strokeWidth={2.5} style={styles.chevron} />}
        sx={styles.summary}
      >
        <Stack sx={styles.titleRow}>
          <Box sx={styles.titleIcon}>
            <Sparkles size={13} strokeWidth={2.5} />
          </Box>
          <Typography sx={styles.title}>{title}</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={styles.details}>
        <Box sx={styles.grid}>
          {benefits.map((benefit) => (
            <Stack key={benefit.text} sx={styles.item}>
              {benefit.icon ? (
                <Typography component="span" sx={styles.emoji}>{benefit.icon}</Typography>
              ) : null}
              <Typography sx={styles.text}>{benefit.text}</Typography>
            </Stack>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default ProductBenefits;
