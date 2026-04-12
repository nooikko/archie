import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';

marked.use({ gfm: true, breaks: true });

export function readChangelog(): string {
  return readFileSync(join(process.cwd(), 'CHANGELOG.md'), 'utf-8');
}

export function parseMarkdown(raw: string): string {
  if (!raw.trim()) {
    return '';
  }
  return marked.parse(raw) as string;
}
