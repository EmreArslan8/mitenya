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
      onClick={() => url && router.push(url)}
      direction="column"
      alignItems="center"
      sx={{ cursor: url ? 'pointer' : 'default' }}
    >
      {icon && <Icon name={icon} sx={styles.icon} />}
      {label && <Typography variant="body">{label}</Typography>}
      {description && <Markdown text={description} sx={styles.description} />}
    </Stack>
  );
};

export default InfoArea;
