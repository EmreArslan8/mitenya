
import SearchSort from '@/components/SearchSort';
import Button from '@/components/common/Button';
import ModalCard from '@/components/common/ModalCard';
import { ShopFilter, ShopFilterType, ShopSearchSort } from '@/lib/api/types';
import { Stack } from '@mui/material';
import { useState } from 'react';
import FilterCard from '../FilterCard';
import useStyles from './styles';
import { SlidersHorizontal } from 'lucide-react';
import { FILTER_TYPE_LABEL_TR } from '@/lib/utils/filters';

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
  const styles = useStyles();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<ShopFilter<ShopFilterType>[]>(
    Object.values(filters)[0]
  );

  return (
    <Stack sx={styles.mobileFiltersBar}>
      {sortOptions && sortOptions.length > 1 && <SearchSort sortOptions={sortOptions} />}
      {Object.values(filters).map((e) => (
        <Button
          size="small"
          variant={e.some((k) => k.selected) ? 'outlined' : 'tonal'}
          color={e.some((k) => k.selected) ? 'primary' : 'neutral'}
          startIcon={<SlidersHorizontal  size={20} />}
          onClick={() => {
            setCurrentFilter(e);
            setModalOpen(true);
          }}
          key={e[0].type}
        >
          {FILTER_TYPE_LABEL_TR[e[0].type]}
        </Button>
      ))}
      <ModalCard
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        showCloseIcon
        title={FILTER_TYPE_LABEL_TR[currentFilter![0].type]}
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
