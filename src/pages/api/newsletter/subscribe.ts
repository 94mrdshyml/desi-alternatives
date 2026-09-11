import type { APIRoute } from 'astro';
import { newsletterSubscribers, users, siteSettings, type NewsletterSource } from '@/lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';
import { sendNewsletterWelcomeEmail } from '@/lib/server/email';

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nanoid32 = customAlphabet(alphabet, 32);

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
    const body = (await request.json()) as any;
    const emailRaw = body?.email;
    const nameRaw = body?.name;
    const sourceRaw = body?.source;

    if (!emailRaw || typeof emailRaw !== 'string') {
      return new Response(JSON.stringify({ error: 'Valid email address is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const email = emailRaw.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const validSources: NewsletterSource[] = ['registration', 'profile', 'newsletter_page'];
    const source: NewsletterSource = validSources.includes(sourceRaw) ? sourceRaw : 'newsletter_page';
    const name = nameRaw && typeof nameRaw === 'string' ? nameRaw.trim().slice(0, 100) : (user?.name || null);

    // Check if user is linked or find matching registered user by email
    let linkedUserId = user?.id || null;
    if (!linkedUserId) {
      try {
        const matchingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).get();
        if (matchingUser) {
          linkedUserId = matchingUser.id;
        }
      } catch (e) {
        // Non-fatal
      }
    }

    const existing = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email))
      .get();

    if (existing) {
      if (existing.status === 'subscribed') {
        // If already subscribed, ensure userId is linked if available
        if (!existing.userId && linkedUserId) {
          await db
            .update(newsletterSubscribers)
            .set({ userId: linkedUserId, name: name || existing.name })
            .where(eq(newsletterSubscribers.id, existing.id))
            .run();
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: 'You are already subscribed to the Dispatch!',
            subscriber: {
              email: existing.email,
              status: existing.status,
              source: existing.source,
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Reactivate unsubscribed subscriber
      await db
        .update(newsletterSubscribers)
        .set({
          status: 'subscribed',
          source: source,
          name: name || existing.name,
          userId: linkedUserId || existing.userId,
          unsubscribedAt: null,
          subscribedAt: new Date().toISOString(),
        })
        .where(eq(newsletterSubscribers.id, existing.id))
        .run();

      // Dispatch Newsletter Welcome Email (non-blocking)
      try {
        let settings: any = null;
        try {
          settings = await db.select().from(siteSettings).where(eq(siteSettings.id, 'general')).get();
        } catch {}

        const resendApiKey = (locals as any).runtime?.env?.RESEND_API_KEY;
        await sendNewsletterWelcomeEmail({
          apiKey: resendApiKey,
          to: email,
          name: name || existing.name,
          unsubscribeToken: existing.token,
          settings,
        });
      } catch (e) {
        console.error('Failed to send newsletter welcome email upon reactivation:', e);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.',
          reactivated: true,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // New subscription
    const token = `sub_${nanoid32()}`;
    await db
      .insert(newsletterSubscribers)
      .values({
        email,
        name,
        userId: linkedUserId,
        source,
        status: 'subscribed',
        token,
        subscribedAt: new Date().toISOString(),
      })
      .run();

    // Dispatch Newsletter Welcome Email (non-blocking)
    try {
      let settings: any = null;
      try {
        settings = await db.select().from(siteSettings).where(eq(siteSettings.id, 'general')).get();
      } catch {}

      const resendApiKey = (locals as any).runtime?.env?.RESEND_API_KEY;
      await sendNewsletterWelcomeEmail({
        apiKey: resendApiKey,
        to: email,
        name,
        unsubscribeToken: token,
        settings,
      });
    } catch (e) {
      console.error('Failed to send newsletter welcome email:', e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Welcome aboard! You are now subscribed to the Desi Alternatives Dispatch.',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Newsletter subscribe error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'An unexpected error occurred while subscribing' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
