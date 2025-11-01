const requestLog = new Map<string, number>();

const DEFAULT_WINDOW_MS = 2000;

function cleanup(now: number, windowMs: number) {
  for (const [key, timestamp] of requestLog) {
    if (now - timestamp > windowMs * 5) {
      requestLog.delete(key);
    }
  }
}

export function checkThrottle(identifier: string, windowMs = DEFAULT_WINDOW_MS) {
  const now = Date.now();
  const lastRequest = requestLog.get(identifier) ?? 0;
  if (now - lastRequest < windowMs) {
    return {
      throttled: true,
      retryAfterSeconds: Math.ceil((windowMs - (now - lastRequest)) / 1000),
    } as const;
  }

  requestLog.set(identifier, now);

  if (requestLog.size > 1024) {
    cleanup(now, windowMs);
  }

  return {
    throttled: false,
    retryAfterSeconds: 0,
  } as const;
}
