import SearchSort from '@/components/SearchSort';
import { ArrowLeft, ChevronRight, CloseIcon } from '@/components/icons';
import { ShopFilter, ShopFilterType, ShopSearchResponseFilters, ShopSearchSort } from '@/lib/api/types';
import { FILTER_TYPE_LABEL_TR } from '@/lib/utils/filters';
import { Chip } from '@mui/material';
import { Drawer, IconButton, Stack, Typography } from '@mui/material';
import { SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import FilterCard from '../FilterCard';
import useStyles from './styles';

interface MobileFiltersProps {
  filters: Omit<ShopSearchResponseFilters, 'selectedOptions'>;
  sortOptions?: ShopSearchSort[];
  resultsCount?: number;
  onOptionClicked: (option: ShopFilter<ShopFilterType>) => void;
}

const MobileFilters = ({
  filters,
  sortOptions,
  resultsCount,
  onOptionClicked,
}: MobileFiltersProps) => {
  const styles = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFilterType, setActiveFilterType] = useState<ShopFilterType | null>(null);

  type FilterGroup = ShopFilter<ShopFilterType>[];
  const filterGroups = useMemo(
    () => Object.values(filters).filter((entry) => Array.isArray(entry) && entry.length > 0) as FilterGroup[],
    [filters]
  );

  const resetDrawerState = () => {
    setDrawerOpen(false);
    setActiveFilterType(null);
  };

  const activeFilter = useMemo(
    () => filterGroups.find((group) => group[0]?.type === activeFilterType) ?? null,
    [activeFilterType, filterGroups]
  );

  const openFilterDetail = (groupType: ShopFilterType) => {
    setActiveFilterType(groupType);
  };

  const currentFilterLabel = activeFilter ? FILTER_TYPE_LABEL_TR[activeFilter[0].type] : 'Filtreler';
  const normalizeOptionText = (value: string) => value.replace(/\s*\(\d+\)\s*$/, '').trim();
  const selectedChips = useMemo(
    () =>
      filterGroups.flatMap((group) =>
        group
          .filter((option) => option.selected)
          .map((option) => ({
            key: `${group[0].type}-${JSON.stringify(option.searchOptions)}`,
            label: normalizeOptionText(option.text),
            option,
          }))
      ),
    [filterGroups]
  );

  return (
    <Stack sx={styles.mobileFiltersWrapper}>
      <Stack sx={styles.mobileFiltersBar}>
        <Stack sx={styles.sortWrap}>
          {sortOptions && sortOptions.length > 1 ? (
            <SearchSort
              sortOptions={sortOptions}
              mobileTriggerLabel="Sırala"
              buttonLike
              hideSelectedValue
            />
          ) : (
            <Stack sx={{ ...styles.filterTrigger, opacity: 0.5, pointerEvents: 'none' }}>Sırala</Stack>
          )}
        </Stack>
        <Stack
          role="button"
          tabIndex={0}
          aria-label="Filtrele"
          sx={styles.filterTrigger}
          onClick={() => setDrawerOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setDrawerOpen(true);
            }
          }}
        >
          <SlidersHorizontal size={17} />
          Filtrele
        </Stack>
      </Stack>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={resetDrawerState}
        sx={styles.drawer}
        PaperProps={{ sx: styles.drawerPaper }}
      >
        <Stack sx={styles.drawerHeader}>
          {activeFilter ? (
            <IconButton onClick={() => setActiveFilterType(null)} aria-label="Filtre listesine dön" sx={styles.headerAction}>
              <ArrowLeft size={20} />
            </IconButton>
          ) : (
            <Stack sx={styles.headerSpacer} />
          )}
          <Typography sx={styles.drawerTitle}>{currentFilterLabel}</Typography>
          <IconButton onClick={resetDrawerState} aria-label="Filtre panelini kapat" sx={styles.headerAction}>
            <CloseIcon size={20} />
          </IconButton>
        </Stack>

        {!activeFilter ? (
          <Stack sx={styles.drawerList}>
            {!!selectedChips.length && (
              <Stack sx={styles.selectedChipsWrap}>
                {selectedChips.map((chip) => (
                  <Chip
                    key={chip.key}
                    label={chip.label}
                    onDelete={() => onOptionClicked(chip.option)}
                    sx={styles.selectedChip}
                  />
                ))}
              </Stack>
            )}
            {filterGroups.map((group) => {
              const selectedOptions = group.filter((option) => option.selected);
              const selectedCount = selectedOptions.length;
              const selectedPreview = selectedOptions
                .slice(0, 2)
                .map((option) => normalizeOptionText(option.text))
                .join(', ');

              return (
                <Stack
                  key={group[0].type}
                  role="button"
                  tabIndex={0}
                  onClick={() => openFilterDetail(group[0].type)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openFilterDetail(group[0].type);
                    }
                  }}
                  sx={styles.filterListItem}
                >
                  <Stack sx={styles.filterListMeta}>
                    <Typography sx={styles.filterListLabel}>{FILTER_TYPE_LABEL_TR[group[0].type]}</Typography>
                    {!!selectedCount && (
                      <Typography sx={styles.filterListSelected}>
                        {selectedCount} seçili
                        {selectedPreview ? ` · ${selectedPreview}` : ''}
                      </Typography>
                    )}
                  </Stack>
                  <ChevronRight size={18} />
                </Stack>
              );
            })}
          </Stack>
        ) : (
          <Stack sx={styles.drawerDetail}>
            <FilterCard
              index={0}
              data={activeFilter}
              onOptionClicked={onOptionClicked}
              showTitleOnMobile={false}
              defaultCollapsedOverride={false}
              singleColumnOnMobile
            />
          </Stack>
        )}

        <Stack sx={styles.drawerFooter}>
          <Stack role="button" tabIndex={0} sx={styles.cancelAction} onClick={resetDrawerState}>
            İptal Et
          </Stack>
          <Stack role="button" tabIndex={0} sx={styles.resultsAction} onClick={resetDrawerState}>
            Sonuçlar {typeof resultsCount === 'number' ? `(${resultsCount})` : ''}
          </Stack>
        </Stack>
      </Drawer>
    </Stack>
  );
};

export default MobileFilters;
