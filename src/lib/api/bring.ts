export interface BringOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | string[] | number | boolean>;
  body?: Record<string, any> | string;
  static?: boolean;
}

const bring = async (
  url: string,
  init?: BringOptions
): Promise<[any, Error | null]> => {
  let requestUrl = url;

  // Query params
  if (init?.params) {
    const params = new URLSearchParams();
    Object.entries(init.params).forEach(([k, v]) =>
      Array.isArray(v)
        ? v.forEach((e) => params.append(k, String(e)))
        : params.append(k, String(v))
    );
    requestUrl += `?${params.toString()}`;
  }

  // Base URL
  const isInternal = requestUrl.startsWith('/api');
  const isExternal = requestUrl.startsWith('http');

  if (isInternal) {
    requestUrl = process.env.NEXT_PUBLIC_HOST_URL + requestUrl;
  } else if (!isExternal) {
    requestUrl = process.env.NEXT_PUBLIC_STRAPI_URL + requestUrl;
  }

  const headers: Record<string, string> = {};
  if (init?.body) headers['Content-Type'] = 'application/json';

  // ❗️STATIC MODE → auth / cookie / runtime logic YOK
  if (!init?.static && process.env.STRAPI_BEARER && !isInternal) {
    headers['Authorization'] = `Bearer ${process.env.STRAPI_BEARER}`;
  }

  try {
    const res = await fetch(requestUrl, {
      method: init?.body ? 'POST' : 'GET',
      ...init,
      body: init?.body ? JSON.stringify(init.body) : undefined,
      headers: { ...headers, ...init?.headers },
    });

    const contentType = res.headers.get('content-type');
    const data = contentType?.includes('application/json')
      ? await res.json()
      : await res.text();

    if (!res.ok) throw new Error(JSON.stringify(data));

    return [data, null];
  } catch (err) {
    console.error(`Bring Error on ${requestUrl}:`, err);
    return [null, err as Error];
  }
};

export default bring;
