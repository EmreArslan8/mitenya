import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

export const fetchCategoryBySlug = async (slug: string): Promise<CategoryRow | null> => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as CategoryRow;
};
