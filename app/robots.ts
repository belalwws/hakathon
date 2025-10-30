export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/judge/',
          '/supervisor/',
          '/expert/',
          '/participant/',
          '/emergency-admin/'
        ]
      }
    ],
    sitemap: 'https://hackpro.com/sitemap.xml'
  }
}
