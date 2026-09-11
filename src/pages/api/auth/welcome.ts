import type { APIRoute } from 'astro';
import { siteSettings, users } from '@/lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { sendWelcomeEmail } from '@/lib/server/email';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  const runtime = (locals as any).runtime;
  const resendApiKey = runtime?.env?.RESEND_API_KEY;

  if (!db) {
    return new Response(JSON.stringify({ error: 'Database connection unavailable' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as any;
    const emailRaw = body?.email;
    const nameRaw = body?.name;

    if (!emailRaw || typeof emailRaw !== 'string') {
      return new Response(JSON.stringify({ error: 'Valid email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const email = emailRaw.trim().toLowerCase();
    let name = nameRaw && typeof nameRaw === 'string' ? nameRaw.trim() : '';

    // If name wasn't provided, try fetching from users table
    if (!name) {
      try {
        const u = await db.select().from(users).where(eq(users.email, email)).get();
        if (u) {
          name = u.name || '';
        }
      } catch (e) {
        // Non-blocking
      }
    }

    // Fetch site settings
    let settings: any = null;
    try {
      settings = await db.select().from(siteSettings).where(eq(siteSettings.id, 'general')).get();
    } catch (e) {
      // Fallback
    }

    const res = await sendWelcomeEmail({
      apiKey: resendApiKey,
      to: email,
      name,
      settings,
    });

    return new Response(JSON.stringify({ success: res.success, id: res.id, error: res.error }), {
      status: res.success ? 200 : 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Registration welcome email dispatch error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
