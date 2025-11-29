/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: "https",
        hostname: "funny-animal-09dc5ed329.media.strapiapp.com", 
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "funny-animal-09dc5ed329.strapiapp.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kozmedo-cms.onrender.com", 
        port: "",
        pathname: "/uploads/**",
      },
    ],
  },
};

module.exports = nextConfig;
