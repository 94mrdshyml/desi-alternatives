import { writeFileSync } from 'fs';
import { createBlogAuthorId, createBlogPostId, createBlogPostToolId } from '../src/lib/server/id';

const editorialAuthorId = 'author_editorial_team_001';
const devAuthorId = 'author_rohit_sharma_002';
const archAuthorId = 'author_ananya_rao_003';

interface BlogPostSeed {
  slug: string;
  title: string;
  subtitle: string;
  authorId: string;
  categorySlug: string;
  coverImageUrl: string;
  toolSlugs: string[];
  readingTime: number;
  content: string;
}

const posts: BlogPostSeed[] = [
  {
    slug: 'open-source-internal-tool-builders-replacing-retool',
    title: 'Open-Source Internal Tool Builders: Replacing Retool with Sovereign Frameworks',
    subtitle: 'How modern Indian engineering teams build customer-ops portals, CRUD dashboards, and database tools without vendor lock-in.',
    authorId: devAuthorId,
    categorySlug: 'developer-tools',
    coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    toolSlugs: ['appsmith', 'frappe'],
    readingTime: 5,
    content: `Building internal tools—admin panels, refund dispatchers, user moderation tables, and database managers—used to eat up 25-35% of an engineering sprint.

When proprietary low-code builders entered the market, teams initially jumped aboard. But as data privacy regulations tightened and per-seat pricing models escalated, engineering teams faced painful architectural lock-in.

> [!NOTE]
> **The Sovereign Low-Code Advantage**: With platforms like **Appsmith** and **Frappe Framework**, your business logic is stored as standard JavaScript or Python, versioned directly in Git, and deployed behind your own VPC.

---

## 1. Appsmith: JavaScript-First Visual Architecture

:::tool{slug="appsmith"}
:::

Appsmith changed the developer workflow by treating code as a first-class citizen. Instead of rigid drag-and-drop constraints, every property, query parameter, and transform function is written in native JavaScript.

### Core Architectural Benefits
- **Zero Data Exposure**: Queries execute directly against your Postgres, MongoDB, or REST APIs from your private container without routing through third-party servers.
- **Git-Connected Releases**: Connect your Appsmith workspace directly to GitHub or GitLab for standard branch-based peer reviews and automated CI/CD staging deploys.

---

## 2. Frappe Framework: Full-Stack Metadata Engine

:::tool{slug="frappe"}
:::

For enterprise-grade back-office workflows, **Frappe Framework** offers a complete Python and JavaScript framework with built-in ORM, automated REST APIs, role-based access control (RBAC), and background job queues.

| Feature | Appsmith | Frappe Framework | Proprietary US Monoliths |
| :--- | :--- | :--- | :--- |
| **License** | Open Source (Apache 2.0) | Open Source (GPLv3) | Closed Source / Black Box |
| **Self-Hosting** | Docker / Kubernetes | Bench CLI / Docker | Cloud Only ($$$) |
| **Data Residency** | 100% Private VPC | 100% On-Prem / Cloud | US-East / Overseas |

---

## Final Verdict

If you need fast API-driven dashboards with visual UI components, **Appsmith** is unbeatable. If you need complete schema-backed business applications with data models and workflows, **Frappe Framework** provides a sovereign foundation that scales for decades.`,
  },
  {
    slug: 'why-tech-startups-are-picking-chatwoot-over-intercom',
    title: 'Next-Gen Customer Support: Why Tech Startups Are Picking Chatwoot Over Intercom',
    subtitle: 'An in-depth look at omnichannel customer messaging, self-hosted data ownership, and seamless WhatsApp API integration.',
    authorId: archAuthorId,
    categorySlug: 'customer-support',
    coverImageUrl: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=1200&auto=format&fit=crop&q=80',
    toolSlugs: ['chatwoot', 'freshsales'],
    readingTime: 6,
    content: `Customer support for modern consumer and B2B products is no longer just a web chat widget. In India and emerging markets, customer conversations happen across **WhatsApp, Email, Twitter/X, Live Chat, and SMS**.

Legacy helpdesks like Intercom and Zendesk charge exorbitant add-on fees for basic omnichannel routing and require sensitive customer conversations to reside on overseas infrastructure.

:::tool{slug="chatwoot"}
:::

---

## 1. Native Omnichannel Inboxes

With **Chatwoot**, all incoming customer channels converge into a unified dashboard:
- **WhatsApp Cloud API & Twilio**: Real-time two-way messaging directly inside the agent interface.
- **Live Chat Widget**: Ultra-lightweight SDK (<30KB) that doesn't drag down website Core Web Vitals.
- **Email & Social**: Route support emails and direct messages seamlessly.

> [!TIP]
> **WhatsApp Integration**: Integrating official WhatsApp Business Cloud API with Chatwoot takes under 10 minutes and avoids intermediary markup fees.

---

## 2. Full Data Sovereignty for Fintech & Healthcare

For Indian fintechs, insurtechs, and healthcare apps bound by DPDP Act 2023 guidelines, customer chats often contain sensitive identifiers (PAN, Aadhaar references, payment receipts).

Running Chatwoot on domestic cloud infrastructure (AWS Mumbai or GCP Delhi) guarantees:
1. End-to-end data residency on domestic soil.
2. Direct connection to your internal CRM data without webhooks leaking PII.

---

## Summary

Chatwoot proves that open-source software can deliver superior user interface aesthetics, multi-agent collaboration, and complete compliance without compromise.`,
  },
  {
    slug: 'modern-agile-sprints-rise-of-plane-jira-alternative',
    title: 'Modern Agile Sprints: The Rise of Plane as an Open-Source Jira Alternative',
    subtitle: 'Why engineering teams are replacing sluggish issue trackers with lightning-fast, keyboard-driven sprint management.',
    authorId: devAuthorId,
    categorySlug: 'developer-tools',
    coverImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    toolSlugs: ['plane'],
    readingTime: 5,
    content: `Ask any software engineer about Jira, and the response is usually unanimous: it's sluggish, over-configured, and feels like enterprise software designed in 2005.

Enter **Plane**, an open-source project management platform that has taken the global developer community by storm with over 30,000 GitHub stars.

:::tool{slug="plane"}
:::

---

## What Makes Plane Different?

### 1. Speed & Keyboard Navigation
Plane is built around a modern Next.js frontend with optimistic UI updates. Moving an issue across Kanban columns, assigning story points, or filtering by sprint milestone happens in milliseconds.

### 2. Multi-View Flexibility
Every project can be visualized in the layout that suits your team best:
- **Kanban Board**: Drag-and-drop workflow status columns.
- **List View**: Dense, customizable spreadsheets for backlog grooming.
- **Calendar & Timeline / Gantt**: Real-time roadmapping with dependency tracking.
- **Analytics & Burn-Down**: Instant velocity charts for engineering leads.

> [!IMPORTANT]
> **Self-Hosting Freedom**: You can deploy Plane on your own Kubernetes cluster or Docker VPS with a single command, ensuring project roadmaps and vulnerability tickets remain private.

\`\`\`bash
# Deploy Plane with Docker
curl -fsSL https://primer.plane.so/docker-compose.yml -o docker-compose.yml
docker compose up -d
\`\`\`

---

## Conclusion

Plane delivers the speed of Linear combined with the self-hosted data ownership and extensibility that enterprise engineering teams demand.`,
  },
  {
    slug: 'scaling-high-velocity-sales-leadsquared-crm',
    title: 'Scaling High-Velocity Sales Operations with LeadSquared',
    subtitle: 'How Indian tech giants and education platforms manage millions of leads without dropped pipeline conversions.',
    authorId: archAuthorId,
    categorySlug: 'crm-sales',
    coverImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
    toolSlugs: ['leadsquared', 'freshsales'],
    readingTime: 4,
    content: `High-velocity B2C and B2B businesses in India—edtechs, financial lenders, real estate platforms, and healthcare providers—face a unique scale challenge: managing hundreds of thousands of daily inbound leads with zero latency.

Standard American CRMs designed for low-volume enterprise deals quickly become cost-prohibitive and fail under sudden campaign spikes.

:::tool{slug="leadsquared"}
:::

---

## 1. Zero-Lead-Loss Architecture

LeadSquared is engineered specifically for high-velocity distribution:
- **Instant Lead Capture**: Ingest leads from Google Ads, Meta Ads, WhatsApp campaigns, and webhooks in real time.
- **Automated Dialers & Telephony**: Native integration with Exotel, Knowlarity, and Ozonetel with 1-click click-to-call.
- **Smart Distribution Engines**: Route leads to sales reps dynamically based on geography, language proficiency, and past conversion rate.

---

## 2. Freshsales vs LeadSquared: The Right Tool for Your Team

:::tool{slug="freshsales"}
:::

| Dimension | LeadSquared | Freshsales |
| :--- | :--- | :--- |
| **Primary Strength** | High-velocity B2C & Call Centers | Modern B2B Tech Pipelines |
| **AI Insights** | Lead scoring & automated dialer rules | Freddy AI deal insights |
| **Billing** | Direct INR + 18% GST Invoice | Direct INR + Global USD |

Both platforms demonstrate the maturity of Indian CRM engineering, offering localized dialer workflows and unbeatable price-to-performance.`,
  },
  {
    slug: 'transitioning-from-slack-to-flock-team-messaging',
    title: 'Next-Gen Team Communication: Transitioning from Slack to Flock',
    subtitle: 'A practical evaluation of workspace channels, video conferencing, integrated task management, and cost optimization.',
    authorId: devAuthorId,
    categorySlug: 'productivity',
    coverImageUrl: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=1200&auto=format&fit=crop&q=80',
    toolSlugs: ['flock-2'],
    readingTime: 4,
    content: `Workplace communication tools have become the operating system of the modern company. But as per-user subscription fees for Slack continue to rise, mid-market companies are searching for leaner, faster communication suites.

**Flock** has emerged as a powerhouse collaboration suite built right out of Mumbai and Bengaluru.

:::tool{slug="flock-2"}
:::

---

## Key Advantages of Flock

### 1. Built-In Productivity Tools
Unlike Slack, where every mini-feature requires a third-party app integration:
- **Shared To-Do Lists**: Create and assign actionable tasks directly within any channel.
- **Polls & Surveys**: Quick team voting without installing external bots.
- **Rich Note Sharing**: Collaborative scratchpad inside chat sidebars.

### 2. Video Calling & Screen Sharing
Flock includes native 1-click video and audio conferencing, reducing the need for separate Zoom licensing for daily standups.

> [!TIP]
> **Migration Experience**: Flock provides automated Slack workspace import tools, transferring message history, public channels, and user directories in minutes.`,
  },
  {
    slug: 'fast-git-hosting-sovereign-devops-entire',
    title: 'Fast Git Hosting & Sovereign DevOps Pipelines for AI-Native Teams',
    subtitle: 'Why the next decade of software engineering requires distributed Git infrastructure optimized for massive repositories and speed.',
    authorId: archAuthorId,
    categorySlug: 'developer-tools',
    coverImageUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&auto=format&fit=crop&q=80',
    toolSlugs: ['entire', 'frappe'],
    readingTime: 5,
    content: `As artificial intelligence models and large language model datasets become embedded directly within software codebases, repository sizes and CI/CD throughput requirements have exploded.

**Entire** represents India's sovereign push into high-performance Git hosting and DevOps infrastructure.

:::tool{slug="entire"}
:::

---

## 1. High-Throughput Git Operations

Legacy code hosting platforms experience significant latency when handling large monorepos with hundreds of thousands of daily commits.

**Entire** is built from the ground up for extreme speed:
- Sub-50ms clone and fetch speeds across Indian cloud regions.
- Native integration with modern AI coding assistants and review agents.
- Tight compliance with national data governance frameworks.

---

## 2. The Future of Sovereign DevOps

Coupled with open frameworks like **Frappe** and observability engines like **SigNoz**, Indian engineering teams now have access to a full sovereign developer stack from code commit to production monitoring.`,
  },
];

