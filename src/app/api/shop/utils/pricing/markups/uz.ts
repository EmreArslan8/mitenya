import 'server-only';

import { MarkupConfig } from './helpers';

export const markups: MarkupConfig[] = [
  {
    type: 'breadcrumbFragment',
    value: 'Elektrikli Ev Aletleri',
    markup: { rate: 0.15, fixed: 6 },
    children: [{ type: 'priceRange', value: [20, Infinity], markup: { rate: 0.15, fixed: 60 } }],
  },
  { type: 'breadcrumbFragment', value: 'Tencere', markup: { rate: 0.15, fixed: 50 } },
  { type: 'breadcrumbFragment', value: 'Tava', markup: { rate: 0.15, fixed: 50 } },
  { type: 'breadcrumbFragment', value: 'Sahan', markup: { rate: 0.15, fixed: 40 } },
  { type: 'breadcrumbFragment', value: 'Valiz', markup: { rate: 0.15, fixed: 40 } },
  {
    type: 'breadcrumbFragment',
    value: 'Fitness',
    markup: { rate: 0.15, fixed: 6 },
    children: [
      { type: 'priceRange', value: [20, 50], markup: { rate: 0.15, fixed: 60 } },
      { type: 'priceRange', value: [50, 100], markup: { rate: 0.25, fixed: 80 } },
      { type: 'priceRange', value: [100, Infinity], markup: { rate: 0.5, fixed: 100 } },
    ],
  },
  {
    type: 'default',
    value: 'default',
    markup: { rate: 0.15 },
    children: [
      { type: 'priceRange', value: [0, 5], markup: { fixed: 3 } },
      { type: 'priceRange', value: [5, 8], markup: { fixed: 4 } },
      { type: 'priceRange', value: [8, 15], markup: { fixed: 5 } },
      { type: 'priceRange', value: [15, 30], markup: { fixed: 6 } },
      { type: 'priceRange', value: [30, 45], markup: { fixed: 7 } },
      { type: 'priceRange', value: [45, Infinity], markup: { fixed: 8 } },
      { type: 'default', value: 'default', markup: { fixed: 6 } },
    ],
  },
];
