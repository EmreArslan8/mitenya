import { ShopSearchOptions } from '@/lib/api/types';
import { NextRequest, NextResponse } from 'next/server';
import hunter from './hunters';

export const maxDuration = 60;

export const GET = async (req: NextRequest) => {

  // 🔴 ÖNEMLİ: Servis kapatma satırı YORUM SATIRINDAN ÇIKARILMALI
  // return NextResponse.json({ error: 'Service is under maintenance' }, { status: 503 });
  
  let {
    page = '1',
    query = '',
    brand = '',
    category = '',
    nt = false,
    ...rest
  } = Object.fromEntries(req.nextUrl.searchParams.entries());

  // 🔴 KALDIRILDI: locale ve region okuma/atama işlemleri
  // const locale = (cookies().get('NEXT_LOCALE')?.value ?? 'en') as Locale;
  // const region = (cookies().get('NEXT_REGION')?.value ?? 'uz') as Region;

  // 1. PARAMETRE DOĞRULAMA
  if (
    typeof page !== 'string' ||
    typeof parseInt(page) !== 'number' ||
    typeof query !== 'string' ||
    typeof brand !== 'string' ||
    typeof category !== 'string' 
    // 🔴 KALDIRILDI: locale doğrulama
  ) {
    return NextResponse.json({ message: 'Bad request.' }, { status: 400 });
  }

  // 2. PARAMETRELERİ OLUŞTURMA (locale ve region olmadan)
  const params: ShopSearchOptions = {
    page: parseInt(page),
    query,
    brand,
    category,
    // 🔴 KALDIRILDI: locale
    // 🔴 KALDIRILDI: region
    nt: Boolean(nt),
    ...rest,
    // locale: 'tr' as any, // İstenirse sabit bir varsayılan dil atanabilir
    // region: 'TR' as any, // İstenirse sabit bir varsayılan bölge atanabilir
  };
 
  // 3. HUNTER ÇAĞRISI
  try {
    const response = await hunter(params);
    if (!response) {
        console.error("Hunter returned no response, possibly 404 or external error.");
        // Başarısız/Boş yanıtı 404 olarak döndürebiliriz
        return NextResponse.json({ message: 'Products not found' }, { status: 404 });
    }
    // fetchProducts'ın beklediği dizi formatına sarmalıyoruz
    return NextResponse.json([response], { status: 200 }); 
  } catch (error) {
    console.error("API Route Error:", error);
    // Hata mesajını doğru formatta döndürüyoruz
    return NextResponse.json(error, { status: 500 });
  }
};

export const dynamic = 'force-dynamic';