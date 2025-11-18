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
  sx: SxProps;
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
  // const selectedStyle = sectionBackground === 'primary' ? primaryStyle() : {};
  const { smUp } = useScreen();

  return (
    <Stack
      id={sectionHeader}
      sx={{
        gap: 3,
        maxWidth: sectionWidth,
        width:
          smUp && (sectionBackground === 'primary')
            ? '100vw'
            : '100%',
        height: '100%',
        flexGrow: 1,
        backgroundColor:
          sectionBackground === 'primary'
            ? primaryStyle().sectionBackground?.bg
            : undefined,
            mx: 'auto', // merkeze al
            alignItems: 'center', // içerikleri yatayda ortala
            textAlign: 'center', // metinleri ortala
            px: { xs: 2, md: 4 }, 
            padding: 1,
        ...sx,
      }}
    >
      {(sectionHeader || sectionDescription) && (
        <Stack gap={1}>
          {sectionHeader && <DynamicTitle title={splitTextWithDynamicSections(sectionHeader)} />}
          {sectionDescription && (
            <Markdown text={sectionDescription} options={sectionDescriptionMarkdownOptions} />
          )}
        </Stack>
      )}
      {children}
    </Stack>
  );
};

const splitTextWithDynamicSections = (text: string): (string | string[])[] => {
  const sections = text.split(/(\[[^\]]+\])/);
  const result: (string | string[])[] = [];

  for (const section of sections) {
    if (section.startsWith('[') && section.endsWith(']')) {
      result.push(
        section
          .substring(1, section.length - 1)
          .split(',')
          .map((s) => s.trim())
      );
    } else {
      const words = section.split(/\s+/);
      words.forEach((word) => result.push(word));
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
              text={`${section} `}
              options={styles.dynamicTitleMarkdownOptions}
              key={section}
            />
          ) : (
            <DynamicTitleSection section={section} key={section.toString()} />
          )
        )}
      </Stack>
    </Box>
  );
};

const DynamicTitleSection = ({ section }: { section: string[] }) => {
  const styles = useStyles();
  const [currentIndex, setCurrentIndex] = useState(0);
  const parentRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<HTMLElement[]>([]);
  const { width: windowWidth } = useWindowSize();

  useEffect(() => {
    if (!parentRef.current) return;
    let maxWidth = 0;
    itemsRef.current.forEach((item) => {
      if (item) {
        const width = item.offsetWidth;
        if (width > maxWidth) maxWidth = width;
      }
    });
    parentRef.current.style.width = `${maxWidth + 12}px`;
  }, [windowWidth, section]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % section.length);
    }, 2000);
  
    return () => clearInterval(intervalId);
  }, [section.length]);

  return (
    <Box
      sx={{
        ...styles.dynamicTitleSectionContainer,
        height: { xs: '31.2px', sm: '41.6px' },
      }}
      component="span"
      ref={parentRef}
    >
      <Box sx={styles.dynamicTitleSectionUnderline} />
      {section.map((section, i) => (
        <Typography
          variant="h2"
          component="span"
          sx={{
            ...styles.dynamicTitleSection,
            ...(currentIndex === i ? styles.dynamicTitleSectionActive : {}),
          }}
          key={section}
          ref={(ref: HTMLSpanElement | null) => {
            itemsRef.current[i] = ref as HTMLElement;
          }}
        >
          {section}
        </Typography>
      ))}
    </Box>
  );
};

export default SectionBase;
