import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  // Basit doğrulama (URL ?secret=… ile)
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: 'Invalid secret' }, { status: 401 });
  }

  // Sanity payload (document gönderiyoruz)
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // boş bırak
  }

  // Tip ve slug çek
  const docType = body?._type;
  const slug =
    body?.slug?.current || body?.slug || body?.previousSlug?.current || null;

  // Her durumda ürün listesi yenilensin
  revalidatePath('/products');

  // Ürün detay sayfasını yenile (slug varsa)
  if (docType === 'product' && slug) {
    revalidatePath(`/products/${slug}`);
  }

  // İsteğe bağlı: anasayfa/kategori/sitemap vs. de tetiklenebilir
  // revalidatePath('/');

  return NextResponse.json({ ok: true, type: docType, slug });
}
