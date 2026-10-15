# 🚀 Drobe Enterprise Infrastructure Architecture
**Nginx Load Balancers · Upstash & In-Memory Redis · Cloudflare Edge CDN · Docker Multi-Stage**

---

## 1. System Topology Overview

```
                                [ Users / Mobile App ]
                                           │
                                           ▼
                      [ Cloudflare Edge CDN (Global Anycast) ]
                      • 103 Early Hints · Brotli/Zstandard
                      • Tiered Edge Cache (Static Assets & Microcached APIs)
                      • DDoS & WAF Bot Mitigation
                                           │
                      ┌────────────────────┴────────────────────┐
                      │                                         │
        [ Self-Hosted / VPS Path ]                     [ Vercel Edge Path ]
                      │                                         │
                      ▼                                         ▼
         [ Nginx Load Balancer ]                      [ Vercel Serverless ]
       • Least-Connection Algorithm                   • Edge Middleware
       • SSL Termination & HTTP/2                     • Next.js App Router
       • Microcache & Rate Limiting                             │
                      │                                         │
         ┌────────────┴────────────┐                            │
         ▼                         ▼                            │
  [ Drobe App #1 ]          [ Drobe App #2 ]                    │
  (Next.js Node)            (Next.js Node)                      │
         │                         │                            │
         └────────────┬────────────┘                            │
                      │                                         │
                      └────────────────────┬────────────────────┘
                                           │
                                           ▼
                         [ Hybrid Redis Caching Layer ]
                         • Upstash Redis (Serverless REST Edge)
                         • In-Memory LRU (Automatic Zero-Config Fallback)
                         • Rate Limiting & Query Cache-Aside
                                           │
                                           ▼
                         [ Supabase Postgres & Storage ]
                         • Managed Postgres DB with RLS
                         • Object Storage (drobe-media)
                         • Realtime WebSockets
```

---

## 2. Hybrid Redis Caching Layer

Drobe features a **resilient hybrid caching architecture** implemented in [`lib/redis.ts`](file:///c:/Users/User/wipachunks/lib/redis.ts) and [`lib/cache.ts`](file:///c:/Users/User/wipachunks/lib/cache.ts):

- **Automatic Environment Detection**:
  - In local development or environments without Redis credentials, it transparently utilizes an **in-memory LRU store with background TTL cleanup**, requiring zero local setup or external services.
  - In production / staging, simply supplying `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env.local` or Vercel Environment Variables activates high-concurrency Edge Redis caching via HTTP REST (eliminating TCP connection limits on serverless).
- **Cached Layers & TTLs**:
  - **Brand Profiles**: 30-minute TTL (`CACHE_TTL.LONG`).
  - **Brand Storefront Catalog**: 5-minute TTL (`CACHE_TTL.MEDIUM`).
  - **Storefront Categories**: 5-minute TTL (`CACHE_TTL.MEDIUM`).
  - **Discover Brands Lookbook**: 30-minute TTL with instant cache invalidation upon brand updates.
  - **API Rate Limiter**: 60-second sliding window rate limiting.

### Environment Configuration:
```env
# Optional for local, active in production:
UPSTASH_REDIS_REST_URL=https://your-upstash-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

---

## 3. Nginx Load Balancer & Reverse Proxy

The Nginx configuration in [`nginx/nginx.conf`](file:///c:/Users/User/wipachunks/nginx/nginx.conf) provides:
- **Upstream Pool (`drobe_app_cluster`)**: Distributes requests across Next.js replicas using the `least_conn` algorithm.
- **Microcaching**: Edge microcaching on GET requests (`/api/`) with 30-second TTL to handle viral flash sales.
- **Immutable Static Asset Caching**: 1-year cache (`31536000s`) on `/_next/static/` with byte-range support.
- **Strict Rate Limiting**:
  - `drobe_api_limit`: 30 requests/second per binary IP with burst allowances.
  - `drobe_general_limit`: 100 requests/second per IP.
- **Zero-Trust Security**: Pre-configured HSTS, X-Frame-Options, X-Content-Type-Options, and TLS 1.2/1.3 ciphers.

---

## 4. Docker Multi-Stage Container Orchestration

Run the complete multi-replica, load-balanced stack with Redis using Docker Compose:

```bash
# Build and launch Nginx Load Balancer + 2 Next.js App Replicas + Redis
docker compose up -d --build
```

Services initialized:
- `drobe-nginx-lb`: Nginx listening on port 80 and 443.
- `drobe-app-node-1`: Primary Next.js App instance.
- `drobe-app-node-2`: Secondary Next.js App instance (load balanced).
- `drobe-redis-cache`: Persistent Redis Alpine with LRU eviction and memory bounds.

---

## 5. Cloudflare Edge CDN Configuration Rules

For maximum global edge speed on Vercel or VPS:

1. **Caching Rules**:
   - URL: `drobe.in/_next/static/*`
   - Cache Level: *Cache Everything*
   - Edge Cache TTL: *1 Year*
   - Browser Cache TTL: *1 Year*
2. **Media Assets Rules**:
   - URL: `drobe.in/assets/*`
   - Cache Level: *Cache Everything*
   - Edge Cache TTL: *7 Days*
   - Browser Cache TTL: *1 Day*
3. **Speed Optimizations**:
   - Enable **Brotli Compression**
   - Enable **Early Hints (103)**
   - Enable **Tiered Cache (Argo Smart Routing)**

---

## 6. Live Health & Telemetry Verification

You can inspect the live caching status, hub status, and memory metrics at any time:

```bash
curl http://localhost:3005/api/health
```

Example Response:
```json
{
  "status": "healthy",
  "uptime": 1284.5,
  "timestamp": "2026-10-15T12:22:00.000Z",
  "latencyMs": 1,
  "hub": "AMD-DARKSTORE-01",
  "darkstore": "Ahmedabad Shivam Bungalows 1, Koteshwar Road",
  "deliveryPromise": "30-Min Doorstep Trial",
  "caching": {
    "mode": "in-memory-fallback (active & healthy)",
    "status": "in-memory-fallback (active & healthy)",
    "upstashConfigured": false
  },
  "system": {
    "nodeEnv": "development",
    "heapUsedMb": 72,
    "rssMb": 164
  }
}
```
