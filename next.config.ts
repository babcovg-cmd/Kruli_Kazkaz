import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Разрешаем оптимизацию загруженных пользователем изображений из /uploads
  images: {
    remotePatterns: [],
  },
  // Папка mockups — это исходный дизайн-прототип, не часть сборки
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
