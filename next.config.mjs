/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Статический экспорт для Cloudflare Pages
  output: 'export',

  // ✅ Игнорируем ошибки TypeScript при сборке
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Игнорируем ошибки ESLint при сборке
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;