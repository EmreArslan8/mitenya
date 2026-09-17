import Banner from '@/components/common/Banner';
import ModalCard from '@/components/common/ModalCard';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import Image from 'next/image';
import { RulerDimensionLine } from '@/components/icons';

const ProductSizeGuide = ({
  sizeRecommendation,
  sizeGuide,
}: {
  sizeRecommendation: string | undefined;
  sizeGuide: string | undefined;
}) => {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {sizeRecommendation && <Banner variant="info" title={sizeRecommendation} />}
      {sizeGuide && (
        <>
          <Button
            size="small"
            color="tertiary"
            startIcon={<RulerDimensionLine size={17} />}
            onClick={() => setSizeGuideOpen(true)}
            className="-mx-2 -mb-3 w-max self-end"
          >
            Beden Rehberi
          </Button>
          <ModalCard
            showCloseIcon
            open={sizeGuideOpen}
            onClose={() => setSizeGuideOpen(false)}
            bodyClassName="p-0"
          >
            <Image src={sizeGuide} alt="Size guide" />
          </ModalCard>
        </>
      )}
    </div>
  );
};

export default ProductSizeGuide;
