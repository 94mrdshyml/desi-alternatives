import { describe, it, expect } from 'vitest';
import {
  sendOtpEmail,
  sendWelcomeEmail,
  sendNewsletterWelcomeEmail,
  interpolateTemplate,
  sanitizeEmailHtml,
} from '@/lib/server/email';

describe('React Email & Resend OTP Dispatcher', () => {
  it('renders React Email template and falls back cleanly in dev mode when API key is omitted', async () => {
    const result = await sendOtpEmail({
      to: 'founder@signoz.io',
      otp: '849201',
      type: 'sign-in',
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe('dev-mock-id');
  });

  it('handles 6-digit numeric verification code formatting', async () => {
    const result = await sendOtpEmail({
      to: 'developer@appsmith.com',
      otp: '123456',
      type: 'email-verification',
    });

    expect(result.success).toBe(true);
  });

  it('accepts configurable fromName and fromEmail settings', async () => {
    const result = await sendOtpEmail({
      to: 'founder@postman.com',
      otp: '992812',
      type: 'sign-in',
      fromName: 'Desi Alternatives Team',
      fromEmail: 'notifications@desialternatives.in',
    });

    expect(result.success).toBe(true);
  });
});

describe('Welcome Email Personalization & Template Interpolation Engine', () => {
  it('interpolates receiver first name with custom fallback', () => {
    const template = 'Hi {{first_name|builder}}, welcome to Bharat stack!';
    
    // When full name provided
    const res1 = interpolateTemplate(template, { name: 'Karan Patel' });
    expect(res1).toBe('Hi Karan, welcome to Bharat stack!');

    // When firstName explicitly provided
    const res2 = interpolateTemplate(template, { firstName: 'Ananya' });
    expect(res2).toBe('Hi Ananya, welcome to Bharat stack!');

    // When name is empty/omitted -> uses fallback "builder"
    const res3 = interpolateTemplate(template, { name: '' });
    expect(res3).toBe('Hi builder, welcome to Bharat stack!');

    // When null
    const res4 = interpolateTemplate(template, { name: null, firstName: null });
    expect(res4).toBe('Hi builder, welcome to Bharat stack!');
  });

  it('interpolates full name and email with fallback values', () => {
    const template = 'Welcome {{name|friend}} ({{email}})!';
    
    const res1 = interpolateTemplate(template, { name: 'Rohan Sharma', email: 'rohan@example.com' });
    expect(res1).toBe('Welcome Rohan Sharma (rohan@example.com)!');

    const res2 = interpolateTemplate(template, { name: '', email: 'guest@example.com' });
    expect(res2).toBe('Welcome friend (guest@example.com)!');
  });

  it('handles standard {{first_name}} and {{name}} without explicit fallback by defaulting to "there"', () => {
    const template = 'Hello {{first_name}}, welcome to {{name}} club.';
    
    const res = interpolateTemplate(template, { name: '' });
    expect(res).toBe('Hello there, welcome to there club.');
  });

  it('dispatches registration welcome email cleanly in mock mode', async () => {
    const result = await sendWelcomeEmail({
      to: 'cto@scaleup.in',
      name: 'Vikram Sethi',
      fromName: 'Desi Alternatives',
      fromEmail: 'team@letter.mrdshyml.xyz',
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe('dev-mock-welcome-id');
  });

  it('dispatches newsletter subscription welcome email with unsubscribe token', async () => {
    const result = await sendNewsletterWelcomeEmail({
      to: 'engineer@bengaluru.io',
      name: 'Priya Nair',
      unsubscribeToken: 'sub_tok_abcdef123456',
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe('dev-mock-newsletter-welcome-id');
  });

  it('respects welcomeEnabled=false setting by skipping dispatch', async () => {
    const result = await sendWelcomeEmail({
      to: 'test@example.com',
      name: 'Test User',
      settings: {
        welcomeEnabled: false,
      },
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe('skipped-disabled');
  });

  it('respects newsletterWelcomeEnabled=false setting by skipping dispatch', async () => {
    const result = await sendNewsletterWelcomeEmail({
      to: 'test@example.com',
      name: 'Test User',
      settings: {
        newsletterWelcomeEnabled: false,
      },
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe('skipped-disabled');
  });
});

describe('Email HTML Normalizer & Sanitizer', () => {
  it('strips external editor data attributes and rogue font-size inline styles', () => {
    const dirtyHtml = `<p data-path-to-node="1">Hi {{first_name|there}} 👋,</p><p data-path-to-node="2"><span style="font-size: 0.875rem;">Here is what you can dive into right away:&nbsp;</span></p><ol><li>🛠️ <span data-path-to-node="3" data-index-in-node="47">Explore homegrown tools:</span> Local apps</li></ol><p></p><p data-path-to-node="4"><span style="font-size: 0.875rem;">Got a question?</span></p>`;

    const clean = sanitizeEmailHtml(dirtyHtml);

    expect(clean).not.toContain('data-path-to-node');
    expect(clean).not.toContain('data-index-in-node');
    expect(clean).not.toContain('font-size: 0.875rem');
    expect(clean).not.toContain('<p></p>');
    expect(clean).toContain('🛠️ Explore homegrown tools:');
  });

  it('preserves valid semantic HTML structure and headings', () => {
    const html = `<h2>Welcome</h2><p><strong>Bold text</strong> and <em>italic</em>.</p><ul><li>Item 1</li><li>Item 2</li></ul>`;
    const clean = sanitizeEmailHtml(html);

    expect(clean).toBe(html);
  });
});

describe('Umami Tracking Pixel Email Integration', () => {
  it('passes pixelUrl when emailPixelTrackingEnabled and umamiPixelEnabled are active', async () => {
    const result = await sendWelcomeEmail({
      to: 'founder@desi.io',
      name: 'Rohan Verma',
      settings: {
        welcomeEnabled: true,
        umamiPixelEnabled: true,
        umamiPixelUrl: 'https://cloud.umami.is/api/pixel/12345678-abcd-ef01-2345-6789abcdef01',
        emailPixelTrackingEnabled: true,
      },
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe('dev-mock-welcome-id');
  });

  it('passes pixelUrl to newsletter welcome dispatch when enabled', async () => {
    const result = await sendNewsletterWelcomeEmail({
      to: 'reader@tech.in',
      name: 'Simran Kaur',
      settings: {
        newsletterWelcomeEnabled: true,
        umamiPixelEnabled: true,
        umamiPixelUrl: 'https://cloud.umami.is/api/pixel/98765432-dcba-10fe-5432-10fedcba9876',
        emailPixelTrackingEnabled: true,
      },
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe('dev-mock-newsletter-welcome-id');
  });
});

