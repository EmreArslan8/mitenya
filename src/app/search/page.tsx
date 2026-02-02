import { Suspense } from 'react';
import SuspensedView from './suspensedView';
import Loading from './loading';

const SearchPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) => {
  const resolvedParams = await searchParams;

  return (
    <Suspense fallback={<Loading />} key={JSON.stringify(resolvedParams)}>
      <SuspensedView searchParams={resolvedParams} />
    </Suspense>
  );
};

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) => {
  const params = await searchParams;
  const query = params.query || '';
  return {
    title: query ? `"${query}" Arama Sonuçları` : 'Ürün Ara',
    description: query
      ? `"${query}" araması için Kore kozmetik ve cilt bakım ürünleri sonuçları.`
      : 'Mitenya\'da Kore kozmetik, K-beauty ve cilt bakım ürünlerini arayın.',
  };
};

export default SearchPage;
