// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { GET } from '../route';

const call = (query: string) => GET(new Request(`https://archie.findquinn.com/api/badges${query}`));

describe('GET /api/badges', () => {
  it('returns a shields.io badge payload for a known stat', async () => {
    const response = await call('?stat=games');
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.schemaVersion).toBe(1);
    expect(body.label).toBe('games supported');
    expect(typeof body.message).toBe('string');
  });

  it('rejects a missing stat', async () => {
    const response = await call('');
    expect(response.status).toBe(400);
  });

  it('rejects an unknown stat', async () => {
    const response = await call('?stat=nonsense');
    expect(response.status).toBe(400);
  });

  // The guard used `stat in STATS`, which walks the prototype chain. Every
  // inherited Object.prototype key slipped through: `__proto__` reached a
  // non-callable and threw a 500, and `toString` returned a spread string as
  // the badge body.
  it.each(['__proto__', 'toString', 'valueOf', 'constructor', 'hasOwnProperty'])('rejects inherited Object key %s', async (key) => {
    const response = await call(`?stat=${encodeURIComponent(key)}`);
    expect(response.status).toBe(400);
  });
});
