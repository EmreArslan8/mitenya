import { Box } from '@mui/material';
import DOMPurify from 'isomorphic-dompurify';

const sanitizeConfig = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'a',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'blockquote',
    'pre',
    'code',
    'span',
    'div',
  ],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'object', 'embed'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
};

const sanitizeHtml = (dirty: string) => DOMPurify.sanitize(dirty, sanitizeConfig);
const wrapTables = (cleanHtml: string) =>
  cleanHtml.replace(/<table\b[\s\S]*?<\/table>/g, (tableHtml) => {
    return `<div class="legal-table-wrap">${tableHtml}</div>`;
  });

const LegalDocumentContent = ({ html }: { html: string }) => {
  const safeHtml = wrapTables(sanitizeHtml(html));

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        '& p': {
          fontSize: 15,
          lineHeight: '22px',
          color: 'text.primary',
          mb: 1.25,
        },
        '& ul, & ol': {
          pl: 3,
          mb: 2,
        },
        '& li': {
          fontSize: 15,
          lineHeight: '22px',
          mb: 1,
        },
        '& .legal-table-wrap': {
          width: '100%',
          maxWidth: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          mb: 2,
        },
        '& table': {
          width: '100%',
          minWidth: 640,
          borderCollapse: 'collapse',
          border: '1px solid',
          borderColor: 'tertiary.light',
        },
        '& th, & td': {
          border: '1px solid',
          borderColor: 'tertiary.light',
          padding: '8px 10px',
          verticalAlign: 'top',
        },
        '& table p': {
          mb: 0,
        },
        '& strong': { fontWeight: 700 },
        '& a': {
          color: 'primary.main',
          textDecoration: 'underline',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
        },
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
    </Box>
  );
};

export default LegalDocumentContent;
