import LoadingOverlay from '@/components/LoadingOverlay';
import useScreen from '@/lib/hooks/useScreen';
import { CategoryNode } from '@/lib/shop/categories';
import searchUrlFromOptions from '@/lib/shop/searchHelpers';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import DesktopCategories from './DesktopCategories';
import MobileCategories from './MobileCategories';

interface CategoriesProps {
  open: boolean;
  onClose: () => void;
}

const Categories = ({ open, onClose }: CategoriesProps) => {
  const { isMobile } = useScreen();
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const [loading, setLoading] = useState(false);

  const handleOptionClicked = (option: CategoryNode) => {
    if (!option.searchOptions) return;
    const withSalt = Array.from(searchParams.entries()).every(
      ([k, v]) => option.searchOptions![k as keyof typeof option.searchOptions] === v
    );
    router.push(searchUrlFromOptions(option.searchOptions, withSalt));
    setLoading(true);
    onClose();
  };

  useEffect(() => {
    setLoading(false);
  }, [searchParams]);

  return (
    <>
      {isMobile ? (
        <MobileCategories open={open} onClose={onClose} onOptionClicked={handleOptionClicked} />
      ) : (
        <DesktopCategories open={open} onClose={onClose} onOptionClicked={handleOptionClicked} />
      )}
      <LoadingOverlay loading={loading} />
    </>
  );
};

export default Categories;
