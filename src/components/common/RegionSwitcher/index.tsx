/*

import useLocale from '@/lib/hooks/useLocale';
import { Region, regions } from '@/lib/shop/regions';
import { Menu } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import styles from './styles';
import emojiFlags from 'emoji-flags';
import Icon from '@/components/Icon';

const RegionSwitcher = ({ region }: { region: Region }) => {
  const t = useTranslations('common');
  const { changeRegion } = useLocale();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSelect = (region: Region) => {
    changeRegion(region);
    handleClose();
  };

  return (
    <>
      <MenuItem onClick={handleOpen} sx={styles.button}>
        <div>{(emojiFlags as any)[region.toUpperCase()]?.emoji ?? <Icon name="language" fontSize={16} />}</div>{' '}
        {t(`regions.${region.toLowerCase()}`)}
      </MenuItem>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {regions.map((region) => (
          <MenuItem
            onClick={() => handleSelect(region)}
            key={region}
          >
            <div>
              {(emojiFlags as any)[region.toUpperCase()]?.emoji ?? <Icon name="language" fontSize={18} />}
            </div>{' '}
            {t(`regions.${region.toLowerCase()}`)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default RegionSwitcher;


*/