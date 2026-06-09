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
        hostname: 'mintcream-mink-168421.hostingersite.com',
      },
      {
        protocol: 'https',
        hostname: 'antiquewhite-elephant-610472.hostingersite.com',
      },
    ],
  },
  reactStrictMode: true,
  turbopack: {
    root: './',
  },
}

export default nextConfig