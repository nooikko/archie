import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createGitHubIssue } from '../github';

const okResponse = () => new Response(JSON.stringify({ html_url: 'https://github.com/nooikko/archie/issues/1' }), { status: 201 });

/** The JSON payload the route would have sent to the GitHub API. */
const sentPayload = (fetchMock: ReturnType<typeof vi.fn>) => JSON.parse(fetchMock.mock.calls[0][1].body);

const baseParams = {
  gameName: 'Chrono Trigger',
  category: 'data-correction' as const,
  description: 'The platform field says SNES but it should say SNES/PS1.',
};

describe('createGitHubIssue', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv('GITHUB_TOKEN', 'test-token');
    fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns the created issue url', async () => {
    const result = await createGitHubIssue(baseParams);
    expect(result.issueUrl).toBe('https://github.com/nooikko/archie/issues/1');
  });

  it('throws when the token is not configured', async () => {
    vi.stubEnv('GITHUB_TOKEN', '');
    await expect(createGitHubIssue(baseParams)).rejects.toThrow('GITHUB_TOKEN is not configured');
  });

  it('throws when GitHub rejects the request', async () => {
    fetchMock.mockResolvedValue(new Response('Bad credentials', { status: 401 }));
    await expect(createGitHubIssue(baseParams)).rejects.toThrow('GitHub API error 401');
  });

  // A submitter could otherwise make the repo mass-ping arbitrary GitHub users
  // or spam cross-references onto unrelated issues.
  describe('neutralizes GitHub notification triggers', () => {
    it('defuses @mentions in the description', async () => {
      await createGitHubIssue({ ...baseParams, description: 'Hey @torvalds and @nooikko/maintainers please look' });

      const { body } = sentPayload(fetchMock);
      expect(body).not.toMatch(/@torvalds/);
      expect(body).not.toMatch(/@nooikko/);
      // Still readable to a maintainer once GitHub renders the entity.
      expect(body).toContain('&#64;torvalds');
    });

    it('defuses issue cross-references in the description', async () => {
      await createGitHubIssue({ ...baseParams, description: 'Same as #123 and #456' });

      const { body } = sentPayload(fetchMock);
      expect(body).not.toMatch(/#123/);
      expect(body).toContain('&#35;123');
    });

    it('defuses mentions in contact info and download url', async () => {
      await createGitHubIssue({
        ...baseParams,
        contactInfo: '@evil-user',
        downloadUrl: 'https://example.com/x#@team',
      });

      const { body } = sentPayload(fetchMock);
      expect(body).not.toMatch(/@evil-user/);
      expect(body).not.toMatch(/@team/);
    });

    it('defuses mentions in the game name, including in the title', async () => {
      await createGitHubIssue({ ...baseParams, gameName: '@everyone' });

      const { title, body } = sentPayload(fetchMock);
      expect(body).not.toMatch(/@everyone/);
      expect(title).not.toMatch(/@everyone/);
    });

    it('leaves ordinary prose untouched', async () => {
      await createGitHubIssue(baseParams);

      const { body } = sentPayload(fetchMock);
      expect(body).toContain('The platform field says SNES but it should say SNES/PS1.');
    });
  });

  // Without this a hung GitHub API call holds the function open to the
  // platform's 300s default, burning active CPU time per stuck request.
  it('aborts the request if GitHub does not respond in time', async () => {
    await createGitHubIssue(baseParams);

    const init = fetchMock.mock.calls[0][1];
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });
});
