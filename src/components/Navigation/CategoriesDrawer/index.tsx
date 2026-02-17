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

  const handleNavigate = (slug?: string) => {
    if (!slug) return;
    onNavigate?.(slug);
    onClose();
  };

  const handleAction = (callback?: () => void) => {
    if (!callback) return;
    callback();
    onClose();
  };

  const toggleCategory = (id: number) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const hasCategories = !!categories?.length;

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
          <Typography sx={styles.headerTitle}>Menü</Typography>
          <IconButton onClick={onClose} aria-label="Kapat" sx={styles.closeButton}>
            <X />
          </IconButton>
        </Stack>

        <Stack sx={styles.body}>
          <Stack sx={styles.section}>
            <Typography sx={styles.sectionTitle}>Hızlı Erişim</Typography>
            <Stack sx={styles.quickActions}>
              <MenuItem sx={styles.actionItem} onClick={() => handleAction(onAccount)} disabled={!onAccount}>
                <Box sx={styles.actionIcon}>
                  <User size={18} />
                </Box>
                <Typography sx={styles.actionLabel}>
                  {isAuthenticated ? 'Hesabım' : 'Giriş yap / Üye ol'}
                </Typography>
              </MenuItem>
              <MenuItem
                sx={styles.actionItem}
                onClick={() => handleAction(onFavorites)}
                disabled={!onFavorites}
              >
                <Box sx={styles.actionIcon}>
                  <Heart size={18} />
                </Box>
                <Typography sx={styles.actionLabel}>Favoriler</Typography>
              </MenuItem>
              <MenuItem sx={styles.actionItem} onClick={() => handleAction(onOrders)} disabled={!onOrders}>
                <Box sx={styles.actionIcon}>
                  <Package size={18} />
                </Box>
                <Typography sx={styles.actionLabel}>Siparişlerim</Typography>
              </MenuItem>
            </Stack>
          </Stack>

          <Divider sx={styles.divider} />

          <Stack sx={styles.section}>
            <Typography sx={styles.sectionTitle}>Kategoriler</Typography>
            {!hasCategories && (
              <Typography sx={styles.emptyText}>Kategori bulunamadı</Typography>
            )}
            <Stack sx={styles.categoryList}>
              {categories?.map((category) => {
                const hasSubs = !!category.subs?.length;
                const isOpen = !!openCategories[category.id];
                const isDirectLink = !hasSubs && !!category.slug;

                return (
                  <Box key={category.id}>
                    <MenuItem
                      sx={styles.categoryItem}
                      onClick={() => {
                        if (hasSubs) return toggleCategory(category.id);
                        handleNavigate(category.slug);
                      }}
                      disabled={!hasSubs && !category.slug}
                    >
                      <Typography sx={styles.categoryLabel}>{category.label}</Typography>
                      {hasSubs && (
                        <Box
                          sx={{
                            ...styles.chevronWrap,
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        >
                          <ChevronDown size={16} />
                        </Box>
                      )}
                      {isDirectLink && <Box sx={styles.directLinkDot} />}
                    </MenuItem>

                    {hasSubs && (
                      <Collapse in={isOpen} timeout={200} unmountOnExit>
                        <Stack sx={styles.subList}>
                          {category.subs?.map((sub) => (
                            <MenuItem
                              key={sub.id}
                              sx={styles.subItem}
                              onClick={() => handleNavigate(sub.slug)}
                              disabled={!sub.slug}
                            >
                              <Typography sx={styles.subLabel}>{sub.label}</Typography>
                            </MenuItem>
                          ))}
                        </Stack>
                      </Collapse>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Stack>

          {/* Kampanya bloğu şimdilik devre dışı */}
          {/*
          <Stack sx={styles.promoCard} onClick={() => handleNavigate('search?sort=rct')}>
            <Typography sx={styles.promoEyebrow}>Kampanya</Typography>
            <Typography sx={styles.promoTitle}>Yeni Gelenler • Hemen Keşfet</Typography>
          </Stack>
          */}

          <Stack sx={styles.footerLinks}>
            <MenuItem
              component="a"
              href="https://api.whatsapp.com/send?phone=905070617930"
              target="_blank"
              rel="noreferrer"
              sx={styles.footerLinkItem}
              onClick={onClose}
            >
              Yardım
            </MenuItem>
            <MenuItem
              component="a"
              href="https://help.mitenya.com/"
              target="_blank"
              rel="noreferrer"
              sx={styles.footerLinkItem}
              onClick={onClose}
            >
              SSS
            </MenuItem>
          </Stack>
        </Stack>
      </Stack>
    </Drawer>
  );
};

export default CategoriesDrawer;
