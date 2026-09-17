import { buildImageSrcSet, canResizeImage } from '@/lib/imageLoader';
import { getNextImageWidths } from '@/lib/imageSizesConfig';

export type TocItem = {
  id: string;
  text: string;
  /** 2 = ana bölüm (h2), 3 = alt başlık (h3). Gezinme bunu girintileme için kullanır. */
  level: 2 | 3;
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
 * Makale gövdesindeki görsellerin `sizes` değeri.
 * Gövde masaüstünde ~720px'lik bir sütunda, mobilde tam genişlikte akıyor.
 */
const ARTICLE_IMAGE_SIZES = '(min-width: 1000px) 720px, 100vw';

const ARTICLE_IMAGE_WIDTHS = getNextImageWidths(ARTICLE_IMAGE_SIZES);

const hasAttr = (attrs: string, name: string) =>
  new RegExp(`\\s${name}\\s*=`, 'i').test(attrs);

/** Attribute değerini tırnak/ampersand kaçışıyla güvenli hale getirir. */
const escapeAttr = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/**
 * Gövdeye elle yazılan `<img>` etiketlerini ürün görselleriyle aynı CDN
 * boru hattına bağlar.
 *
 * Neden: içerik HTML'i `dangerouslySetInnerHTML` ile basıldığı için `next/image`
 * bileşeni kullanılamıyor. Sonuç olarak yazılardaki görseller srcset'siz, tek
 * boyutta ve eager iniyordu — mobilde masaüstü boyutunda bayt indiriliyor.
 * Burada aynı `imageLoader` ile srcset üretiliyor; yazar yalnızca `<img src>`
 * yazıyor, kural bu fonksiyonda yaşıyor.
 *
 * NOT: sanitize BU ADIMDAN ÖNCE çalışır (view.tsx). Burada eklenen attribute'lar
 * kullanıcı girdisi değil, `src`ten türetiliyor ve kaçış uygulanıyor.
 */
export const enhanceArticleImages = (html: string): string =>
  html.replace(/<img([^>]*?)\/?>/gi, (match, rawAttrs: string) => {
    const src = /\ssrc=["']([^"']+)["']/i.exec(rawAttrs)?.[1];
    if (!src) return match;

    let attrs = rawAttrs.trimEnd();

    // Gövde görselleri her zaman kıvrımın altında: eager indirmeye gerek yok.
    if (!hasAttr(attrs, 'loading')) attrs += ' loading="lazy"';
    if (!hasAttr(attrs, 'decoding')) attrs += ' decoding="async"';

    if (canResizeImage(src) && !hasAttr(attrs, 'srcset')) {
      const srcset = buildImageSrcSet(src, ARTICLE_IMAGE_WIDTHS);
      if (srcset) {
        attrs += ` srcset="${escapeAttr(srcset)}"`;
        if (!hasAttr(attrs, 'sizes')) attrs += ` sizes="${ARTICLE_IMAGE_SIZES}"`;
      }
    }

    return `<img${attrs}>`;
  });

/**
 * Sanitize edilmiş blog HTML'ini okuma deneyimi için hazırlar:
 * - h2 ve h3 başlıklarına id verir ve içindekiler listesini çıkarır
 * - tabloları yatay kaydırılabilir bir sarmalayıcıya alır (mobilde taşmayı önler)
 * - görselleri CDN srcset'i + lazy/decoding ile donatır (bkz. enhanceArticleImages)
 * - okuma süresini hesaplar
 */
export const prepareArticle = (rawHtml: string): PreparedArticle => {
  const toc: TocItem[] = [];
  const usedIds = new Set<string>();

  const withHeadingIds = rawHtml.replace(
    /<(h2|h3)([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag: string, attrs: string, inner: string) => {
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
      toc.push({ id, text, level: tag.toLowerCase() === 'h2' ? 2 : 3 });

      return existing ? match : `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
    }
  );

  const withScrollableTables = withHeadingIds.replace(
    /<table[\s\S]*?<\/table>/gi,
    (table) => `<div class="article-table">${table}</div>`
  );

  const withEnhancedImages = enhanceArticleImages(withScrollableTables);

  const words = toPlainText(rawHtml).split(' ').filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(words / 200));

  return { html: withEnhancedImages, toc, readingMinutes };
};
