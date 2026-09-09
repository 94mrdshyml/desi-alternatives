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

  it('validates and parses Global Giant AI JSON payloads with USD plans, pros/cons, and company metadata', () => {
    const rawGlobalTool = {
      name: 'Datadog',
      slug: 'datadog',
      tagline: 'Cloud-scale monitoring, APM, and observability platform',
      description: 'Datadog is an observability service for cloud-scale applications...',
      websiteUrl: 'https://www.datadoghq.com',
      logoUrl: 'https://img.logo.dev/datadoghq.com?token=pk_anonymous',
      category: 'developer-tools',
      company: {
        country: 'United States',
        city: 'New York',
        foundedYear: 2010,
        companyType: 'Public Ltd',
        isOpenSource: false,
        githubUrl: 'https://github.com/DataDog',
        discordUrl: '',
      },
      pros: [
        'Extensive ecosystem with 600+ out-of-the-box integrations',
        'Sophisticated distributed tracing and APM dashboarding',
      ],
      cons: [
        'Notoriously steep and unpredictable usage-based billing spikes',
        'No 18% GST input tax credit for registered Indian entities',
      ],
      foreignPainPoints: [
        'Recurring credit card auto-debit mandate failures in India',
        'Lack of Indian Rupee (INR) / UPI direct payment support',
      ],
      pricing: {
        startingPriceUsd: 15,
        plans: [
          {
            name: 'Free Tier',
            currency: 'USD',
            amount: 0,
            billingPeriod: 'monthly',
            isFree: true,
            description: 'Core metric collection up to 5 hosts with 1-day retention.',
          },
          {
            name: 'Pro',
            currency: 'USD',
            amount: 15,
            billingPeriod: 'monthly',
            isFree: false,
            description: 'Per host/month with over 500 integrations and 15-month retention.',
          },
        ],
      },
      socialProfiles: {
        twitter: 'datadoghq',
        linkedin: 'https://www.linkedin.com/company/datadog',
        youtube: 'https://www.youtube.com/@DatadogHQ',
        facebook: 'https://www.facebook.com/datadoghq',
        instagram: 'datadoghq',
      },
    };

    expect(rawGlobalTool.name).toBe('Datadog');
    expect(rawGlobalTool.company.country).toBe('United States');
    expect(rawGlobalTool.company.city).toBe('New York');
    expect(rawGlobalTool.company.foundedYear).toBe(2010);
    expect(rawGlobalTool.pros.length).toBe(2);
    expect(rawGlobalTool.cons.length).toBe(2);
    expect(rawGlobalTool.foreignPainPoints.length).toBe(2);
    expect(rawGlobalTool.pricing.startingPriceUsd).toBe(15);
    expect(rawGlobalTool.pricing.plans.length).toBe(2);
    expect(rawGlobalTool.socialProfiles.twitter).toBe('datadoghq');
  });
});

