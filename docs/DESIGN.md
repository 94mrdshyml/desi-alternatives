## Design System & UI/UX Guidelines (design.md)

## 1. Aesthetic Principles

- Sovereign Editorial Modernism: Clean, high-density SaaS utility paired with editorial warmth.

- Targeted Serif Emphasis: Using Source Serif 4 in italics to highlight high-impact words in headlines (e.g. "Discover sovereign Desi alternatives to global software").

- Dynamic Mesh Glows: Tool cards and profiles render subtle radial gradients derived from the tool's extracted logo brand color.

- Zero Visual Noise: Amber/Saffron ( #F59E0B ) serves as a measured highlight rather than large, aggressive color blocks.

## 2. Typography Hierarchy

|   | Role / Token Font Family Size / Leading Application Context |
| --- | --- |
|   | Hero headlines with italicized keyword Source Serif 4 + Sans 3.5rem (56px) / 1.1 |
|   | text-display accents. text-h1 Plus Jakarta / Sans 2.25rem (36px) / 1.2 Tool canonical page and comparison titles. |
|   | Section headers with 4px amber left text-h2 Plus Jakarta / Sans 1.5rem (24px) / 1.3 indicator. |
|   | 1.125rem (18px) / text-h3 Plus Jakarta / Sans Directory card titles, modal headings. 1.4 0.9375rem (15px) / text-body Plus Jakarta / Sans Tool descriptions, editorial paragraphs. 1.6 text-badge Plus Jakarta / Sans 0.75rem (12px) / 1.0 Checklist badges, pricing tags, categories. |

## 3. Color Palette & Semantic CSS Tokens

|   | Token Light Mode (HEX / Value) Dark Mode (HEX / Value) --background #FFFFFF (Pure White) #09090B (Obsidian Black) --card #FCFCFC (Crisp Canvas) #0E0E11 (Elevated Charcoal) --foreground #09090B (Deep Charcoal) #FAFAFA (Crisp White) --primary #F59E0B (Saffron Amber) #F59E0B (Saffron Amber) --border #E4E4E7 (Zinc 200) #27272A (Zinc 800) --muted #F4F4F5 (Zinc 100) #27272A (Zinc 800) |
| --- | --- |


## 4. Spacing, Radii & Container System

## Corner Radii Tokens

- rounded-md (6px): Form inputs, action buttons, popovers.

- rounded-lg (10px): Standard tool cards, CMDK dialog, modals.

- rounded-2xl (20px): Tool dynamic gradient cover hero.

- rounded-full : Checklist badges, user avatars, pill filters.

## 5. Dynamic Gradient Cover Implementation

```
<!-- Astro Component: ToolHeroCover.astro -->
<div
```

## Layout Width Constraints

- Directory Container: max-w-6xl (1152px) with responsive px-4 md:px-8 .

- Tool / Reading Detail: max-w-4xl (896px).

- CMDK / Auth Dialogs: max-w-md (448px).

```
class="relative w-full h-44 rounded-2xl overflow-hidden border border-border"
style={`background: linear-gradient(135deg, ${tool.primaryColor}22 0%, var(--card) 100%),
radial-gradient(circle at 10% 20%, ${tool.primaryColor}33 0%, transparent 60%);`}
>
<div class="absolute inset-0 bg-grid-pattern opacity-10 dark:opacity-5"></div>
<div class="absolute bottom-4 left-6 flex items-center gap-4">
<div class="w-16 h-16 rounded-xl border border-border bg-background p-2 shadow-sm">
<img src={tool.logoUrl} alt={tool.name} class="w-full h-full object-contain" />
</div>
</div>
</div>
```

## 6. Zero-FOUC Edge Theme Script

To eliminate theme flicker on Cloudflare Workers edge delivery, inject this script in BaseLayout.astro :
