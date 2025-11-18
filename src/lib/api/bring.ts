export type BringOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  next?: RequestInit['next'];
};

export async function bring<T = any>(
  endpoint: string,
  options: BringOptions = {}
): Promise<[T | null, Error | null]> {
  try {
    let url: string;

    const isInternalAPI = endpoint.startsWith("/api/cms");

    if (isInternalAPI) {
      // NEXT.JS API ROUTES
      url = `${process.env.NEXT_PUBLIC_HOST_URL}${endpoint}`;
    } else if (endpoint.startsWith("http")) {
      // FULL URL verildiyse direkt kullan
      url = endpoint;
    } else {
      // STRAPI API
      url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
    }

    // Query Params
    if (options.params) {
      const query = new URLSearchParams();
      Object.entries(options.params).forEach(([k, v]) =>
        Array.isArray(v)
          ? v.forEach((e) => query.append(k, String(e)))
          : query.append(k, String(v))
      );
      url += `?${query.toString()}`;
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const fetchBody =
      options.body && headers['Content-Type'] === 'application/json'
        ? JSON.stringify(options.body)
        : options.body;

    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: fetchBody,
      next: options.next,
    });

    const isJSON = res.headers.get('content-type')?.includes('application/json');
    const data = isJSON ? await res.json() : await res.text();

    if (!res.ok) {
      return [null, new Error(JSON.stringify(data))];
    }

    return [data as T, null];
  } catch (err: any) {
    console.error('bring error:', err);
    return [null, err];
  }
}
