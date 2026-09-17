import { describe, expect, it } from 'vitest';
import type { BrandProduct } from '@/lib/api/supabaseBrand';
import { buildBrandJsonLd } from './brandJsonLd';

const product = {
  id: 'p1',
  slug: 'relief-sun',
  name: 'Relief Sun',
  url: '/product/relief-sun',
  brand: 'Beauty of Joseon',
  brandId: 'b1',
  imgSrc: '',
  price: { currentPrice: 949, originalPrice: 999, currency: 'TRY' },
  benefits: [],
} as BrandProduct;

const parse = (json: string) => JSON.parse(json) as { '@graph': Array<Record<string, unknown>> };

describe('buildBrandJsonLd', () => {
  it('builds Brand, ItemList and BreadcrumbList with absolute urls', () => {
    const graph = parse(
      buildBrandJsonLd({ name: 'Beauty of Joseon', slug: 'beauty-of-joseon', products: [product] })
    )['@graph'];

    expect(graph.map((node) => node['@type'])).toEqual(['Brand', 'ItemList', 'BreadcrumbList']);
    expect(graph[0].url).toMatch(/^https?:\/\/.+\/brand\/beauty-of-joseon$/);
    expect(graph[1]).toMatchObject({
      numberOfItems: 1,
      itemListElement: [{ position: 1, name: 'Relief Sun', url: expect.stringMatching(/\/product\/relief-sun$/) }],
    });
  });

  it('omits empty description and logo', () => {
    const brand = parse(buildBrandJsonLd({ name: 'A', slug: 'a', products: [] }))['@graph'][0];
    expect(brand).not.toHaveProperty('description');
    expect(brand).not.toHaveProperty('logo');
  });

  it('escapes < so CMS text cannot close the script tag', () => {
    const json = buildBrandJsonLd({ name: 'A', slug: 'a', description: '</script><b>', products: [] });
    expect(json).not.toContain('</script>');
    expect(parse(json)['@graph'][0].description).toBe('</script><b>');
  });
});
