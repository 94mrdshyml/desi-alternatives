import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface OtpVerificationEmailProps {
  otp: string;
  type?: 'sign-in' | 'email-verification' | 'forget-password' | string;
}

export const OtpVerificationEmail: React.FC<OtpVerificationEmailProps> = ({
  otp = '123456',
  type = 'sign-in',
}) => {
  const isSignIn = type === 'sign-in' || type === 'email-verification';
  const previewText = `Your Desi Alternatives verification code is ${otp}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Logo */}
          <Section style={headerSection}>
            <Text style={logoText}>
              Desi <span style={logoAccent}>Alternatives</span>
            </Text>
          </Section>

          {/* Main Card */}
          <Section style={card}>
            <Heading style={heading}>
              {isSignIn ? 'Sign in to Desi Alternatives' : 'Verify your email'}
            </Heading>
            <Text style={paragraph}>
              Use the 6-digit verification code below to complete your login. This code is valid for <strong>10 minutes</strong>.
            </Text>

            {/* OTP Code Display */}
            <Section style={codeBox}>
              <Text style={otpText}>{otp}</Text>
            </Section>

            <Text style={subtext}>
              If you didn't request this verification code, you can safely ignore this email.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              Desi Alternatives — Indian Alternatives to Global Giants across Software, Hardware, Games, Newsletters & Tech Services.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OtpVerificationEmail;

// Styles
const main: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: '40px 0',
};

const container: React.CSSProperties = {
  margin: '0 auto',
  maxWidth: '560px',
  padding: '0 20px',
};

const headerSection: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '24px',
};

const logoText: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '800',
  color: '#0f172a',
  letterSpacing: '-0.5px',
  margin: '0',
};

const logoAccent: React.CSSProperties = {
  color: '#d97706',
  fontStyle: 'italic',
};

const card: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '36px 32px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
};

const heading: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 12px',
  textAlign: 'center',
};

const paragraph: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#475569',
  textAlign: 'center',
  margin: '0 0 24px',
};

const codeBox: React.CSSProperties = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fef3c7',
  borderRadius: '12px',
  padding: '16px 24px',
  textAlign: 'center',
  margin: '0 auto 24px',
  maxWidth: '280px',
};

const otpText: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: '32px',
  fontWeight: '800',
  color: '#b45309',
  letterSpacing: '8px',
  margin: '0',
};

const subtext: React.CSSProperties = {
  fontSize: '12px',
  lineHeight: '18px',
  color: '#94a3b8',
  textAlign: 'center',
  margin: '0 0 20px',
};

const hr: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '24px 0 16px',
};

const footer: React.CSSProperties = {
  fontSize: '11px',
  lineHeight: '16px',
  color: '#94a3b8',
  textAlign: 'center',
  margin: '0',
};
