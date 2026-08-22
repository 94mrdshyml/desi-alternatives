import type { APIRoute } from 'astro';
import { sendOtpEmail } from '@/lib/server/email';
import { siteSettings } from '@/lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  const user = locals.user;
  const env = locals.runtime?.env;

  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as any;
    const testRecipient = String(body?.recipient || user.email || '').trim();

    if (!testRecipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testRecipient)) {
      return new Response(JSON.stringify({ error: 'Please provide a valid recipient email address.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let fromName = 'Desi Alternatives';
    let fromEmail = 'auth@desialternatives.in';

    if (db) {
      try {
        const settings = await db.select().from(siteSettings).where(eq(siteSettings.id, 'general')).get();
        if (settings?.fromName) fromName = settings.fromName;
        if (settings?.fromEmail) fromEmail = settings.fromEmail;
      } catch {}
    }

    const apiKey = env?.RESEND_API_KEY || (import.meta as any).env?.RESEND_API_KEY || (globalThis as any).process?.env?.RESEND_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'RESEND_API_KEY environment variable is not configured on Cloudflare or in .env',
          devFallback: true,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const result = await sendOtpEmail({
      apiKey,
      to: testRecipient,
      otp: testOtp,
      type: 'sign-in',
      fromName,
      fromEmail,
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error,
          from: `${fromName} <${fromEmail}>`,
          to: testRecipient,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        id: result.id,
        from: `${fromName} <${fromEmail}>`,
        to: testRecipient,
        message: `Test email successfully dispatched via Resend! (Resend Email ID: ${result.id})`,
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
