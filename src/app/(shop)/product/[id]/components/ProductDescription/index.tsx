'use client';

import { Accordion, AccordionSummary, AccordionDetails, Typography, Stack } from '@mui/material';
import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import Markdown, { MarkdownOptions } from '@/components/common/Markdown';
import useStyles from './styles';

interface Section {
  title: string;
  content: string;
}

const parseMarkdownSections = (text: string): Section[] => {
  const sections: Section[] = [];
  const lines = text.split('\n');

  let currentTitle = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      // Save previous section if exists
      if (currentTitle) {
        sections.push({
          title: currentTitle,
          content: currentContent.join('\n').trim(),
        });
      }
      currentTitle = line.replace('## ', '').trim();
      currentContent = [];
    } else if (currentTitle) {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentTitle) {
    sections.push({
      title: currentTitle,
      content: currentContent.join('\n').trim(),
    });
  }

  return sections;
};

interface ProductDescriptionProps {
  description: string;
  defaultExpanded?: number; // index of default expanded section, -1 for none
}

const MARKDOWN_OPTIONS: MarkdownOptions = {
  p: {
    sx: {
      fontSize: '14px',
      lineHeight: 1.6,
      color: 'inherit',
    },
  },
  ul: {
    sx: {
      m: 0,
      pl: '20px',
    },
  },
  ol: {
    sx: {
      m: 0,
      pl: '20px',
    },
  },
  li: {
    sx: {
      fontSize: '14px',
      lineHeight: 1.6,
      color: 'inherit',
      '& + li': {
        mt: '4px',
      },
    },
  },
};

const ProductDescription = ({ description, defaultExpanded = 0 }: ProductDescriptionProps) => {
  const styles = useStyles();
  const sections = parseMarkdownSections(description);
  const [expanded, setExpanded] = useState<number | false>(defaultExpanded);

  const handleChange = (index: number) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? index : false);
  };

  if (sections.length === 0) {
    return <Markdown text={description} />;
  }

  return (
    <Stack sx={styles.container}>
      {sections.map((section, index) => (
        <Accordion
          key={index}
          expanded={expanded === index}
          onChange={handleChange(index)}
          sx={styles.accordion}
          disableGutters
        >
          <AccordionSummary
            expandIcon={expanded === index ? <Minus size={22} /> : <Plus size={22} />}
            sx={styles.summary}
          >
            <Typography sx={styles.title}>{section.title}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={styles.details}>
            <Markdown text={section.content} options={MARKDOWN_OPTIONS} sx={styles.markdown} />
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
};

export default ProductDescription;
