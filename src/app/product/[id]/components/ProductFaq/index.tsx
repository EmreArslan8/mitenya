'use client';

import Markdown from '@/components/common/Markdown';
import { ShopProductData } from '@/lib/api/types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography } from '@mui/material';
import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import ProductQAEntryCard from '../ProductQA/EntryCard';
import useStyles from './styles';

type ProductFaqProps = {
  faqs?: ShopProductData['faqs'];
  productName?: string;
};

type ProductFaqItemProps = {
  answer: string;
  question: string;
};

function ProductFaqItem({ answer, question }: ProductFaqItemProps) {
  const styles = useStyles();
  const [expanded, setExpanded] = useState(false);

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      disableGutters
      elevation={0}
      sx={styles.item}
    >
      <AccordionSummary
        expandIcon={expanded ? <Minus size={16} /> : <Plus size={16} />}
        sx={styles.summary}
      >
        <Box sx={styles.questionWrap}>
          <Typography component="h3" sx={styles.question}>
            {question}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={styles.details}>
        <Box sx={styles.answerShell}>
          <Markdown
            text={answer}
            options={{
              p: {
                sx: styles.answer,
              },
            }}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

export default function ProductFaq({ faqs, productName }: ProductFaqProps) {
  const styles = useStyles();

  if (!faqs?.length) return null;

  return (
    <Stack sx={styles.section}>
      <Box sx={styles.layout}>
        <Stack sx={styles.headingColumn}>
          <Typography component="h2" sx={styles.title}>
            Sıkça Sorulan
            <br />
            Sorular
          </Typography>
          <Typography sx={styles.intro}>
            {productName
              ? `${productName} hakkinda en cok merak edilen detaylari burada bulabilirsiniz.`
              : 'Urun hakkinda en cok merak edilen detaylari burada bulabilirsiniz.'}
          </Typography>
        </Stack>

        <Stack sx={styles.contentColumn}>
          <Stack sx={styles.list}>
            {faqs.map((faq, index) => (
              <ProductFaqItem
                key={`${faq.question}-${index}`}
                answer={faq.answer}
                question={faq.question}
              />
            ))}
          </Stack>

          <ProductQAEntryCard variant="faq" productName={productName} />
        </Stack>
      </Box>
    </Stack>
  );
}
