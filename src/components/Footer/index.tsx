'use client';

import { ShopFooterData } from '@/lib/api/types';
import { useIsMobileApp } from '@/lib/hooks/useIsMobileApp';
import { Divider, Grid, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import CMSImage from '../cms/shared/CMSImage';
import Link from '../common/Link';
import Markdown from '../common/Markdown';
import useStyles from './styles';
import { usePathname, useRouter } from 'next/navigation';
import { Lock, ShieldCheck, Headset } from 'lucide-react';

const MINIMAL_ROUTES = ['/payment'];

const LEGAL_LINKS = [
  { label: 'İade Politikası', href: '/iade-politikasi' },
  { label: 'Mesafeli Satış Sözleşmesi', href: '/mesafeli-satis-sozlesmesi' },
  { label: 'KVKK', href: '/kvkk' },
];

interface FooterProps {
  data: ShopFooterData | undefined;
}
const Footer = ({ data }: FooterProps) => {
  const isMobileApp = useIsMobileApp();
  const router = useRouter();
  const pathname = usePathname();
  const styles = useStyles();
  const isMinimal = MINIMAL_ROUTES.some((r) => pathname?.startsWith(r));

  if (isMinimal) {
    return (
      <Stack
        component="footer"
        sx={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
          borderTop: '1px solid',
          borderColor: 'gray.100',
          pt: { xs: 3, sm: 4 },
          pb: { xs: 2.5, sm: 3 },
          px: 2,
        }}
      >
        <Stack sx={{ maxWidth: 960, mx: 'auto', width: '100%', gap: { xs: 2.5, sm: 3 } }}>
          {/* Trust Badges */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            gap={{ xs: 1.5, sm: 3 }}
            flexWrap="wrap"
          >
            {[
              { icon: <ShieldCheck size={18} strokeWidth={1.8} />, label: 'Güvenli Alışveriş' },
              { icon: <Lock size={18} strokeWidth={1.8} />, label: '256-bit SSL' },
              { icon: <Headset size={18} strokeWidth={1.8} />, label: 'Canlı Destek', href: 'https://api.whatsapp.com' },
            ].map((badge) => {
              const content = (
                <Stack
                  key={badge.label}
                  direction="row"
                  alignItems="center"
                  gap={0.75}
                  sx={{
                    px: { xs: 1.5, sm: 2 },
                    py: 1,
                    borderRadius: '100px',
                    border: '1px solid',
                    borderColor: 'gray.100',
                    bgcolor: '#fff',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      borderColor: 'gray.200',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    },
                  }}
                >
                  <Stack sx={{ color: 'success.main' }}>{badge.icon}</Stack>
                  <Typography
                    fontSize={{ xs: 11, sm: 12 }}
                    fontWeight={600}
                    color="text.medium"
                    letterSpacing={0.2}
                    whiteSpace="nowrap"
                  >
                    {badge.label}
                  </Typography>
                </Stack>
              );

              return badge.href ? (
                <a key={badge.label} href={badge.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  {content}
                </a>
              ) : (
                content
              );
            })}
          </Stack>

          {/* Payment Vendors */}
          {data?.vendors?.data && data.vendors.data.length > 0 && (
            <Stack gap={1.5} alignItems="center">
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                gap={{ xs: 1, sm: 1.5 }}
                flexWrap="wrap"
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: '#fff',
                  border: '1px solid',
                  borderColor: 'gray.100',
                }}
              >
                {data.vendors.data.map((image) => (
                  <CMSImage
                    key={image.attributes.url}
                    src={image.attributes.url}
                    alt={image.attributes.alternativeText}
                    width={44}
                    height={28}
                    style={{ objectFit: 'contain', opacity: 0.75 }}
                  />
                ))}
              </Stack>
            </Stack>
          )}

          {/* Legal Links */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            gap={{ xs: 1.5, sm: 2.5 }}
            flexWrap="wrap"
            divider={
              <Divider orientation="vertical" flexItem sx={{ borderColor: 'gray.200', my: 0.25 }} />
            }
          >
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} target="_blank">
                <Typography
                  fontSize={11}
                  fontWeight={500}
                  color="text.light"
                  letterSpacing={0.3}
                  sx={{
                    transition: 'color 0.2s',
                    '&:hover': { color: 'text.main' },
                  }}
                >
                  {link.label}
                </Typography>
              </Link>
            ))}
          </Stack>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack sx={styles.container}>
      <Stack sx={styles.innerContainer}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4} md={3}>
            <Stack gap={3}>
              <Image
                src={styles.logo.src}
                alt="mitenya"
                width={styles.logo.width}
                height={styles.logo.height}
                style={styles.logo}
                onClick={() => router.push('/')}
              />
              <Stack sx={styles.socials}>
                {data?.socials?.map((social) => (
                  <Link key={social.platform} href={social.url} target="_blank">
                    <Image
                      src={`/static/images/socials/${social.platform.toLowerCase()}.svg`}
                      alt={`${social.platform} icon`}
                      width={20}
                      height={20}
                    />
                  </Link>
                ))}
              </Stack>
            </Stack>
          </Grid>
          {data?.links?.map((linkGroup, index) => (
            <Grid key={index} item xs={12} sm={2} md={2}>
              <Stack gap={{ xs: 1, sm: 0.5 }}>
                <Typography variant="cardTitle">{linkGroup.label}</Typography>
                {linkGroup.children && linkGroup.children.length > 0 && (
                  <Stack sx={styles.item} gap={{ xs: 1, sm: 0.5 }}>
                    {linkGroup.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.url}
                        target={isMobileApp ? '_self' : '_blank'}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Grid>
          ))}
        </Grid>
        <Stack sx={styles.bottomBar}>
          <Markdown options={styles.markdownOptions} text={data?.address} />
        </Stack>
        <Stack sx={styles.vendors}>
          {data?.vendors?.data?.map((image) => (
            <CMSImage
              key={image.attributes.url}
              src={image.attributes.url}
              alt={image.attributes.alternativeText}
              width={48}
              height={30}
              style={{ objectFit: 'contain' }}
            />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Footer;
