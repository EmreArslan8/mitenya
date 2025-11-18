// src/lib/sanity.queries.ts
import { groq } from 'next-sanity';

export const allProductsQuery = groq`*[_type == "product" && status == "PUBLISHED"] | order(_createdAt desc)[]{
  "slug": slug.current,
  title,
  priceCents,
  currency,
  "image": images[0],
  "brand": brand->name,
  "category": category->title,
  shortDesc,
  badges
}`;

export const productBySlugQuery = groq`*[_type == "product" && slug.current == $slug][0]{
  "slug": slug.current,
  title,
  priceCents,
  currency,
  images,
  "brand": brand->name,
  "category": category->title,
  shortDesc,
  description,
  specs,
  badges
}`;

// 🔧 Eksik olan export'u ekleyin:
export const allProductSlugsQuery = groq`
  *[_type=="product" && defined(slug.current) && status == "PUBLISHED"]
  [].slug.current
`;

export const allBrandsQuery = groq`*[_type == "brand"] | order(name asc){
  _id,
  name,
  "slug": slug.current,
  "logo": {
    "url": logo.asset->url,
    "alt": logo.alt
  },
  website
}`;


export const allCategoriesQuery = groq`*[_type == "category"] | order(title asc){
  title,
  "slug": slug.current,
  image
}`;

export const allCategoriesWithChildrenQuery = groq`
  *[_type == "category" && !defined(parent) && status == "ACTIVE"] | order(order asc, title asc) {
    _id,
    title,
    "slug": slug.current,
    image,
    order,
    highlighted,
    seo,
    "children": *[_type == "category" && references(^._id) && status == "ACTIVE"] | order(order asc, title asc) {
      _id,
      title,
      "slug": slug.current,
      image,
      order,
      "children": *[_type == "category" && references(^._id) && status == "ACTIVE"] | order(order asc, title asc) {
        _id,
        title,
        "slug": slug.current,
        image,
        order
      }
    }
  }
`;


export const homePageQuery = groq`
*[_type == "homePage"][0]{
  title,
  "slug": slug.current,
  gap,
  blocks[]{
    _key,
    _type,
    title,
    subtitle,
    cta,

    // 🖼️ Tek görseli SharedImageType formatında çöz
    "image": {
      "asset": {
        "url": image.asset->url
      },
      "alt": image.alt
    },

    // 🖼️ Çoklu görseller
    "images": images[]{
      "asset": {
        "url": asset->url
      },
      "alt": alt
    },

    // 🧩 Kategoriler
    categories[]->{
      title,
      "slug": slug.current,
      "image": {
        "asset": {
          "url": image.asset->url
        },
        "alt": image.alt
      }
    },

    // 🛍️ Ürünler
    products[]->{
      title,
      "slug": slug.current,
      priceCents,
      currency,
      "image": {
        "asset": {
          "url": images[0].asset->url
        },
        "alt": images[0].alt
      }
    },

    // 🏷️ Markalar
    brands[]->{
      name,
      "logo": {
        "asset": {
          "url": logo.asset->url
        },
        "alt": logo.alt
      }
    },

    // 🖼️ Slider / Banner
    _type == "shopBanner" => {
      _type,
      _key,
      "banners": banners[]{
        url,
        "image": {
          "url": image.asset->url,
          "alt": image.alt
        },
        "mobileImage": {
          "url": mobileImage.asset->url,
          "alt": mobileImage.alt
        }
      }
    },

    // ❓ FAQ Bloğu
    _type == "faq" => {
      _type,
      _key,
      title,
      subtitle,
      categories,
      items[]{
        title,
        description,
        categories
      }
    },

    // 📝 FreeText Bloğu
    _type == "freeText" => {
      _type,
      _key,
      "section": section,
      "text": text
    },
  
    _type == "shopBadgeButtons" => {
  _type,
  _key,
  "section": section,
  "badges": coalesce(badges[], [])[]{
    url,
    label,
    "image": {
      "url": image.asset->url,
      "alt": image.alt
    }
  }
},
_type == "shopFeatureBox" => {
  _type,
  _key,
  title,
  description,
  imagePosition,
  imageFit,
  button,
  "image": select(
    defined(image.asset->url) => {
      "url": image.asset->url,
      "alt": image.alt
    },
    null
  )
},
_type == "shopFeatureCards" => {
  _type,
  _key,
  title,
  subtitle,
  variant,
  "section": section,
  // Grid yapılandırması
  "gridOptions": gridOptions{
    xs,
    sm,
    md,
    lg
  },
  // Kartların içeriği
  "cards": cards[]{
    title,
    "image": {
      "url": image.asset->url,
      "alt": image.alt
    },
    // Arama seçenekleri (ShopSearchOptions yapısına uygun)
    "searchOptions": {
      "brands": brands[]->{
        title,
        "slug": slug.current
      },
      "categories": categories[]->{
        title,
        "slug": slug.current
      },
      "tags": tags[]->title,
      "priceRange": priceRange
    }
  }
},
_type == "shopInfoAreas" => {
  _type,
  _key,
  "section": section,
  // 🧩 Info kutuları
  "infoAreas": infoAreas[]{
    icon,
    label,
    description,
    url
  }
},
_type == "shopInlineProducts" => {
  _type,
  _key,
  cta,
  displayType,
  "section": section,
  "searchOptions": {
    "brands": brands[]->{
      title,
      "slug": slug.current
    },
    "categories": categories[]->{
      title,
      "slug": slug.current
    },
    "tags": tags[]->title,
    "priceRange": priceRange
  }
},

_type == "shopRibbon" => {
  _type,
  _key,
  title,
  description,
  colorway,
  "section": section,
  // 🖼️ Görsel çözümü
  "image": select(
    defined(image.asset->url) => {
      "url": image.asset->url,
      "alt": image.alt
    },
    null
  ),
  // 🔘 Buton alanı
  "button": select(
    defined(button.label) => {
      label,
      url,
      variant,
      color
    },
    null
  )
},
_type == "shopInlineProducts" => {
  _type,
  _key,
  cta,
  displayType,
  "section": section,
  "searchOptions": {
    // 🧩 Alt kategoriler
    "categories": searchOptions.categories[]->{
      title,
      "slug": slug.current
    },
    // 🏷️ Markalar
    "brands": searchOptions.brand[]->{
      title,
      "slug": slug.current
    },
    // 🔢 Limit ve sıralama
    "limit": searchOptions.limit,
    "sort": searchOptions.sort
  }
},
  }
}`;





