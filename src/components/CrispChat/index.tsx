/* 


'use client';

import { Crisp } from 'crisp-sdk-web';
import { useEffect } from 'react';

const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

const CrispChat = () => {
  useEffect(() => {
    if (!CRISP_WEBSITE_ID) return;
    Crisp.configure(CRISP_WEBSITE_ID);
  }, []);

  return null;
};

export default CrispChat;

*/