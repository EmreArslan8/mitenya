import { Box, Stack, SxProps, Typography } from '@mui/material';
import { ElementType } from 'react';
import { useRemarkSync } from 'react-remark';
import Link from '../Link';

const defaultHeaderSx = { '&:not(:first-child)': { mt: 3 } };

export type MarkdownOptions = {
  [key in 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'li' | 'ul' | 'ol' | 'a' | 'strong']?: {
    variant?: string;
    sx?: SxProps;
    color?: string;
    fontWeight?: number;
  };
};

const components = (options: MarkdownOptions) => ({
  h1: (props: any) => (
    <Typography
      variant="h1"
      {...options.h1}
      sx={{ ...options.h1?.sx, ...defaultHeaderSx }}
      {...props}
    />
  ),
  h2: (props: any) => (
    <Typography
      variant="h2"
      {...options.h2}
      sx={{ ...options.h2?.sx, ...defaultHeaderSx }}
      {...props}
    />
  ),
  h3: (props: any) => (
    <Typography
      variant="h3"
      {...options.h3}
      sx={{ ...options.h3?.sx, ...defaultHeaderSx }}
      {...props}
    />
  ),
  h4: (props: any) => (
    <Typography
      variant="h4"
      {...options.h4}
      sx={{ ...options.h4?.sx, ...defaultHeaderSx }}
      {...props}
    />
  ),
  h5: (props: any) => (
    <Typography
      variant="h5"
      {...options.h5}
      sx={{ ...options.h5?.sx, ...defaultHeaderSx }}
      {...props}
    />
  ),
  h6: (props: any) => (
    <Typography
      variant="h6"
      {...options.h6}
      sx={{ ...options.h6?.sx, ...defaultHeaderSx }}
      {...props}
    />
  ),
  p: (props: any) => (
    <Typography component="p" variant="body" whiteSpace="pre-wrap" {...options.p} {...props} />
  ),
  li: (props: any) => <Typography component="li" variant="body" {...options.li} {...props} />,
  ul: (props: any) => <Box component="ul" {...options.ul} {...props} />,
  ol: (props: any) => <Box component="ol" {...options.ol} {...props} />,
  a: (props: any) => <Link {...options.a} title={props.children} {...props} />,
  strong: (props: any) => (
    <Typography component="strong" variant="bodyBold" {...options.strong} {...props} />
  ),
});

interface MarkdownProps {
  text: string | undefined | null;
  component?: ElementType<any>;
  options?: MarkdownOptions;
  sx?: SxProps;
}

const Markdown = ({ text, component = 'article', options = {}, sx }: MarkdownProps) => {
  return (
    <Stack component={component} gap={2} sx={sx}>
      {useRemarkSync(text ?? '', {
        rehypeReactOptions: {
          components: components(options),
        },
      })}
    </Stack>
  );
};

export default Markdown;
