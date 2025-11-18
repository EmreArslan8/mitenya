/*

import bring from '@/lib/api/bring';
import { NextRequest, NextResponse } from 'next/server';

const makeUrl1 = 'https://hook.eu2.make.com/8asv5697an2a6yv6gj76d98uohmnka5f'; // resets on 22
const makeUrl2 = 'https://hook.eu2.make.com/7e672bwxt4qtcnu4jkftdoa8y1vqw48d'; // resets on 14

export const POST = async (req: NextRequest) => {
  const isProduction = process.env.NEXT_PUBLIC_HOST_ENV === 'production';

  if (!isProduction) {
    return NextResponse.json(
      { message: 'Rejected: Not in production environment.' },
      { status: 412 }
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');
  const body = await req.json();
  console.log(body);
  if (id === 'C11D647') return NextResponse.json({ message: 'Success.' }, { status: 200 });
  if (!id) return NextResponse.json({ message: 'Bad request.' }, { status: 400 });
  await bring(makeUrl1, {
    body: { ...body, id },
  });
  return NextResponse.json({ message: 'Success.' }, { status: 200 });
};

*/