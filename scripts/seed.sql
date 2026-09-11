-- Seed script for Desi Alternatives

INSERT OR IGNORE INTO categories (id, slug, name, emoji, description, is_featured) VALUES ('cat_uR4PlXem1eUopusdrc1bLe9f', 'developer-tools', 'Developer Tools', '⚡', 'World-class developer tools, testing frameworks, and APIs engineered by Indian builders for global scale.', 1);
INSERT OR IGNORE INTO categories (id, slug, name, emoji, description, is_featured) VALUES ('cat_O7TNwhLddqmqecVf3v31qklj', 'observability', 'Observability & APM', '📊', 'Unified APM and observability platforms to monitor uptime and troubleshoot infrastructure without the massive USD markup.', 1);
INSERT OR IGNORE INTO categories (id, slug, name, emoji, description, is_featured) VALUES ('cat_FxLL3bJz89HqrQi7dlNCWjdG', 'billing-finance', 'Billing & Finance', '💳', 'GST-ready billing and finance software to automate invoicing, manage subscriptions, and claim input tax credits effortlessly.', 1);
INSERT OR IGNORE INTO categories (id, slug, name, emoji, description, is_featured) VALUES ('cat_mvyOGXYtpqtPSeWFlolsIDhC', 'crm-sales', 'CRM & Marketing', '🎯', 'High-conversion CRM and sales software built to close deals, manage pipelines, and scale Indian revenue teams.', 1);
INSERT OR IGNORE INTO categories (id, slug, name, emoji, description, is_featured) VALUES ('cat_ee1ryRa3MrDBcP7wKeGlJ37I', 'customer-support', 'Customer Support', '💬', 'Omnichannel helpdesk and support tools designed for high-velocity teams, backed by IST-aligned engineering.', 1);
INSERT OR IGNORE INTO categories (id, slug, name, emoji, description, is_featured) VALUES ('cat_i5catYAaHRNlGw0BAW8eMIfT', 'ai-machine-learning', 'AI & Machine Learning', '🧠', 'Powerful AI and machine learning models built for the Indian context, from vernacular LLMs to enterprise automation.', 1);
INSERT OR IGNORE INTO categories (id, slug, name, emoji, description, is_featured) VALUES ('cat_0Cbc7WQDprMG1iiEr0nuaOtR', 'hr-payroll', 'HR & Payroll', '👥', 'Automated HRMS and payroll software that actually understands Indian tax slabs, PF, and local compliance laws.', 0);
INSERT OR IGNORE INTO categories (id, slug, name, emoji, description, is_featured) VALUES ('cat_NMCDz6YP8ggWvFrnj6C8UwDx', 'productivity', 'Productivity & Docs', '✍️', 'Intuitive productivity and project management hubs to keep your startup organized and relentlessly focused on execution.', 0);
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_nnB2hTsUwy4wBgA75H0inJZD', 'datadog', 'Datadog', 'https://datadoghq.com', 'https://logo.clearbit.com/datadoghq.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_0EpbQZzo2WenRCbtjce1IaN4', 'retool', 'Retool', 'https://retool.com', 'https://logo.clearbit.com/retool.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_7AE2tWP5kEzR8ennjc5dKOc5', 'stripe', 'Stripe', 'https://stripe.com', 'https://logo.clearbit.com/stripe.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_IK7as3FCokYDVmuOpOAk9R4I', 'salesforce', 'Salesforce', 'https://salesforce.com', 'https://logo.clearbit.com/salesforce.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_fN5x26FMGM0Xu5aKQDGXR5nB', 'zendesk', 'Zendesk', 'https://zendesk.com', 'https://logo.clearbit.com/zendesk.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_fOs67uHYdoCKJw6gefAc9Tem', 'saucelabs', 'Sauce Labs', 'https://saucelabs.com', 'https://logo.clearbit.com/saucelabs.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_OW7tFHzCYddiRUZ0yNxV0LaD', 'insomnia', 'Insomnia', 'https://insomnia.rest', 'https://logo.clearbit.com/insomnia.rest');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_HvNpqLlN2hDbQSsUKBPLYlXb', 'gusto', 'Gusto', 'https://gusto.com', 'https://logo.clearbit.com/gusto.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_mklvhY9qRiNtOaVK3Hz354NB', 'elevenlabs', 'ElevenLabs', 'https://elevenlabs.io', 'https://logo.clearbit.com/elevenlabs.io');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_fYfXUmmhohM5OC97nzCV6bQa', 'mixpanel', 'Mixpanel', 'https://mixpanel.com', 'https://logo.clearbit.com/mixpanel.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_z1x73KNyLLs5FTDU6McE8jy3', 'twilio', 'Twilio', 'https://twilio.com', 'https://logo.clearbit.com/twilio.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_iOuJGnuH6j178f2oVoUAWs65', 'gitbook', 'GitBook', 'https://gitbook.com', 'https://logo.clearbit.com/gitbook.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_kXcEDYWqJ9a1Qph5K3odq3hl', 'recurly', 'Recurly', 'https://recurly.com', 'https://logo.clearbit.com/recurly.com');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_hEMgbfBjnupkpInBpIdRsXvF', 'signoz', 'SigNoz', 'Open-source APM, Tracing, Logs and Metrics built for scale',
    'Single-pane observability platform based on OpenTelemetry and ClickHouse. Native INR pricing, self-hostable, and zero USD egress surcharges.', 'https://signoz.io', 'https://signoz.io/img/signoz-logo.svg', '#EE6C4D',
    'cat_O7TNwhLddqmqecVf3v31qklj', 1, 1,
    1, 1, 1,
    1, 1, 1,
    'Freemium', 0, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_signoz_datadog', 'gt_nnB2hTsUwy4wBgA75H0inJZD', 'tool_hEMgbfBjnupkpInBpIdRsXvF');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_O87SFmGFDc4kPhZCfsP9rY0z', 'appsmith', 'Appsmith', 'Build internal tools, admin panels, and dashboards in minutes',
    'Open-source low-code internal tool framework with native database integrations, custom JS scripts, and Indian cloud hosting options.', 'https://appsmith.com', 'https://assets.appsmith.com/appsmith-logo.svg', '#F36A4A',
    'cat_uR4PlXem1eUopusdrc1bLe9f', 1, 1,
    1, 1, 1,
    1, 1, 1,
    'Freemium', 0, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_appsmith_retool', 'gt_0EpbQZzo2WenRCbtjce1IaN4', 'tool_O87SFmGFDc4kPhZCfsP9rY0z');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_hcFBwz0vj19hQO73eFOXuzQW', 'postman', 'Postman', 'The complete API platform for building, testing, and designing APIs',
    'Founded in Bengaluru, Postman is the world-leading API collaborative environment with workspace synchronization and mock servers.', 'https://postman.com', 'https://assets.getpostman.com/common-share/postman-logo-stacked.svg', '#FF6C37',
    'cat_uR4PlXem1eUopusdrc1bLe9f', 1, 1,
    1, 1, 0,
    1, 0, 1,
    'Freemium', 1200, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_postman_insomnia', 'gt_OW7tFHzCYddiRUZ0yNxV0LaD', 'tool_hcFBwz0vj19hQO73eFOXuzQW');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_wzCTuVA7OYcu6byWPzkckzRb', 'browserstack', 'BrowserStack', 'Instant cross-browser and mobile device testing platform in the cloud',
    'Test websites and mobile apps across 3,000+ real browsers and devices with high speed, zero maintenance, and local Indian billing.', 'https://browserstack.com', 'https://static.browserstack.com/images/browserstack-logo-600x600.png', '#0052CC',
    'cat_uR4PlXem1eUopusdrc1bLe9f', 1, 1,
    1, 1, 0,
    1, 0, 1,
    'Paid', 2400, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_browserstack_saucelabs', 'gt_fOs67uHYdoCKJw6gefAc9Tem', 'tool_wzCTuVA7OYcu6byWPzkckzRb');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_CNEUYfVnaKcN3Wxf9Y2Gl7mU', 'chargebee', 'Chargebee', 'Subscription management and recurring billing infrastructure',
    'Manage complex recurring SaaS subscriptions, automated dunning, GST invoices, and global tax compliance originating from Chennai.', 'https://chargebee.com', 'https://webstatic.chargebee.com/assets/web/600/images/footer/chargebee-logo-black.svg', '#6C5CE7',
    'cat_FxLL3bJz89HqrQi7dlNCWjdG', 1, 1,
    1, 1, 0,
    1, 0, 1,
    'Freemium', 0, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_chargebee_recurly', 'gt_kXcEDYWqJ9a1Qph5K3odq3hl', 'tool_CNEUYfVnaKcN3Wxf9Y2Gl7mU');
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_chargebee_stripe', 'gt_7AE2tWP5kEzR8ennjc5dKOc5', 'tool_CNEUYfVnaKcN3Wxf9Y2Gl7mU');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_AvxRw5jdXBMhfHwHMJFUpjRn', 'razorpay', 'Razorpay', 'Payments, banking, and financial suite for Indian internet businesses',
    'Accept UPI, Cards, Netbanking, EMI, and Wallets with 99.9% uptime, instant settlements, and comprehensive GST reconciliation.', 'https://razorpay.com', 'https://razorpay.com/assets/razorpay-glyph.svg', '#0C2340',
    'cat_FxLL3bJz89HqrQi7dlNCWjdG', 1, 1,
    1, 1, 0,
    1, 0, 1,
    'Free', 0, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_razorpay_stripe', 'gt_7AE2tWP5kEzR8ennjc5dKOc5', 'tool_AvxRw5jdXBMhfHwHMJFUpjRn');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_NDP22t7rWdnLKzBcCs8YZCa3', 'freshdesk', 'Freshdesk', 'Omnichannel customer support software powered by Freddy AI',
    'Unified ticketing, live chat, telephony, and self-service knowledge base built by Freshworks in Chennai with local INR billing.', 'https://freshdesk.com', 'https://assets.freshdesk.com/skin/freshdesk-logo.svg', '#00A88F',
    'cat_ee1ryRa3MrDBcP7wKeGlJ37I', 1, 1,
    1, 1, 0,
    1, 0, 1,
    'Freemium', 999, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_freshdesk_zendesk', 'gt_fN5x26FMGM0Xu5aKQDGXR5nB', 'tool_NDP22t7rWdnLKzBcCs8YZCa3');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_AJ7NO2lYzObhPuxWEvD54bYI', 'zoho-crm', 'Zoho CRM', 'Supercharge your sales team with 360-degree customer relationship management',
    'Pioneering sovereign CRM software suite with automated lead routing, Zia AI sales assistant, domestic data residency, and GST compliance.', 'https://zoho.com/crm', 'https://www.zohowebstatic.com/sites/zweb/images/common/zoho-logo-web.svg', '#ED1C24',
    'cat_mvyOGXYtpqtPSeWFlolsIDhC', 1, 1,
    1, 1, 0,
    1, 0, 1,
    'Freemium', 800, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_zoho-crm_salesforce', 'gt_IK7as3FCokYDVmuOpOAk9R4I', 'tool_AJ7NO2lYzObhPuxWEvD54bYI');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_ucMyIfS3z4iCrjIMWxJ1AWd5', 'murf-ai', 'Murf AI', 'Studio-quality realistic AI voiceovers and text-to-speech engine',
    'Generate hyper-realistic synthetic voices in multiple Indian accents and international languages for videos, podcasts, and e-learning.', 'https://murf.ai', 'https://murf.ai/static/media/logo.3c6e9ec1.svg', '#6366F1',
    'cat_i5catYAaHRNlGw0BAW8eMIfT', 1, 1,
    1, 1, 0,
    1, 0, 1,
    'Freemium', 1500, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_murf-ai_elevenlabs', 'gt_mklvhY9qRiNtOaVK3Hz354NB', 'tool_ucMyIfS3z4iCrjIMWxJ1AWd5');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_eoQkURSdnYUrAo1x8dFC2T0k', 'clevertap', 'CleverTap', 'All-in-one customer engagement and retention platform for mobile apps',
    'Real-time user behavioral analytics, predictive segmentation, omnichannel push notifications, and lifecycle automation.', 'https://clevertap.com', 'https://clevertap.com/wp-content/themes/clevertap/assets/images/logo.svg', '#D81B60',
    'cat_mvyOGXYtpqtPSeWFlolsIDhC', 1, 1,
    1, 1, 0,
    1, 0, 0,
    'Paid', 5000, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_clevertap_mixpanel', 'gt_fYfXUmmhohM5OC97nzCV6bQa', 'tool_eoQkURSdnYUrAo1x8dFC2T0k');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_RmPvKcJDoHWKdy3BWcX0cLLt', 'keka', 'Keka HR', 'Modern HR, Payroll, Leave, and Performance Management for Indian teams',
    'Automated statutory PF, ESI, TDS, PT tax calculations, geofenced attendance, and employee self-service portal.', 'https://keka.com', 'https://cdn.keka.com/brand/keka-logo-blue.svg', '#2563EB',
    'cat_0Cbc7WQDprMG1iiEr0nuaOtR', 1, 1,
    1, 1, 0,
    1, 0, 0,
    'Paid', 6999, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_keka_gusto', 'gt_HvNpqLlN2hDbQSsUKBPLYlXb', 'tool_RmPvKcJDoHWKdy3BWcX0cLLt');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_qOy3OUxbUs5xsaiKTnZlyigP', 'document360', 'Document360', 'Knowledge base platform for technical documentation and SOPs',
    'Create private and public knowledge bases, product documentation, and API guides with markdown editor and version control.', 'https://document360.com', 'https://document360.com/wp-content/themes/document360/images/document360-logo.svg', '#4F46E5',
    'cat_NMCDz6YP8ggWvFrnj6C8UwDx', 1, 1,
    1, 1, 0,
    1, 0, 1,
    'Freemium', 3000, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_document360_gitbook', 'gt_iOuJGnuH6j178f2oVoUAWs65', 'tool_qOy3OUxbUs5xsaiKTnZlyigP');
