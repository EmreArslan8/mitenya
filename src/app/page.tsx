// app/page.tsx
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


const bestSellers = [
  { slug: '/products/marvis-classic', title: 'Marvis Classic Strong Mint', price: '₺349', img: '/static/images/placeholders/marvis-classic.webp' },
  { slug: '/products/round-lab-toner', title: 'ROUND LAB Dokdo Toner', price: '₺799', img: '/static/images/placeholders/roundlab-toner.webp' },
  { slug: '/products/celimax-serum', title: 'celimax Noni Energy Ampoule', price: '₺1.099', img: '/static/images/placeholders/celimax-ampoule.webp' },
];

const categories = [
  { href: '/c/k-beauty', label: 'K-Beauty', img: '/static/images/placeholders/cat-kbeauty.webp' },
  { href: '/c/cilt-bakim', label: 'Cilt Bakım', img: '/static/images/placeholders/cat-skincare.webp' },
  { href: '/c/sac-bakim', label: 'Saç Bakım', img: '/static/images/placeholders/cat-hair.webp' },
];

const brands = [
  { name: 'Round Lab', img: '/static/images/brands/roundlab.svg' },
  { name: 'celimax', img: '/static/images/brands/celimax.svg' },
  { name: 'Marvis', img: '/static/images/brands/marvis.svg' },
  { name: "TIA'M", img: '/static/images/brands/tiam.svg' },
];

