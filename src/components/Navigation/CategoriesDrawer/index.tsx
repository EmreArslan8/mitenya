'use client';

import { CategoryParent } from '@/lib/api/types';
import {
  Box,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowLeft, ChevronRight, Heart, Package, User, X } from 'lucide-react';
import Image from 'next/image';
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
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeSubId, setActiveSubId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setActiveCategoryId(null);
      setActiveSubId(null);
    }
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

  const handleBack = () => {
    if (activeSubId !== null) {
      setActiveSubId(null);
      return;
    }
    setActiveCategoryId(null);
  };

  const hasCategories = !!categories?.length;
  const activeCategory = categories?.find((e) => e.id === activeCategoryId);
  const activeSub = activeCategory?.subs?.find((e) => e.id === activeSubId);
  const isLevel1 = activeCategoryId === null;
  const isLevel2 = activeCategoryId !== null && activeSubId === null;
  const isLevel3 = activeSubId !== null;

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
          <Box sx={styles.headerLogoWrap}>
            <Image
              src={styles.headerLogo.src}
              alt="Mitenya"
              width={styles.headerLogo.width}
              height={styles.headerLogo.height}
              style={styles.headerLogo}
              priority
            />
          </Box>
          <IconButton onClick={onClose} aria-label="Kapat" sx={styles.closeButton}>
            <X strokeWidth={1.5} size={28} />
          </IconButton>
        </Stack>

        <Stack sx={styles.body}>
          <Stack sx={styles.sectionHeader}>
            <Typography sx={styles.sectionHeaderLabel}>Hesabım</Typography>
          </Stack>

          <Stack sx={styles.listContainer}>
            <MenuItem sx={styles.actionItem} onClick={() => handleAction(onAccount)} disabled={!onAccount}>
              <User size={32} strokeWidth={1.5} style={styles.actionIcon} />
              <Typography sx={styles.actionLabel}>
                {isAuthenticated ? 'Hesabım' : 'Giriş yap'}
              </Typography>
            </MenuItem>
            
            <MenuItem sx={styles.actionItem} onClick={() => handleAction(onFavorites)} disabled={!onFavorites}>
              <Heart size={32} strokeWidth={1.5} style={styles.actionIcon} />
              <Typography sx={styles.actionLabel}>Favorilerim</Typography>
            </MenuItem>
            
            <MenuItem sx={styles.actionItem} onClick={() => handleAction(onOrders)} disabled={!onOrders}>
              <Package size={32} strokeWidth={1.5} style={styles.actionIcon} />
              <Typography sx={styles.actionLabel}>Sipariş takibi</Typography>
            </MenuItem>
          </Stack>

          {/* Kategoriler Bölümü */}
          <Stack direction="row" alignItems="center" gap={1} sx={styles.sectionHeader}>
            {!isLevel1 && (
              <IconButton onClick={handleBack} size="small" sx={styles.sectionBackButton}>
                <ArrowLeft size={20} strokeWidth={1.5} />
              </IconButton>
            )}
            <Typography sx={styles.sectionHeaderLabel}>
              {isLevel1 ? 'Kategoriler' : isLevel2 ? 'Tüm Kategoriler' : activeCategory?.label}
            </Typography>
          </Stack>
          
          {!hasCategories && (
            <Typography sx={styles.emptyText}>Kategori bulunamadı</Typography>
          )}

          <Stack sx={styles.listContainer}>
            {isLevel1 &&
              categories?.map((category) => {
                const hasSubs = !!category.subs?.length;
                return (
                  <MenuItem
                    key={category.id}
                    sx={styles.categoryItem}
                    onClick={() => {
                      if (hasSubs) setActiveCategoryId(category.id);
                      else handleNavigate(category.slug);
                    }}
                    disabled={!hasSubs && !category.slug}
                  >
                    <Typography sx={styles.categoryLabel}>{category.label}</Typography>
                    {hasSubs && <ChevronRight size={24} strokeWidth={1.5} style={styles.chevronIcon} />}
                  </MenuItem>
                );
              })}

            {isLevel2 &&
              activeCategory?.subs?.map((sub) => {
                const hasItems = !!sub.items?.length;
                return (
                  <MenuItem
                    key={sub.id}
                    sx={styles.categoryItem}
                    onClick={() => {
                      if (hasItems) setActiveSubId(sub.id);
                      else handleNavigate(sub.slug);
                    }}
                    disabled={!hasItems && !sub.slug}
                  >
                    <Typography sx={styles.categoryLabel}>{sub.label}</Typography>
                    {hasItems && <ChevronRight size={24} strokeWidth={1.5} style={styles.chevronIcon} />}
                  </MenuItem>
                );
              })}

            {isLevel3 &&
              activeSub?.items?.map((item) => (
                <MenuItem
                  key={item.id}
                  sx={styles.categoryItem}
                  onClick={() => handleNavigate(item.slug)}
                  disabled={!item.slug}
                >
                  <Typography sx={styles.categoryLabel}>{item.label}</Typography>
                </MenuItem>
              ))}
          </Stack>

          {/* Footer Yardım Linki */}
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
          </Stack>
        </Stack>
      </Stack>
    </Drawer>
  );
};

export default CategoriesDrawer;
