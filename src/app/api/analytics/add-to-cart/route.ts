/*

import bring from '@/lib/api/bring';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const customer = searchParams.get('customer');
  const pids = searchParams.get('pids');

  if (!pids) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const products = pids
    .split(',')
    .map((e) => {
      const [id, variants] = e.split(':');
      return `https://shop.bringist.com/product/${id}${variants ? '=> Size: ' + variants : ''}`;
    })
    .join('\n\n');

  await bring(
    `https://hook.eu2.make.com/8asv5697an2a6yv6gj76d98uohmnka5f?customer=${customer}&pids=${products}`
  );

  return NextResponse.json({ message: 'Success.' }, { status: 200 });
};


*/