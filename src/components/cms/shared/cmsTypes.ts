export type SharedImageType = {
  data: { attributes: { url: string; alternativeText: string; ext: string; width: number; height: number } };
};
export type SharedSiblingImageType = { attributes: { url: string; alternativeText: string } };

export type SharedButtonType = {
  href?: string;
  label?: string | null;
  target?: string;
  variant?: 'text' | 'contained' | 'outlined';
  arrow: 'none' | 'start' | 'end';
  dataLayerEventId?: string;
};
export type GridOptions = { xs: number; sm: number; md: number; lg: number };
