type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS = 12;

export function checkAssistantRateLimit(identifier: string) {
  const now = Date.now();
  const bucket = buckets.get(identifier);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
    };
  }

  if (bucket.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: bucket.resetAt - now,
    };
  }

  bucket.count += 1;
  buckets.set(identifier, bucket);

  return {
    allowed: true,
    remaining: MAX_REQUESTS - bucket.count,
  };
}
