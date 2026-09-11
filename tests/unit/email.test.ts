import { describe, it, expect } from 'vitest';
import {
  sendOtpEmail,
  sendWelcomeEmail,
  sendNewsletterWelcomeEmail,
  interpolateTemplate,
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
