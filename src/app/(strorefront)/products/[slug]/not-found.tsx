import Link from 'next/link';
import { Box, Button, Container, Typography } from '@mui/material';

export default function NotFound() {
  return (
    <main>
      <Box sx={{ bgcolor: 'bg.main', py: { xs: 6, sm: 8 } }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h1">Ürün bulunamadı</Typography>
          <Typography variant="body" sx={{ color: 'text.medium', mt: 1 }}>
            Aradığınız ürün kaldırılmış veya bağlantı geçersiz olabilir.
          </Typography>
          <Button component={Link} href="/products" variant="outlined" color="primary" size="large" sx={{ mt: 3 }}>
            Ürünlere geri dön
          </Button>
        </Container>
      </Box>
    </main>
  );
}
