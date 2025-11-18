import 'server-only';

import { headers } from 'next/headers';

// For RSC navigations, it uses either `Accept: text/x-component` or `Accept: */*`,
// For SSR browsers and other clients, `Accept: text/html`
const isSSR = async (): Promise<boolean> => {
  const h = await headers(); // await eklendi
  const accept = h.get('accept') ?? '';

  return (
    !(
      accept.includes('text/x-component') ||
      accept.includes('*/*')
    ) || accept.includes('text/html')
  );
};

export default isSSR;
