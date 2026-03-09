'use client';

import Button from '@/components/common/Button';
import Markdown from '@/components/common/Markdown';
import CMSImage from '@/components/cms/shared/CMSImage';
import { SharedImageType } from '@/components/cms/shared/cmsTypes';
import SectionBase, { SectionBaseProps } from '@/components/cms/shared/SectionBase';
import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { BlockComponentBaseProps } from '..';
import useStyles from './styles';

export interface ProductDetailTabsProps extends BlockComponentBaseProps {
  section?: SectionBaseProps;
  image: SharedImageType;
  items: {
    title: string;
    description?: string;
  }[];
}

export default function ProductDetailTabs({ section, image, items }: ProductDetailTabsProps) {
  const styles = useStyles();
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  if (!items.length || !image?.data?.attributes?.url) return null;

  const {
    sectionHeader,
    sectionDescription,
    sectionDescriptionMarkdownOptions,
    sectionLabel,
    sectionHref,
    sx: sectionSx,
    ...sectionBaseProps
  } = section ?? {};

  return (
    <SectionBase {...sectionBaseProps} sx={[styles.section, sectionSx]}>
      {(sectionHeader || sectionDescription || sectionLabel) && (
        <Stack gap={1}>
          {(sectionHeader || sectionLabel) && (
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {sectionHeader ? (
                  <Typography component="h2" sx={styles.sectionHeaderTypography}>
                    {sectionHeader}
                  </Typography>
                ) : null}
              </Box>
              {sectionLabel ? (
                <Button
                  color="neutral"
                  arrow="end"
                  size="small"
                  variant="outlined"
                  sx={styles.sectionButton}
                  href={sectionHref}
                >
                  {sectionLabel}
                </Button>
              ) : null}
            </Stack>
          )}
          {sectionDescription ? (
            <Markdown text={sectionDescription} options={sectionDescriptionMarkdownOptions} />
          ) : null}
        </Stack>
      )}
      <Box sx={styles.layout}>
        <Stack sx={styles.content}>
          {items.map((item, index) => {
            const expanded = index === activeIndex;

            return (
              <Accordion
                key={`${item.title}-${index}`}
                expanded={expanded}
                onChange={(_, isExpanded) => setActiveIndex(isExpanded ? index : null)}
                disableGutters
                elevation={0}
                square
                sx={styles.tabItem}
              >
                <AccordionSummary expandIcon={<ChevronDown size={20} style={styles.icon} />} sx={styles.header}>
                  <Typography sx={styles.title}>{item.title}</Typography>
                </AccordionSummary>

                <AccordionDetails sx={styles.details}>
                  {item.description ? <Markdown text={item.description} sx={styles.description} /> : null}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>

        <Box sx={styles.imageWrap}>
          <Box sx={styles.imageBox}>
            <CMSImage
              src={image.data.attributes.url}
              alt={image.data.attributes.alternativeText || items[0]?.title || 'Product detail visual'}
              fill
              style={styles.image}
            />
          </Box>
        </Box>
      </Box>
    </SectionBase>
  );
}
