export type DataLayerEvent = Record<string, unknown>;

export const pushItemToDataLayer = (item: DataLayerEvent) => {
  try {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(item);
  } catch (error) {
    console.error(error);
  }
};
