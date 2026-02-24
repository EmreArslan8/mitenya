import Markdown from '@/components/common/Markdown';
import { Box, Stack, Typography } from '@mui/material';
import styles from './styles';
import { useRouter } from 'next/navigation';
import { SharedImageType } from '../cmsTypes';
import CMSImage from '../CMSImage';

export interface InfoAreaProps {
  index?: number;
  label?: string;
  description?: string;
  url?: string;
  icon?: SharedImageType;
}

const InfoArea = ({ label, description, url, icon }: InfoAreaProps) => {
  const router = useRouter();
  const iconImage = icon?.data?.attributes;

  return (
    <Stack
      direction="column"
      spacing={1}
      alignItems="center"
      onClick={() => url && router.push(url)}
      sx={{
        ...styles.root,
        cursor: url ? 'pointer' : 'default',
      }}
    >
      {iconImage && (
        <Box sx={styles.iconFrame}>
          <Box sx={{ ...styles.icon, position: 'relative', overflow: 'hidden' }}>
            <CMSImage
              src={iconImage.url}
              alt={iconImage.alternativeText || label || 'Bilgi ikonu'}
              fill
              style={{ objectFit: 'contain' }}
            />
          </Box>
        </Box>
      )}
      <Stack spacing={0.25} sx={styles.textBlock}>
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
