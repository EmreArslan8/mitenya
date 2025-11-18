import { getCookie } from 'cookies-next';
import { useEffect, useState } from 'react';

export const useIsMobileApp = () => {
  const [isMobileApp, setIsMobileApp] = useState(false);

  useEffect(() => {
    const cookieValue = getCookie('isMobileApp') === 'true';
    setIsMobileApp(cookieValue);
  }, []);

  return isMobileApp;
};
