/*

import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const revalidate = 'force-cache';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const POST = async (req: NextRequest) => {
  const addressData = await req.json();
  const apiToken = req.headers.get('Authorization');
  const apiKey = Buffer.from(apiToken?.split(' ')[1]!, 'base64')?.toString('utf-8')?.split(':')[1];

  if (apiKey !== process.env.LATINIZE_API_TOKEN) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Unauthorized: API token is required' } },
      { status: 401 }
    );
  }
  try {
    // map all address fragments to their latinized versions and return the result as an object of the same shape
    const latinizedAddress: Record<string, any> = {};

    const latinizeFragment = async (fragment: any): Promise<any> => {
      if (typeof fragment === 'string') {
        return await latinize(fragment);
      } else if (typeof fragment === 'object' && fragment !== null) {
        const result: Record<string, any> = {};
        await Promise.all(
          Object.entries(fragment).map(async ([key, value]) => {
            result[key] = await latinizeFragment(value);
          })
        );
        return result;
      }
      return fragment;
    };

    await Promise.all(
      Object.entries(addressData).map(async ([key, fragment]) => {
        latinizedAddress[key] = await latinizeFragment(fragment);
      })
    );

    return NextResponse.json({ latinizedAddress });
  } catch (error) {
    console.log('error', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message:
            'An unexpected error occurred while processing your request. Please try again later.',
        },
      },
      { status: 500 }
    );
  }
};

const latinize = async (str: string): Promise<string | null> => {
  try {
    if (str.length === null) return null;

    const prompt = `You are an AI model that accepts a string that is part of an address and returns a string translated to English. The goal is to get rid of cyrillic letters. Only output the result string, do not include any other text. Do not use any markdown or formatting. Do not include any quotes. You do not need to translate the string if it only contains latin letters.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: `system`, content: `${prompt}\n\nTranslate this string: ${str}` }],
    });
    const cleanedResponse = response.choices[0].message
      .content!.trim()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/"/g, '');
    return cleanedResponse || str;
  } catch (error) {
    console.log('error latinizing address fragment:', error);
    return str;
  }
};

*/
