import { NextResponse } from 'next/server';
import { fetchOrders } from './api';
import { createSupabaseServer } from '@/lib/supabase/server';

export const GET = async () => {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const res = await fetchOrders();
  if (!res) return NextResponse.json({ error: 'Error fetching orders.' }, { status: 500 });
  return NextResponse.json(res);
};

export const dynamic = 'force-dynamic';
