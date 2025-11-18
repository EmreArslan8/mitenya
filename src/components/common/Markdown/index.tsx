import { Box, Stack, SxProps, Typography } from "@mui/material";
import {
  CSSProperties,
  ElementType,
  ReactNode,
  HTMLAttributes,
} from "react";
import { useRemarkSync } from "react-remark";
import Link from "../Link";

// ---------------------------------------------------------------
//  TYPE DEFINITIONS
// ---------------------------------------------------------------

type MarkdownTag =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "li"
  | "ul"
  | "ol"
  | "a"
  | "strong";

export type MarkdownOptions = {
  [key in MarkdownTag]?: {
    variant?: string;
    sx?: SxProps;
    color?: string;
    fontWeight?: number;
    style?: CSSProperties;
  };
};

interface MarkdownProps {
  text: string | undefined | null;
  component?: ElementType;
  options?: MarkdownOptions;
  sx?: SxProps;
}

// ---------------------------------------------------------------
//  DEFAULT SPACING
// ---------------------------------------------------------------

const defaultHeaderSx = { "&:not(:first-child)": { mt: 3 } };

// ---------------------------------------------------------------
//  SAFE COMPONENT MAKER
// ---------------------------------------------------------------

const components = (options: MarkdownOptions) => ({
  h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <Typography
      component="h1"
      variant="h1"
      {...options.h1}
      sx={{ ...options.h1?.sx, ...defaultHeaderSx }}
      {...props}
    />
  ),
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <Typography
      component="h2"
      variant="h2"
      {...options.h2}
      sx={{ ...options.h2?.sx, ...defaultHeaderSx }}
      {...props}
    />
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <Typography
      component="h3"
      variant="h3"
      {...options.h3}
      sx={{ ...options.h3?.sx, ...defaultHeaderSx }}
      {...props}
    />
  ),
  h4: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <Typography
      component="h4"
      variant="h4"
      {...options.h4}
      sx={{ ...options.h4?.sx, ...defaultHeaderSx }}
      {...props}
    />
  ),
  h5: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <Typography
      component="h5"
      variant="h5"
      {...options.h5}
      sx={{ ...options.h5?.sx, ...defaultHeaderSx }}
      {...props}
    />
  ),
  h6: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <Typography
      component="h6"
      variant="h6"
      {...options.h6}
      sx={{ ...options.h6?.sx, ...defaultHeaderSx }}
      {...props}
    />
  ),

  p: (props: HTMLAttributes<HTMLParagraphElement>) => (
    <Typography
      component="p"
      variant="body"
      whiteSpace="pre-wrap"
      {...options.p}
      {...props}
    />
  ),

  li: (props: HTMLAttributes<HTMLLIElement>) => (
    <Typography component="li" variant="body" {...options.li} {...props} />
  ),

  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <Box component="ul" {...options.ul} {...props} />
  ),

  ol: (props: HTMLAttributes<HTMLOListElement>) => (
    <Box component="ol" {...options.ol} {...props} />
  ),

  a: (props: HTMLAttributes<HTMLAnchorElement>) => (
    <Link {...options.a} title={props.children as ReactNode} {...props} />
  ),

  strong: (props: HTMLAttributes<HTMLElement>) => (
    <Typography
      component="strong"
      variant="bodyBold"
      {...options.strong}
      {...props}
    />
  ),
});

// ---------------------------------------------------------------
//  COMPONENT
// ---------------------------------------------------------------

const Markdown = ({
  text,
  component = "article",
  options = {},
  sx,
}: MarkdownProps) => {
  return (
    <Stack component={component} gap={2} sx={sx}>
      {useRemarkSync(text ?? "", {
        rehypeReactOptions: {
          components: components(options),
        },
      })}
    </Stack>
  );
};

export default Markdown;
