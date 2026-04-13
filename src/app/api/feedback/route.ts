import { NextResponse } from 'next/server';
import { createGitHubIssue } from '@/lib/feedback/github';
import { checkRateLimit } from '@/lib/feedback/rate-limit';
import { validateFeedback } from '@/lib/feedback/schema';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before submitting again.' },
      {
        status: 429,
        headers: retryAfter ? { 'Retry-After': String(retryAfter) } : undefined,
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const result = validateFeedback(body);
  if (!result.success) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const { data } = result;
  if (!data) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  // Honeypot: silent success — never reveal spam detection
  if (data.honeypot) {
    return NextResponse.json({ success: true, issueUrl: null });
  }

  try {
    const { issueUrl } = await createGitHubIssue({
      gameName: data.gameName,
      category: data.category,
      description: data.description,
      downloadUrl: data.downloadUrl,
      contactInfo: data.contactInfo,
    });
    return NextResponse.json({ success: true, issueUrl });
  } catch (err) {
    console.error('[feedback] GitHub issue creation failed:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
