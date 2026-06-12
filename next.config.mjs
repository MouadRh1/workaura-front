/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'saddlebrown-lion-880900.hostingersite.com',
      },
    ],
  },
  reactStrictMode: true,
}

export default nextConfig