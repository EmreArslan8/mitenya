import Link from 'next/link';
import Image from 'next/image';
import {
  Box,
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

const products = [
  {
    slug: '/products/marvis-classic',
    title: 'Marvis Classic Strong Mint',
    price: '₺349',
    img: '/static/images/placeholders/marvis-classic.webp',
  },
  {
    slug: '/products/round-lab-toner',
    title: 'ROUND LAB Dokdo Toner',
    price: '₺799',
    img: '/static/images/placeholders/roundlab-toner.webp',
  },
  {
    slug: '/products/celimax-serum',
    title: 'celimax Noni Energy Ampoule',
    price: '₺1.099',
    img: '/static/images/placeholders/celimax-ampoule.webp',
  },
  {
    slug: '/products/tiam-serum',
    title: 'TIA’M Vita B3 Source',
    price: '₺599',
    img: '/static/images/placeholders/tiam-serum.webp',
  },
];

export default function ProductsPage() {
  return (
    <main>
      {/* HERO / HEADER */}
      <Box
        component="section"
        sx={{
          bgcolor: 'bg.main',
          py: { xs: 6, sm: 8 },
          mb: { xs: 4, sm: 6 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h1">Ürünler</Typography>
          <Typography variant="body" sx={{ color: 'text.medium', mt: 1 }}>
            Kozmedo’nun seçili markaları ve en çok satan ürünlerini keşfet.
          </Typography>
        </Container>
      </Box>

      {/* PRODUCTS GRID */}
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {products.map((p) => (
            <Grid key={p.slug} xs={12} sm={6} md={3}>
              <CardProduct {...p} />
            </Grid>
          ))}
        </Grid>

        {/* CTA */}
        <Stack alignItems="center" sx={{ mt: { xs: 6, sm: 8 } }}>
          <Button component={Link} href="/" variant="outlined" color="primary" size="large">
            Ana sayfaya dön
          </Button>
        </Stack>
      </Container>
    </main>
  );
}

/* ------- Yardımcı bileşen ------- */
function CardProduct({
  slug,
  title,
  price,
  img,
}: {
  slug: string;
  title: string;
  price: string;
  img: string;
}) {
  return (
    <Link href={slug} style={{ textDecoration: 'none' }}>
      <Card
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 6,
        }}
      >
        <Box sx={{ position: 'relative', pt: '100%' }}>
          <Image
            src={img}
            alt={title}
            fill
            sizes="(max-width: 900px) 50vw, 25vw"
            style={{ objectFit: 'cover' }}
          />
          <Chip
            label="Stokta"
            color="success"
            variant="outlined"
            size="small"
            sx={{ position: 'absolute', top: 8, left: 8 }}
          />
        </Box>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="body" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="h3" sx={{ color: 'primary.main' }}>
            {price}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
}
