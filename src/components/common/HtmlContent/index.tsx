import { createElement, ElementType } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { cn } from '@/lib/utils/cn';

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
    sx?: Record<string, unknown>;
    color?: string;
    fontWeight?: number;
  };
};

interface HtmlContentProps {
  html: string | undefined | null;
  component?: ElementType;
  options?: HtmlContentOptions;
  className?: string;
}

const HtmlContent = ({ html, component = 'article', options = {}, className }: HtmlContentProps) => {
  if (!html) return null;
  const clean = DOMPurify.sanitize(html, sanitizeConfig);
  const warningParagraph = options.p?.variant === 'warning';
  return createElement(component, {
    className: cn(
      'flex flex-col gap-4',
      '[&>*:first-child]:mt-0',
      '[&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:leading-[1.2] sm:[&_h1]:text-[28px]',
      '[&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:leading-[1.2] sm:[&_h2]:text-xl',
      '[&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-bold [&_h3]:leading-[1.25] sm:[&_h3]:text-lg',
      '[&_h4]:mt-6 [&_h4]:text-base [&_h4]:font-bold [&_h5]:mt-6 [&_h5]:text-base [&_h5]:font-bold [&_h6]:mt-6 [&_h6]:text-base [&_h6]:font-bold',
      '[&_p]:m-0 [&_p]:whitespace-pre-wrap [&_p]:text-sm [&_p]:leading-[1.6]',
      '[&_ul]:m-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:m-0 [&_ol]:list-decimal [&_ol]:pl-5',
      '[&_li]:text-sm [&_li]:leading-[1.6] [&_li+li]:mt-1 [&_strong]:font-bold [&_b]:font-bold',
      '[&_a]:text-primary [&_a]:underline',
      warningParagraph && '[&_p]:text-[15px] [&_p]:font-normal [&_p]:leading-5',
      className,
    ),
    dangerouslySetInnerHTML: { __html: clean },
  });
};

export default HtmlContent;
