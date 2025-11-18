/* import 'server-only';

import bring from '@/lib/api/bring';

const bringWithProxy = async (
  url: string,
  init?: Omit<RequestInit, 'body'> & {
    body?: Record<string, any>;
    static?: boolean;
  }
): Promise<[any, Error | null]> => {
  return bring('http://api.scrape.do', {
    ...init,
    params: { url, retryTimeout: 5000, geoCode: 'tr', token: process.env.SCRAPEDO_TOKEN! },
  });
};

export default bringWithProxy;

*/