let sql = `-- ===================================================
-- SEED BLOG AUTHORS & MULTI-CATEGORY ARTICLES
-- ===================================================

-- 1. Insert Authors
INSERT OR IGNORE INTO blog_authors (id, slug, name, role, avatar_url, bio, twitter_handle, linkedin_url, website_url)
VALUES (
  '${editorialAuthorId}',
  'desi-editorial',
  'Desi Alternatives Editorial',
  'Software Architecture & Research Team',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'Deep-dive technical analyses and software curations from the engineers and researchers at Desi Alternatives.',
  'DesiAlternativ',
  'https://linkedin.com',
  'https://desialternatives.in'
);

INSERT OR IGNORE INTO blog_authors (id, slug, name, role, avatar_url, bio, twitter_handle, linkedin_url, website_url)
VALUES (
  '${devAuthorId}',
  'rohit-sharma-dev',
  'Rohit Sharma',
  'Lead Systems Architect',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'Full-stack engineer and open-source contributor writing about distributed architectures and developer tools.',
  'rohit_dev',
  'https://linkedin.com',
  'https://desialternatives.in'
);

INSERT OR IGNORE INTO blog_authors (id, slug, name, role, avatar_url, bio, twitter_handle, linkedin_url, website_url)
VALUES (
  '${archAuthorId}',
  'ananya-rao-tech',
  'Ananya Rao',
  'Cloud Infrastructure & Compliance Lead',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'DevOps engineer specializing in DPDP Act compliance, cloud telemetry, and sovereign infrastructure scaling.',
  'ananya_cloud',
  'https://linkedin.com',
  'https://desialternatives.in'
);
\n`;

