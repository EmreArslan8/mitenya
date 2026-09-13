'use client';

import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { Typography } from '@/components/ui/Typography';
import DOMPurify from 'isomorphic-dompurify';
import { Minus, Plus } from '@/components/icons';
import Markdown, { MarkdownOptions } from '@/components/common/Markdown';

interface Section {
  title: string;
  content: string;
}

const stripHtml = (html: string) =>
  DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .replace(/\s+/g, ' ')
    .trim();

const parseHtmlSections = (html: string): Section[] => {
  const sections: Section[] = [];
  const headingPattern = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  const headings = [...html.matchAll(headingPattern)];

  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const nextHeading = headings[index + 1];
    const title = stripHtml(heading[1] ?? '');
    const contentStart = (heading.index ?? 0) + heading[0].length;
    const contentEnd = nextHeading?.index ?? html.length;
    const content = html.slice(contentStart, contentEnd).trim();

    if (title && content) {
      sections.push({ title, content });
    }
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
  const sections = parseHtmlSections(description);

  if (sections.length === 0) {
    return <Markdown text={description} />;
  }

  return (
    <Accordion
      /* MUI'de `expanded === index` idi: biri açılınca diğeri kapanıyordu. */
      type="single"
      className="border-t border-gray-200"
      defaultValue={defaultExpanded >= 0 ? [String(defaultExpanded)] : []}
    >
      {sections.map((section, index) => (
        <AccordionItem
          key={index}
          value={String(index)}
          className="border-b border-gray-200"
          triggerClassName="px-2 py-3.5"
          contentClassName="px-3.5 pb-4"
          hideChevron
          trigger={
            <>
              <Typography as="span" className="text-[16px] leading-[1.45] text-text">
                {section.title}
              </Typography>
              {/* MUI'de ikon `expanded` state'iyle değişiyordu; artık data-[state] ile. */}
              <span className="shrink-0 text-text">
                <Plus size={22} className="group-data-[state=open]:hidden" />
                <Minus size={22} className="hidden group-data-[state=open]:block" />
              </span>
            </>
          }
        >
          <Markdown text={section.content} options={MARKDOWN_OPTIONS} className="text-text" />
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default ProductDescription;
