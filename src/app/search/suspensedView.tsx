import SearchFilters from '@/components/SearchFilters';
import TwoColumnLayout, {
  SecondaryColumn,
  PrimaryColumn,
} from '@/components/layouts/TwoColumnLayout';
import SearchProductsView from './view';
import { fetchProductsSupabase } from '@/lib/api/supabaseShop';

const SuspensedView = async ({ searchParams }: { searchParams: Record<string, string> }) => {
  const res = await fetchProductsSupabase({ ...searchParams });
  const data = Array.isArray(res) ? res[0] : res;
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
            resultsCount={data.totalCount}
          />
        </SecondaryColumn>
      )}

      <PrimaryColumn>
        <SearchProductsView initialData={data} />
      </PrimaryColumn>
    </TwoColumnLayout>
  );
};

export default SuspensedView;
