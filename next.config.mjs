/** @type {import('next').NextConfig} */
const nextConfig = {
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