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
        ...sx,
        padding: 1,
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

  for (let section of sections) {
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
      const width = item.offsetWidth;
      if (width > maxWidth) {
        maxWidth = width;
      }
    });
    parentRef.current.style.width = maxWidth + 12 + 'px';
  }, [parentRef.current, windowWidth]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % section.length);
    }, 2000);

    return () => clearInterval(intervalId);
  }, [currentIndex]);

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
          ref={(ref: HTMLElement) => (itemsRef.current[i] = ref)}
        >
          {section}
        </Typography>
      ))}
    </Box>
  );
};

export default SectionBase;
