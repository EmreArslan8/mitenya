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
    <div className="w-full min-w-0 [&_a]:break-words [&_a]:text-primary [&_a]:underline [&_li]:mb-2 [&_li]:text-[15px] [&_li]:leading-[22px] [&_ol]:mb-4 [&_ol]:pl-6 [&_p]:mb-2.5 [&_p]:text-[15px] [&_p]:leading-[22px] [&_strong]:font-bold [&_ul]:mb-4 [&_ul]:pl-6 [&_.legal-table-wrap]:mb-4 [&_.legal-table-wrap]:w-full [&_.legal-table-wrap]:max-w-full [&_.legal-table-wrap]:overflow-x-auto [&_table]:w-full [&_table]:min-w-[640px] [&_table]:border-collapse [&_table]:border [&_table]:border-tertiary-light [&_table_p]:mb-0 [&_td]:border [&_td]:border-tertiary-light [&_td]:px-2.5 [&_td]:py-2 [&_td]:align-top [&_th]:border [&_th]:border-tertiary-light [&_th]:px-2.5 [&_th]:py-2 [&_th]:align-top">
      <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
    </div>
  );
};

export default LegalDocumentContent;
