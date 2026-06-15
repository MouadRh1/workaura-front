/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "saddlebrown-lion-880900.hostingersite.com",
      },
      {
        protocol: "https",
        hostname: "workaura.ma",
      },
    ],
  },
  reactStrictMode: true,

  async headers() {
    return [
      {
        // Fichiers statiques → cache long terme (immutable)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Pages HTML → jamais cachées par le CDN
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },
};

export default nextConfig;