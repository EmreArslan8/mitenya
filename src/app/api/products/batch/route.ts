import { ApiErrors } from '@/lib/api/errors';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';
import { fetchProductDataSupabase } from '@/lib/api/supabaseProducts';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const batchSchema = z.object({
  ids: z.array(z.string().trim().min(1).max(100)).min(1).max(50),
});

export async function POST(req: NextRequest) {
  try {
    const userIp = getClientIp(req);
    if (!(await rateLimit(`products_batch:${userIp}`))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return ApiErrors.badRequest('Invalid JSON');
    }

    const parsed = batchSchema.safeParse(body);
    if (!parsed.success) {
      return ApiErrors.validationError(parsed.error.issues);
    }

    const results = await Promise.all(
      parsed.data.ids.map((id) => fetchProductDataSupabase(id))
    );

    const products = results.filter(Boolean);

    return NextResponse.json({ products });
  } catch (error) {
    console.error('API /products/batch POST error:', error);
    return ApiErrors.internalError('Failed to fetch products');
  }
}
