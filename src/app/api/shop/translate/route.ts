/*

import 'server-only';

import { Locale } from '@/i18n';
import bring from '@/lib/api/bring';
import { decode } from 'he';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 3600 * 24 * 30;

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const contents = searchParams.getAll('contents');
  const target = searchParams.get('target') as Locale;
  const source = (searchParams.get('source') as Locale) || 'tr';
  if (!target) return NextResponse.json(contents);

  if (contents?.[0] === 'please cache me')
    return NextResponse.json({ results: [`cached! ${Date.now()}`] });

  try {
    const promises = contents.map((e) => getTranslation(e, target, source));
    const translations = await Promise.all(promises);
    return NextResponse.json({ results: translations });
  } catch (error) {
    return NextResponse.json({ results: contents });
  }
};

const getTranslation = async (
  text: string,
  target: Locale | 'tr',
  source: Locale | 'tr' = 'tr'
): Promise<string> => {
  try {
    if (!isNaN(parseFloat(text)) || text.length < 2) return text;
    const url = 'https://api.mymemory.translated.net/get';
    const params = {
      q: text,
      langpair: `${source}|${target}`,
      de: `${Date.now() + Math.floor(Math.random() * 256)}@gmail.com`,
    };
    const randomIp = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
    const [res] = await Promise.race([
      bring(url, {
        params,
        static: true,
        headers: { 'X-Forwarded-For': randomIp },
      }),
      new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000)),
    ]);

    let translatedText = res?.responseData?.translatedText;
    if (!translatedText) throw new Error('did not receive translated text');

    let decodedText = decode(translatedText);
    decodedText = decodedText.replace(/KO'Ylam/gi, "KO'YLAK");
    return decodedText;
  } catch (error) {
    console.log(`error translating ${text}: `, error);
    return text;
  }
};

*/
