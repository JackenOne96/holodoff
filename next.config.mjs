/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    turbopack: false,
  },
  // Отключаем статическую генерацию для всех страниц
  output: 'standalone',
};

export default nextConfig;
