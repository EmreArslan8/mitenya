'use client';


import { ShopFooterData } from '@/lib/api/types';
import { useIsMobileApp } from '@/lib/hooks/useIsMobileApp';
import { Grid, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import Image from 'next/image';
import { ArrowUpRight, BadgeCheck } from 'lucide-react';
import CMSImage from '../cms/shared/CMSImage';
import Card from '../common/Card';
import Link from '../common/Link';
import Markdown from '../common/Markdown';
import useStyles from './styles';
import { useRouter } from 'next/navigation';

interface FooterProps {
  data: ShopFooterData | undefined;
}

const ETBIS_PORTAL_URL =
  'https://etbis.ticaret.gov.tr/tr/Anasayfa/SiteAraSonuc?siteId=06415656-3bee-4e41-88a7-e349d350bb8e';

const Footer = ({ data }: FooterProps) => {
  const isMobileApp = useIsMobileApp();
  const router = useRouter();
  const styles = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const logoSection = (
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
  );

  const etbisSection = (
    <Card sx={styles.etbisInfoCard}>
      <Stack direction="row" alignItems="center" gap={0.7} sx={styles.etbisInfoBadge}>
      <Typography sx={styles.etbisInfoTitle}>Mitenya, ETBİS’e kayıtlıdır</Typography>
        <BadgeCheck size={18} strokeWidth={2.2} />
      </Stack>
      <Typography sx={styles.etbisInfoBody}>
        Kayıt durumunu Ticaret Bakanlığı ETBİS sistemi üzerinden doğrulayabilirsiniz.
      </Typography>

      <Link href={ETBIS_PORTAL_URL} target="_blank">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={styles.etbisInfoCta}>
          <Typography sx={styles.etbisInfoCtaText}>Resmi kaydı doğrula</Typography>
          <ArrowUpRight size={14} />
        </Stack>
      </Link>
    </Card>
  );

  return (
    <Stack sx={styles.container}>
      <Stack sx={styles.innerContainer}>
        <Grid container spacing={2}>
          {isDesktop ? (
            <>
              <Grid item xs={12} md={2}>
                {logoSection}
              </Grid>
              <Grid item xs={12} md={7}>
                <Stack direction="row" justifyContent="space-between" gap={4} sx={{ width: '100%' }}>
                  {data?.links?.map((linkGroup, index) => (
                    <Stack key={index} gap={1} sx={{ minWidth: 132, flex: 1 }}>
                      <Typography variant="cardTitle" sx={styles.linkGroupTitle}>
                        {linkGroup.label}
                      </Typography>
                      {linkGroup.children && linkGroup.children.length > 0 && (
                        <Stack sx={styles.item} gap={0.85}>
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
                  ))}
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack alignItems="flex-end">{etbisSection}</Stack>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} sm={4}>
                {logoSection}
              </Grid>
              {data?.links?.map((linkGroup, index) => (
                <Grid key={index} item xs={12} sm={2}>
                  {isMobile ? (
                    <Card
                      collapsible
                      defaultCollapsed
                      noDivider
                      title={linkGroup.label}
                      titleProps={{ sx: styles.linkGroupTitle }}
                      sx={styles.mobileLinkGroupCard}
                    >
                      {linkGroup.children && linkGroup.children.length > 0 && (
                        <Stack sx={styles.item} gap={1} pb={1.5}>
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
                    </Card>
                  ) : (
                    <Stack gap={{ xs: 1, sm: 0.9 }}>
                      <Typography variant="cardTitle" sx={styles.linkGroupTitle}>
                        {linkGroup.label}
                      </Typography>
                      {linkGroup.children && linkGroup.children.length > 0 && (
                        <Stack sx={styles.item} gap={{ xs: 1.1, sm: 0.9 }}>
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
                  )}
                </Grid>
              ))}
              <Grid item xs={12} sm={4}>
                {etbisSection}
              </Grid>
            </>
          )}
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
