import { describe, expect, it } from 'vitest';
import type { BrandProduct } from '@/lib/api/supabaseBrand';
import { attachProductNotes, buildRoutineSteps, toParagraphs } from './model';

const product = (slug: string) => ({ id: slug, slug, name: slug }) as BrandProduct;
const sun = product('sun');
const eye = product('eye');

describe('attachProductNotes', () => {
  it('matches notes by trimmed slug and leaves others empty', () => {
    const views = attachProductNotes([sun, eye], [{ productSlug: ' sun ', note: 'Güneş' }]);
    expect(views.map((view) => view.note)).toEqual(['Güneş', undefined]);
  });
});

describe('buildRoutineSteps', () => {
  it('resolves comma separated slugs and labels the timing', () => {
    const [step] = buildRoutineSteps(
      [{ title: 'Koru', timing: 'sabah', productSlugs: 'sun, eye' }],
      [sun, eye]
    );
    expect(step.timing).toBe('Sabah');
    expect(step.products.map((p) => p.slug)).toEqual(['sun', 'eye']);
  });

  it('keeps a step with only a fallback link', () => {
    const steps = buildRoutineSteps(
      [{ title: 'Temizle', timing: 'sabah_aksam', fallbackLabel: 'Göz at', fallbackUrl: '/search' }],
      [sun]
    );
    expect(steps).toEqual([
      { title: 'Temizle', timing: 'Sabah · Akşam', products: [], fallback: { label: 'Göz at', url: '/search' } },
    ]);
  });

  it('drops steps whose products are gone and have no fallback', () => {
    expect(
      buildRoutineSteps([{ title: 'Eski', timing: 'aksam', productSlugs: 'removed' }], [sun])
    ).toEqual([]);
  });
});

describe('toParagraphs', () => {
  it('splits on blank lines and trims', () => {
    expect(toParagraphs('Bir\nsatır\n\n  İki  \n\n\n')).toEqual(['Bir\nsatır', 'İki']);
    expect(toParagraphs(null)).toEqual([]);
  });
});
