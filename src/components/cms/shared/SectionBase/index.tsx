import useWindowSize from '@/lib/hooks/useWindowSize';
import { Box, Stack, SxProps, Typography } from '@mui/material';
import { ReactNode, useEffect, useRef, useState } from 'react';
import Markdown, { MarkdownOptions } from '../../../common/Markdown';
import useStyles, { primaryStyle } from './styles';
import { defaultMaxWidth } from '@/theme/theme';
import useScreen from '@/lib/hooks/useScreen';

export interface SectionBaseProps {
  sectionHeader?: string;
  sectionDescription?: string;
  sectionDescriptionMarkdownOptions?: MarkdownOptions;
  sectionWidth?: string | number;
  sectionBackground?: 'default' | 'primary';
  sx?: SxProps;
  children: ReactNode;
}

const SectionBase = ({
  sectionHeader,
  sectionDescription,
  sectionDescriptionMarkdownOptions,
  sectionBackground = 'default',
  sectionWidth = defaultMaxWidth,
  sx = {},
  children,
}: SectionBaseProps) => {
  const selectedStyle = sectionBackground === 'primary' ? primaryStyle() : {};
  const { smUp } = useScreen();

  return (
    <Stack
      id={sectionHeader}
      sx={{
        gap: 3,
        maxWidth: sectionWidth,
        width: smUp && selectedStyle.sectionBackground?.bg ? '100vw' : '100%',
        height: '100%',
        flexGrow: 1,
        backgroundColor: selectedStyle.sectionBackground?.bg,
        padding: 1,
        ...sx,
      }}
    >
      {(sectionHeader || sectionDescription) && (
        <Stack gap={1}>
          {sectionHeader && (
            <DynamicTitle title={splitTextWithDynamicSections(sectionHeader)} />
          )}
          {sectionDescription && (
            <Markdown
              text={sectionDescription}
              options={sectionDescriptionMarkdownOptions}
            />
          )}
        </Stack>
      )}
      {children}
    </Stack>
  );
};

const splitTextWithDynamicSections = (
  text: string
): (string | string[])[] => {
  const sections = text.split(/(\[[^\]]+\])/);
  const result: (string | string[])[] = [];

  for (const section of sections) {
    if (section.startsWith('[') && section.endsWith(']')) {
      result.push(
        section
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim())
      );
    } else {
      section.split(/\s+/).forEach((word) => result.push(word));
    }
  }

  return result;
};

const DynamicTitle = ({ title }: { title: (string | string[])[] }) => {
  const styles = useStyles();

  return (
    <Box component="h2" m={0}>
      <Stack
        sx={styles.title}
        columnGap={0.5}
        direction="row"
        flexWrap="wrap"
        justifyContent="center"
        alignItems="center"
      >
        {title.map((section) =>
          typeof section === 'string' ? (
            <Markdown
              key={section}
              text={`${section} `}
              options={styles.dynamicTitleMarkdownOptions}
            />
          ) : (
            <DynamicTitleSection
              key={section.toString()}
              section={section}
            />
          )
        )}
      </Stack>
    </Box>
  );
};

const DynamicTitleSection = ({ section }: { section: string[] }) => {
  const styles = useStyles();
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ Doğru DOM tipleri
  const parentRef = useRef<HTMLSpanElement | null>(null);
  const itemsRef = useRef<(HTMLSpanElement | null)[]>([]);

  const { width: windowWidth } = useWindowSize();

  // 🔹 En geniş kelimeye göre container genişliği
  useEffect(() => {
    if (!parentRef.current) return;

    let maxWidth = 0;

    itemsRef.current.forEach((item) => {
      if (!item) return;
      maxWidth = Math.max(maxWidth, item.offsetWidth);
    });

    parentRef.current.style.width = `${maxWidth + 12}px`;
  }, [windowWidth]);

  // 🔹 Text rotasyonu
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % section.length);
    }, 2000);

    return () => clearInterval(intervalId);
  }, [section.length]);

  return (
    <Box
      component="span"
      ref={parentRef}
      sx={{
        ...styles.dynamicTitleSectionContainer,
        height: { xs: '31.2px', sm: '41.6px' },
      }}
    >
      <Box sx={styles.dynamicTitleSectionUnderline} />

      {section.map((word, i) => (
        <Typography
          key={word}
          variant="h2"
          component="span"
          sx={{
            ...styles.dynamicTitleSection,
            ...(currentIndex === i
              ? styles.dynamicTitleSectionActive
              : {}),
          }}
          ref={(el) => {
            itemsRef.current[i] = el;
          }}
        >
          {word}
        </Typography>
      ))}
    </Box>
  );
};

export default SectionBase;
