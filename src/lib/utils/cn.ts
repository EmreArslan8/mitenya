import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Koşullu class birleştirici.
 *
 * `clsx` koşulları çözer, `twMerge` çakışan Tailwind utility'lerinde
 * SONUNCUYU kazandırır — böylece bir komponentin varsayılan sınıfı
 * dışarıdan gelen `className` ile ezilebilir:
 *
 *   cn('px-4 text-text', className)   // className="px-6" -> px-6 kazanır
 *
 * Not (ADR-0002 §11): `cn()` uzun koşul zincirlerini tek satıra dizmek için
 * değildir. Varyantlar `cva` ile komponentin yanındaki `variants.ts`'te
 * tanımlanır; `cn()` yalnızca dışarıdan gelen `className`'i birleştirir.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
