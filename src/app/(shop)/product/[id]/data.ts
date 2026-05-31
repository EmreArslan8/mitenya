import { fetchProductDataSupabase } from '@/lib/api/supabaseProducts';
import { cache } from 'react';

export const getProductData = cache(fetchProductDataSupabase);
