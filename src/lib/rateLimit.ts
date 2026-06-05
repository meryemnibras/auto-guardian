/**
 * Lightweight in-memory rate limiter — server-only.
 *
 * Fixed-window counter keyed by client IP + bucket name. No external service
 * (Redis) required, which keeps the free-tier demo zero-cost. The trade-off:
 * state lives per serverless instance, so under heavy fan-out the effective
 * limit is (limit × warm instances). That's perfectly fine as an abuse guard
 * for a public demo — it stops a single client from hammering the free Groq
 * key, without needing extra infrastructure.
 *
 * For production scale, swap the Map for Upstash Redis (same interface).
 */

interface Counter {
  count: number;
  /** Epoch ms when the current window resets. */
  resetAt: number;
}

const buckets = new Map<string, Counter>();

/** Periodically drop expired counters so the Map can't grow unbounded. */
let lastSweep = 0;
function sweep(now: number): void {
  // At most once every 60s — cheap amortized cleanup.
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, c] of buckets) {
    if (c.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  /** True when the request is within the allowed quota. */
  ok: boolean;
  /** Requests remaining in the current window. */
  remaining: number;
  /** Seconds until the window resets (for the Retry-After header). */
  retryAfter: number;
  /** Total quota for the window. */
  limit: number;
}

/**
 * Record one hit for `key` in the named bucket and report whether it's allowed.
 *
 * @param key     Stable client identifier (usually the IP).
 * @param bucket  Logical bucket name so different routes have separate quotas.
 * @param limit   Max requests allowed per window.
 * @param windowMs Window length in milliseconds.
 */
export function rateLimit(
  key: string,
  bucket: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const id = `${bucket}:${key}`;
  const existing = buckets.get(id);

  if (!existing || existing.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + windowMs });
    return {
      ok: true,
      remaining: limit - 1,
      retryAfter: 0,
      limit,
    };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  const ok = existing.count <= limit;
  return {
    ok,
    remaining,
    retryAfter: ok ? 0 : Math.ceil((existing.resetAt - now) / 1000),
    limit,
  };
}

/**
 * Best-effort client IP from standard proxy headers. On Vercel the first
 * entry of `x-forwarded-for` is the real client. Falls back to a constant so
 * the limiter still degrades gracefully (shared bucket) if no IP is present.
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}
