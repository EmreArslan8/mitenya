import SearchSort from '@/components/SearchSort';
import { ArrowLeft, ChevronRight, CloseIcon } from '@/components/icons';
import { ShopFilter, ShopFilterType, ShopSearchResponseFilters, ShopSearchSort } from '@/lib/api/types';
import { FILTER_TYPE_LABEL_TR } from '@/lib/utils/filters';

import { SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import FilterCard from '../FilterCard';
import { Chip } from '@/components/ui/Chip';
import { Dialog } from '@/components/ui/Dialog';

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
    <div className="min-h-[52px]">
      <div className="fixed right-0 left-0 z-[1296] grid min-h-[52px] grid-cols-2 border-y border-gray-200 bg-bg [top:var(--mobile-nav-bottom,56px)]">
        <div className="min-w-0 border-r border-gray-200">
          {sortOptions && sortOptions.length > 1 ? (
            <SearchSort
              sortOptions={sortOptions}
              mobileTriggerLabel="Sırala"
              buttonLike
              hideSelectedValue
            />
          ) : (
            <div className="flex min-h-[50px] w-full items-center justify-center px-3 text-[17px] font-extrabold uppercase opacity-50">Sırala</div>
          )}
        </div>
        <button
          type="button"
          aria-label="Filtrele"
          className="flex min-h-[50px] w-full cursor-pointer appearance-none select-none items-center justify-center gap-2 border-0 bg-bg px-3 text-[17px] leading-none font-extrabold tracking-[0.02em] uppercase hover:bg-bg-light focus-visible:bg-bg-light focus-visible:outline-none"
          onClick={() => setDrawerOpen(true)}
        >
          <SlidersHorizontal size={17} />
          Filtrele
        </button>
      </div>

      <Dialog
        position="right"
        open={drawerOpen}
        onOpenChange={(next) => { if (!next) resetDrawerState(); }}
        srTitle="Filtreler"
        className="w-screen max-w-full bg-bg sm:max-w-[420px]"
      >
        <div className="flex min-h-[58px] items-center justify-between bg-text px-3">
          {activeFilter ? (
            <button type="button" onClick={() => setActiveFilterType(null)} aria-label="Filtre listesine dön" className="inline-flex size-9 appearance-none items-center justify-center border-0 bg-transparent text-bg">
              <ArrowLeft size={20} />
            </button>
          ) : (
            <span className="size-9 shrink-0" />
          )}
          <h2 className="text-[23px] font-extrabold tracking-[0.05em] text-bg uppercase">{currentFilterLabel}</h2>
          <button type="button" onClick={resetDrawerState} aria-label="Filtre panelini kapat" className="inline-flex size-9 appearance-none items-center justify-center border-0 bg-transparent text-bg">
            <CloseIcon size={20} />
          </button>
        </div>

        {!activeFilter ? (
          <div className="h-[calc(100%_-_116px)] overflow-y-auto border-t border-gray-200 bg-bg px-4 pt-2.5 pb-4">
            {!!selectedChips.length && (
              <div className="flex flex-wrap gap-1.5 pb-2.5">
                {selectedChips.map((chip) => (
                  <Chip
                    key={chip.key}
                    label={chip.label}
                    onDelete={() => onOptionClicked(chip.option)}
                    deleteLabel={`${chip.label} filtresini kaldır`}
                    className="h-auto min-h-[30px] rounded-full border border-gray-200 bg-gray-50 px-1.5 py-1"
                  />
                ))}
              </div>
            )}
            {filterGroups.map((group) => {
              const selectedOptions = group.filter((option) => option.selected);
              const selectedCount = selectedOptions.length;
              const selectedPreview = selectedOptions
                .slice(0, 2)
                .map((option) => normalizeOptionText(option.text))
                .join(', ');

              return (
                <button
                  type="button"
                  key={group[0].type}
                  onClick={() => openFilterDetail(group[0].type)}
                  className="flex min-h-16 w-full cursor-pointer appearance-none select-none items-center justify-between border-0 border-b border-gray-200 bg-bg py-2.5 text-left text-text"
                >
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-base font-bold">{FILTER_TYPE_LABEL_TR[group[0].type]}</span>
                    {!!selectedCount && (
                      <span className="max-w-full truncate text-[13px] text-text-medium">
                        {selectedCount} seçili
                        {selectedPreview ? ` · ${selectedPreview}` : ''}
                      </span>
                    )}
                  </span>
                  <ChevronRight size={18} />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="h-[calc(100%_-_116px)] overflow-y-auto border-t border-gray-200 bg-bg px-4 pt-2.5 pb-4">
            <FilterCard
              index={0}
              data={activeFilter}
              onOptionClicked={onOptionClicked}
              showTitleOnMobile={false}
              defaultCollapsedOverride={false}
              singleColumnOnMobile
            />
          </div>
        )}

        <div className="grid h-[58px] grid-cols-2 border-t border-gray-300 bg-bg">
          <button type="button" className="flex appearance-none items-center justify-center border-0 border-r border-gray-300 bg-bg text-[17px] font-bold tracking-[0.06em] uppercase" onClick={resetDrawerState}>
            İptal Et
          </button>
          <button type="button" className="flex appearance-none items-center justify-center border-0 bg-text text-[17px] font-bold tracking-[0.06em] text-bg uppercase" onClick={resetDrawerState}>
            Sonuçlar {typeof resultsCount === 'number' ? `(${resultsCount})` : ''}
          </button>
        </div>
      </Dialog>
    </div>
  );
};

export default MobileFilters;
