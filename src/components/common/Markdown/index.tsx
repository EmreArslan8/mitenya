import { ElementType } from 'react';
import HtmlContent, { HtmlContentOptions } from '../HtmlContent';

export type MarkdownOptions = HtmlContentOptions;

interface MarkdownProps {
  text: string | undefined | null;
  component?: ElementType;
  options?: MarkdownOptions;
  className?: string;
}

/**
 * Backwards-compatible name for existing call sites.
 * Content is expected to be stored as HTML and is sanitized before rendering.
 */
const Markdown = ({ text, component = 'article', options = {}, className }: MarkdownProps) => (
  <HtmlContent html={text} component={component} options={options} className={className} />
);

export default Markdown;
