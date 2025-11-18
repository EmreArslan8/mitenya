'use client';

import Icon from '@/components/Icon';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { Region } from '@/lib/shop/regions';
import { Divider, Stack } from '@mui/material';
import RegionSwitcher from '../common/RegionSwitcher';
import useStyles from './styles';

const LocaleSwitcher = ({ region }: { region: Region }) => {
  const styles = useStyles();

  return (
    <Stack component="ul" sx={styles.container}>
      <Icon name="language" fontSize={16} />
      <LanguageSwitcher />
      <Divider flexItem orientation="vertical" sx={styles.divider} />
      <RegionSwitcher region={region} />
    </Stack>
  );
};

export default LocaleSwitcher;
