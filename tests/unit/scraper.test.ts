import { describe, it, expect } from 'vitest';
import { parseHtmlMetadata } from '@/lib/server/scraper';

describe('URL Metadata Parser', () => {
  it('extracts og tags and titles correctly', () => {
    const sampleHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SigNoz - Open source APM and Observability | Official</title>
          <meta name="description" content="SigNoz is an open-source APM tool providing metrics, traces and logs." />
          <meta property="og:title" content="SigNoz: The Open Source Datadog Alternative" />
          <meta property="og:description" content="Monitor your applications with open source distributed tracing and metrics." />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        </head>
        <body>
          <h1>SigNoz</h1>
        </body>
      </html>
    `;

    const metadata = parseHtmlMetadata(sampleHtml, 'https://signoz.io');

    expect(metadata.title).toBe('SigNoz: The Open Source Datadog Alternative');
    expect(metadata.description).toBe('Monitor your applications with open source distributed tracing and metrics.');
    expect(metadata.logoUrl).toBe('https://signoz.io/apple-touch-icon.png');
    expect(metadata.primaryColor).toBe('#F59E0B');
  });

  it('falls back gracefully to standard title and favicon generator when og tags are missing', () => {
    const sampleHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hasura GraphQL Engine</title>
        </head>
      </html>
    `;

    const metadata = parseHtmlMetadata(sampleHtml, 'https://hasura.io');

    expect(metadata.title).toBe('Hasura GraphQL Engine');
    expect(metadata.description).toBe('');
    expect(metadata.logoUrl).toBe('https://www.google.com/s2/favicons?domain=hasura.io&sz=128');
  });
});
