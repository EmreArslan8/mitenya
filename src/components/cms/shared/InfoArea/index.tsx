import Markdown from '@/components/common/Markdown';
import Icon from '@/components/Icon';
import { Stack, Typography } from '@mui/material';
import styles from './styles';

export interface InfoAreaProps {
  icon?: string;
  label?: string;
  description?: string;
  url?: string;
}

const InfoArea = ({ icon, label, description, url }: InfoAreaProps) => {


  return (
    <Stack
      onClick={() => url && router.push(url)}
      direction="column"
      alignItems="center"
      sx={{ cursor: url ? 'pointer' : 'default' }}
    >
      {icon && <Icon name={icon} />}
      {label && <Typography variant="body">{label}</Typography>}
      {description && <Markdown text={description} sx={styles.description} />}
    </Stack>
  );
};

export default InfoArea;
