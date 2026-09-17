import { describe, expect, it } from 'vitest';
import { collectRevalidateTags } from './collectTags';

describe('collectRevalidateTags', () => {
  it('drops product and brand tags from a Supabase webhook record', () => {
    const tags = collectRevalidateTags({
      record: { slug: 'relief-sun', id: 7, brand_id: 'b1' },
      old_record: { slug: 'relief-sun', id: 7, brand_id: 'b1' },
    });
    expect(tags.sort()).toEqual(['brand:b1', 'product:7', 'product:relief-sun']);
  });

  it('also drops the old brand and old slug when they changed', () => {
    const tags = collectRevalidateTags({
      record: { slug: 'new-slug', id: 7, brand_id: 'b2' },
      old_record: { slug: 'old-slug', id: 7, brand_id: 'b1' },
    });
    expect(tags).toEqual(
      expect.arrayContaining(['product:new-slug', 'product:old-slug', 'brand:b1', 'brand:b2'])
    );
  });

  it('handles DELETE payloads where record is null', () => {
    const tags = collectRevalidateTags({
      record: null,
      old_record: { slug: 'gone', id: 9, brand_id: 'b3' },
    });
    expect(tags.sort()).toEqual(['brand:b3', 'product:9', 'product:gone']);
  });

  it('accepts a manual body and the slug query', () => {
    expect(collectRevalidateTags({ brand_id: 'b4' }, 'from-query').sort()).toEqual([
      'brand:b4',
      'product:from-query',
    ]);
  });

  it('keeps id 0 but ignores null fields', () => {
    expect(collectRevalidateTags({ id: 0, slug: null, brand_id: null })).toEqual(['product:0']);
  });

  it('returns nothing for an empty body', () => {
    expect(collectRevalidateTags({})).toEqual([]);
  });
});
