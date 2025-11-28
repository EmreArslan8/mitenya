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
  return {
    title: '🔎' + (params.query ? ` ${params.query}` : ''),
  };
};

export default SearchPage;
