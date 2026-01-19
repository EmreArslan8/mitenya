import localFont from 'next/font/local';

export const albertSans = localFont({
  src: [
    {
      path: '../assets/fonts/AlbertSans/AlbertSans-VariableFont_wght.woff2', 
      style: 'normal',
      weight: '100 900',
    },
    {
      path: '../assets/fonts/AlbertSans/AlbertSans-Italic-VariableFont_wght.woff2',
      style: 'italic',
      weight: '100 900', 
    },
  ],
  display: 'swap',
  variable: '--font-albert-sans',
});
