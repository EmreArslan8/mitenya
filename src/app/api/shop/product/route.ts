import { NextResponse } from 'next/server';

export const maxDuration = 60;

export const GET = async () => {
  // #SHUTDOWN
  return NextResponse.json({ error: 'Service is under maintenance' }, { status: 503 });
};

export const dynamic = 'force-dynamic';
