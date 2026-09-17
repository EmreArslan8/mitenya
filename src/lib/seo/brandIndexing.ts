/**
 * Marka sayfası indekslenir mi? — TEK kural (sayfa robots meta'sı + sitemap).
 * Strapi içeriği olmayan ya da ürünü olmayan sayfa ince içeriktir (ADR-0003).
 */
export const isBrandIndexable = ({ hasContent, productCount }: { hasContent: boolean; productCount: number }) =>
  hasContent && productCount > 0;
