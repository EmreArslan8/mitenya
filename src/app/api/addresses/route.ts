/*

import bring from '@/lib/api/bring';
import { AddressData } from '@/lib/api/types';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const GET = async () => {
  const session = await getServerSession(authOptions);
  if (session === null) return NextResponse.json(null, { status: 403 });
  const res = await bring('/customers/v1/me/addressbook/entries');
  const region = cookies().get('NEXT_REGION')?.value ?? 'ww';
  if (!region)
    return NextResponse.json({ error: 'Cannot determine user region.' }, { status: 500 });
  let addresses = res[0];
  if (region !== 'ww')
    addresses = addresses?.filter((e: AddressData) => e.countryCode === region.toUpperCase());
  return NextResponse.json(addresses);
};

export const dynamic = 'force-dynamic';

*/