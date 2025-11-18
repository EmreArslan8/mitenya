import Icon from '@/components/Icon';
import Banner from '@/components/common/Banner';
import ModalCard from '@/components/common/ModalCard';
import { Button, Stack } from '@mui/material';
import { useState } from 'react';
import Image from 'next/image';

const ProductSizeGuide = ({
  sizeRecommendation,
  sizeGuide,
}: {
  sizeRecommendation: string | undefined;
  sizeGuide: string | undefined;
}) => {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  return (
    <Stack gap={1}>
      {sizeRecommendation && <Banner variant="info" title={sizeRecommendation} />}
      {sizeGuide && (
        <>
          <Button
            size="small"
            color="tertiary"
            startIcon={<Icon name="checkroom" fontSize={17} />}
            onClick={() => setSizeGuideOpen(true)}
            sx={{ width: 'max-content', alignSelf: 'end', mx: -1, mb: -1.5 }}
          >
            {('shop.sizeGuide')}
          </Button>
          <ModalCard
            showCloseIcon
            open={sizeGuideOpen}
            onClose={() => setSizeGuideOpen(false)}
            BodyProps={{ sx: { p: 0 } }}
          >
            <Image src={sizeGuide} alt="Size guide" />
          </ModalCard>
        </>
      )}
    </Stack>
  );
};

export default ProductSizeGuide;
