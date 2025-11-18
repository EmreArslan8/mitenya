/*

import { bring } from '@/lib/api/bring';
import 'server-only';




const translate = async (
  contents: string[],
  target: Locale | 'tr',
  source: Locale | 'tr' = 'tr'
): Promise<string[]> => {
  if (source === target) return contents;
  try {
    const res = await bring('/api/shop/translate', {
      params: { target, source, contents },
     // static: true,
     // next: { revalidate: 3600 * 24 * 30 }, // once a month just in case
    });
    if (!res[0].results) throw new Error();
    return res[0].results;
  } catch (error) {
    return contents;
  }
};

export const translateSearchQuery = async (
  text: string,
  target: Locale | 'tr',
  source: Locale | 'tr' = 'tr'
): Promise<string> => {
  if (source === target) return text;
  try {
    const [res, err] = await bring('/api/shop/translate/search-query', {
      params: { target, source, text },
    //  static: true,
    //  next: { revalidate: 3600 * 24 * 30 }, // once a month just in case
    });
    if (!res.result) throw new Error();
    return res.result;
  } catch (error) {
    return text;
  }
};

export default translate;
*/