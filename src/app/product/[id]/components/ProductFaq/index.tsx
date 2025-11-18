import FAQ from '@/components/cms/blocks/FAQ';
import { SectionBaseProps } from '@/components/cms/shared/SectionBase';
import { Stack, Typography } from '@mui/material';
import React from 'react';

const keys = ['howToOrder', 'shippingDetails', 'shippingEstimate'];

const ProductFaq = () => {
  const items = keys.map(() => ({
    title: ('shop.faq.${e}.title'),
    description: ('shop.faq.${e}.description'),
    categories: 'all',
  }));

  const section: SectionBaseProps = {
    sx: {},
    children: null,
  };

  return (
    <Stack gap={2} mt={2}>
      <Typography variant="h3">{('title')}</Typography>
      <FAQ
        section={section}
        categories="all"
        items={items}
        blockIndex={0}
      />
    </Stack>
  );
};

export default ProductFaq;
