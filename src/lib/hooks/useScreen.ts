'use client';

import { mediaQueries, type MediaQueryName } from '@/theme/breakpoints';
import useMediaQuery from './useMediaQuery';

/** Yalnızca viewport'a göre davranış değişmesi gerektiğinde kullanılır. */
const useScreen = (name: MediaQueryName) => useMediaQuery(mediaQueries[name]);

export default useScreen;
