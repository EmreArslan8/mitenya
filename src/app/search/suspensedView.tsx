import SearchFilters from '@/components/SearchFilters';
import TwoColumnLayout, {
  SecondaryColumn,
  PrimaryColumn,
} from '@/components/layouts/TwoColumnLayout';
import SearchProductsView from './view';
import { fetchProductsSupabase } from '@/lib/api/supabaseShop';

const SuspensedView = async ({ searchParams }: { searchParams: Record<string, string> }) => {
  console.log("🔍 [SEARCH] incoming searchParams:", searchParams);
  const res = await fetchProductsSupabase({ ...searchParams });

  // fetchProducts ALWAYS returns array [response]
  const data = Array.isArray(res) ? res[0] : res;
  console.log("📦 [SEARCH] fetchProducts result:", data);
  if (!data?.products) throw new Error('error.products.list');

  return (
    <TwoColumnLayout>
      {data.filters && (
        <SecondaryColumn
          sx={{
            width: { md: 200 },
            minWidth: { md: 200 },
            maxWidth: { sm: 200 }
          }}
        >
          <SearchFilters
            data={data.filters}
            sortOptions={data.sortOptions}
            key={JSON.stringify(data.filters)}
          />
        </SecondaryColumn>
      )}

      <PrimaryColumn>
        <SearchProductsView
          initialData={data}
          key={JSON.stringify(data.products)}
        />
      </PrimaryColumn>
    </TwoColumnLayout>
  );
};

export default SuspensedView;
