import Image from 'next/image';
import Link from 'next/link';
import { sanityClient } from '@/lib/sanity.client';
import { productBySlugQuery } from '@/lib/sanity.queries';
import { urlFor } from '@/lib/sanity.image';
import { Box, Button, Card, CardContent, Chip, Container, Divider, Stack, Typography } from '@mui/material';
import type { Image as SanityImage } from 'sanity';   // ✅ Sanity tipini import et

type Product = {
  slug: string;
  title: string;
  priceCents: number;
  currency?: string;
  images?: SanityImage[];   // ✅ any[] yerine SanityImage[]
  shortDesc?: string;
  badges?: string[];
};

function trPrice(cents: number, currency = 'TRY') {
  const tl = cents / 100;
  return currency === 'TRY' ? `₺${tl.toLocaleString('tr-TR')}` : `${tl} ${currency}`;
}

export default async function TestProductPage() {
  const slug = 'round-lab-dokdo-toner'; // Studio’da oluşturduğun ürün slug'ı
  const product = await sanityClient.fetch<Product | null>(productBySlugQuery, { slug });

  if (!product) {
    return (
      <main>
        <Container maxWidth="sm" sx={{ py: { xs: 6, sm: 8 }, textAlign: 'center' }}>
          <Typography variant="h1">Ürün bulunamadı</Typography>
          <Typography variant="body" sx={{ color: 'text.medium', mt: 1 }}>
            Slug: {slug}
          </Typography>
          <Button component={Link} href="/products" variant="outlined" color="primary" sx={{ mt: 3 }}>
            Ürünlere dön
          </Button>
        </Container>
      </main>
    );
  }

  return (
    <main>
      <Box sx={{ bgcolor: 'bg.main', py: { xs: 6, sm: 8 }, mb: { xs: 4, sm: 6 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h1">{product.title}</Typography>
          {product.shortDesc ? (
            <Typography variant="body" sx={{ color: 'text.medium', mt: 1 }}>
              {product.shortDesc}
            </Typography>
          ) : null}
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ pb: { xs: 6, sm: 8 } }}>
        <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 6 }}>
          <Box sx={{ position: 'relative', pt: '100%' }}>
            {product.images?.[0] ? (
              <Image
                src={urlFor(product.images[0]).width(1000).height(1000).fit('crop').url()}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                style={{ objectFit: 'cover' }}
                priority
              />
            ) : null}
            {product.badges?.[0] ? (
              <Chip
                label={product.badges[0]}
                color="success"
                variant="outlined"
                size="small"
                sx={{ position: 'absolute', top: 8, left: 8 }}
              />
            ) : null}
          </Box>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="h2">{trPrice(product.priceCents, product.currency)}</Typography>
              <Divider />
              <Button component={Link} href={`/products/${product.slug}`} color="primary" variant="contained">
                Tam detay sayfasına git
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
