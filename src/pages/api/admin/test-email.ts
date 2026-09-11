import type { APIRoute } from 'astro';
import { sendOtpEmail, sendWelcomeEmail, sendNewsletterWelcomeEmail } from '@/lib/server/email';
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
    const testRecipient = String(body?.toEmail || body?.recipient || user.email || '').trim();
    const emailType = body?.type || 'otp'; // 'otp' | 'welcome' | 'newsletter_welcome'
    const testName = String(body?.testName || user.name || 'Karan Patel').trim();
    const overrideSubject = body?.overrideSubject ? String(body.overrideSubject) : undefined;
    const overrideBody = body?.overrideBody ? String(body.overrideBody) : undefined;

    if (!testRecipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testRecipient)) {
      return new Response(JSON.stringify({ error: 'Please provide a valid recipient email address.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let settings: any = null;
    let fromName = 'Desi Alternatives';
    let fromEmail = 'team@letter.mrdshyml.xyz';

    if (db) {
      try {
        settings = await db.select().from(siteSettings).where(eq(siteSettings.id, 'general')).get();
        if (settings?.fromName) fromName = settings.fromName;
        if (settings?.fromEmail) fromEmail = settings.fromEmail;
      } catch {}
    }

    const apiKey = env?.RESEND_API_KEY || (import.meta as any).env?.RESEND_API_KEY || (globalThis as any).process?.env?.RESEND_API_KEY;

    let result: { success: boolean; id?: string; error?: string };

    if (emailType === 'welcome') {
      result = await sendWelcomeEmail({
        apiKey,
        to: testRecipient,
        name: testName,
        fromName,
        fromEmail,
        settings,
        overrideSubject,
        overrideBody,
      });
    } else if (emailType === 'newsletter_welcome') {
      result = await sendNewsletterWelcomeEmail({
        apiKey,
        to: testRecipient,
        name: testName,
        fromName,
        fromEmail,
        unsubscribeToken: 'test_token_123',
        settings,
        overrideSubject,
        overrideBody,
      });
    } else {
      // Default: OTP
      const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
      result = await sendOtpEmail({
        apiKey,
        to: testRecipient,
        otp: testOtp,
        type: 'sign-in',
        fromName,
        fromEmail,
      });
    }

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error,
          from: `${fromName} <${fromEmail}>`,
          to: testRecipient,
          type: emailType,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const typeLabels: Record<string, string> = {
      otp: 'Verification OTP code',
      welcome: 'Registration welcome email',
      newsletter_welcome: 'Newsletter welcome email',
    };

    return new Response(
      JSON.stringify({
        success: true,
        id: result.id,
        from: `${fromName} <${fromEmail}>`,
        to: testRecipient,
        type: emailType,
        message: `${typeLabels[emailType] || 'Test email'} successfully dispatched${!apiKey ? ' (Dev console mock)' : ' via Resend'}!`,
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
