/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
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
  turbopack: {
    root: './',
  },
}

export default nextConfig