/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['blob.vercel-storage.com'],
  },
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
