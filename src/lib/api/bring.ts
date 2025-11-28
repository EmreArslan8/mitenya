// Yeni bring.ts (Sadeleştirilmiş Versiyon)

// Gerekli tipler (Mevcut kodunuzdan alındı, sadeleştirildi)
export interface BringOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | string[] | number | boolean>;
  body?: Record<string, any> | string;
  // 'static' veya diğer özel Next.js/Auth logic'leri kaldırıldı
}

/**
 * Temel HTTP isteği (fetch) sarıcı fonksiyonu.
 * Sadeleştirilmiş hali: Yalnızca URL, body, yetkilendirme (API Token) ve temel hata yönetimini içerir.
 * Locale, Region, NextAuth veya Cookie işlemleri YÖNETİLMEZ.
 *
 * @param url İstek atılacak adres (kısmi path veya tam URL).
 * @param init İstek ayarları (method, headers, body, params).
 * @returns [data, error] tuple'ı.
 */
const bring = async (
  url: string,
  init?: BringOptions
): Promise<[any, Error | null]> => {
  let requestUrl = url;

  // 1. Arama parametrelerini (query params) URL'ye ekle
  if (init?.params) {
    const params = new URLSearchParams();
    Object.entries(init.params).forEach(([k, v]) =>
      Array.isArray(v) ? v.forEach((e) => params.append(k, String(e))) : params.append(k, String(v))
    );
    requestUrl += `?${params.toString()}`;
  }

  // 2. Base URL'i ekle
  const isThirdPartyRequest = requestUrl.startsWith('http');

  if (!isThirdPartyRequest) {
    // İç API'ler veya Ana API'ler için BASE_URL kullan
    const baseURL = requestUrl.startsWith('/api') 
      ? process.env.NEXT_PUBLIC_HOST_URL 
      : process.env.NEXT_PUBLIC_BRINGIST_API_URL;
    
    if (!baseURL) {
        return [null, new Error("API Base URL ortam değişkeni tanımlı değil.")];
    }
    requestUrl = baseURL + requestUrl;
  }

  // 3. Başlıkları (Headers) hazırla
  const defaultHeaders: Record<string, string> = init?.body ? { 'Content-Type': 'application/json' } : {};
  
  // API Token'ı ortam değişkeninden al (Varsa)
  const apiToken = process.env.STRAPI_BEARER; 
  if (apiToken) {
    defaultHeaders['Authorization'] = `Bearer ${apiToken}`;
  }
  
  const headers = { ...defaultHeaders, ...init?.headers };

  // 4. Fetch isteğini yap
  try {
    const res = await fetch(requestUrl, {
      method: init?.method || (init?.body ? 'POST' : 'GET'), // method belirtilmemişse POST'u body'ye göre varsay
      ...init,
      body: typeof init?.body === 'string' ? init.body : JSON.stringify(init?.body),
      headers: headers,
    });
    
    let responseData;
    const contentType = res.headers.get('content-type');

    // 5. Yanıtı oku (Mevcut logic korunmuştur)
    if (contentType && contentType.includes('application/json')) {
      responseData = await res.json();
    } else if (contentType && contentType.includes('text/')) {
      responseData = await res.text();
    } else if (contentType && contentType.includes('multipart/form-data')) {
      responseData = await res.formData();
    } else if (contentType && contentType.includes('application/octet-stream')) {
      responseData = await res.blob();
    } else {
      responseData = await res.text();
    }

    // Basitleştirilmiş hata kontrolü
    if (!res.ok) { // res.status !== 200 yerine res.ok kullanıldı
      // 401 için özel bir işlem yapılmadı, sadece hata fırlatıldı
      throw new Error(JSON.stringify(responseData));
    }

    return [responseData, null];

  } catch (error) {
    console.error(`Bring Error on ${requestUrl}:`, error);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
};

export default bring;