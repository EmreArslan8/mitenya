import Icon from '@/components/Icon';
import SearchSort from '@/components/SearchSort';
import Button from '@/components/common/Button';
import ModalCard from '@/components/common/ModalCard';
import { ShopFilter, ShopFilterType, ShopSearchSort } from '@/lib/api/types';
import { bannerHeight } from '@/theme/theme';
import { Stack } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import FilterCard from '../FilterCard';
import useStyles from './styles';

interface MobileFiltersProps {
  filters: {
    categories?: ShopFilter<'category'>[] | undefined;
    brands?: ShopFilter<'brand'>[] | undefined;
    genders?: ShopFilter<'gender'>[] | undefined;
    sizes?: ShopFilter<'size'>[] | undefined;
  };
  sortOptions?: ShopSearchSort[];
  onOptionClicked: (option: ShopFilter<ShopFilterType>) => void;
}

const MobileFilters = ({ filters, sortOptions, onOptionClicked }: MobileFiltersProps) => {
  const t = useTranslations('shop');
  const styles = useStyles();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<ShopFilter<ShopFilterType>[]>(
    Object.values(filters)[0]
  );
  const prevScrollPosition = useRef(0);
  const ref = useRef<HTMLDivElement>(null);
  const isMobileRef = useRef(true);

  const handleScroll = () => {
    if (!ref.current) return;
    const headerHidden = window.scrollY > 120 && window.scrollY > prevScrollPosition.current;
    const scrolled = window.scrollY > 0;
    if (isMobileRef.current) {
      ref.current.style.top = (headerHidden ? 44 : scrolled ? 88 : 88 + bannerHeight) + 'px';
      ref.current.style.boxShadow = scrolled ? '0 0 5px #00000010' : 'none';
    } else {
      ref.current.style.top = headerHidden ? '86px' : '146px';
      ref.current.style.maxHeight = `calc(100vh - ${headerHidden ? 86 : 146}px - 8px)`;
    }
    prevScrollPosition.current = window.scrollY;
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Stack sx={styles.mobileFiltersBar} ref={ref}>
      {sortOptions && sortOptions.length > 1 && <SearchSort sortOptions={sortOptions} />}
      {Object.values(filters).map((e) => (
        <Button
          size="small"
          variant={e.some((k) => k.selected) ? 'outlined' : 'tonal'}
          color={e.some((k) => k.selected) ? 'primary' : 'neutral'}
          startIcon={<Icon name="tune" fontSize={20} />}
          onClick={() => {
            setCurrentFilter(e);
            setModalOpen(true);
          }}
          key={e[0].type}
        >
          {t(`filters.${e[0].type}`)}
        </Button>
      ))}
      <ModalCard
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        showCloseIcon
        title={t(`filters.${currentFilter![0].type}`)}
        iconName="tune"
        sx={styles.modal}
      >
        <Stack sx={styles.modalBody}>
          <FilterCard index={0} data={currentFilter} onOptionClicked={onOptionClicked} />
        </Stack>
      </ModalCard>
    </Stack>
  );
};

export default MobileFilters;
