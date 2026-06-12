/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mintcream-mink-168421.hostingersite.com',
      },
    ],
  },
  reactStrictMode: true,
}

export default nextConfig