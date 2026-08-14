import { NextResponse } from 'next/server';
import { clientIp } from '@/lib/feedback/client-ip';
import { createGitHubIssue } from '@/lib/feedback/github';
import { checkRateLimit } from '@/lib/feedback/rate-limit';
import { validateFeedback } from '@/lib/feedback/schema';

export async function POST(request: Request) {
  // In-process only, so it resets on cold start and is per-instance. The real
  // flood protection is the Vercel WAF rate-limit rule at the edge; this is a
  // cheap backstop for repeat submissions hitting a warm instance.
  const { allowed, retryAfter } = checkRateLimit(clientIp(request));
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
