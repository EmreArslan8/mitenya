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