for (const p of posts) {
  const postId = createBlogPostId();
  const escapedContent = p.content.replace(/'/g, "''");
  const escapedTitle = p.title.replace(/'/g, "''");
  const escapedSubtitle = p.subtitle.replace(/'/g, "''");

  sql += `-- Article: ${p.title}
INSERT OR IGNORE INTO blog_posts (
  id,
  slug,
  title,
  subtitle,
  content,
  cover_image_url,
  author_id,
  category_id,
  status,
  reading_time_minutes,
  meta_title,
  meta_description,
  published_at
)
SELECT
  '${postId}',
  '${p.slug}',
  '${escapedTitle}',
  '${escapedSubtitle}',
  '${escapedContent}',
  '${p.coverImageUrl}',
  '${p.authorId}',
  c.id,
  'published',
  ${p.readingTime},
  '${escapedTitle} | Desi Alternatives',
  '${escapedSubtitle}',
  datetime('now', '-${Math.floor(Math.random() * 5 + 1)} days')
FROM categories c
WHERE c.slug = '${p.categorySlug}'
LIMIT 1;
\n`;

  for (const tSlug of p.toolSlugs) {
    const postToolId = createBlogPostToolId();
    sql += `INSERT OR IGNORE INTO blog_post_tools (id, post_id, desi_tool_id)
SELECT '${postToolId}', '${postId}', id FROM desi_tools WHERE slug = '${tSlug}';\n`;
  }
  sql += '\n';
}

writeFileSync('drizzle/seed-blog-posts.sql', sql);
console.log('Successfully generated drizzle/seed-blog-posts.sql with accurate foreign keys!');
