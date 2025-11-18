import Icon from '@/components/Icon';
import Card from '@/components/common/Card';
import Markdown from '@/components/common/Markdown';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import styles from './styles';

export interface FAQProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  categories: string;
  items: { title: string; description: string; categories: string }[];
}

const FAQ = ({ section, categories: unparsedCategories, items: unparsedItems }: FAQProps) => {
  const categories = unparsedCategories.split(',').map((c) => c.trim());
  const items = unparsedItems.map((p) => ({
    ...p,
    categories: p.categories.split(',').map((c) => c.trim()),
  }));

  const filterItemsByCategory = (c: string) => items.filter((p) => p.categories.includes(c));

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [filteredItems, setFilteredItems] = useState(filterItemsByCategory(categories[0]));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setFilteredItems(filterItemsByCategory(selectedCategory)), [selectedCategory]);

  return (
    <SectionBase {...section}>
      <Stack sx={styles.container}>
        {categories.length > 1 && (
          <Tabs
            value={selectedCategory}
            onChange={(e, c) => setSelectedCategory(c)}
            variant="scrollable"
            sx={styles.categories}
          >
            {categories.map((c) => (
              <Tab label={c} value={c} sx={styles.category} key={c} />
            ))}
          </Tabs>
        )}
        <Stack sx={styles.items}>
          {filteredItems.map((item, index) => (
            <FAQItem
              item={item}
              index={index}
              key={item.title + item.description + selectedCategory}
            />
          ))}
        </Stack>
      </Stack>
    </SectionBase>
  );
};

const FAQItem = ({
  item,
}: {
  item: { title: string; description: string };
  index: number;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card border>
      <Accordion sx={styles.accordion} disableGutters elevation={0}>
        <AccordionSummary
          expandIcon={<Icon name="expand_more" color="tertiary" />}
          onClick={() => setExpanded(!expanded)}
        >
          <Typography variant="warningSemibold" mx={1}>
            {item.title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Markdown
            text={item.description}
            sx={{ mx: 1 }}
            options={{ p: { variant: 'warning' } }}
          />
        </AccordionDetails>
      </Accordion>
    </Card>
  );
};

export default FAQ;
