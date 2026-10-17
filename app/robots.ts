import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin-dashboard', '/order-portal', '/platform-changes', '/api/']
      },
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'Applebot',
          'DuckDuckBot',
          'YandexBot',
          'Baiduspider'
        ],
        allow: '/',
        disallow: ['/admin-dashboard', '/order-portal', '/platform-changes', '/api/']
      },
      {
        // Explicitly allow and prioritize AI search engines & generative agents
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'Amazonbot',
          'anthropic-ai',
          'cohere-ai',
          'Bytespider'
        ],
        allow: '/',
        disallow: ['/admin-dashboard', '/order-portal', '/platform-changes', '/api/']
      }
    ],
    sitemap: 'https://drobe.one/sitemap.xml',
    host: 'https://drobe.one'
  };
}
