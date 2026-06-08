/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['mintcream-mink-168421.hostingersite.com'],
  },
  reactStrictMode: true,
  swcMinify: true,
}

export default nextConfig