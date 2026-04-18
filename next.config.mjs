/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Отключаем статическую генерацию, чтобы переменные окружения (env) были доступны
  output: 'standalone',

  // ✅ Настройки для TypeScript: игнорируем ошибки сборки
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ✅ Другие важные настройки
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;