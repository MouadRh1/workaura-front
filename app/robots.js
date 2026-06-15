export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/dashboard'],
    },
    sitemap: 'https://workaura.ma/sitemap.xml',
  }
}