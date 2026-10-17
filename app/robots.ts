import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // 1. General search engine access
        userAgent: '*',
        allow: [
          '/',
          '/product/',
          '/brand/',
          '/collection/',
          '/categories',
          '/trends',
          '/llms.txt',
          '/llms-full.txt',
          '/manifest.json',
          '/favicon.ico',
          '/og-image.png',
          '/og-square.png'
        ],
        disallow: [
          '/admin-dashboard',
          '/order-portal',
          '/platform-changes',
          '/brand-dashboard',
          '/delivery-partner',
          '/seller',
          '/api/',
          '/*?*dev=',
          '/*?*preview=',
          '/*?*admin=',
          '/*?*secret=',
          '/*.json$'
        ]
      },
      {
        // 2. 100+ Verified AI Bots & Search Crawlers (OpenAI, ChatGPT, Anthropic, Perplexity, Google, Apple, etc.)
        userAgent: [
          // OpenAI & ChatGPT Ecosystem
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'OpenAI',

          // Anthropic & Claude
          'ClaudeBot',
          'Claude-Web',
          'anthropic-ai',

          // Perplexity AI
          'PerplexityBot',
          'Perplexity-User',

          // Google AI & Search
          'Google-Extended',
          'GoogleOther',
          'GoogleOther-Image',
          'GoogleOther-Video',
          'Storebot-Google',
          'Google-InspectionTool',
          'Googlebot',
          'Googlebot-Image',
          'Googlebot-Mobile',
          'Googlebot-News',
          'Feedfetcher-Google',
          'Mediapartners-Google',
          'APIs-Google',

          // Microsoft Bing & Copilot
          'Bingbot',
          'BingPreview',
          'msnbot',
          'Copilot',

          // Apple & Apple Intelligence
          'Applebot',
          'Applebot-Extended',

          // Meta & Llama
          'Meta-ExternalAgent',
          'Meta-ExternalFetcher',
          'FacebookBot',
          'facebookexternalhit',

          // Leading AI Labs & Models
          'cohere-ai',
          'cohere-training-data-crawler',
          'MistralBot',
          'Amazonbot',
          'Bytespider',

          // Privacy & AI Search Engines
          'DuckAssistBot',
          'DuckDuckBot',
          'DuckDuckGo-Favicons-Bot',
          'Bravebot',
          'YouBot',
          'KagiBot',
          'NeevaBot',
          'ExaBot',
          'Diffbot',
          'WebzBot',
          'Timpibot',
          'MojeekBot',
          'Qwantify',

          // International Search Engines
          'Baiduspider',
          'Baiduspider-image',
          'YandexBot',
          'YandexImages',
          'YandexDirect',
          'Yeti',
          'Slurp',
          'Sogou web spider',
          'Sogou inst spider',
          'Daumoa',
          'SeznamBot',
          'coccocbot',
          'Mail.RU_Bot',
          'Barkrowler',
          'Linespider',

          // Social Discovery & Real-Time Cards
          'Twitterbot',
          'LinkedInBot',
          'Slackbot',
          'Slackbot-LinkExpanding',
          'Discordbot',
          'TelegramBot',
          'WhatsApp',
          'Pinterestbot',
          'RedditBot',
          'BlueskyCard',
          'SkypeUriPreview',
          'Embedly',
          'Quora Link Preview',
          'vkShare',
          'FlipboardProxy',
          'Tumblr',
          'Snapchat',
          'Viber',
          'Signal',
          'WeChat',
          'LineBot',

          // Open LLM Knowledge & Archival Engines
          'CCBot',
          'CriteoBot',
          'archive.org_bot',
          'ia_archiver',
          'Feedly',
          'PocketParser',
          'Instapaper',
          'BitlyBot',
          'TinyURLBot',
          'W3C_Validator'
        ],
        allow: [
          '/',
          '/product/',
          '/brand/',
          '/collection/',
          '/categories',
          '/trends',
          '/llms.txt',
          '/llms-full.txt',
          '/sitemap.xml',
          '/.well-known/ai-plugin.json',
          '/.well-known/openapi.json'
        ],
        disallow: [
          '/admin-dashboard',
          '/order-portal',
          '/platform-changes',
          '/brand-dashboard',
          '/delivery-partner',
          '/seller',
          '/api/',
          '/*?*dev=',
          '/*?*preview=',
          '/*?*admin='
        ]
      },
      {
        // 3. Blacklist Hostile Scrapers, Competitor Harvesters, and Exploit Scanners
        userAgent: [
          // Vulnerability & Attack Tools
          'sqlmap',
          'nikto',
          'masscan',
          'nmap',
          'gobuster',
          'dirbuster',
          'wpscan',
          'acunetix',
          'havij',
          'zgrab',
          'netsparker',
          'burpsuite',
          'arachni',
          'openvas',
          'nessus',

          // Generic Unapproved Scraper Libraries
          'Scrapy',
          'HttpClient',
          'python-requests',
          'aiohttp',
          'Go-http-client',
          'libwww-perl',
          'PycURL',
          'urllib',
          'mechanize',
          'phantomjs',

          // Hostile Competitor Scraping & Data Extraction Bots
          'SemrushBot',
          'AhrefsBot',
          'DotBot',
          'MJ12bot',
          'BLEXBot',
          'DataForSeoBot',
          'MegaIndex',
          'spbot',
          'PetalBot',
          'ZoominfoBot',
          'trendictionbot',
          'TurnitinBot'
        ],
        disallow: ['/']
      }
    ],
    sitemap: 'https://drobe.one/sitemap.xml',
    host: 'https://drobe.one'
  };
}