export default function HomePage() {
  return (
    <main>
      {/* HERO */}
      <Box
        component="section"
        sx={{
          bgcolor: 'bg.main',
          pt: { xs: 6, sm: 8 },
          pb: { xs: 6, sm: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, sm: 6 }} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={2}>
                <Chip
                  label="Yeni sezon • Otantik & Yetkili tedarik"
                  color="primary"
                  variant="outlined"
                  sx={{ alignSelf: 'flex-start' }}
                />
                <Typography variant="h1">
                  Kozmedo ile <br /> günlük bakımını yükselt
                </Typography>
                <Typography variant="body" sx={{ color: 'text.medium' }}>
                  Kore kozmetiği ve seçili premium markaları resmi tedarikten,
                  hızlı kargo ve kolay iade güvencesiyle keşfet.
                </Typography>
                <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                  <Button component={Link} href="/products" color="primary" variant="contained" size="large">
                    Alışverişe Başla
                  </Button>
                  <Button component={Link} href="/about" color="secondary" variant="outlined" size="large">
                    Neden Kozmedo?
                  </Button>
                </Stack>
                <Stack direction="row" spacing={3} sx={{ pt: 2 }}>
                  <FeaturePill text="Ücretsiz iade (14 gün)" />
                  <FeaturePill text="Aynı gün kargo" />
                  <FeaturePill text="Yetkili satıcı" />
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: 280, sm: 360, md: 420 },
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: 8,
                }}
              >
                <Image
                  src="/static/images/hero/hero-banner.webp"
                  alt="Kozmedo Hero"
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  priority
                  style={{ objectFit: 'cover' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* BRAND STRIP */}
      <Box component="section" sx={{ py: { xs: 4, sm: 5 } }}>
        <Container maxWidth="lg">
          <Typography variant="body" sx={{ color: 'text.light', mb: 2 }}>
            Güvendiğimiz markalar
          </Typography>
          <Grid container spacing={3} alignItems="center" justifyContent="space-between">
            {brands.map((b) => (
              <Grid key={b.name} size={{ xs: 6, sm: 'auto' }}>
                <Box sx={{ position: 'relative', width: 140, height: 40, mx: 'auto', opacity: 0.9 }}>
                  <Image src={b.img} alt={b.name} fill sizes="140px" style={{ objectFit: 'contain' }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CATEGORIES */}
      <Box component="section" sx={{ py: { xs: 5, sm: 7 }, bgcolor: 'white.main' }}>
        <Container maxWidth="lg">
          <SectionHeader
            title="Kategoriler"
            subtitle="İhtiyacına göre hızlıca göz at"
            cta={{ href: '/categories', label: 'Tümü' }}
          />
          <Grid container spacing={3}>
            {categories.map((c) => (
              <Grid key={c.href} size={{ xs: 12, sm: 4 }}>
                <Link href={c.href} style={{ textDecoration: 'none' }}>
                  <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 6 }}>
                    <Box sx={{ position: 'relative', height: 180 }}>
                      <Image
                        src={c.img}
                        alt={c.label}
                        fill
                        sizes="(max-width: 600px) 100vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                    <CardContent>
                      <Typography variant="h3">{c.label}</Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* BEST SELLERS */}
      <Box component="section" sx={{ py: { xs: 6, sm: 8 }, bgcolor: 'bg.main' }}>
        <Container maxWidth="lg">
          <SectionHeader
            title="En Çok Satanlar"
            subtitle="Topluluğun favorileri"
            cta={{ href: '/products?sort=top', label: 'Hepsini Gör' }}
          />
          <Grid container spacing={3}>
            {bestSellers.map((p) => (
              <Grid key={p.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                <CardProduct {...p} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* USP / GUARANTEES */}
      <Box component="section" sx={{ py: { xs: 6, sm: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <UspCard title="Yetkili Satıcı" desc="Markalardan veya resmi distribütörden tedarik." />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <UspCard title="Hızlı Teslimat" desc="14:00’a kadar verilen siparişler aynı gün kargoda." />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <UspCard title="Kolay İade" desc="Memnun kalmazsan 14 gün içinde ücretsiz iade." />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* NEWSLETTER */}
      <Box component="section" sx={{ py: { xs: 6, sm: 8 }, bgcolor: 'bg.main' }}>
        <Container maxWidth="md">
          <Card sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, boxShadow: 8 }}>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <Typography variant="h2">%10 hoş geldin indirimi</Typography>
              <Typography variant="body" sx={{ color: 'text.medium' }}>
                Haberler, kampanyalar ve kişisel bakım ipuçları için kaydol.
              </Typography>
              <Button component={Link} href="/newsletter" color="primary" variant="contained" size="large">
                E-posta ile kaydol
              </Button>
              <Typography variant="body" sx={{ color: 'text.light' }}>
                Kaydolarak KVKK ve gizlilik politikasını kabul etmiş olursun.
              </Typography>
            </Stack>
          </Card>
        </Container>
      </Box>

      {/* FAQ */}
      <Box component="section" sx={{ py: { xs: 6, sm: 8 } }}>
        <Container maxWidth="md">
          <SectionHeader title="Sık Sorulanlar" subtitle="Hızlı cevaplar" />
          <Stack spacing={3}>
            <FaqItem q="Ürünler orijinal mi?" a="Evet. Tüm ürünler markaların kendisi veya resmi distribütörlerinden tedarik edilir." />
            <FaqItem q="Kargo süresi nedir?" a="Hafta içi 14:00’a kadar verilen siparişler aynı gün kargoya verilir." />
            <FaqItem q="İade koşulları nelerdir?" a="14 gün içinde, açılmamış/denenmemiş ürünlerde ücretsiz iade sunuyoruz." />
          </Stack>
        </Container>
      </Box>
    </main>
  );
}

/* ------- Yardımcı bileşenler ------- */

function SectionHeader({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle?: string;
  cta?: { href: string; label: string };
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: { xs: 3, sm: 4 } }}
    >
      <Stack spacing={0.5}>
        <Typography variant="h2">{title}</Typography>
        {subtitle ? (
          <Typography variant="body" sx={{ color: 'text.medium' }}>
            {subtitle}
          </Typography>
        ) : null}
      </Stack>
      {cta ? (
        <Button component={Link} href={cta.href} color="primary" variant="outlined">
          {cta.label}
        </Button>
      ) : null}
    </Stack>
  );
}

function FeaturePill({ text }: { text: string }) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 0.75,
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        border: '1px solid',
        borderColor: 'text.light',
        color: 'text.medium',
        bgcolor: 'white.main',
      }}
    >
      {text}
    </Box>
  );
}

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
        <Box sx={{ position: 'relative', pt: '75%' }}>
          <Image src={img} alt={title} fill sizes="(max-width: 900px) 50vw, 33vw" style={{ objectFit: 'cover' }} />
          <Chip
            label="Hızlı Kargo"
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

function UspCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Card sx={{ p: 3, borderRadius: 3, height: '100%', boxShadow: 6 }}>
      <Stack spacing={1}>
        <Typography variant="h3">{title}</Typography>
        <Typography variant="body" sx={{ color: 'text.medium' }}>
          {desc}
        </Typography>
      </Stack>
    </Card>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <Stack spacing={1.25}>
      <Typography variant="h3">{q}</Typography>
      <Typography variant="body" sx={{ color: 'text.medium' }}>
        {a}
      </Typography>
      <Divider />
    </Stack>
  );
}
