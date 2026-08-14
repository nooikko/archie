import { describe, expect, it } from 'vitest';
import { clientIp } from '../client-ip';

const withHeaders = (headers: Record<string, string>) => new Request('https://archie.findquinn.com/api/feedback', { headers });

describe('clientIp', () => {
  // Vercel's proxy sets x-real-ip to the true client address. x-forwarded-for
  // is a client-supplied chain by spec, so its leftmost entry is the one an
  // attacker would control if anything ever fronted the platform.
  it('prefers x-real-ip over x-forwarded-for', () => {
    const request = withHeaders({
      'x-real-ip': '203.0.113.7',
      'x-forwarded-for': '10.0.0.1, 203.0.113.7',
    });

    expect(clientIp(request)).toBe('203.0.113.7');
  });

  it('falls back to the first x-forwarded-for entry', () => {
    expect(clientIp(withHeaders({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' }))).toBe('203.0.113.9');
  });

  it('trims whitespace around the forwarded address', () => {
    expect(clientIp(withHeaders({ 'x-forwarded-for': '  203.0.113.9  , 10.0.0.1' }))).toBe('203.0.113.9');
  });

  it('returns unknown when no address header is present', () => {
    expect(clientIp(withHeaders({}))).toBe('unknown');
  });

  it('returns unknown rather than an empty bucket for a blank header', () => {
    expect(clientIp(withHeaders({ 'x-forwarded-for': '   ' }))).toBe('unknown');
  });
});
