import { Skeleton, Stack, SxProps, Typography, TypographyProps } from '@mui/material';
import { ReactNode } from 'react';

interface InfoItemProps {
  label: ReactNode;
  value?: ReactNode;
  slotProps?: {
    label?: TypographyProps;
    value?: TypographyProps;
  };
  sx?: SxProps;
}

const InfoItem = ({ label, value, slotProps, sx }: InfoItemProps) => {
  return (
    <Stack gap={0.5} sx={sx}>
      <Typography variant="infoLabel" {...slotProps?.label}>
        {label}
      </Typography>
      {value ? (
        <Typography variant="infoValue" {...slotProps?.value}>
          {value}
        </Typography>
      ) : (
        <Skeleton variant="rectangular" width={80} height={20} />
      )}
    </Stack>
  );
};

export default InfoItem;
