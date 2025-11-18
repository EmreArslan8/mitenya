import Icon from '@/components/Icon';
import categories, { CategoryNode } from '@/lib/shop/categories';
import { bannerHeight } from '@/theme/theme';
import { Drawer, Grid, MenuItem, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import useStyles from './styles';

interface DesktopCategoriesProps {
  open: boolean;
  onClose: () => void;
  onOptionClicked: (leaf: CategoryNode) => void;
}

const DesktopCategories = ({ open, onClose, onOptionClicked }: DesktopCategoriesProps) => {
  const styles = useStyles();
  const [currentCategory, setCurrentCategory] = useState(0);
  const prevScrollPosition = useRef(0);
  const mtRef = useRef<string>('146px');

  const handleScroll = () => {
    const hidden = window.scrollY > 120 && window.scrollY > prevScrollPosition.current;
    const scrolled = window.scrollY > 0;
    mtRef.current = (hidden ? 70 : scrolled ? 146 - bannerHeight : 146) + 'px';
    prevScrollPosition.current = window.scrollY;
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Drawer disableEnforceFocus open={open} onClose={onClose} anchor="top" sx={styles.drawer}>
      <Stack sx={styles.drawerBody} mt={mtRef.current}>
        <Stack sx={styles.categories}>
          {categories.map((e, i) => (
            <MenuItem
              value={i}
              selected={i === currentCategory}
              sx={styles.category}
              onClick={() => setCurrentCategory(i)}
              key={e.key}
            >
              {e.icon && <Icon name={e.icon} />}
              {(e.key)}
            </MenuItem>
          ))}
        </Stack>
        <Stack sx={styles.categoryChildren}>
          <Grid container spacing={2}>
            {categories[currentCategory].children?.map((e) => (
              <Grid item sm={6} md={4} lg={3} key={e.key}>
                <Typography variant="cardTitle" sx={styles.childTitle}>
                  {(e.key)}
                </Typography>
                {e.children?.map((c) => (
                  <MenuItem sx={styles.leaf} onClick={() => onOptionClicked(c)} key={c.key}>
                    {(c.key)}
                  </MenuItem>
                ))}
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Stack>
    </Drawer>
  );
};

export default DesktopCategories;
