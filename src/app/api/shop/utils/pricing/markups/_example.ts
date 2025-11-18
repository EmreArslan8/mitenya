// import 'server-only';

// import { MarkupConfig } from "./helpers";

// const defaultPriceRangeMarkupConfigs: MarkupConfig[] = [
//   {
//     type: 'priceRange',
//     value: [0, 100],
//     markup: { rate: 0, fixed: 3 },
//   },
//   {
//     type: 'priceRange',
//     value: [100, Infinity],
//     markup: { rate: 0, fixed: 6 },
//   },
// ];

// const markups: MarkupConfig[] = [
//   {
//     type: 'brand',
//     value: 'hiccup',
//     markup: { rate: 0, fixed: 0 },
//     children: [
//       {
//         type: 'priceRange',
//         value: [0, 100],
//         markup: { rate: 0, fixed: 0 },
//       },
//       {
//         type: 'category',
//         value: 'ayakkabi',
//         markup: { rate: 0, fixed: 3 },
//       },
//       {
//         type: 'default',
//         value: 'default',
//         markup: { rate: 0, fixed: 0 },
//       },
//     ],
//   },
//   {
//     type: 'category',
//     value: 'kucuk-ev-aletleri',
//     markup: { rate: 0.1, fixed: 10 },
//     children: [
//       {
//         type: 'priceRange',
//         value: [0, 1000],
//         markup: { rate: 0.1, fixed: 5 },
//       },
//       {
//         type: 'priceRange',
//         value: [1001, Infinity],
//         markup: { rate: 0.15, fixed: 10 },
//       },
//     ],
//   },
//   {
//     type: 'default',
//     value: 'default',
//     markup: { rate: 0.15, fixed: 3 },
//     children: defaultPriceRangeMarkupConfigs,
//   },
// ];
