import { FEEDBACK_CATEGORIES, type FeedbackCategory } from './schema';

export interface CreateIssueParams {
  gameName: string;
  category: FeedbackCategory;
  description: string;
  downloadUrl?: string;
  contactInfo?: string;
}

function categoryLabel(category: FeedbackCategory): string {
  return FEEDBACK_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

/** How long to wait on the GitHub API before giving up. */
const GITHUB_TIMEOUT_MS = 10_000;

/**
 * Defuse the two sigils GitHub turns into notifications: `@name` pings a user
 * or team, `#123` cross-references an issue. Without this, anyone could use the
 * feedback form to make this repo mass-ping arbitrary GitHub users.
 *
 * The HTML entities render as the original characters, so a maintainer reading
 * the issue still sees exactly what was submitted — it just does not link.
 */
const SIGIL_ENTITIES: Record<string, string> = { '@': '&#64;', '#': '&#35;' };

function defuseNotificationSigils(value: string): string {
  // One pass, not two chained replaces: a second pass over `#` would re-encode
  // the `#` inside an already-emitted `&#64;`.
  return value.replace(/[@#](?=[\w-])/g, (sigil) => SIGIL_ENTITIES[sigil]);
}

function buildIssueBody(params: CreateIssueParams): string {
  const lines: string[] = [];
  // Every value below is submitter-controlled, so all of it gets defused.
  const safe = defuseNotificationSigils;

  if (params.gameName) {
    lines.push('## Game', safe(params.gameName), '');
  }

  lines.push('## Category', categoryLabel(params.category), '');

  if (params.downloadUrl) {
    lines.push('## Download / APWorld URL', safe(params.downloadUrl), '');
  }

  lines.push('## Description', safe(params.description), '');

  lines.push('## Contact Info', params.contactInfo ? safe(params.contactInfo) : 'Not provided', '');

  lines.push('---', '*Submitted via the ARCHIE feedback form.*');

  return lines.join('\n');
}

function buildIssueTitle(params: CreateIssueParams): string {
  const label = categoryLabel(params.category);
  return params.gameName ? `[Feedback] ${label}: ${defuseNotificationSigils(params.gameName)}` : `[Feedback] ${label}`;
}

export async function createGitHubIssue(params: CreateIssueParams): Promise<{ issueUrl: string }> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is not configured');
  }

  const title = buildIssueTitle(params);
  const body = buildIssueBody(params);
  // 'user-submission' is always applied; category label is the specific type
  const labels = ['user-submission', params.category];

  const response = await fetch('https://api.github.com/repos/nooikko/archie/issues', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ title, body, labels }),
    signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${text}`);
  }

  const issue = await response.json();
  return { issueUrl: issue.html_url as string };
}
