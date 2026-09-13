import { NextRequest, NextResponse } from 'next/server';
import { fetchOrder } from '../api';
import { createSupabaseServer } from '@/lib/supabase/server';

export const GET = async (_: NextRequest, { params }: { params: Promise<{ id: string[] }> }) => {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Catch-all segment: Next `id`'yi dizi olarak veriyor, URL'deki haline geri birlestir.
  const { id } = await params;
  const orderId = id?.join('/');
  if (!orderId) return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  const res = await fetchOrder(orderId);
  if (!res) return NextResponse.json({ error: 'Error fetching order.' }, { status: 500 });
  return NextResponse.json(res);
};

