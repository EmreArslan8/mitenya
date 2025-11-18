/*
import 'server-only';

import { Locale } from '@/i18n';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const revalidate = 'force-cache';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const text = searchParams.get('text');
  const target = searchParams.get('target') as Locale;
  const source = (searchParams.get('source') as Locale) || 'tr';
  if (!text || !target) return NextResponse.json({ result: text });

  try {
    const translatedText = await getTranslation(text, target, source);
    return NextResponse.json({ result: translatedText });
  } catch (error) {
    return NextResponse.json({ result: text });
  }
};

const getTranslation = async (
  text: string,
  target: Locale | 'tr',
  source: Locale | 'tr' = 'tr'
): Promise<string> => {
  try {
    if (!isNaN(parseFloat(text)) || text.length < 2) return text;

    const prompt = `Translate a product search query in ${source} to ${target}. Do not translate brand or model names. If the query was in ${target}, return it as is. Return an empty string (zero characters) if the query was non-sensical. Otherwise, return the translated query without any other comments. IMPORTANT: Never translate to ${source}! The goal is to translate to ${target}.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 100,
      messages: [{ role: `system`, content: `${prompt}\n\nQuery: ${text}` }],
    });

    const translatedText = response.choices[0].message.content?.trim();
    if (!translatedText) throw new Error('did not receive translated text');
    return translatedText;
  } catch (error) {
    console.log(`error translating ${text}: `, error);
    return text;
  }
};

*/