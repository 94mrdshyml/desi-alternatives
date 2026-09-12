import type { APIRoute } from 'astro';
import { siteSettings } from '@/lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export const prerender = false;

const DEFAULT_WELCOME_SUBJECT = 'Welcome to Desi Alternatives, {{first_name|builder}}! 🇮🇳';
const DEFAULT_WELCOME_BODY = `Hi {{first_name|there}},

Welcome to Desi Alternatives! We're thrilled to have you join our sovereign community of founders, CTOs, and developers building the future of Indian tech.

Here is what you can do right now:
• Explore the Sovereign Directory across Developer Tools, Cloud, AI, and Productivity
• Compare Indian SaaS vs Global Giants in our Head-to-Head Comparison Engine
• Submit or Claim your Indian software listing to verify official ownership
• Read in-depth migration teardowns and architecture blueprints in the Tech Journal

Have questions or built a tool you'd like indexed? Simply reply to this email.

Best regards,
The Desi Alternatives Team
https://desialternatives.in`;

const DEFAULT_NEWSLETTER_SUBJECT = 'Welcome to Desi Alternatives Dispatch, {{first_name|there}}! 📬';
const DEFAULT_NEWSLETTER_BODY = `Hi {{first_name|there}},

Thanks for subscribing to the Desi Alternatives Dispatch!

Every Thursday morning, we deliver curated intelligence directly to your inbox:
• Sovereign SaaS Radar: Hidden gems and high-performing Indian software
• Cost Teardowns: Real case studies on cutting foreign cloud bills
• Migration Blueprints: Step-by-step guides for moving off global monopolies
• Compliance Guides: Navigating Indian data residency, 18% GST invoices, and DPDP rules

Look out for our next dispatch in your inbox this Thursday!

Warmly,
The Dispatch Editorial Team
https://desialternatives.in/newsletter`;

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
        fromEmail: settings?.fromEmail || 'team@letter.mrdshyml.xyz',
        welcomeEnabled: settings?.welcomeEnabled !== false,
        welcomeSubject: settings?.welcomeSubject || DEFAULT_WELCOME_SUBJECT,
        welcomeBody: settings?.welcomeBody || DEFAULT_WELCOME_BODY,
        newsletterWelcomeEnabled: settings?.newsletterWelcomeEnabled !== false,
        newsletterWelcomeSubject: settings?.newsletterWelcomeSubject || DEFAULT_NEWSLETTER_SUBJECT,
        newsletterWelcomeBody: settings?.newsletterWelcomeBody || DEFAULT_NEWSLETTER_BODY,
        gtmEnabled: settings?.gtmEnabled === true,
        gtmId: settings?.gtmId || '',
        umamiEnabled: settings?.umamiEnabled === true,
        umamiWebsiteId: settings?.umamiWebsiteId || '',
        umamiScriptUrl: settings?.umamiScriptUrl || 'https://cloud.umami.is/script.js',
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
    const fromEmail = String(body?.fromEmail || '').trim() || 'team@letter.mrdshyml.xyz';

    // Simple email validation regex
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail)) {
      return new Response(JSON.stringify({ error: 'Please provide a valid sender email address.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const welcomeEnabled = body?.welcomeEnabled !== false;
    const welcomeSubject = String(body?.welcomeSubject || '').trim() || DEFAULT_WELCOME_SUBJECT;
    const welcomeBody = String(body?.welcomeBody || '').trim() || DEFAULT_WELCOME_BODY;

    const newsletterWelcomeEnabled = body?.newsletterWelcomeEnabled !== false;
    const newsletterWelcomeSubject = String(body?.newsletterWelcomeSubject || '').trim() || DEFAULT_NEWSLETTER_SUBJECT;
    const newsletterWelcomeBody = String(body?.newsletterWelcomeBody || '').trim() || DEFAULT_NEWSLETTER_BODY;

    const gtmEnabled = Boolean(body?.gtmEnabled);
    const gtmId = String(body?.gtmId || '').trim();

    const umamiEnabled = Boolean(body?.umamiEnabled);
    const umamiWebsiteId = String(body?.umamiWebsiteId || '').trim();
    const umamiScriptUrl = String(body?.umamiScriptUrl || '').trim() || 'https://cloud.umami.is/script.js';

    const existing = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, 'general'))
      .get();

    const updatePayload = {
      fromName,
      fromEmail,
      welcomeEnabled,
      welcomeSubject,
      welcomeBody,
      newsletterWelcomeEnabled,
      newsletterWelcomeSubject,
      newsletterWelcomeBody,
      gtmEnabled,
      gtmId: gtmId || null,
      umamiEnabled,
      umamiWebsiteId: umamiWebsiteId || null,
      umamiScriptUrl,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    };

    if (existing) {
      await db
        .update(siteSettings)
        .set(updatePayload)
        .where(eq(siteSettings.id, 'general'));
    } else {
      await db.insert(siteSettings).values({
        id: 'general',
        ...updatePayload,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...updatePayload,
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
