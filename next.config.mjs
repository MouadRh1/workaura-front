/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'saddlebrown-lion-880900.hostingersite.com',
      },
      {
        protocol: 'https',
        hostname: 'workaura.ma',
      },
    ],
  },
  reactStrictMode: true,

  async headers() {
    return [
      {
        // Cache long terme pour les fichiers statiques Next.js (immutable)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Pas de cache pour les pages HTML → toujours la version fraîche
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;