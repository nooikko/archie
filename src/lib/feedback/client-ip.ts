/**
 * Best-effort client address for rate-limit bucketing.
 *
 * `x-real-ip` is set by Vercel's proxy and holds a single trusted address, so
 * it wins. `x-forwarded-for` is by spec a client-supplied chain — its leftmost
 * entry is attacker-controlled if anything ever sits in front of the platform —
 * so it is only a fallback for local dev and non-Vercel hosting.
 */
export function clientIp(request: Request): string {
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) {
    return realIp;
  }

  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) {
    return forwarded;
  }

  return 'unknown';
}
