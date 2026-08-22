import { render } from '@react-email/render';
import * as React from 'react';
import { OtpVerificationEmail } from '@/emails/OtpVerificationEmail';

export interface SendOtpEmailParams {
  apiKey?: string;
  to: string;
  otp: string;
  type?: 'sign-in' | 'email-verification' | 'forget-password' | string;
}

export async function sendOtpEmail({
  apiKey,
  to,
  otp,
  type = 'sign-in',
}: SendOtpEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const emailHtml = await render(React.createElement(OtpVerificationEmail, { otp, type }));
    const subject = `${otp} is your Desi Alternatives verification code`;

    // Local dev fallback when Resend API key is omitted
    if (!apiKey) {
      console.log('====================================================');
      console.log(`[AUTH-OTP DEV CONSOLE] To: ${to} | 6-DIGIT CODE: ${otp} | Type: ${type}`);
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
        from: 'Desi Alternatives <auth@desialternatives.in>',
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
