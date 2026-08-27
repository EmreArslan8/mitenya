import { Box, Stack, Typography } from '@mui/material';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import ShopCategoryBlock from '../../shared/ShopCategoryBlock';
import { SharedImageType } from '../../shared/cmsTypes';
import useStyles from './styles';

interface CategoryCard {
  image: SharedImageType;
  title: string;
  label?: string;
  href: string;
  buttonLabel?: string;
  target?: '_self' | '_blank';
  variant?: 'default' | 'featured';
}

export interface ShopCategoryBlocksProps extends BlockComponentBaseProps {
  section?: SectionBaseProps | null;
  cards?: CategoryCard[] | null;
}

const ShopCategoryBlocks = ({ section, cards }: ShopCategoryBlocksProps) => {
  const styles = useStyles();
  const cardItems = cards ?? [];
  const sectionData: SectionBaseProps = section ?? { children: null };
  const sectionHeader = sectionData.sectionHeader || 'İhtiyacına göre';
  const sectionLabel = sectionData.sectionLabel || 'Cilt rehberi';
  const sectionDescription = sectionData.sectionDescription
    || 'Cildinin sana söylediğinden başla; bakımını ihtiyacına göre şekillendir.';

  if (!cardItems.length) return null;

  return (
    <SectionBase
      {...sectionData}
      sectionHeader={undefined}
      sectionDescription={undefined}
      sectionLabel={undefined}
      sectionHref={undefined}
      sx={{ ...styles.section, ...(sectionData.sx as object) }}
    >
      <Stack sx={styles.sectionHead}>
        <Stack sx={styles.headingGroup}>
          <Typography sx={styles.eyebrow}>{sectionLabel}</Typography>
          <Typography component="h2" sx={styles.title}>
            {sectionHeader}
          </Typography>
        </Stack>
        <Typography sx={styles.description}>{sectionDescription}</Typography>
      </Stack>

      <Box sx={styles.grid}>
        {cardItems.map((item, index) => (
          <Box key={`${item.title}-${index}`} sx={styles.gridItem}>
            <ShopCategoryBlock
              {...item}
              index={index}
              variant={item.variant ?? 'default'}
            />
          </Box>
        ))}
      </Box>
    </SectionBase>
  );
};

export default ShopCategoryBlocks;
