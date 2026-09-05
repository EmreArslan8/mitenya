export type TocItem = {
  id: string;
  text: string;
};

export type PreparedArticle = {
  html: string;
  toc: TocItem[];
  readingMinutes: number;
};

const TR_CHARS: Record<string, string> = {
  ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u',
  Ç: 'c', Ğ: 'g', İ: 'i', Ö: 'o', Ş: 's', Ü: 'u',
};

const stripTags = (value: string) => value.replace(/<[^>]*>/g, ' ');

const decodeEntities = (value: string) =>
  value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");

const toPlainText = (value: string) =>
  decodeEntities(stripTags(value)).replace(/\s+/g, ' ').trim();

// Türkçe karakterler önce eşlenir; 'İ'.toLowerCase() birleşik nokta üretiyor.
export const slugifyHeading = (value: string) =>
  toPlainText(value)
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (char) => TR_CHARS[char] ?? char)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'bolum';

/**
 * Sanitize edilmiş blog HTML'ini okuma deneyimi için hazırlar:
 * - h2 başlıklarına id verir ve içindekiler listesini çıkarır
 * - tabloları yatay kaydırılabilir bir sarmalayıcıya alır (mobilde taşmayı önler)
 * - okuma süresini hesaplar
 */
export const prepareArticle = (rawHtml: string): PreparedArticle => {
  const toc: TocItem[] = [];
  const usedIds = new Set<string>();

  const withHeadingIds = rawHtml.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/gi,
    (match, attrs: string, inner: string) => {
      // İçerikte zaten id varsa dokunma, yalnızca listeye ekle.
      const existing = /\sid=["']([^"']+)["']/i.exec(attrs);
      const text = toPlainText(inner);
      if (!text) return match;

      let id = existing?.[1] ?? slugifyHeading(text);
      if (!existing) {
        let suffix = 2;
        while (usedIds.has(id)) id = `${slugifyHeading(text)}-${suffix++}`;
      }
      usedIds.add(id);
      toc.push({ id, text });

      return existing ? match : `<h2${attrs} id="${id}">${inner}</h2>`;
    }
  );

  const withScrollableTables = withHeadingIds.replace(
    /<table[\s\S]*?<\/table>/gi,
    (table) => `<div class="article-table">${table}</div>`
  );

  const words = toPlainText(rawHtml).split(' ').filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(words / 200));

  return { html: withScrollableTables, toc, readingMinutes };
};
