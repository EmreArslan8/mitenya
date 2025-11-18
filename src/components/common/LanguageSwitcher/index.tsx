/*
import Icon from '@/components/Icon';
import { Locale } from '@/i18n';
import useLocale from '@/lib/hooks/useLocale';
import { regionalLanguages } from '@/lib/shop/regions';
import { cyrillicFontFamily } from '@/theme/theme';
import { Menu } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import emojiFlags from 'emoji-flags';
import { useState } from 'react';
import styles from './styles';

const flagCodes = { uz: 'UZ', ru: 'RU', he: 'IL', en: '', tr: 'TR' };

const LanguageSwitcher = () => {
  const t = useTranslations('common');
  const { region, locale, changeLanguage } = useLocale();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSelect = (locale: Locale) => {
    changeLanguage(locale);
    handleClose();
  };

  return (
    <>
      <MenuItem onClick={handleOpen} sx={styles.button}>
        <div style={{ fontSize: 14 }}>
          {(emojiFlags as any)[flagCodes[locale]]?.emoji ?? <Icon name="language" fontSize={16} />}{' '}
        </div>
        {t('label')}
      </MenuItem>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {regionalLanguages[region].map((locale) => (
          <MenuItem
            onClick={() => handleSelect(locale)}
            sx={{ fontFamily: cyrillicFontFamily, fontWeight: 500 }}
            key={locale}
          >
            <div style={{ fontSize: 14 }}>
              {(emojiFlags as any)[flagCodes[locale]]?.emoji ?? (
                <Icon name="language" fontSize={16} />
              )}{' '}
            </div>
            {t(`languages.${locale}`)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;

*/
