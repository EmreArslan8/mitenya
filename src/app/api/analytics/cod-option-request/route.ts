/*
import bring from '@/lib/api/bring';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const customer = searchParams.get('customer');

  await bring(
    `https://hook.eu2.make.com/dy8utmsxira36pvula12h45mha369nar?customer=${customer}`
  );

  return NextResponse.json({ message: 'Success.' }, { status: 200 });
};

*/
