import type { APIRoute } from 'astro';
import { siteSettings } from '@/lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.db;
  const user = locals.user;

  if (!db || !user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const settings = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, 'general'))
      .get();

    return new Response(
      JSON.stringify({
        fromName: settings?.fromName || 'Desi Alternatives',
        fromEmail: settings?.fromEmail || 'auth@desialternatives.in',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  const user = locals.user;

  if (!db || !user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as any;
    const fromName = String(body?.fromName || '').trim() || 'Desi Alternatives';
    const fromEmail = String(body?.fromEmail || '').trim() || 'auth@desialternatives.in';

    // Simple email validation regex
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail)) {
      return new Response(JSON.stringify({ error: 'Please provide a valid sender email address.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const existing = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, 'general'))
      .get();

    if (existing) {
      await db
        .update(siteSettings)
        .set({
          fromName,
          fromEmail,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(siteSettings.id, 'general'));
    } else {
      await db.insert(siteSettings).values({
        id: 'general',
        fromName,
        fromEmail,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        fromName,
        fromEmail,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
