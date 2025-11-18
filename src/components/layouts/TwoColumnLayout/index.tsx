import { Stack, SxProps } from '@mui/material';
import { ReactNode } from 'react';
import styles from './styles';

export const PrimaryColumn = ({ children, sx }: { children: ReactNode; sx?: SxProps }) => {
  return <Stack sx={{ ...styles.primaryColumn, ...sx }}>{children}</Stack>;
};

export const SecondaryColumn = ({ children, sx }: { children: ReactNode; sx?: SxProps }) => {
  return <Stack sx={{ ...styles.secondaryColumn, ...sx }}>{children}</Stack>;
};

const TwoColumnLayout = ({
  children,
  reverseColsOnMobile = false,
  sx,
}: {
  children: ReactNode;
  reverseColsOnMobile?: boolean;
  sx?: SxProps;
}) => {
  return <Stack sx={{ ...styles.container(reverseColsOnMobile), ...sx }}>{children}</Stack>;
};

export default TwoColumnLayout;
