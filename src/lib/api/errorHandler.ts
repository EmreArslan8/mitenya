/**
 * Güvenli hata yönetimi utility'leri
 * Production'da hassas hata detaylarını gizler
 */

const isDev = process.env.NODE_ENV === 'development';

// Kullanıcıya gösterilebilecek güvenli hata mesajları
const SAFE_ERROR_MESSAGES: Record<string, string> = {
  PGRST116: 'Kayıt bulunamadı',
  '23505': 'Bu kayıt zaten mevcut',
  '23503': 'İlişkili kayıt bulunamadı',
  '42501': 'Bu işlem için yetkiniz yok',
  NETWORK_ERROR: 'Bağlantı hatası oluştu',
  TIMEOUT: 'İstek zaman aşımına uğradı',
  UNAUTHORIZED: 'Oturum süreniz dolmuş',
  FORBIDDEN: 'Bu işlem için yetkiniz yok',
  NOT_FOUND: 'Kayıt bulunamadı',
  VALIDATION_ERROR: 'Geçersiz veri',
  DEFAULT: 'Bir hata oluştu',
};

interface ErrorDetails {
  code?: string;
  message?: string;
  hint?: string;
  details?: string;
}

/**
 * Hata mesajını production için güvenli hale getirir
 * Development'ta tam hata detayını döner
 */
export function sanitizeError(error: unknown): string {
  if (isDev && error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as ErrorDetails;

    // Bilinen hata kodlarını kontrol et
    if (err.code && SAFE_ERROR_MESSAGES[err.code]) {
      return SAFE_ERROR_MESSAGES[err.code];
    }
  }

  return SAFE_ERROR_MESSAGES.DEFAULT;
}

/**
 * API response için güvenli hata objesi oluşturur
 */
export function createSafeErrorResponse(error: unknown, statusCode: number = 500) {
  const message = sanitizeError(error);

  // Development'ta daha fazla detay ver
  if (isDev && error instanceof Error) {
    return {
      error: message,
      stack: error.stack,
      name: error.name,
    };
  }

  return { error: message };
}

/**
 * Console'a güvenli log yapar - production'da hassas verileri maskeler
 */
export function safeLog(level: 'log' | 'error' | 'warn', message: string, data?: unknown) {
  if (!isDev) {
    // Production'da sadece hata kodu ve genel mesaj
    if (level === 'error') {
      console.error(`[ERROR] ${message}`);
    }
    return;
  }

  // Development'ta tam log
  const logFn = console[level];
  if (data) {
    logFn(`[${level.toUpperCase()}] ${message}`, data);
  } else {
    logFn(`[${level.toUpperCase()}] ${message}`);
  }
}

/**
 * Kullanıcı girdisinden potansiyel XSS/injection karakterlerini temizler
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // HTML tags
    .replace(/javascript:/gi, '') // JS protocol
    .replace(/on\w+=/gi, '') // Event handlers
    .trim();
}

/**
 * SQL injection için tehlikeli karakterleri tespit eder
 * NOT: Bu sadece ek kontrol içindir, her zaman parameterized queries kullanın
 */
export function containsSqlInjection(input: string): boolean {
  const patterns = [
    /('|"|;|--|\/\*|\*\/)/i,
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b/i,
    /\b(OR|AND)\s+\d+\s*=\s*\d+/i,
  ];

  return patterns.some(pattern => pattern.test(input));
}
