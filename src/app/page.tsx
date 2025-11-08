import Link from "next/link";
import Image from "next/image";
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
} from "@mui/material";
import { sanityClient } from "@/lib/sanity.client";
import {
  allProductsQuery,
  allBrandsQuery,
  allCategoriesQuery,
} from "@/lib/sanity.queries";
import { getImageUrl, type ImageLike } from "@/lib/sanity.utils";

type Brand = {
  name?: string;
  title?: string;
  logo?: ImageLike;
};

type Category = {
  title: string;
  slug: string;
  image?: ImageLike;
  heroImage?: ImageLike;
};

type Product = {
  slug: string;
  title: string;
  priceCents: number;
  currency?: string;
  image?: ImageLike;
  brand?: string;
  category?: string;
  shortDesc?: string;
  badges?: string[];
};

export default async function HomePage() {
  // Ürünler, markalar, kategorileri paralel olarak çek
  const [products, brands, categories] = await Promise.all([
    sanityClient.fetch(allProductsQuery),
    sanityClient.fetch(allBrandsQuery),
    sanityClient.fetch(allCategoriesQuery),
  ]);

  const trPrice = (cents: number, currency = "TRY") =>
    currency === "TRY"
      ? `₺${(cents / 100).toLocaleString("tr-TR")}`
      : `${(cents / 100).toFixed(2)} ${currency}`;

  return (
    <main>
      {/* HERO */}
      <Box
        component="section"
        sx={{
          bgcolor: "bg.main",
          pt: { xs: 6, sm: 8 },
          pb: { xs: 6, sm: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, sm: 6 }} alignItems="center">
            <Grid xs={12} md={6}>
              <Stack spacing={2}>
                <Chip
                  label="Yeni sezon • Otantik & Yetkili tedarik"
                  color="primary"
                  variant="outlined"
                  sx={{ alignSelf: "flex-start" }}
                />
                <Typography variant="h1">
                  Kozmedo ile <br /> günlük bakımını yükselt
                </Typography>
                <Typography variant="body1" sx={{ color: "text.medium" }}>
                  Kore kozmetiği ve seçili premium markaları resmi tedarikten,
                  hızlı kargo ve kolay iade güvencesiyle keşfet.
                </Typography>
                <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                  <Button
                    component={Link}
                    href="/products"
                    color="primary"
                    variant="contained"
                    size="large"
                  >
                    Alışverişe Başla
                  </Button>
                  <Button
                    component={Link}
                    href="/about"
                    color="secondary"
                    variant="outlined"
                    size="large"
                  >
                    Neden Kozmedo?
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid xs={12} md={6}>
              <Box
                sx={{
                  position: "relative",
                  height: { xs: 280, sm: 360, md: 420 },
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: 8,
                }}
              >
                <Image
                  src="/static/images/hero/hero-banner.webp"
                  alt="Kozmedo Hero"
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  priority
                  style={{ objectFit: "cover" }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* BRAND STRIP */}

      <Box component="section" sx={{ py: { xs: 4, sm: 5 } }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ color: "text.light", mb: 2 }}>
            Güvendiğimiz markalar
          </Typography>

          <Grid
            container
            spacing={3}
            alignItems="center"
            justifyContent="space-between"
          >
            {brands.map((b: Brand) => (
              <Grid key={b.name ?? b.title} xs={6} sm="auto">
                <Box
                  sx={{
                    position: "relative",
                    width: 140,
                    height: 40,
                    mx: "auto",
                    opacity: 0.9,
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                    "&:hover": { opacity: 1, transform: "scale(1.05)" },
                  }}
                >
                  <Image
                    src={getImageUrl(b.logo, {
                      width: 240,
                      height: 100,

                      quality: 80,
                      fallback: "/images/placeholders/brand.webp",
                    })}
                    alt={b.name ?? b.title ?? "Brand"}
                    fill
                    sizes="140px"
                    style={{ objectFit: "contain" }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CATEGORIES */}

      <Box
        component="section"
        sx={{ py: { xs: 5, sm: 7 }, bgcolor: "white.main" }}
      >
        <Container maxWidth="lg">
          <SectionHeader
            title="Kategoriler"
            subtitle="İhtiyacına göre hızlıca göz at"
            cta={{ href: "/categories", label: "Tümü" }}
          />

          <Grid container spacing={3}>
            {categories.map((c: Category) => (
              <Grid key={c.slug} xs={12} sm={4}>
                <Link href={`/c/${c.slug}`} style={{ textDecoration: "none" }}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: 6,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 12,
                      },
                    }}
                  >
                    <Box sx={{ position: "relative", height: 200 }}>
                      <Image
                        src={getImageUrl(c.heroImage || c.image, {
                          width: 900,
                          height: 540,
                          quality: 80,
                          fit: "crop",
                          fallback: "/static/images/placeholders/category.webp",
                        })}
                        alt={c.title}
                        fill
                        sizes="(max-width: 600px) 100vw, 33vw"
                        style={{ objectFit: "cover" }}
                      />
                    </Box>
                    <CardContent>
                      <Typography variant="h3">{c.title}</Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* BEST SELLERS */}
      <Box
        component="section"
        sx={{ py: { xs: 6, sm: 8 }, bgcolor: "bg.main" }}
      >
        <Container maxWidth="lg">
          <SectionHeader
            title="En Çok Satanlar"
            subtitle="Topluluğun favorileri"
            cta={{ href: "/products?sort=top", label: "Hepsini Gör" }}
          />
          <Grid container spacing={3}>
            {products.slice(0, 6).map((p: Product) => {
              const img = getImageUrl(p.image, {
                width: 900,
                height: 900,
                quality: 80,
                fallback: "/static/images/placeholders/default.webp",
              });
              return (
                <Grid key={p.slug} xs={12} sm={6} md={4}>
                  <CardProduct
                    slug={`/products/${p.slug}`}
                    title={p.title}
                    price={trPrice(p.priceCents, p.currency)}
                    img={img}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>
    </main>
  );
}

/* ---------------------- COMPONENTS ---------------------- */

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
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: { xs: 3, sm: 4 } }}
    >
      <Stack spacing={0.5}>
        <Typography variant="h2">{title}</Typography>
        {subtitle ? (
          <Typography variant="body2" sx={{ color: "text.medium" }}>
            {subtitle}
          </Typography>
        ) : null}
      </Stack>
      {cta ? (
        <Button
          component={Link}
          href={cta.href}
          color="primary"
          variant="outlined"
        >
          {cta.label}
        </Button>
      ) : null}
    </Stack>
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
    <Link href={slug} style={{ textDecoration: "none" }}>
      <Card
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          boxShadow: 6,
        }}
      >
        <Box sx={{ position: "relative", pt: "75%" }}>
          <Image
            src={img}
            alt={title}
            fill
            sizes="(max-width: 900px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />
          <Chip
            label="Hızlı Kargo"
            color="success"
            variant="outlined"
            size="small"
            sx={{ position: "absolute", top: 8, left: 8 }}
          />
        </Box>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="h3" sx={{ color: "primary.main" }}>
            {price}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
}
