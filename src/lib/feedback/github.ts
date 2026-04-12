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

function buildIssueBody(params: CreateIssueParams): string {
  const lines: string[] = [];

  if (params.gameName) {
    lines.push('## Game', params.gameName, '');
  }

  lines.push('## Category', categoryLabel(params.category), '');

  if (params.downloadUrl) {
    lines.push('## Download / APWorld URL', params.downloadUrl, '');
  }

  lines.push('## Description', params.description, '');

  lines.push('## Contact Info', params.contactInfo || 'Not provided', '');

  lines.push('---', '*Submitted via the ARCHIE feedback form.*');

  return lines.join('\n');
}

function buildIssueTitle(params: CreateIssueParams): string {
  const label = categoryLabel(params.category);
  return params.gameName ? `[Feedback] ${label}: ${params.gameName}` : `[Feedback] ${label}`;
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
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${text}`);
  }

  const issue = await response.json();
  return { issueUrl: issue.html_url as string };
}
