import type { APIRoute } from 'astro';
import { newsletterSubscribers } from '@/lib/server/db/schema';
import { eq, or } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  const user = locals.user;

  if (!db) {
    return new Response(JSON.stringify({ error: 'Database connection unavailable' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as any;
    const token = body?.token ? String(body.token).trim() : null;
    const emailRaw = body?.email ? String(body.email).trim().toLowerCase() : null;

    // Without the emailed token, only a signed-in user may unsubscribe (and only their own email).
    if (!token && !user) {
      return new Response(JSON.stringify({ error: 'Please use the unsubscribe link from your email, or sign in.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let targetSubscriber: any = null;

    if (token) {
      targetSubscriber = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.token, token))
        .get();
    } else if (emailRaw && user && emailRaw === user.email.toLowerCase()) {
      targetSubscriber = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, emailRaw))
        .get();
    } else if (user) {
      targetSubscriber = await db
        .select()
        .from(newsletterSubscribers)
        .where(or(eq(newsletterSubscribers.userId, user.id), eq(newsletterSubscribers.email, user.email.toLowerCase())))
        .get();
    }

    if (!targetSubscriber) {
      return new Response(
        JSON.stringify({ error: 'Subscriber record not found or already removed.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (targetSubscriber.status === 'unsubscribed') {
      return new Response(
        JSON.stringify({ success: true, message: 'You are already unsubscribed.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await db
      .update(newsletterSubscribers)
      .set({
        status: 'unsubscribed',
        unsubscribedAt: new Date().toISOString(),
      })
      .where(eq(newsletterSubscribers.id, targetSubscriber.id))
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'You have been successfully unsubscribed from the Desi Alternatives Dispatch.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Newsletter unsubscribe error:', err);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred while unsubscribing' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
