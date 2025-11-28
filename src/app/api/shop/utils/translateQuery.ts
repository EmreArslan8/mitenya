

import 'server-only';

import brands, { brandIds } from './brands';
import { translateSearchQuery } from './translate';

const commonTerms: Record<string, Record<'tr' | 'en', string>> = {
  airforce: { tr: 'airforce', en: 'airforce' },
  airmax: { tr: 'airmax', en: 'airmax' },
  air: { tr: 'air', en: 'air' },
  max: { tr: 'max', en: 'max' },
  force: { tr: 'force', en: 'force' },
  superstar: { tr: 'superstar', en: 'superstar' },
  basic: { tr: 'basic', en: 'basic' },
  body: { tr: 'body', en: 'body' },
  pushup: { tr: 'pushup', en: 'pushup' },
  hoodie: { tr: 'hoodie', en: 'hoodie' },
  sweatshirt: { tr: 'sweatshirt', en: 'sweatshirt' },
  laptop: { tr: 'laptop', en: 'laptop' },
  lipstick: { tr: 'lipstick', en: 'lipstick' },
  curler: { tr: 'curler', en: 'curler' },
  jeans: { tr: 'jeans', en: 'jeans' },
  pants: { tr: 'pantolon', en: 'pants' },
  mascara: { tr: 'mascara', en: 'mascara' },
  sneakers: { tr: 'sneakers', en: 'sneakers' },
  sneaker: { tr: 'sneaker', en: 'sneaker' },
  foundation: { tr: 'foundation', en: 'foundation' },
  conditioner: { tr: 'conditioner', en: 'conditioner' },
  blush: { tr: 'blush', en: 'blush' },
  eyeliner: { tr: 'eyeliner', en: 'eyeliner' },
  deodorant: { tr: 'deodorant', en: 'deodorant' },
  wakiki: { tr: 'lc waikiki', en: 'lc waikiki' },
  waikiki: { tr: 'lc waikiki', en: 'lc waikiki' },
  lcw: { tr: 'lc waikiki', en: 'lc waikiki' },
  lcwakiki: { tr: 'lc waikiki', en: 'lc waikiki' },
  lcwaikiki: { tr: 'lc waikiki', en: 'lc waikiki' },
};

const glossaries: Partial<
  Record<
    Locale,
    { availableTargets: (Locale | 'tr')[]; glossary: Record<string, Record<'tr' | 'en', string>> }
  >
> = {
  uz: {
    availableTargets: ['tr', 'en'],
    glossary: {
      ayol: { tr: 'kadın', en: 'women' },
      kiyim: { tr: 'giyim', en: 'clothing' },
      sumka: { tr: 'çanta', en: 'bag' },
      poyafzal: { tr: 'ayakkabı', en: 'shoes' },
      kozok: { tr: 'kazak', en: 'sweater' },
      jinsi: { tr: 'jeans', en: 'jeans' },
      yubka: { tr: 'etek', en: 'skirt' },
      jaket: { tr: 'ceket', en: 'jacket' },
      "ko'ylak": { tr: 'gömlek', en: 'shirt' },
      shortik: { tr: 'şort', en: 'shorts' },
      shim: { tr: 'pantolon', en: 'pants' },
      shapka: { tr: 'şapka', en: 'hats' },
      "qo'lqop": { tr: 'eldiven', en: 'gloves' },
      paypoq: { tr: 'çorap', en: 'socks' },
      lassina: { tr: 'tayt', en: 'leggings' },
      вадаласка: { tr: 'bluz', en: 'blouse' },
      vadalaska: { tr: 'bluz', en: 'blouse' },
      спортивка: { tr: 'sweatshirt', en: 'sweatshirt' },
      sportivka: { tr: 'sweatshirt', en: 'sweatshirt' },
      ...commonTerms,
    },
  },
  en: { availableTargets: ['tr'], glossary: { ...commonTerms } },
  ru: {
    availableTargets: ['tr', 'en'],
    glossary: {
      вадаласка: { tr: 'bluz', en: 'blouse' },
      vadalaska: { tr: 'bluz', en: 'blouse' },
      спортивка: { tr: 'sweatshirt', en: 'sweatshirt' },
      sportivka: { tr: 'sweatshirt', en: 'sweatshirt' },
      ...commonTerms,
    },
  },
  he: { availableTargets: ['tr'], glossary: { ...commonTerms } },
};

const translateQuery = async (
  query: string,
  target: Locale | 'tr',
  source: Locale
): Promise<{ extractedBrand?: string; query: string }> => {
  if (target === source) return { query };

  query = query.toLowerCase();

  let glossaryMatches = '';
  if (glossaries[source]?.availableTargets.includes(target)) {
    const glossary = glossaries[source]!.glossary;
    let allFoundInGlossary = true;
    const tokenizedQuery = query.split(' ');
    for (const token of tokenizedQuery) {
      const glossaryMatch = (
        Object.entries(glossary).find(([k, v]) => token.startsWith(k))?.[1] as any
      )?.[target];
      if (glossaryMatch) {
        query = query.replace(glossaryMatch, '').trim();
        glossaryMatches += ' ' + glossaryMatch;
      } else {
        allFoundInGlossary = false;
      }
    }
    glossaryMatches = glossaryMatches.trim();
    if (allFoundInGlossary) return { query: glossaryMatches };
    query = query.trim();
  }

  const { extractedBrand, query: debrandedQuery } = extractBrandsFromQuery(query);
  if (debrandedQuery) query = debrandedQuery;
  else return { extractedBrand, query: '' };

  const translatedQuery = await translateSearchQuery(query, target, source);
  return { extractedBrand, query: translatedQuery + ' ' + glossaryMatches };
};

export const extractBrandsFromQuery = (
  query: string
): { extractedBrand?: string; query: string } => {
  let extractedBrand;
  for (const brand of brands) {
    const brandRegex = new RegExp(`\\b${brand}\\b`, 'i');
    if (!brandRegex.test(query)) continue;
    extractedBrand = brandIds[brand] ?? brand;
    query = query.replace(brandRegex, '').trim();
    break;
  }
  return { extractedBrand, query: query.trim() };
};

export default translateQuery;
