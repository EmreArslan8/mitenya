'use client';

import Icon from '@/components/Icon';
import { Stack, Typography } from '@mui/material';
import useStyles from './styles';

export interface TrustBadge {
  icon: string;
  title: string;
  description?: string;
}

interface TrustBadgesProps {
  badges?: TrustBadge[];
  variant?: 'horizontal' | 'vertical' | 'grid';
  showDescriptions?: boolean;
}

const defaultBadges: TrustBadge[] = [
  {
    icon: 'verified_user',
    title: 'Güvenli Ödeme',
    description: '256-bit SSL şifreleme',
  },
  {
    icon: 'autorenew',
    title: 'Kolay İade',
    description: '14 gün içinde ücretsiz iade',
  },
  {
    icon: 'workspace_premium',
    title: 'Orijinal Ürün',
    description: '%100 orijinal ürün garantisi',
  },
  {
    icon: 'local_shipping',
    title: 'Hızlı Teslimat',
    description: '1-3 iş günü içinde kargoda',
  },
];

const TrustBadges = ({
  badges = defaultBadges,
  variant = 'horizontal',
  showDescriptions = true,
}: TrustBadgesProps) => {
  const styles = useStyles();

  return (
    <Stack sx={styles.container(variant)}>
      {badges.map((badge, index) => (
        <Stack key={index} sx={styles.badge(variant)}>
          <Stack sx={styles.iconWrapper}>
            <Icon name={badge.icon} fontSize={26} color="info" fill />
          </Stack>
          <Stack sx={styles.textWrapper}>
            <Typography sx={styles.title}>{badge.title}</Typography>
            {showDescriptions && badge.description && (
              <Typography sx={styles.description}>{badge.description}</Typography>
            )}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};

export default TrustBadges;
