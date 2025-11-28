// src/api/shop/hunters/index.ts (Örnek yol)
import 'server-only';

import { ShopProductPrice, ShopSearchOptions, ShopSearchResponse } from '@/lib/api/types';
// Gerekli olmayan import'lar (Locale, Fiyatlandırma/Bölge yardımcıları) KALDIRILDI

import gratisHunter from './gratis'; 
import watsonsHunter from './watsons';
import rossmannHunter from './rossmann';

import trendyolHunter from './trendyol';
import bring from '@/lib/api/bring';

export type ProductHunter = (req: ShopSearchOptions) => Promise<ShopSearchResponse | undefined>;

const hunter = async (req: ShopSearchOptions) => {
  // 1. ANALİTİK KAYDI
  // Sorgu varsa ve ilk sayfa ise analitik servisine kaydet
  if (req.query && !req.nt && (!req.page || req.page == 1))
    bring(`/api/analytics/search-query?query=${req.query}`);

  // 2. HUNTER ÇAĞRISI
  const selectedHunter = rossmannHunter; 
  
  // 🔴 KALDIRILDI: req.region ve sourceLocale tanımlamaları

  let res = await selectedHunter(req);
  if (!res) return;


  // 🔴 KALDIRILDI: Kur Çevirisi, Sabit Marjlar ve Fiyat Dönüşümü ile ilgili tüm kod blokları

  // 3. SONUÇLARIN BİRLEŞTİRİLMESİ
  // Fiyat dönüşümü (convertProductPrices) kaldırıldığı için, 
  // GratisHunter'dan gelen ham ürünler olduğu gibi kullanılır.

  return res;
};

export default hunter;