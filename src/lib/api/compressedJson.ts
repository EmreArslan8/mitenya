import { NextResponse } from 'next/server';
import { promisify } from 'node:util';
import { gzip } from 'node:zlib';

const gzipAsync = promisify(gzip);

/**
 * Onunuzdeki openresty JSON'u sikistirmiyor ve Next'in `compress` ayari App
 * Router route handler'larina uygulanmiyor; sonucta /api/products gibi
 * yanitlar teline ham JSON olarak iniyordu (Lighthouse: 68 KiB tasarruf).
 * Bu yardimci, istemci gzip kabul ediyorsa govdeyi kendisi sikistirir.
 *
 * Proxy tarafinda `gzip_types application/json` acilabilirse orasi daha
 * dogru yer; bu, ona erisim olmadan calisan uygulama seviyesi cozumdur.
 */

/** Bu esigin altinda gzip'in kazanci basligin maliyetini karsilamiyor. */
const MIN_COMPRESS_BYTES = 1024;

export const compressedJson = async (
  request: Request,
  data: unknown,
  init?: ResponseInit
): Promise<NextResponse> => {
  const body = JSON.stringify(data);
  const acceptsGzip = (request.headers.get('accept-encoding') ?? '').includes('gzip');

  /**
   * `Vary` HER iki dalda da sart. Ayni URL istemciye gore farkli govde
   * donduruyor; sikistirilmamis yanit `Vary` tasimazsa onundeki paylasimli
   * cache (openresty/CDN) onu depolayip gzip bekleyen istemciye verebilir ya
   * da tersine gzip'li govdeyi `Accept-Encoding` gondermeyen istemciye
   * uzatir — ki o govde ikili copluk olarak cozulur.
   */
  const plain = () => {
    const response = NextResponse.json(data, init);
    response.headers.append('vary', 'Accept-Encoding');
    return response;
  };

  if (!acceptsGzip || Buffer.byteLength(body) < MIN_COMPRESS_BYTES) {
    return plain();
  }

  try {
    const compressed = await gzipAsync(body);
    const headers = new Headers(init?.headers);
    headers.set('content-type', 'application/json; charset=utf-8');
    headers.set('content-encoding', 'gzip');
    headers.set('content-length', String(compressed.byteLength));
    headers.append('vary', 'Accept-Encoding');

    return new NextResponse(new Uint8Array(compressed), { ...init, headers });
  } catch (error) {
    console.error('compressedJson: gzip failed, falling back to plain JSON', error);
    return plain();
  }
};
