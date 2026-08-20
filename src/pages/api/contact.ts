// pages/api/contact.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sendContactEmail } from '../../../src/lib/resend';
import { contactSchema } from '../../../src/lib/contact';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

type RateLimitEntry = { count: number; resetAt: number };

const rateLimitStore = new Map<string, RateLimitEntry>();

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '16kb',
    },
  },
};

function getClientIp(req: NextApiRequest) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]?.trim();

  return forwardedIp ?? req.socket.remoteAddress ?? 'unknown';
}

function isSameOriginRequest(req: NextApiRequest) {
  const origin = req.headers.origin;
  const host = req.headers.host;

  if (!origin || !host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function consumeRateLimit(identifier: string) {
  const now = Date.now();

  if (rateLimitStore.size > 1_000) {
    for (const [key, entry] of rateLimitStore) {
      if (entry.resetAt <= now) rateLimitStore.delete(key);
    }
  }

  const current = rateLimitStore.get(identifier);

  if (!current || current.resetAt <= now) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return { allowed: true, resetAt };
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, resetAt: current.resetAt };
  }

  current.count += 1;
  return { allowed: true, resetAt: current.resetAt };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!isSameOriginRequest(req)) {
    return res.status(403).json({ success: false, error: 'Invalid request origin' });
  }

  const contentType = req.headers['content-type']?.split(';', 1)[0]?.trim().toLowerCase();
  if (contentType !== 'application/json') {
    return res.status(415).json({ success: false, error: 'Content-Type must be application/json' });
  }

  const rateLimit = consumeRateLimit(getClientIp(req));
  if (!rateLimit.allowed) {
    const retryAfterSeconds = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
    res.setHeader('Retry-After', retryAfterSeconds.toString());
    return res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' });
  }

  try {
    const submission = await contactSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (submission.website) {
      return res.status(200).json({ success: true });
    }

    const result = await sendContactEmail(submission);

    if (result.success) {
      return res.status(200).json({ success: true });
    }
  } catch {
    return res.status(400).json({ success: false, error: 'Please provide valid contact details.' });
  }

  return res.status(500).json({ success: false, error: 'Unable to send your message right now.' });
}
