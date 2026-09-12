import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { sanitizeEmailHtml } from '@/lib/email-utils';

interface WelcomeEmailProps {
  subject: string;
  body: string;
  type?: 'welcome' | 'newsletter_welcome';
  ctaText?: string;
  ctaUrl?: string;
  unsubscribeUrl?: string;
  pixelUrl?: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  subject = 'Welcome to Desi Alternatives! 🇮🇳',
  body = 'Welcome to the sovereign Indian software movement.',
  type = 'welcome',
  ctaText = type === 'newsletter_welcome' ? 'Browse Latest Dispatches' : 'Explore Sovereign Directory',
  ctaUrl = type === 'newsletter_welcome' ? 'https://desialternatives.in/newsletter' : 'https://desialternatives.in',
  unsubscribeUrl,
  pixelUrl,
}) => {
  const isHtml = /<[a-z][\s\S]*>/i.test(body);
  const cleanBody = isHtml ? sanitizeEmailHtml(body) : body;
  const paragraphs = !isHtml ? cleanBody.split(/\n\n+/).map((p) => p.trim()).filter(Boolean) : [];

  return (
    <Html>
      <Head>
        <style>{`
          .email-content p, .email-content li, .email-content span, .email-content div {
            font-size: 14px !important;
            line-height: 24px !important;
            color: #334155 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          }
          .email-content p {
            margin: 0 0 16px 0 !important;
          }
          .email-content ol, .email-content ul {
            margin: 0 0 16px 0 !important;
            padding-left: 20px !important;
          }
          .email-content li {
            margin: 0 0 8px 0 !important;
          }
          .email-content strong {
            font-weight: 700 !important;
            color: #0f172a !important;
          }
          .email-content a {
            color: #d97706 !important;
            text-decoration: underline !important;
          }
          .email-content h2 {
            font-size: 18px !important;
            line-height: 26px !important;
            font-weight: 700 !important;
            color: #0f172a !important;
            margin: 20px 0 10px 0 !important;
          }
          .email-content h3 {
            font-size: 16px !important;
            line-height: 24px !important;
            font-weight: 700 !important;
            color: #0f172a !important;
            margin: 16px 0 8px 0 !important;
          }
          .email-content blockquote {
            border-left: 3px solid #d97706 !important;
            padding-left: 12px !important;
            color: #64748b !important;
            font-style: italic !important;
            margin: 16px 0 !important;
          }
        `}</style>
      </Head>
      <Preview>{subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Logo */}
          <Section style={headerSection}>
            <Text style={logoText}>
              Desi <span style={logoAccent}>Alternatives</span>
            </Text>
            {type === 'newsletter_welcome' && (
              <Text style={badgeText}>📬 Weekly Dispatch</Text>
            )}
          </Section>

          {/* Main Card */}
          <Section style={card}>
            <Heading style={heading}>{subject}</Heading>

            {/* Render HTML content if WYSIWYG format, otherwise formatted paragraphs */}
            {isHtml ? (
              <div
                className="email-content"
                style={htmlContainer}
                dangerouslySetInnerHTML={{ __html: cleanBody }}
              />
            ) : (
              paragraphs.map((p, idx) => {
                if (p.includes('\n•') || p.startsWith('•')) {
                  const lines = p.split('\n');
                  return (
                    <div key={idx} style={{ marginBottom: '18px' }}>
                      {lines.map((line, lIdx) => (
                        <Text
                          key={lIdx}
                          style={line.startsWith('•') ? bulletItem : paragraph}
                        >
                          {line}
                        </Text>
                      ))}
                    </div>
                  );
                }
                return (
                  <Text key={idx} style={paragraph}>
                    {p}
                  </Text>
                );
              })
            )}

            {/* Action CTA Button */}
            {ctaUrl && ctaText && (
              <Section style={btnContainer}>
                <Button style={button} href={ctaUrl}>
                  {ctaText} →
                </Button>
              </Section>
            )}

            <Hr style={hr} />

            {/* Footer Notes */}
            <Text style={footer}>
              🇮🇳 Desi Alternatives — Sovereign Indian software directory, benchmarks, and blueprints.
            </Text>

            {unsubscribeUrl && (
              <Text style={unsubscribeText}>
                No longer want these updates?{' '}
                <Link href={unsubscribeUrl} style={link}>
                  Unsubscribe with 1-click
                </Link>
                .
              </Text>
            )}

            {/* Invisible Analytics Tracking Pixel (e.g. Umami Pixels) */}
            {pixelUrl && (
              <img
                src={pixelUrl}
                width="1"
                height="1"
                alt=""
                style={{ display: 'none', width: '1px', height: '1px', border: 0, opacity: 0 }}
              />
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

// Styles
const main: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: '40px 0',
};

const container: React.CSSProperties = {
  margin: '0 auto',
  maxWidth: '580px',
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

const badgeText: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '11px',
  fontWeight: '700',
  color: '#92400e',
  backgroundColor: '#fef3c7',
  padding: '2px 8px',
  borderRadius: '6px',
  marginTop: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
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
  margin: '0 0 20px',
  lineHeight: '28px',
};

const htmlContainer: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#334155',
  margin: '0 0 16px',
};

const paragraph: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#334155',
  margin: '0 0 16px',
  whiteSpace: 'pre-line',
};

const bulletItem: React.CSSProperties = {
  fontSize: '13.5px',
  lineHeight: '22px',
  color: '#475569',
  margin: '0 0 6px',
  paddingLeft: '6px',
};

const btnContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '28px 0 24px',
};

const button: React.CSSProperties = {
  backgroundColor: '#d97706',
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '12px 24px',
};

const hr: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '28px 0 18px',
};

const footer: React.CSSProperties = {
  fontSize: '11px',
  lineHeight: '18px',
  color: '#94a3b8',
  textAlign: 'center',
  margin: '0',
};

const unsubscribeText: React.CSSProperties = {
  fontSize: '11px',
  lineHeight: '16px',
  color: '#94a3b8',
  textAlign: 'center',
  margin: '8px 0 0',
};

const link: React.CSSProperties = {
  color: '#d97706',
  textDecoration: 'underline',
};