export const siteSettingsQuery = groq`
*[_type == "siteSettings"][0]{
  siteTitle,
  logo,
  footerText,
  "headerCategories": headerCategories[]->{
    title, "slug": slug.current
  },
  socials
}`;

/* Header bilgisi */
export const headerQuery = groq`*[_type == "header"][0]{
  logo,
  promoText,
  menuItems[]{ label, href }
}`;

/* Footer bilgisi */
export const footerQuery = groq`*[_type == "footer"][0]{
  aboutText,
  links[]{ label, href },
  social[]{ platform, url }
}`;

export const productsSearchQuery = (filters: any) => {
  let base = `*[_type == "product" && defined(slug.current)]`;

  if (filters.category)
    base += `[references(*[_type == "category" && slug.current == "${filters.category}"]._id)]`;
  if (filters.brand)
    base += `[references(*[_type == "brand" && slug.current == "${filters.brand}"]._id)]`;
  if (filters.tag)
    base += `[references(*[_type == "tag" && slug.current == "${filters.tag}"]._id)]`;

  return `${base}{
    _id,
    title,
    "slug": slug.current,
    "image": images[0]{ "url": asset->url, "alt": alt },
    priceCents,
    currency,
    categories[]->{ title, "slug": slug.current },
    brands[]->{ title, "slug": slug.current },
    tags[]->{ title, "slug": slug.current }
  }`;
};


export const productsByFiltersQuery = groq`
*[
  _type == "product"
  && (
    count((categories[]->slug.current)[@ in $categorySlugs]) > 0
    || count((brands[]->slug.current)[@ in $brandSlugs]) > 0
  )
] | order(
  _createdAt desc
)[0...$limit]{
  _id,
  title,
  "slug": slug.current,
  priceCents,
  currency,
  "image": {
    "url": images[0].asset->url,
    "alt": images[0].alt
  },
  categories[]->{ title, "slug": slug.current },
  brands[]->{ title, "slug": slug.current }
}
`;

export const inlineProductsQuery = groq`
*[
  _type == "product" &&
  status == "PUBLISHED" &&
  (
    count((category->slug.current)[@ in $categorySlugs]) > 0 &&
    count((brand->name)[@ in $brandNames]) > 0
  )
] | order(
  _createdAt desc
)[0...$limit]{
  _id,
  title,
  "slug": slug.current,
  priceCents,
  currency,
  "brand": brand->{
    name,
    "slug": slug.current
  },
  "category": category->{
    title,
    "slug": slug.current,
    parent->{ title, "slug": slug.current }
  },
  "image": images[0].asset->url,
  shortDesc,
  badges
}
`;
