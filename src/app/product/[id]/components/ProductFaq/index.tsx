import FAQ from '@/components/cms/blocks/FAQ';
import { SectionBaseProps } from '@/components/cms/shared/SectionBase';
import { Stack, Typography } from '@mui/material';


const keys = [
  {
    title: "Sipariş nasıl verilir?",
    description: "Sepete ekledikten sonra ödeme adımlarını takip ederek sipariş verebilirsiniz.",
    categories: "all"
  },
  {
    title: "Kargo ne zaman gelir?",
    description: "Siparişiniz 1-3 iş günü içinde kargoya verilir.",
    categories: "all"
  }
];

const ProductFaq = () => {
  const items = keys.map(f => ({
    title: f.title,
    description: f.description,
    categories: f.categories,
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
