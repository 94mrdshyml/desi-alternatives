import { render } from '@react-email/render';
import * as React from 'react';
import { OtpVerificationEmail } from '@/emails/OtpVerificationEmail';
import { WelcomeEmail } from '@/emails/WelcomeEmail';

export interface SendOtpEmailParams {
  apiKey?: string;
  to: string;
  otp: string;
  type?: 'sign-in' | 'email-verification' | 'forget-password' | string;
  fromName?: string;
  fromEmail?: string;
}

export interface WelcomeEmailSettings {
  fromName?: string;
  fromEmail?: string;
  welcomeEnabled?: boolean;
  welcomeSubject?: string;
  welcomeBody?: string;
  newsletterWelcomeEnabled?: boolean;
  newsletterWelcomeSubject?: string;
  newsletterWelcomeBody?: string;
}

export interface SendWelcomeEmailParams {
  apiKey?: string;
  to: string;
  name?: string | null;
  firstName?: string | null;
  fromName?: string;
  fromEmail?: string;
  settings?: WelcomeEmailSettings;
  overrideSubject?: string;
  overrideBody?: string;
}

export interface SendNewsletterWelcomeEmailParams {
  apiKey?: string;
  to: string;
  name?: string | null;
  firstName?: string | null;
  unsubscribeToken?: string;
  fromName?: string;
  fromEmail?: string;
  settings?: WelcomeEmailSettings;
  overrideSubject?: string;
  overrideBody?: string;
}

/**
 * Interpolates template variables with support for fallbacks:
 * - {{first_name|fallback}} (e.g. {{first_name|there}}, {{first_name|builder}})
 * - {{name|fallback}} (e.g. {{name|subscriber}})
 * - {{first_name}}
 * - {{name}}
 * - {{email}}
 */
export function interpolateTemplate(
  template: string,
  vars: { name?: string | null; firstName?: string | null; email?: string }
): string {
  if (!template) return '';

  const rawName = (vars.name || '').trim();
  const rawFirstName = (vars.firstName || (rawName ? rawName.split(/\s+/)[0] : '')).trim();
  const email = (vars.email || '').trim();

  // Replace {{first_name|fallback}} and {{name|fallback}} with optional whitespace
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)(?:\s*\|\s*([^}]+?))?\s*\}\}/g, (_, key, fallback) => {
    const normKey = key.toLowerCase();
    const cleanFallback = fallback !== undefined ? fallback.trim() : '';

    if (normKey === 'first_name' || normKey === 'firstname') {
      return rawFirstName || cleanFallback || 'there';
    }

    if (normKey === 'name' || normKey === 'full_name' || normKey === 'fullname') {
      return rawName || cleanFallback || (rawFirstName || 'there');
    }

    if (normKey === 'email') {
      return email || cleanFallback;
    }

    // Unrecognized variable
    return cleanFallback || '';
  });
}

/**
 * Send OTP Verification Email
 */
