// src/lib/sanity.client.ts
import { createClient } from 'next-sanity';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01', // veya sabit bir tarih
  useCdn: true,             // published içerik için hızlı CDN
  perspective: 'published', // taslakları gizler
});
