-- Seed script for Desi Alternatives

INSERT OR IGNORE INTO categories (id, slug, name, emoji, description, is_featured) VALUES ('cat_nKRrtncPDDtVHkqte9VDBR0I', 'developer-tools', 'Developer Tools', '⚡', 'Internal tool builders, APIs, testing, and backend infrastructure.', 1);
INSERT OR IGNORE INTO categories (id, slug, name, emoji, description, is_featured) VALUES ('cat_JLCHL2yG4jxpJEKR5v7UjCb7', 'observability', 'Observability & APM', '📊', 'Metrics, logs, traces, and application monitoring platforms.', 1);
INSERT OR IGNORE INTO categories (id, slug, name, emoji, description, is_featured) VALUES ('cat_GgnwH5L6jqd6GyhBAVnJztbL', 'billing-finance', 'Billing & Finance', '💳', 'Payment gateways, subscription billing, and GST accounting.', 1);
INSERT OR IGNORE INTO categories (id, slug, name, emoji, description, is_featured) VALUES ('cat_rZwEuAHnlpCJDPQjuJLEPBZN', 'crm-sales', 'CRM & Marketing', '🎯', 'Customer relations, marketing automation, and lead capture.', 1);
INSERT OR IGNORE INTO categories (id, slug, name, emoji, description, is_featured) VALUES ('cat_IrxD95uJW4deXeC8mLqPHGIe', 'customer-support', 'Customer Support', '💬', 'Helpdesk, ticketing, live chat, and AI customer agents.', 1);
INSERT OR IGNORE INTO categories (id, slug, name, emoji, description, is_featured) VALUES ('cat_WBulCpZSR0wnDA5GWNDQTglT', 'ai-machine-learning', 'AI & Machine Learning', '🧠', 'Indic voice synthesis, sovereign LLMs, and video generation.', 1);
INSERT OR IGNORE INTO categories (id, slug, name, emoji, description, is_featured) VALUES ('cat_do8fkh21KyCnT6BHr97i3N89', 'hr-payroll', 'HR & Payroll', '👥', 'Domestic compliance, payroll calculation, and attendance.', 0);
INSERT OR IGNORE INTO categories (id, slug, name, emoji, description, is_featured) VALUES ('cat_RByboCZiwahKZZMVnkmOzuOa', 'productivity', 'Productivity & Docs', '✍️', 'Knowledge bases, collaboration, and documentation suites.', 0);
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_KmMEesdOcF1PsHDUAhnkGnE8', 'datadog', 'Datadog', 'https://datadoghq.com', 'https://logo.clearbit.com/datadoghq.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_NwTTeQ4q8CU9Y6CvXN0p63C5', 'retool', 'Retool', 'https://retool.com', 'https://logo.clearbit.com/retool.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_E3wgfVaeIISaX4wjmWmuc1l4', 'stripe', 'Stripe', 'https://stripe.com', 'https://logo.clearbit.com/stripe.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_wvU6NazKShKcnU4wwkKGfSXt', 'salesforce', 'Salesforce', 'https://salesforce.com', 'https://logo.clearbit.com/salesforce.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_SquhvcVg55LZKMGBsl2CjN0R', 'zendesk', 'Zendesk', 'https://zendesk.com', 'https://logo.clearbit.com/zendesk.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_hEiE8T3nxkatx8DGrb2Vx8ey', 'saucelabs', 'Sauce Labs', 'https://saucelabs.com', 'https://logo.clearbit.com/saucelabs.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_p59G0yfpzoSspDJUFxzv0B10', 'insomnia', 'Insomnia', 'https://insomnia.rest', 'https://logo.clearbit.com/insomnia.rest');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_tOqPburL7MrK8Y7LCsKHq1hV', 'gusto', 'Gusto', 'https://gusto.com', 'https://logo.clearbit.com/gusto.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_DqbNi48dvjRsb9jtuzVYZlfo', 'elevenlabs', 'ElevenLabs', 'https://elevenlabs.io', 'https://logo.clearbit.com/elevenlabs.io');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_t7BtWqiVfDdU1ZfKqkxT5mAN', 'mixpanel', 'Mixpanel', 'https://mixpanel.com', 'https://logo.clearbit.com/mixpanel.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_VMXbd7j13OyYkBmP5XJciMbI', 'twilio', 'Twilio', 'https://twilio.com', 'https://logo.clearbit.com/twilio.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_7Na81aptmktr91aoeH82ZL5x', 'gitbook', 'GitBook', 'https://gitbook.com', 'https://logo.clearbit.com/gitbook.com');
INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('gt_Mqudo437Ks711dYYsJSZ4B5Y', 'recurly', 'Recurly', 'https://recurly.com', 'https://logo.clearbit.com/recurly.com');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_OuWdXVpxlBGXGOyqwHjGWJ0x', 'signoz', 'SigNoz', 'Open-source APM, Tracing, Logs and Metrics built for scale',
    'Single-pane observability platform based on OpenTelemetry and ClickHouse. Native INR pricing, self-hostable, and zero USD egress surcharges.', 'https://signoz.io', 'https://signoz.io/img/signoz-logo.svg', '#EE6C4D',
    'cat_JLCHL2yG4jxpJEKR5v7UjCb7', 1, 1,
    1, 1, 1,
    1, 1, 1,
    'Freemium', 0, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_signoz_datadog', 'gt_KmMEesdOcF1PsHDUAhnkGnE8', 'tool_OuWdXVpxlBGXGOyqwHjGWJ0x');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_X7wjpl7N9VLxKLW4BCsqUmTS', 'appsmith', 'Appsmith', 'Build internal tools, admin panels, and dashboards in minutes',
    'Open-source low-code internal tool framework with native database integrations, custom JS scripts, and Indian cloud hosting options.', 'https://appsmith.com', 'https://assets.appsmith.com/appsmith-logo.svg', '#F36A4A',
    'cat_nKRrtncPDDtVHkqte9VDBR0I', 1, 1,
    1, 1, 1,
    1, 1, 1,
    'Freemium', 0, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_appsmith_retool', 'gt_NwTTeQ4q8CU9Y6CvXN0p63C5', 'tool_X7wjpl7N9VLxKLW4BCsqUmTS');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_6YgaXB0I5QwkkzYCqsGiPsHC', 'postman', 'Postman', 'The complete API platform for building, testing, and designing APIs',
    'Founded in Bengaluru, Postman is the world-leading API collaborative environment with workspace synchronization and mock servers.', 'https://postman.com', 'https://assets.getpostman.com/common-share/postman-logo-stacked.svg', '#FF6C37',
    'cat_nKRrtncPDDtVHkqte9VDBR0I', 1, 1,
    1, 1, 0,
    1, 0, 1,
    'Freemium', 1200, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_postman_insomnia', 'gt_p59G0yfpzoSspDJUFxzv0B10', 'tool_6YgaXB0I5QwkkzYCqsGiPsHC');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_dapZSgcods2YfaADqeaOLvzp', 'browserstack', 'BrowserStack', 'Instant cross-browser and mobile device testing platform in the cloud',
    'Test websites and mobile apps across 3,000+ real browsers and devices with high speed, zero maintenance, and local Indian billing.', 'https://browserstack.com', 'https://static.browserstack.com/images/browserstack-logo-600x600.png', '#0052CC',
    'cat_nKRrtncPDDtVHkqte9VDBR0I', 1, 1,
    1, 1, 0,
    1, 0, 1,
    'Paid', 2400, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_browserstack_saucelabs', 'gt_hEiE8T3nxkatx8DGrb2Vx8ey', 'tool_dapZSgcods2YfaADqeaOLvzp');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_riiAngRUZ9rIMB4MK5AeCdtP', 'chargebee', 'Chargebee', 'Subscription management and recurring billing infrastructure',
    'Manage complex recurring SaaS subscriptions, automated dunning, GST invoices, and global tax compliance originating from Chennai.', 'https://chargebee.com', 'https://webstatic.chargebee.com/assets/web/600/images/footer/chargebee-logo-black.svg', '#6C5CE7',
    'cat_GgnwH5L6jqd6GyhBAVnJztbL', 1, 1,
    1, 1, 0,
    1, 0, 1,
    'Freemium', 0, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_chargebee_recurly', 'gt_Mqudo437Ks711dYYsJSZ4B5Y', 'tool_riiAngRUZ9rIMB4MK5AeCdtP');
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_chargebee_stripe', 'gt_E3wgfVaeIISaX4wjmWmuc1l4', 'tool_riiAngRUZ9rIMB4MK5AeCdtP');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_GAsBXj8gQ2mmLRe9L1pSQh9E', 'razorpay', 'Razorpay', 'Payments, banking, and financial suite for Indian internet businesses',
    'Accept UPI, Cards, Netbanking, EMI, and Wallets with 99.9% uptime, instant settlements, and comprehensive GST reconciliation.', 'https://razorpay.com', 'https://razorpay.com/assets/razorpay-glyph.svg', '#0C2340',
    'cat_GgnwH5L6jqd6GyhBAVnJztbL', 1, 1,
    1, 1, 0,
    1, 0, 1,
    'Free', 0, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_razorpay_stripe', 'gt_E3wgfVaeIISaX4wjmWmuc1l4', 'tool_GAsBXj8gQ2mmLRe9L1pSQh9E');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_SFdm4ZHMdOBPWs8dk6pqU1sP', 'freshdesk', 'Freshdesk', 'Omnichannel customer support software powered by Freddy AI',
    'Unified ticketing, live chat, telephony, and self-service knowledge base built by Freshworks in Chennai with local INR billing.', 'https://freshdesk.com', 'https://assets.freshdesk.com/skin/freshdesk-logo.svg', '#00A88F',
    'cat_IrxD95uJW4deXeC8mLqPHGIe', 1, 1,
    1, 1, 0,
    1, 0, 1,
    'Freemium', 999, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_freshdesk_zendesk', 'gt_SquhvcVg55LZKMGBsl2CjN0R', 'tool_SFdm4ZHMdOBPWs8dk6pqU1sP');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_kcpElBzfPuFNFtU2UFTSOvie', 'zoho-crm', 'Zoho CRM', 'Supercharge your sales team with 360-degree customer relationship management',
    'Pioneering sovereign CRM software suite with automated lead routing, Zia AI sales assistant, domestic data residency, and GST compliance.', 'https://zoho.com/crm', 'https://www.zohowebstatic.com/sites/zweb/images/common/zoho-logo-web.svg', '#ED1C24',
    'cat_rZwEuAHnlpCJDPQjuJLEPBZN', 1, 1,
    1, 1, 0,
    1, 0, 1,
    'Freemium', 800, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_zoho-crm_salesforce', 'gt_wvU6NazKShKcnU4wwkKGfSXt', 'tool_kcpElBzfPuFNFtU2UFTSOvie');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_nPKhNe9GjDhwaR0ZPjvpbP2r', 'murf-ai', 'Murf AI', 'Studio-quality realistic AI voiceovers and text-to-speech engine',
    'Generate hyper-realistic synthetic voices in multiple Indian accents and international languages for videos, podcasts, and e-learning.', 'https://murf.ai', 'https://murf.ai/static/media/logo.3c6e9ec1.svg', '#6366F1',
    'cat_WBulCpZSR0wnDA5GWNDQTglT', 1, 1,
    1, 1, 0,
    1, 0, 1,
    'Freemium', 1500, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_murf-ai_elevenlabs', 'gt_DqbNi48dvjRsb9jtuzVYZlfo', 'tool_nPKhNe9GjDhwaR0ZPjvpbP2r');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_DnNi492QmHJbhPVVTYYLW3v0', 'clevertap', 'CleverTap', 'All-in-one customer engagement and retention platform for mobile apps',
    'Real-time user behavioral analytics, predictive segmentation, omnichannel push notifications, and lifecycle automation.', 'https://clevertap.com', 'https://clevertap.com/wp-content/themes/clevertap/assets/images/logo.svg', '#D81B60',
    'cat_rZwEuAHnlpCJDPQjuJLEPBZN', 1, 1,
    1, 1, 0,
    1, 0, 0,
    'Paid', 5000, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_clevertap_mixpanel', 'gt_t7BtWqiVfDdU1ZfKqkxT5mAN', 'tool_DnNi492QmHJbhPVVTYYLW3v0');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_GIVxbPQ0PowfeLGJAUSDGGS5', 'keka', 'Keka HR', 'Modern HR, Payroll, Leave, and Performance Management for Indian teams',
    'Automated statutory PF, ESI, TDS, PT tax calculations, geofenced attendance, and employee self-service portal.', 'https://keka.com', 'https://cdn.keka.com/brand/keka-logo-blue.svg', '#2563EB',
    'cat_do8fkh21KyCnT6BHr97i3N89', 1, 1,
    1, 1, 0,
    1, 0, 0,
    'Paid', 6999, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_keka_gusto', 'gt_tOqPburL7MrK8Y7LCsKHq1hV', 'tool_GIVxbPQ0PowfeLGJAUSDGGS5');
INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    'tool_bZXWmH9KfZprNl9OLimjvqer', 'document360', 'Document360', 'Knowledge base platform for technical documentation and SOPs',
    'Create private and public knowledge bases, product documentation, and API guides with markdown editor and version control.', 'https://document360.com', 'https://document360.com/wp-content/themes/document360/images/document360-logo.svg', '#4F46E5',
    'cat_RByboCZiwahKZZMVnkmOzuOa', 1, 1,
    1, 1, 0,
    1, 0, 1,
    'Freemium', 3000, 'published'
  );
INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_document360_gitbook', 'gt_7Na81aptmktr91aoeH82ZL5x', 'tool_bZXWmH9KfZprNl9OLimjvqer');
