/*
import { NextResponse } from 'next/server';
import { fetchOrders } from './api';

export const GET = async () => {
  const res = await fetchOrders();
  if (!res) return NextResponse.json({ error: 'Error fetching orders.' }, { status: 500 });
  return NextResponse.json(res);
};

export const dynamic = 'force-dynamic';

*/