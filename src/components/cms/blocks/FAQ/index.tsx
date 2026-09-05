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
import { Minus, Plus } from '@/components/icons';

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
          {filteredItems.map((item) => (
            <FAQItem
              item={item}
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
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      sx={styles.accordion}
      disableGutters
      elevation={0}
    >
      <AccordionSummary
        expandIcon={expanded ? <Minus size={20} /> : <Plus size={20} />}
        sx={styles.summary}
      >
        <Typography variant="warningSemibold" sx={styles.title}>
          {item.title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={styles.details}>
        <Markdown
          text={item.description}
          options={{ p: { variant: 'warning', fontWeight: 400 } }}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default FAQ;
