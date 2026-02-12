import FAQ from '@/components/cms/blocks/FAQ';
import { SectionBaseProps } from '@/components/cms/shared/SectionBase';
import { ShopProductData } from '@/lib/api/types';
import { Stack, Typography } from '@mui/material';

type ProductFaqProps = {
  faqs?: ShopProductData['faqs'];
};

const ProductFaq = ({ faqs }: ProductFaqProps) => {
  if (!faqs?.length) return null;

  const items = faqs.map((faq) => ({
    title: faq.question,
    description: faq.answer,
    categories: 'all',
  }));

  const section: SectionBaseProps = {
    sx: {},
    children: null,
  };

  return (
    <Stack gap={2} mt={2}>
      <Typography variant="h3">Sıkça Sorulan Sorular</Typography>
      <FAQ
        section={section}
        categories="all"
        items={items}
        blockIndex={0}
        direction="ltr"
      />
    </Stack>
  );
};

export default ProductFaq;
