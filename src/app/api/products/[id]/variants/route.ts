import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('attributes_json')
      .eq('id', productId)
      .single();

    if (error || !data) {
      return NextResponse.json(null);
    }

    const variants = typeof data.attributes_json === 'string'
      ? JSON.parse(data.attributes_json)
      : data.attributes_json;

    return NextResponse.json(variants || []);
  } catch (error) {
    console.error('API /products/[id]/variants error:', error);
    return NextResponse.json({ error: 'Failed to fetch variants' }, { status: 500 });
  }
}
