import { ShopSearchOptions } from '@/lib/api/types';
import { Box, Grid } from '@mui/material';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import { GridOptions, SharedImageType } from '../../shared/cmsTypes';
import ShopCategoryBlock from '../../shared/ShopCategoryBlock';

const defaultGridOptions: GridOptions = { xs: 6, sm: 6, md: 4, lg: 3 };

export interface ShopCategoryBlocksProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  variant: 'default' | 'compact';
  cards: { image: SharedImageType; title: string; searchOptions: ShopSearchOptions; variant: 'default' | 'featured' }[];
  gridOptions: GridOptions;
  button: any;
}

const ShopCategoryBlocks = ({ section, cards }: ShopCategoryBlocksProps) => {
  return (
    <SectionBase {...section}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr', // 👈 3 kolon
          },
          gridTemplateRows: {
            md: 'repeat(2, 220px)', // 👈 2 satır
          },
          gap: 2,
        }}
      >
        {cards.map((item, index) => {
          const isFeatured = item.variant === 'featured';

          return (
            <Box
              key={item.title}
              sx={{
                // 📍 ORTA FEATURED KART
                ...(isFeatured && {
                  gridColumn: { md: '2 / 3' }, // orta kolon
                  gridRow: { md: '1 / 3' },    // 2 satır kapla
                }),
              }}
            >
              <ShopCategoryBlock
                {...item}
                href=""
                variant={item.variant ?? 'default'}
              />
            </Box>
          );
        })}
      </Box>
    </SectionBase>
  );
};

export default ShopCategoryBlocks;

  