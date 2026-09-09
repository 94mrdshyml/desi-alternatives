import { describe, it, expect } from 'vitest';
import {
  newsletterSources,
  newsletterStatuses,
  newsletterSubscribers,
  type NewsletterSource,
  type NewsletterStatus,
} from '@/lib/server/db/schema';
import { createNewsletterSubscriberId } from '@/lib/server/id';

describe('Newsletter Domain & Schema', () => {
  it('defines valid newsletter sources and statuses', () => {
    expect(newsletterSources).toContain('registration');
    expect(newsletterSources).toContain('profile');
    expect(newsletterSources).toContain('newsletter_page');
    expect(newsletterSources.length).toBe(3);

    expect(newsletterStatuses).toContain('subscribed');
    expect(newsletterStatuses).toContain('unsubscribed');
  });

  it('generates secure prefixed IDs for newsletter subscribers', () => {
    const id = createNewsletterSubscriberId();
    expect(id.startsWith('sub_')).toBe(true);
    expect(id.length).toBe(4 + 24);
  });

  it('validates newsletter subscriber schema columns', () => {
    expect(newsletterSubscribers.id).toBeDefined();
    expect(newsletterSubscribers.email).toBeDefined();
    expect(newsletterSubscribers.source).toBeDefined();
    expect(newsletterSubscribers.status).toBeDefined();
    expect(newsletterSubscribers.token).toBeDefined();
    expect(newsletterSubscribers.subscribedAt).toBeDefined();
  });

  it('handles source normalization and defaults', () => {
    const validSources: NewsletterSource[] = ['registration', 'profile', 'newsletter_page'];
    
    function normalizeSource(input: string | undefined): NewsletterSource {
      if (input && validSources.includes(input as NewsletterSource)) {
        return input as NewsletterSource;
      }
      return 'newsletter_page';
    }

    expect(normalizeSource('registration')).toBe('registration');
    expect(normalizeSource('profile')).toBe('profile');
    expect(normalizeSource('newsletter_page')).toBe('newsletter_page');
    expect(normalizeSource('unknown_source')).toBe('newsletter_page');
    expect(normalizeSource(undefined)).toBe('newsletter_page');
  });

  it('validates email format regex accurately', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test('vikram@bharat.in')).toBe(true);
    expect(emailRegex.test('cto@scaleup.co.in')).toBe(true);
    expect(emailRegex.test('invalid-email')).toBe(false);
    expect(emailRegex.test('user@domain')).toBe(false);
    expect(emailRegex.test('@missinguser.com')).toBe(false);
  });
});
