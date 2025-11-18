/*
import { NextRequest, NextResponse } from 'next/server';
import { fetchOrder } from '../api';

export const GET = async (_: NextRequest, { params }: { params: { id: string } }) => {
  if (!params.id) return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  const res = await fetchOrder(params.id);
  if (!res) return NextResponse.json({ error: 'Error fetching order.' }, { status: 500 });
  return NextResponse.json(res);
};


*/