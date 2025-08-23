// app/products/[slug]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sanityClient } from '@/lib/sanity.client';
import { productBySlugQuery, allProductSlugsQuery } from '@/lib/sanity.queries';
import { urlFor } from '@/lib/sanity.image';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import type { Image as SanityImage } from 'sanity';

type Spec = { label: string; value: string };

type Product = {
  slug: string;
  title: string;
  priceCents: number;
  currency?: string;
  images?: SanityImage[];
  brand?: string;
  category?: string;
  shortDesc?: string;
  description?: unknown[];
  specs?: Spec[];
  badges?: string[];
};

export const revalidate = 60;

// SSG slug’larını üret
export async function generateStaticParams() {
  const slugs = await sanityClient.fetch<string[]>(allProductSlugsQuery);
  return slugs.map((slug) => ({ slug }));
}

// ✅ params artık Promise tipinde
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await sanityClient.fetch<Product | null>(productBySlugQuery, { slug });
  if (!product) return { title: 'Ürün Bulunamadı | Kozmedo' };

  const title = `${product.title} | Kozmedo`;
  const description = product.shortDesc ?? 'Kozmedo ürün detayları';
  const imageUrl =
    product.images?.[0]
      ? urlFor(product.images[0]).width(1200).height(630).fit('crop').url()
      : '/static/images/ogBanner.webp';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: product.title }],
    },
  };
}

function trPrice(cents: number, currency = 'TRY') {
  const tl = cents / 100;
  return currency === 'TRY' ? `₺${tl.toLocaleString('tr-TR')}` : `${tl} ${currency}`;
}

// ✅ burada da params Promise tipinde
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await sanityClient.fetch<Product | null>(productBySlugQuery, { slug });
  if (!product) notFound();

  return (
    <main>
      {/* HEADER / BREADCRUMBS */}
      <Box component="section" sx={{ bgcolor: 'bg.main', py: { xs: 4, sm: 6 }, mb: { xs: 4, sm: 6 } }}>
        <Container maxWidth="lg">
          <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.medium' }} separator="›">
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Anasayfa</Link>
            <Link href="/products" style={{ color: 'inherit', textDecoration: 'none' }}>Ürünler</Link>
            <Typography variant="body" sx={{ color: 'text.medium' }}>{product.title}</Typography>
          </Breadcrumbs>
          <Typography variant="h1" sx={{ mt: 1 }}>{product.title}</Typography>
          {product.shortDesc ? (
            <Typography variant="body" sx={{ color: 'text.medium', mt: 1 }}>{product.shortDesc}</Typography>
          ) : null}
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* IMAGE */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 6 }}>
              <Box sx={{ position: 'relative', pt: '100%' }}>
                {product.images?.[0] ? (
                  <Image
                    src={urlFor(product.images[0]).width(1000).height(1000).fit('crop').url()}
                    alt={product.title}
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
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
            </Card>
          </Grid>

          {/* INFO / BUY BOX */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 6 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h2" sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    {trPrice(product.priceCents, product.currency)}
                    <Typography variant="body" component="span" sx={{ color: 'text.medium' }}>
                      (KDV dahil)
                    </Typography>
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    {product.badges?.map((b) => (
                      <Chip key={b} label={b} color="primary" variant="outlined" size="small" />
                    ))}
                  </Stack>

                  <Divider />

                  <Stack direction="row" spacing={2}>
                    <Button color="primary" variant="contained" size="large">Sepete Ekle</Button>
                    <Button component={Link} href="/checkout" color="secondary" variant="outlined" size="large">
                      Hemen Al
                    </Button>
                  </Stack>

                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {product.brand ? (
                      <Typography variant="body" sx={{ color: 'text.medium' }}>
                        Marka: <Typography variant="body" component="span">{product.brand}</Typography>
                      </Typography>
                    ) : null}
                    {product.category ? (
                      <Typography variant="body" sx={{ color: 'text.medium' }}>
                        Kategori: <Typography variant="body" component="span">{product.category}</Typography>
                      </Typography>
                    ) : null}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* DESCRIPTION & SPECS */}
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mt: { xs: 4, md: 6 } }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 6 }}>
              <CardContent>
                <Typography variant="h2" sx={{ mb: 2 }}>Ürün Açıklaması</Typography>
                <Typography variant="body" sx={{ color: 'text.medium' }}>
                  {product.shortDesc ?? 'Açıklama yakında eklenecek.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 6 }}>
              <CardContent>
                <Typography variant="h2" sx={{ mb: 2 }}>Özellikler</Typography>
                <Stack spacing={1.25}>
                  {product.specs?.length
                    ? product.specs.map((s) => (
                        <Stack key={s.label} direction="row" justifyContent="space-between" sx={{ gap: 2 }}>
                          <Typography variant="body" sx={{ color: 'text.medium' }}>{s.label}</Typography>
                          <Typography variant="body">{s.value}</Typography>
                        </Stack>
                      ))
                    : <Typography variant="body" sx={{ color: 'text.light' }}>Özellik bilgisi yakında eklenecek.</Typography>}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: { xs: 6, md: 8 }, textAlign: 'center' }}>
          <Button component={Link} href="/products" variant="outlined" color="primary" size="large">
            Tüm Ürünlere Dön
          </Button>
        </Box>
      </Container>
    </main>
  );
}
