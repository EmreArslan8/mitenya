import 'server-only';

import { MarkupConfig } from './helpers';

const defaultPriceRangeMarkupConfigs: MarkupConfig[] = [];

export const markups: MarkupConfig[] = [
  {
    type: 'default',
    value: 'default',
    markup: { rate: 0.15, fixed: 6 },
    children: defaultPriceRangeMarkupConfigs,
  },
];
