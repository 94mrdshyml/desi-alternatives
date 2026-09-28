import type { APIRoute } from 'astro';
import { siteSettings } from '@/lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { sendWelcomeEmail } from '@/lib/server/email';

export const prerender = false;

// Welcome emails may only be sent to the signed-in user's own inbox, right after
// their account was created. This stops the endpoint being used as an open mail relay.
const WELCOME_WINDOW_MS = 10 * 60 * 1000;

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  const user = locals.user;
  const runtime = (locals as any).runtime;
  const resendApiKey = runtime?.env?.RESEND_API_KEY;

  if (!db) {
    return new Response(JSON.stringify({ error: 'Database connection unavailable' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const createdAt = new Date(user.createdAt).getTime();
  if (!createdAt || Date.now() - createdAt > WELCOME_WINDOW_MS) {
    return new Response(JSON.stringify({ error: 'Welcome email is only sent for new accounts' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as any;
    const nameRaw = body?.name;
    const name = (nameRaw && typeof nameRaw === 'string' ? nameRaw.trim().slice(0, 100) : '') || user.name || '';

    // Fetch site settings
    let settings: any = null;
    try {
      settings = await db.select().from(siteSettings).where(eq(siteSettings.id, 'general')).get();
    } catch (e) {
      // Fallback
    }

    const res = await sendWelcomeEmail({
      apiKey: resendApiKey,
      to: user.email,
      name,
      settings,
    });

    return new Response(JSON.stringify({ success: res.success }), {
      status: res.success ? 200 : 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Registration welcome email dispatch error:', err?.message);
    return new Response(JSON.stringify({ error: 'Failed to send welcome email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