export async function sendOtpEmail({
  apiKey,
  to,
  otp,
  type = 'sign-in',
  fromName = 'Desi Alternatives',
  fromEmail = 'team@letter.mrdshyml.xyz',
}: SendOtpEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const emailHtml = await render(React.createElement(OtpVerificationEmail, { otp, type }));
    const subject = `${otp} is your Desi Alternatives verification code`;

    // Local dev fallback when Resend API key is omitted
    if (!apiKey) {
      console.log('====================================================');
      console.log(`[AUTH-OTP DEV CONSOLE] To: ${to} | 6-DIGIT CODE: ${otp} | Sender: ${fromName} <${fromEmail}>`);
      console.log('====================================================');
      return { success: true, id: 'dev-mock-id' };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [to],
        subject,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errData = (await response.json()) as any;
      console.error('Resend API error dispatching email:', errData);
      return { success: false, error: errData.message || `HTTP ${response.status}` };
    }

    const data = (await response.json()) as any;
    return { success: true, id: data.id };
  } catch (err: any) {
    console.error('Failed to send OTP email via Resend:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send User Registration Welcome Email
 */
export async function sendWelcomeEmail({
  apiKey,
  to,
  name,
  firstName,
  fromName = 'Desi Alternatives',
  fromEmail = 'team@letter.mrdshyml.xyz',
  settings,
  overrideSubject,
  overrideBody,
}: SendWelcomeEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    if (settings && settings.welcomeEnabled === false && !overrideSubject) {
      return { success: true, id: 'skipped-disabled' };
    }

    const senderName = settings?.fromName || fromName;
    const senderEmail = settings?.fromEmail || fromEmail;

    const rawSubject =
      overrideSubject ||
      settings?.welcomeSubject ||
      'Welcome to Desi Alternatives, {{first_name|builder}}! 🇮🇳';

    const rawBody =
      overrideBody ||
      settings?.welcomeBody ||
      `Hi {{first_name|there}},

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

    const vars = { name, firstName, email: to };
    const subject = interpolateTemplate(rawSubject, vars);
    const body = interpolateTemplate(rawBody, vars);

    const emailHtml = await render(
      React.createElement(WelcomeEmail, {
        subject,
        body,
        type: 'welcome',
        ctaText: 'Explore Sovereign Directory',
        ctaUrl: 'https://desialternatives.in',
      })
    );

    // Local dev console log
    if (!apiKey) {
      console.log('====================================================');
      console.log(`[WELCOME EMAIL DEV CONSOLE] To: ${to} | Subject: "${subject}" | Sender: ${senderName} <${senderEmail}>`);
      console.log('====================================================');
      return { success: true, id: 'dev-mock-welcome-id' };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${senderName} <${senderEmail}>`,
        to: [to],
        subject,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errData = (await response.json()) as any;
      console.error('Resend API error dispatching welcome email:', errData);
      return { success: false, error: errData.message || `HTTP ${response.status}` };
    }

    const data = (await response.json()) as any;
    return { success: true, id: data.id };
  } catch (err: any) {
    console.error('Failed to send welcome email via Resend:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send Newsletter Subscription Welcome Email
 */
export async function sendNewsletterWelcomeEmail({
  apiKey,
  to,
  name,
  firstName,
  unsubscribeToken,
  fromName = 'Desi Alternatives',
  fromEmail = 'team@letter.mrdshyml.xyz',
  settings,
  overrideSubject,
  overrideBody,
}: SendNewsletterWelcomeEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    if (settings && settings.newsletterWelcomeEnabled === false && !overrideSubject) {
      return { success: true, id: 'skipped-disabled' };
    }

    const senderName = settings?.fromName || fromName;
    const senderEmail = settings?.fromEmail || fromEmail;

    const rawSubject =
      overrideSubject ||
      settings?.newsletterWelcomeSubject ||
      'Welcome to Desi Alternatives Dispatch, {{first_name|there}}! 📬';

    const rawBody =
      overrideBody ||
      settings?.newsletterWelcomeBody ||
      `Hi {{first_name|there}},

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

    const vars = { name, firstName, email: to };
    const subject = interpolateTemplate(rawSubject, vars);
    const body = interpolateTemplate(rawBody, vars);

    const unsubscribeUrl = unsubscribeToken
      ? `https://desialternatives.in/unsubscribe?token=${unsubscribeToken}`
      : 'https://desialternatives.in/unsubscribe';

    const emailHtml = await render(
      React.createElement(WelcomeEmail, {
        subject,
        body,
        type: 'newsletter_welcome',
        ctaText: 'Browse Latest Dispatches',
        ctaUrl: 'https://desialternatives.in/newsletter',
        unsubscribeUrl,
      })
    );

    // Local dev console log
    if (!apiKey) {
      console.log('====================================================');
      console.log(`[NEWSLETTER WELCOME DEV CONSOLE] To: ${to} | Subject: "${subject}" | Sender: ${senderName} <${senderEmail}>`);
      console.log('====================================================');
      return { success: true, id: 'dev-mock-newsletter-welcome-id' };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${senderName} <${senderEmail}>`,
        to: [to],
        subject,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errData = (await response.json()) as any;
      console.error('Resend API error dispatching newsletter welcome email:', errData);
      return { success: false, error: errData.message || `HTTP ${response.status}` };
    }

    const data = (await response.json()) as any;
    return { success: true, id: data.id };
  } catch (err: any) {
    console.error('Failed to send newsletter welcome email via Resend:', err);
    return { success: false, error: err.message };
  }
}
