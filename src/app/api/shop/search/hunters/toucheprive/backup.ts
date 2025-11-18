// parse from html
// export const transformProductData = (html: string): ShopProductListItemData[] => {
//     const $ = load(html);
  
//     const products: ShopProductListItemData[] = [];
//     $('.product-block').each((index, element) => {
//       const name = $(element).find('.deskTitle').text().trim();
//       const currentPrice = parseFloat(
//         $(element).find('.product-price__amount .money').text().replace('TL', '').trim()
//       );
//       const originalPrice =
//         parseFloat(
//           $(element).find('.product-price__compare .money')?.text().replace('TL', '').trim()
//         ) || currentPrice;
  
//       const imgSrc = 'https:' + load($(element).find('noscript')?.html() ?? '')('img').attr('src');
  
//       const handle = extractProductHandle($(element).find('.product-link').attr('href') ?? '');
//       const id = `toucheprive-${handle}`;
  
//       products.push({
//         id,
//         url: `/product/${id}`,
//         name,
//         brand: 'Touche Prive',
//         price: { currentPrice, originalPrice, currency: 'TRY' },
//         imgSrc,
//       });
//     });
//     return products;
//   };