/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'mintcream-mink-168421.hostingersite.com',
      'antiquewhite-elephant-610472.hostingersite.com', // ← ton domaine actuel
    ],
  },
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: false,
  // Désactiver Turbopack explicitement
  experimental: {
    turbo: undefined,
  },
}

export default nextConfig