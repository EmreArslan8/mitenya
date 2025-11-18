'use client';

import { useState, useRef } from 'react';
import {
  Stack,
  Box,
  IconButton,
  TextField,
  Badge,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Icon from '@/components/Icon';
import useScreen from '@/lib/hooks/useScreen';
import { CategoryData, ShopHeaderData } from '@/lib/api/types';

interface NavigationProps {
  data: ShopHeaderData | undefined;
}

const Navigation = ({ data }: NavigationProps) => {

  const router = useRouter();
  const { smDown } = useScreen();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [activeCategory, setActiveCategory] = useState<CategoryData | null>(null);
  const [hovered, setHovered] = useState(false);



  // 🔹 Hover kontrolü
  const handleMouseEnter = (category: CategoryData) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current); // ⬅ bu önemli
    setActiveCategory(category);
    setHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHovered(false);
      setActiveCategory(null);
    }, 150);
  };


  return (
    <Box sx={{ position: 'relative', zIndex: 100 }}>
      {/* 🔸 ÜST BAR */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: { xs: 2, sm: 4 },
          py: 1.5,
          backgroundColor: '#fff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 200,
        }}
      >
        {/* 🅰️ LOGO */}
        <Box onClick={() => router.push('/')} sx={{ cursor: 'pointer' }}>
          <Image src="/static/images/logo.jpg" alt="Logo" width={130} height={38} />
        </Box>

        {/* 🅱️ KATEGORİLER */}
        {!smDown && (
          <Stack direction="row" spacing={3} alignItems="center">
            {data?.map((cat: CategoryData) => (

              <Typography
                key={cat._id}
                onMouseEnter={() => handleMouseEnter(cat)}
                onMouseLeave={handleMouseLeave}
                sx={{
                  textDecoration: 'none',
                  color: 'text.primary',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {cat.title}
              </Typography>
            ))}
          </Stack>
        )}

        {/* 🅲 ARAMA / HESAP / SEPET */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {!smDown && (
            <TextField
              size="small"
              placeholder="Ara..."
              variant="outlined"
              sx={{
                width: 220,
                '& .MuiOutlinedInput-root': {
                  height: 38,
                  borderRadius: '10px',
                },
              }}
              InputProps={{
                endAdornment: (
                  <IconButton>
                    <Icon name="search" />
                  </IconButton>
                ),
              }}
            />
          )}
          <IconButton onClick={() => router.push('/account')}>
            <Icon name="account_circle" fontSize={26} />
          </IconButton>
          <IconButton onClick={() => router.push('/cart')}>
            <Badge badgeContent={3} color="primary">
              <Icon name="shopping_bag" fontSize={26} />
            </Badge>
          </IconButton>
        </Stack>
      </Stack>

      {/* 🧱 ALT KATEGORİLER (FULL-WIDTH DROPDOWN) */}
      {hovered && activeCategory && (
  <Paper
    onMouseLeave={handleMouseLeave}
    onMouseEnter={() => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setHovered(true);
    }}
    elevation={4}
    sx={{
      position: 'absolute',
      left: 0,
      top: '100%',
      width: '100%',
      backgroundColor: '#fff',
      borderTop: '1px solid #eee',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      p: 4,
      maxHeight: 450,
      overflowY: 'auto',
      scrollbarWidth: 'thin',
    }}
  >
    <Typography variant="h6" mb={2} fontWeight={600}>
      {activeCategory.title}
    </Typography>

    <Grid container spacing={3}>
      {activeCategory.children?.map((sub) => (
        <Grid item xs={12} sm={4} md={3} key={sub._id}>
          {/* 🔹 Alt kategori başlık */}
          <Typography
            onClick={() => router.push(`/category/${sub.slug}`)}
            sx={{
              display: 'block',
              mb: 1,
              color: 'text.primary',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' },
            }}
          >
            {sub.title}
          </Typography>

          {/* 🔸 Alt-alt kategoriler */}
          {Array.isArray(sub.children) && sub.children.length > 0 && (
            <Stack sx={{ ml: 1, mt: 1 }}>
              {sub.children.map((child) => (
                <Typography
                  key={child._id}
                  onClick={() => router.push(`/category/${child.slug}`)}
                  sx={{
                    display: 'block',
                    mb: 0.5,
                    color: 'text.secondary',
                    fontWeight: 400,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {child.title}
                </Typography>
              ))}
            </Stack>
          )}
        </Grid>
      ))}
    </Grid>
  </Paper>
)}

    </Box>
  );
};

export default Navigation;
