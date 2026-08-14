import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkRateLimit } from '../rate-limit';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

// The limiter keeps module-level state, so each test uses its own bucket key
// rather than relying on a reset hook.
let bucketId = 0;
const freshIp = () => `198.51.100.${bucketId++}`;

afterEach(() => {
  vi.useRealTimers();
});

describe('checkRateLimit', () => {
  it('allows requests up to the limit', () => {
    const ip = freshIp();

    for (let i = 0; i < MAX_REQUESTS; i++) {
      expect(checkRateLimit(ip).allowed).toBe(true);
    }
  });

  it('blocks the request after the limit is reached', () => {
    const ip = freshIp();
    for (let i = 0; i < MAX_REQUESTS; i++) {
      checkRateLimit(ip);
    }

    const result = checkRateLimit(ip);

    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
    expect(result.retryAfter).toBeLessThanOrEqual(WINDOW_MS / 1000);
  });

  it('tracks each address independently', () => {
    const noisy = freshIp();
    const quiet = freshIp();
    for (let i = 0; i < MAX_REQUESTS + 1; i++) {
      checkRateLimit(noisy);
    }

    expect(checkRateLimit(noisy).allowed).toBe(false);
    expect(checkRateLimit(quiet).allowed).toBe(true);
  });

  it('allows requests again once the window has elapsed', () => {
    vi.useFakeTimers();
    const ip = freshIp();
    for (let i = 0; i < MAX_REQUESTS; i++) {
      checkRateLimit(ip);
    }
    expect(checkRateLimit(ip).allowed).toBe(false);

    vi.advanceTimersByTime(WINDOW_MS + 1);

    expect(checkRateLimit(ip).allowed).toBe(true);
  });

  it('does not leak buckets for addresses whose window expired', () => {
    vi.useFakeTimers();
    const stale = freshIp();
    checkRateLimit(stale);

    vi.advanceTimersByTime(WINDOW_MS + 1);
    // Any call triggers the lazy sweep; the stale bucket should be gone, so the
    // address starts from a full budget.
    checkRateLimit(freshIp());

    for (let i = 0; i < MAX_REQUESTS; i++) {
      expect(checkRateLimit(stale).allowed).toBe(true);
    }
  });
});
