// bring.ts
export type BringParams = Record<
  string,
  string | number | boolean | null | undefined | (string | number | boolean)[]
> | undefined;

export type BringBody =
  | Record<string, unknown>
  | FormData
  | string
  | undefined;

export type BringOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: BringParams;
  body?: BringBody;
  headers?: Record<string, string>;
  next?: RequestInit['next'];
};

export async function bring<T = unknown>(
  endpoint: string,
  options: BringOptions = {}
): Promise<[T | null, Error | null]> {
  try {
    let url: string;

    const isInternalAPI = endpoint.startsWith("/api/cms");

    if (isInternalAPI) {
      url = `${process.env.NEXT_PUBLIC_HOST_URL}${endpoint}`;
    } else if (endpoint.startsWith("http")) {
      url = endpoint;
    } else {
      url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
    }

    // --- QUERY PARAMS ---
    if (options.params) {
      const query = new URLSearchParams();

      Object.entries(options.params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          value.forEach((v) => query.append(key, String(v)));
        } else {
          query.append(key, String(value));
        }
      });

      url += `?${query.toString()}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    };

    const isJson = headers['Content-Type'] === 'application/json';

    // 🔥 Stringify only when body is plain object
    let fetchBody: BodyInit | undefined;

    if (options.body instanceof FormData) {
      fetchBody = options.body;
    } else if (typeof options.body === 'string') {
      fetchBody = options.body;
    } else if (isJson && options.body) {
      fetchBody = JSON.stringify(options.body);
    }

    const res = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: fetchBody,
      next: options.next,
    });

    const isJSON = res.headers.get('content-type')?.includes('application/json');
    const data = isJSON ? await res.json() : await res.text();

    if (!res.ok) {
      return [
        null,
        new Error(typeof data === 'string' ? data : JSON.stringify(data)),
      ];
    }

    return [data as T, null];
  } catch (err: unknown) {
    console.error('bring error:', err);
    return [null, err instanceof Error ? err : new Error(String(err))];
  }
}
