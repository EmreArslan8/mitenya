'use client';

import Markdown from '@/components/common/Markdown';
import { ShopProductData } from '@/lib/api/types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography } from '@mui/material';
import { ArrowUpRight, Minus, Plus } from '@/components/icons';
import { useState } from 'react';
import { openProductQA } from '../ProductShopAssistant/events';
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
          <Typography variant="h2" component="h2" sx={styles.title}>
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

          <Box
            component="button"
            type="button"
            onClick={openProductQA}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              alignSelf: 'flex-start',
              padding: 0,
              marginTop: 1,
              border: 'none',
              background: 'transparent',
              color: 'text.primary',
              cursor: 'pointer',
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: 14,
                fontWeight: 600,
                lineHeight: 1.4,
                color: 'text.primary',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              Cevabını bulamadın mı? Ürün hakkında yapay zekaya sor
            </Typography>
            <ArrowUpRight size={16} />
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
