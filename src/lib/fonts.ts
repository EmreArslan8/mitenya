import localFont from 'next/font/local';

// Normal ağırlık: gövde metni için kritik → preload edilir (FCP).
export const albertSans = localFont({
  src: [
    {
      path: '../assets/fonts/AlbertSans/AlbertSans-VariableFont_wght.woff2',
      style: 'normal',
      weight: '100 900',
    },
  ],
  display: 'swap',
  variable: '--font-albert-sans',
});

// İtalik: ilk sayfa render'ında (özellikle PDP) kullanılmıyor → preload ETME.
// Catchpoint analizi: 52KB italik font, "Highest" öncelikle preload edilip 1.6Mbps
// hatta cross-origin LCP görseliyle bant genişliği için yarışıyor, görselin isteğini
// ~2.17s'ye geciktiriyordu. preload:false → italik yalnızca italik metin render
// edilince (iletişim/hakkımızda/blog/adres) yüklenir, kritik yolu tıkamaz.
export const albertSansItalic = localFont({
  src: [
    {
      path: '../assets/fonts/AlbertSans/AlbertSans-Italic-VariableFont_wght.woff2',
      style: 'italic',
      weight: '100 900',
    },
  ],
  display: 'swap',
  variable: '--font-albert-sans-italic',
  preload: false,
});
