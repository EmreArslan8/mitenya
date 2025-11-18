// import { Locale } from '@/i18n';
// import bring from '@/lib/api/bring';
// import { cookies } from 'next/headers';
//import { NextRequest, NextResponse } from 'next/server';
// import translateQuery from '../../utils/translateQuery';
// import translate from '../../utils/translate';

// const scrapingbeeApiKey = process.env.SCRAPINGBEE_API_KEY;

  // export const GET = async (req: NextRequest) => {
 // return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  //   if (!scrapingbeeApiKey)
  //     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  //   const query = req.nextUrl.searchParams.get('query');
  //   if (!query) return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  //   const locale = (cookies().get('NEXT_LOCALE')?.value ?? 'en') as Locale;
  //   const { extractedBrand, query: newQuery } = await translateQuery(query, 'tr', locale);

  //   const url = `https://public.trendyol.com/discovery-search-websfxsuggestions-santral/api/suggestions?${new URLSearchParams(
  //     {
  //       text: extractedBrand + ' ' + newQuery,
  //       culture: 'tr-TR',
  //       platform: 'WEB',
  //       channelId: '1',
  //     }
  //   )}`;
  //   const res = await bring('https://app.scrapingbee.com/api/v1', {
  //     params: { url, api_key: scrapingbeeApiKey, render_js: false },
  //   });

  //   console.log(res);
  //   if (!res[0].result) return NextResponse.json([]);

  //   const suggestions = res[0].result
  //     .filter((e: any) => !e.label || e.label === 'Marka' || e.label === 'Kategori')
  //     .map((e: any) => e.text);

  //   const translatedSuggestions = await translate(suggestions, locale, 'tr');

  //   return NextResponse.json(translatedSuggestions);
//};
