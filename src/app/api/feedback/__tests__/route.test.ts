// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const createGitHubIssue = vi.hoisted(() => vi.fn());
vi.mock('@/lib/feedback/github', () => ({ createGitHubIssue }));

const { POST } = await import('../route');

let bucketId = 0;
/** The limiter holds module-level state, so each test needs its own bucket. */
const freshIp = () => `192.0.2.${bucketId++}`;

const validBody = {
  gameName: 'Chrono Trigger',
  category: 'data-correction',
  description: 'The platform field says SNES but it should say SNES/PS1.',
};

const post = (body: unknown, headers: Record<string, string> = {}) =>
  POST(
    new Request('https://archie.findquinn.com/api/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-real-ip': freshIp(), ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );

describe('POST /api/feedback', () => {
  beforeEach(() => {
    createGitHubIssue.mockResolvedValue({ issueUrl: 'https://github.com/nooikko/archie/issues/1' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates an issue for a valid submission', async () => {
    const response = await post(validBody);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      issueUrl: 'https://github.com/nooikko/archie/issues/1',
    });
    expect(createGitHubIssue).toHaveBeenCalledOnce();
  });

  it('rejects a malformed JSON body', async () => {
    const response = await post('{not json');

    expect(response.status).toBe(400);
    expect(createGitHubIssue).not.toHaveBeenCalled();
  });

  it('rejects a submission that fails validation', async () => {
    const response = await post({ ...validBody, description: 'short' });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toHaveProperty('errors.description');
    expect(createGitHubIssue).not.toHaveBeenCalled();
  });

  it('rejects an unknown category', async () => {
    const response = await post({ ...validBody, category: 'not-a-category' });

    expect(response.status).toBe(400);
    expect(createGitHubIssue).not.toHaveBeenCalled();
  });

  it('silently discards honeypot submissions without telling the bot', async () => {
    const response = await post({ ...validBody, honeypot: 'filled-by-bot' });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, issueUrl: null });
    expect(createGitHubIssue).not.toHaveBeenCalled();
  });

  it('does not leak GitHub failure details to the caller', async () => {
    createGitHubIssue.mockRejectedValue(new Error('GitHub API error 401: Bad credentials'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await post(validBody);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe('Something went wrong. Please try again later.');
    expect(JSON.stringify(body)).not.toMatch(/401|credentials/i);
  });

  // The route bucketed on the leftmost x-forwarded-for entry, which is
  // client-supplied. Varying that header alone must not hand out a fresh
  // budget when the platform-set address is the same.
  it('buckets the rate limit on the trusted address, not a spoofable header', async () => {
    const ip = '192.0.2.240';
    const headersFor = (n: number) => ({ 'x-real-ip': ip, 'x-forwarded-for': `10.0.0.${n}` });

    for (let i = 0; i < 5; i++) {
      const allowed = await POST(
        new Request('https://archie.findquinn.com/api/feedback', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...headersFor(i) },
          body: JSON.stringify(validBody),
        }),
      );
      expect(allowed.status).toBe(200);
    }

    const blocked = await POST(
      new Request('https://archie.findquinn.com/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headersFor(99) },
        body: JSON.stringify(validBody),
      }),
    );

    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBeTruthy();
  });

  it('rate limits before parsing the request body', async () => {
    const ip = '192.0.2.241';
    const headers = { 'content-type': 'application/json', 'x-real-ip': ip };
    const send = (body: string) => POST(new Request('https://archie.findquinn.com/api/feedback', { method: 'POST', headers, body }));

    for (let i = 0; i < 5; i++) {
      await send(JSON.stringify(validBody));
    }

    // Malformed body would be a 400 if it were parsed first.
    const response = await send('{not json');
    expect(response.status).toBe(429);
  });
});
