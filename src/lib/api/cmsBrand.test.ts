import { describe, expect, it } from 'vitest';
import { normalizeBrandContent } from './cmsBrand';

describe('normalizeBrandContent', () => {
  it('fills missing repeatable sections with empty arrays', () => {
    const content = normalizeBrandContent({ name: 'A313', slug: 'a313' });
    expect(content).toMatchObject({
      facts: [],
      productNotes: [],
      ingredients: [],
      routine: [],
      faqs: [],
      blogs: [],
    });
  });

  it('drops FAQs without an answer', () => {
    const content = normalizeBrandContent({
      name: 'A313',
      slug: 'a313',
      faqs: [
        { title: 'Cevaplı', description: 'Evet.' },
        { title: 'Boş', description: '   ' },
        { title: 'Yok' },
      ],
    });
    expect(content.faqs.map((faq) => faq.title)).toEqual(['Cevaplı']);
  });

  it('unwraps blog relations and skips entries without a slug', () => {
    const content = normalizeBrandContent({
      name: 'A313',
      slug: 'a313',
      blogs: {
        data: [{ attributes: { title: 'Rehber', slug: 'rehber' } }, { attributes: undefined }],
      },
    });
    expect(content.blogs).toEqual([{ title: 'Rehber', slug: 'rehber' }]);
  });
});
