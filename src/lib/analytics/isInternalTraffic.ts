export const isInternalTraffic = (): boolean => {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((c) => c.trim() === 'traffic_type=internal');
};
