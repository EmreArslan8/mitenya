'use client';

import { ShopFooterData } from '@/lib/api/types';
import { useIsMobileApp } from '@/lib/hooks/useIsMobileApp';
import { Grid, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import CMSImage from '../cms/shared/CMSImage';
import Link from '../common/Link';
import Markdown from '../common/Markdown';
import useStyles from './styles';
import { useRouter } from 'next/navigation';

interface FooterProps {
  data: ShopFooterData | undefined;
}
const Footer = ({ data }: FooterProps) => {
  const isMobileApp = useIsMobileApp();
  const router = useRouter();
  const styles = useStyles();


  console.log(data, "footer")
  return (
    <Stack sx={styles.container}>
      <Stack sx={styles.innerContainer}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4} md={3}>
            <Stack gap={3}>
              <Image
                src={styles.logo.src}
                alt="kozmedo"
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
