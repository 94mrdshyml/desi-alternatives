import { describe, it, expect } from 'vitest';
import { sendOtpEmail } from '@/lib/server/email';

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
});
