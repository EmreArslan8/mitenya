// src/lib/utils/r2.ts
export function r2Url(pathOrUrl: string) {
    if (!pathOrUrl) return "";
  
    const base = process.env.NEXT_PUBLIC_R2_BASE_URL;
  
    // base yoksa dokunma (picsum vb. full URL'ler için)
    if (!base) {
      console.warn("⚠ NEXT_PUBLIC_R2_BASE_URL not set, returning raw path/url");
      return pathOrUrl;
    }
  
    // Eğer zaten http ile başlıyorsa (eski full URL kayıtları) hiç dokunma:
    if (/^https?:\/\//i.test(pathOrUrl)) {
      return pathOrUrl;
    }
  
    const cleanBase = base.replace(/\/$/, "");
    const cleanPath = pathOrUrl.replace(/^\/+/, "");
  
    return `${cleanBase}/${cleanPath}`;
  }
  