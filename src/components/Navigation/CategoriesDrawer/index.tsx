'use client';

import { CategoryParent } from '@/lib/api/types';
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { ChevronDown, Heart, Package, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import useStyles from './styles';

interface CategoriesDrawerProps {
  open: boolean;
  categories?: CategoryParent[];
  isAuthenticated?: boolean;
  onClose: () => void;
  onAccount?: () => void;
  onFavorites?: () => void;
  onOrders?: () => void;
  onNavigate?: (slug: string) => void;
}

const CategoriesDrawer = ({
  open,
  categories,
  isAuthenticated,
  onClose,
  onAccount,
  onFavorites,
  onOrders,
  onNavigate,
}: CategoriesDrawerProps) => {
  const styles = useStyles();
  const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!open) setOpenCategories({});
  }, [open]);

  const toggleCategory = (id: number) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNavigate = (slug?: string) => {
    if (!slug) return;
    onNavigate?.(slug);
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={styles.drawer}
      PaperProps={{ sx: styles.paper }}
    >
      <Stack sx={styles.content}>
        <Stack direction="row" sx={styles.header}>
          <Typography sx={styles.brandText}>mitenya</Typography>
          <IconButton onClick={onClose} aria-label="Kapat" sx={styles.closeButton}>
            <X  />
          </IconButton>
        </Stack>

        <Box sx={styles.sectionHeader}>
          <Typography sx={styles.sectionTitle}>Hesabım</Typography>
        </Box>
        <Stack sx={styles.accountSection}>
          <MenuItem sx={styles.menuItem} onClick={onAccount} disabled={!onAccount}>
            <Box sx={styles.menuIconWrap}>
              <User size={18} />
            </Box>
            {isAuthenticated ? 'Hesabım' : 'Giriş yap / Üye Ol '}
          </MenuItem>
          <Divider sx={styles.divider} />
          <MenuItem sx={styles.menuItem} onClick={onFavorites} disabled={!onFavorites}>
            <Box sx={styles.menuIconWrap}>
              <Heart size={18} />
            </Box>
            Favorilerim
          </MenuItem>
          <Divider sx={styles.divider} />
          <MenuItem sx={styles.menuItem} onClick={onOrders} disabled={!onOrders}>
            <Box sx={styles.menuIconWrap}>
              <Package size={18} />
            </Box>
            Sipariş takibi
          </MenuItem>
        </Stack>

        <Box sx={styles.sectionHeader}>
          <Typography sx={styles.sectionTitle}>Kategoriler</Typography>
        </Box>
        <Stack sx={styles.categoriesSection}>
          {categories?.map((cat) => {
            const hasChildren = !!cat.subs?.length;
            const isOpen = !!openCategories[cat.id];
            return (
              <Box key={cat.id}>
                <MenuItem
                  sx={styles.categoryItem}
                  onClick={() => (hasChildren ? toggleCategory(cat.id) : handleNavigate(cat.slug))}
                >
                  <Typography sx={styles.categoryLabel}>{cat.label}</Typography>
                  {hasChildren && (
                    <Box sx={{ ...styles.chevronWrap, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <ChevronDown size={18} />
                    </Box>
                  )}
                </MenuItem>
                {hasChildren && (
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <Stack sx={styles.collapseContainer}>
                      {cat.subs?.map((sub) => (
                        <Stack key={sub.id} spacing={0.5}>
                          <Typography
                            sx={{
                              ...styles.subItem,
                              cursor: sub.slug ? 'pointer' : 'default',
                            }}
                            onClick={() => handleNavigate(sub.slug)}
                          >
                            {sub.label}
                          </Typography>
                          {sub.items?.map((item) => (
                            <Typography
                              key={item.id}
                              sx={{
                                ...styles.subChildItem,
                                cursor: item.slug ? 'pointer' : 'default',
                              }}
                              onClick={() => handleNavigate(item.slug)}
                            >
                              {item.label}
                            </Typography>
                          ))}
                        </Stack>
                      ))}
                    </Stack>
                  </Collapse>
                )}
                <Divider sx={styles.divider} />
              </Box>
            );
          })}
        </Stack>

      </Stack>
    </Drawer>
  );
};

export default CategoriesDrawer;
