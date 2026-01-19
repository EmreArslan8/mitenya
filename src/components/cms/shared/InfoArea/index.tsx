import Markdown from '@/components/common/Markdown';
import Icon from '@/components/Icon';
import { Stack, Typography } from '@mui/material';
import styles from './styles';
import { useRouter } from 'next/navigation';
import useScreen from '@/lib/hooks/useScreen';

export interface InfoAreaProps {
  index?: number;
  label?: string;
  description?: string;
  url?: string;
}

const infoAreaIcons = ['truck', 'clock-4', 'badge-percent', 'credit-card'];

const InfoArea = ({ index, label, description, url }: InfoAreaProps) => {
  const router = useRouter();
  const { smUp, mdUp } = useScreen();
  const iconSize = mdUp ? 48 : smUp ? 36 : 32;
  const icon =
    typeof index === 'number'
      ? infoAreaIcons[index % infoAreaIcons.length]
      : undefined;

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      onClick={() => url && router.push(url)}
      sx={{
        cursor: url ? 'pointer' : 'default',
      }}
    >
      {icon && <Icon name={icon} fontSize={iconSize} sx={styles.icon} weight={100} />}
      <Stack spacing={0.5}>
        {label && (
          <Typography variant="subtitle1" sx={styles.label}>
            {label}
          </Typography>
        )}

        {description && <Markdown text={description} sx={styles.description} />}
      </Stack>
    </Stack>
  );
};

export default InfoArea;
