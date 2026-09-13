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
          className="sm:max-w-[280px] md:w-[280px] md:min-w-[280px]"
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
