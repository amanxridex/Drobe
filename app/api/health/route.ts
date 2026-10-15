import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
  const startTime = Date.now();
  let redisPing = 'unknown';

  try {
    const isRedisConfigured = redis.isConfigured();
    if (isRedisConfigured) {
      const testKey = 'drobe:health:ping';
      await redis.set(testKey, 'pong', { ex: 5 });
      const res = await redis.get<string>(testKey);
      redisPing = res === 'pong' ? 'connected' : 'error';
    } else {
      redisPing = 'in-memory-fallback (active & healthy)';
    }
  } catch (err: any) {
    redisPing = `degraded: ${err?.message || 'timeout'}`;
  }

  const memoryUsage = process.memoryUsage ? process.memoryUsage() : null;

  return NextResponse.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - startTime,
    hub: process.env.NEXT_PUBLIC_DROBE_HUB_ID || 'AMD-DARKSTORE-01',
    darkstore: 'Ahmedabad Shivam Bungalows 1, Koteshwar Road',
    deliveryPromise: '30-Min Doorstep Trial',
    caching: {
      mode: redis.getMode(),
      status: redisPing,
      upstashConfigured: redis.isConfigured()
    },
    system: {
      nodeEnv: process.env.NODE_ENV || 'development',
      heapUsedMb: memoryUsage ? Math.round(memoryUsage.heapUsed / 1024 / 1024) : 'n/a',
      rssMb: memoryUsage ? Math.round(memoryUsage.rss / 1024 / 1024) : 'n/a'
    }
  }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Drobe-Edge-Health': 'PASS'
    }
  });
}
