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

const LegalDocumentContent = ({ html }: { html: string }) => {
  return (
    <Box
      sx={{
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
        '& table': {
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid',
          borderColor: 'tertiary.light',
          mb: 2,
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
        '& a': { color: 'primary.main', textDecoration: 'underline' },
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
    </Box>
  );
};

export default LegalDocumentContent;
