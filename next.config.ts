/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Eski yol (kolay)
    domains: ['cdn.sanity.io'],

    // veya yeni yol (önerilen)
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'cdn.sanity.io' },
    // ],
  },
};
module.exports = nextConfig;
