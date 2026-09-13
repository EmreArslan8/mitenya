/** Tailwind, MUI geçiş katmanı ve davranış sorguları için tek kırılım kaynağı. */
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 1000,
  lg: 1200,
  xl: 1920,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/** Ana navigasyonun mobil/masaüstü yükseklikleri. */
export const headerHeight = { xs: 56, sm: 100 } as const;

const down = (value: number) => `(max-width: ${Math.max(0, value - 0.05)}px)`;
const up = (value: number) => `(min-width: ${value}px)`;

export const mediaQueries = {
  xsDown: down(breakpoints.xs),
  smDown: down(breakpoints.sm),
  mdDown: down(breakpoints.md),
  lgDown: down(breakpoints.lg),
  xlDown: down(breakpoints.xl),
  xsUp: up(breakpoints.xs),
  smUp: up(breakpoints.sm),
  mdUp: up(breakpoints.md),
  lgUp: up(breakpoints.lg),
  xlUp: up(breakpoints.xl),
} as const;

export type MediaQueryName = keyof typeof mediaQueries;

export const matchesMedia = (name: MediaQueryName) =>
  typeof window !== 'undefined' && window.matchMedia(mediaQueries[name]).matches;
