import type { APIRoute } from 'astro';
import { users } from '@/lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.db;
  const user = locals.user;

  if (!user || !db) {
    return new Response(JSON.stringify({ consentStatus: null, authenticated: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const dbUser = await db
      .select({
        consentStatus: users.consentStatus,
        consentUpdatedAt: users.consentUpdatedAt,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .get();

    return new Response(
      JSON.stringify({
        authenticated: true,
        consentStatus: dbUser?.consentStatus ?? null,
        consentUpdatedAt: dbUser?.consentUpdatedAt ?? null,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to fetch consent status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  const user = locals.user;

  if (!user || !db) {
    return new Response(JSON.stringify({ error: 'Unauthorized. Please sign in.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as any;
    const { consentStatus } = body;

    if (consentStatus !== 'allowed' && consentStatus !== 'denied') {
      return new Response(
        JSON.stringify({ error: "Invalid consentStatus. Must be 'allowed' or 'denied'." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    await db
      .update(users)
      .set({
        consentStatus,
        consentUpdatedAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, user.id));

    return new Response(
      JSON.stringify({
        success: true,
        consentStatus,
        consentUpdatedAt: now.toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to update consent status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
