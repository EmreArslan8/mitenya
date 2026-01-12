import Markdown from '@/components/common/Markdown';
import Icon from '@/components/Icon';
import { Stack, Typography } from '@mui/material';
import styles from './styles';
import { useRouter } from 'next/navigation';

export interface InfoAreaProps {
  icon?: string;
  label?: string;
  description?: string;
  url?: string;
}

const InfoArea = ({ icon, label, description, url }: InfoAreaProps) => {
  const router = useRouter();

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
      {icon && <Icon name={icon} sx={styles.icon} fontSize={36} />}
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
