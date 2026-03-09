'use client';

import SectionBase, { SectionBaseProps } from '@/components/cms/shared/SectionBase';
import { Box, Stack, Typography } from '@mui/material';
import type { BlockComponentBaseProps } from '..';
import useStyles from './styles';

type StatItem = {
  value: string;
  label: string;
};

export interface ProductDetailClinicalStatsProps extends BlockComponentBaseProps {
  section?: SectionBaseProps;
  eyebrow?: string;
  title: string;
  description?: string;
  stats: StatItem[];
}

export default function ProductDetailClinicalStats({
  section,
  eyebrow,
  title,
  description,
  stats,
}: ProductDetailClinicalStatsProps) {
  const styles = useStyles();

  if (!title || !stats.length) return null;

  return (
    <SectionBase {...(section ?? {})} sx={styles.section}>
      <Stack sx={styles.shell}>
        <Stack sx={styles.content}>
          {eyebrow ? <Typography sx={styles.eyebrow}>{eyebrow}</Typography> : null}
          <Typography component="h2" sx={styles.title}>
            {title}
          </Typography>
          {description ? <Typography sx={styles.description}>{description}</Typography> : null}
        </Stack>

        <Box sx={styles.statsGrid}>
          {stats.map((item, index) => (
            <Stack key={`${item.value}-${index}`} sx={styles.statCard}>
              <Typography sx={styles.statValue}>{item.value}</Typography>
              <Typography sx={styles.statLabel}>{item.label}</Typography>
            </Stack>
          ))}
        </Box>
      </Stack>
    </SectionBase>
  );
}
