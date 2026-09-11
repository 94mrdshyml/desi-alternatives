ALTER TABLE `site_settings` ADD `welcome_enabled` integer DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE `site_settings` ADD `welcome_subject` text DEFAULT 'Welcome to Desi Alternatives, {{first_name|builder}}! 🇮🇳' NOT NULL;
--> statement-breakpoint
ALTER TABLE `site_settings` ADD `welcome_body` text DEFAULT 'Hi {{first_name|there}},

Welcome to Desi Alternatives! We''re thrilled to have you join our sovereign community of founders, CTOs, and developers building the future of Indian tech.

Here is what you can do right now:
• Explore the Sovereign Directory across Developer Tools, Cloud, AI, and Productivity
• Compare Indian SaaS vs Global Giants in our Head-to-Head Comparison Engine
• Submit or Claim your Indian software listing to verify official ownership
• Read in-depth migration teardowns and architecture blueprints in the Tech Journal

Have questions or built a tool you''d like indexed? Simply reply to this email.

Best regards,
The Desi Alternatives Team
https://desialternatives.in' NOT NULL;
--> statement-breakpoint
ALTER TABLE `site_settings` ADD `newsletter_welcome_enabled` integer DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE `site_settings` ADD `newsletter_welcome_subject` text DEFAULT 'Welcome to Desi Alternatives Dispatch, {{first_name|there}}! 📬' NOT NULL;
--> statement-breakpoint
ALTER TABLE `site_settings` ADD `newsletter_welcome_body` text DEFAULT 'Hi {{first_name|there}},

Thanks for subscribing to the Desi Alternatives Dispatch!

Every Thursday morning, we deliver curated intelligence directly to your inbox:
• Sovereign SaaS Radar: Hidden gems and high-performing Indian software
• Cost Teardowns: Real case studies on cutting foreign cloud bills
• Migration Blueprints: Step-by-step guides for moving off global monopolies
• Compliance Guides: Navigating Indian data residency, 18% GST invoices, and DPDP rules

Look out for our next dispatch in your inbox this Thursday!

Warmly,
The Dispatch Editorial Team
https://desialternatives.in/newsletter' NOT NULL;
