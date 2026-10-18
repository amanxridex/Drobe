import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory sliding rate limiter per IP (Edge runtime compatible)
const ipRateMap = new Map<string, { count: number; resetTime: number }>();

// Hostile tools, scanners, and exploit tool User-Agents to immediately terminate
const HACKER_EXPLOIT_AGENTS = [
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
  'qualys',
  'whatweb',
  'dirb'
];

// Unauthenticated scraping libraries and aggressive scrapers harvesting catalogs
const HOSTILE_SCRAPER_AGENTS = [
  'scrapy',
  'python-requests',
  'aiohttp',
  'go-http-client',
  'libwww-perl',
  'pycurl',
  'urllib',
  'mechanize',
  'phantomjs',
  'semrushbot',
  'ahrefsbot',
  'dotbot',
  'mj12bot',
  'blexbot',
  'dataforseobot',
  'megaindex',
  'spbot',
  'petalbot',
  'zoominfobot',
  'trendictionbot',
  'turnitinbot'
];

// Legitimate AI Search & Generative Bots to prioritize and optimize
const VERIFIED_AI_BOTS = [
  'gptbot',
  'chatgpt-user',
  'oai-searchbot',
  'openai',
  'claudebot',
  'claude-web',
  'anthropic-ai',
  'perplexitybot',
  'perplexity-user',
  'google-extended',
  'googleother',
  'storebot-google',
  'applebot-extended',
  'meta-externalagent',
  'meta-externalfetcher',
  'cohere-ai',
  'mistralbot',
  'amazonbot',
  'bytespider',
  'duckassistbot',
  'youbot',
  'kagibot',
  'exabot',
  'diffbot'
];

// Malicious probe paths & exploit keywords
const MALICIOUS_PATH_PATTERNS = [
  /\/\.(env|git|svn|aws|ssh|bash|sql|bak|conf|config)/i,
  /\/(wp-admin|wp-login|wp-includes|phpmyadmin|pma|adminer|actuator|xmlrpc\.php|server-status)/i,
  /\.\./,
  /%2e%2e/i,
  /select\s+.*from/i,
  /union\s+select/i,
  /<script/i,
  /javascript:/i,
  /eval\(/i
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const fullPath = pathname + search;
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const clientIp =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  // 1. Immediately terminate hacker probes and path traversal attacks
  for (const pattern of MALICIOUS_PATH_PATTERNS) {
    if (pattern.test(fullPath)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Forbidden',
          message: 'Access Denied: Malicious probe pattern detected by DROBE Security Shield.',
          code: 'SECURITY_SHIELD_PROBE_BLOCKED'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'X-DROBE-Security': 'Blocked-Probe'
          }
        }
      );
    }
  }

  // 2. Terminate automated hacker exploit tools (sqlmap, nikto, gobuster, etc.)
  for (const agent of HACKER_EXPLOIT_AGENTS) {
    if (userAgent.includes(agent)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Forbidden',
          message: 'Automated vulnerability scanning or exploitation is strictly forbidden.',
          code: 'SECURITY_SHIELD_EXPLOIT_BLOCKED'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'X-DROBE-Security': 'Blocked-Hacker'
          }
        }
      );
    }
  }

  // 3. Terminate aggressive catalog scrapers & unapproved python/curl scraper libraries
  for (const scraper of HOSTILE_SCRAPER_AGENTS) {
    if (userAgent.includes(scraper)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Forbidden',
          message: 'Automated scraping and content theft are strictly prohibited on DROBE.',
          code: 'SECURITY_SHIELD_SCRAPER_BLOCKED'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'X-DROBE-Security': 'Blocked-Scraper'
          }
        }
      );
    }
  }

  // 4. Rate-Limiting Protection (Anti-DoS & anti-scraping loop)
  // Skip rate-limiting for static media or Next.js core assets
  const isStaticAsset =
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/assets/') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.json') ||
    pathname.endsWith('.txt');

  if (!isStaticAsset) {
    const now = Date.now();
    const windowMs = 15000; // 15-second sliding window
    const maxRequests = 60; // Max 60 requests per 15s (~240 req/min)

    const record = ipRateMap.get(clientIp);
    if (!record || now > record.resetTime) {
      ipRateMap.set(clientIp, { count: 1, resetTime: now + windowMs });
    } else {
      record.count += 1;
      if (record.count > maxRequests) {
        return new NextResponse(
          JSON.stringify({
            error: 'Too Many Requests',
            message: 'High frequency request burst detected. Automated scraping is throttled.',
            retryAfter: 30
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '30',
              'X-DROBE-Security': 'Rate-Limited'
            }
          }
        );
      }
    }

    // Occasional cleanup of stale IP records
    if (ipRateMap.size > 2000) {
      for (const [ip, data] of ipRateMap.entries()) {
        if (now > data.resetTime) {
          ipRateMap.delete(ip);
        }
      }
    }
  }

  // 5. Subdomain Routing: Map brands.drobe.one -> /brand-dashboard
  const host = (request.headers.get('host') || request.nextUrl.hostname || '').toLowerCase();
  const isBrandSubdomain = host.startsWith('brands.') || host === 'brands.drobe.one';

  if (isBrandSubdomain) {
    let rewritePath = pathname;
    const url = request.nextUrl.clone();

    if (pathname === '/') {
      rewritePath = '/brand-dashboard';
    } else if (pathname === '/profile') {
      rewritePath = '/brand-dashboard/profile';
    } else if (pathname === '/onboard' || pathname === '/onboarding') {
      rewritePath = '/brand-dashboard';
      url.searchParams.set('onboard', 'true');
    } else if (
      !pathname.startsWith('/brand-dashboard') &&
      !pathname.startsWith('/api') &&
      !pathname.startsWith('/assets') &&
      !pathname.startsWith('/_next')
    ) {
      rewritePath = `/brand-dashboard${pathname}`;
    }

    if (rewritePath !== pathname || url.searchParams.has('onboard')) {
      url.pathname = rewritePath;
      const rewriteResponse = NextResponse.rewrite(url);
      rewriteResponse.headers.set('X-DROBE-Subdomain', 'brands');
      rewriteResponse.headers.set('X-Content-Type-Options', 'nosniff');
      rewriteResponse.headers.set('X-Frame-Options', 'SAMEORIGIN');
      rewriteResponse.headers.set('X-DROBE-Security-Shield', 'Active');
      return rewriteResponse;
    }
  }

  // 6. Detect and optimize response for verified AI bots (ChatGPT, Claude, Perplexity, etc.)
  let isAIBot = false;
  for (const bot of VERIFIED_AI_BOTS) {
    if (userAgent.includes(bot)) {
      isAIBot = true;
      break;
    }
  }

  const response = NextResponse.next();

  // Enhance headers for AI crawlers and search indexers
  if (isAIBot) {
    response.headers.set('X-Robots-Tag', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    response.headers.set('X-AI-Ready', 'drobe-ai-catalog-v1');
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  } else {
    response.headers.set('X-Robots-Tag', 'index, follow');
  }

  // Enterprise Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-DROBE-Security-Shield', 'Active');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     */
    '/((?!_next/static|_next/image).*)'
  ]
};
