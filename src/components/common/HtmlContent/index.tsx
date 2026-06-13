import { Box, SxProps, Theme } from '@mui/material';
import { ElementType } from 'react';
import DOMPurify from 'isomorphic-dompurify';

const sanitizeConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'blockquote', 'span', 'div',
  ],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'object', 'embed'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
};

export type HtmlContentOptions = {
  [key in 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'li' | 'ul' | 'ol' | 'a' | 'strong']?: {
    variant?: string;
    sx?: SxProps<Theme>;
    color?: string;
    fontWeight?: number;
  };
};

const defaultSx: SxProps<Theme> = {
  '& > *:first-of-type': { mt: 0 },
  '& h1': { fontWeight: 700, fontSize: { xs: 24, sm: 28 }, lineHeight: 1.2, mt: 3 },
  '& h2': { fontWeight: 700, fontSize: { xs: 18, sm: 20 }, lineHeight: 1.2, mt: 3 },
  '& h3': { fontWeight: 700, fontSize: { xs: 16, sm: 18 }, lineHeight: 1.25, mt: 3 },
  '& h4, & h5, & h6': { fontWeight: 700, fontSize: 16, mt: 3 },
  '& p': { fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', m: 0 },
  '& ul, & ol': { m: 0, pl: '20px' },
  '& li': { fontSize: 14, lineHeight: 1.6, '& + li': { mt: '4px' } },
  '& strong, & b': { fontWeight: 700 },
  '& a': { color: 'primary.main', textDecoration: 'underline' },
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const optionsToSx = (options: HtmlContentOptions): SxProps<Theme> => {
  const result: Record<string, unknown> = {};

  for (const [tag, config] of Object.entries(options)) {
    if (!config) continue;

    const { variant, sx, color, fontWeight } = config;
    result[`& ${tag}`] = {
      ...(variant ? { typography: variant } : {}),
      ...(color ? { color } : {}),
      ...(fontWeight ? { fontWeight } : {}),
      ...(sx as Record<string, unknown> | undefined),
    };
  }

  return result;
};

interface HtmlContentProps {
  html: string | undefined | null;
  component?: ElementType;
  options?: HtmlContentOptions;
  sx?: SxProps<Theme>;
}

const HtmlContent = ({ html, component = 'article', options = {}, sx }: HtmlContentProps) => {
  if (!html) return null;
  const clean = DOMPurify.sanitize(html, sanitizeConfig);
  return (
    <Box
      component={component}
      sx={[defaultSx, optionsToSx(options), ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};

export default HtmlContent;
