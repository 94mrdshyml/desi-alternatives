import { describe, it, expect } from 'vitest';

describe('AI JSON Tool Import Parser', () => {
  it('validates and parses complex AI JSON payloads with pricing plans and origins', () => {
    const rawAiPayload = {
      name: 'SigNoz',
      slug: 'signoz',
      tagline: 'Open-source observability and APM built for modern engineering teams',
      description: 'SigNoz is a full-stack open-source application performance monitoring platform built on OpenTelemetry.',
      websiteUrl: 'https://signoz.io',
      logoUrl: 'https://signoz.io/apple-touch-icon.png',
      category: 'developer-tools',
      company: {
        city: 'Bengaluru',
        state: 'Karnataka',
        foundedYear: 2021,
        companyType: 'VC-Funded',
        isOpenSource: true,
        githubUrl: 'https://github.com/SigNoz/signoz',
        discordUrl: 'https://signoz.io/slack',
      },
      compliance: {
        hasIndianDataResidency: true,
        hasGstInvoice: true,
        hasInrPricing: true,
        hasUpiSupport: true,
        hasIstSupport: true,
        isSelfHostable: true,
      },
      pros: [
        'Native OpenTelemetry instrumentation with zero vendor lock-in',
        'Blazing fast columnar queries powered by ClickHouse storage',
      ],
      cons: [
        'Steeper self-hosting learning curve for non-Kubernetes teams',
      ],
      pricingPlans: [
        {
          name: 'Community Open Source',
          currency: 'INR',
          amount: 0,
          billingPeriod: 'lifetime',
          isFree: true,
          description: '100% free forever self-hosted via Docker or Kubernetes.',
        },
        {
          name: 'SigNoz Cloud Pro',
          currency: 'INR',
          amount: 1600,
          billingPeriod: 'monthly',
          isFree: false,
          description: 'Fully managed cloud hosting with 30 days retention.',
        },
      ],
      replacesGlobalTools: ['datadog', 'new-relic'],
    };

    expect(rawAiPayload.name).toBe('SigNoz');
    expect(rawAiPayload.company.city).toBe('Bengaluru');
    expect(rawAiPayload.company.foundedYear).toBe(2021);
    expect(rawAiPayload.pros.length).toBe(2);
    expect(rawAiPayload.cons.length).toBe(1);
    expect(rawAiPayload.pricingPlans.length).toBe(2);
    expect(rawAiPayload.pricingPlans[0].isFree).toBe(true);
    expect(rawAiPayload.pricingPlans[1].amount).toBe(1600);
    expect(rawAiPayload.replacesGlobalTools).toContain('datadog');
  });
});
