import { seedData } from './seed-data';
import { writeFileSync } from 'fs';
import { join } from 'path';

let sql = `-- Seed script for Desi Alternatives\n\n`;

// 1. Categories
for (const cat of seedData.categories) {
  const desc = cat.description ? `'${cat.description.replace(/'/g, "''")}'` : 'NULL';
  sql += `INSERT OR IGNORE INTO categories (id, slug, name, emoji, description, is_featured) VALUES ('${cat.id}', '${cat.slug}', '${cat.name.replace(/'/g, "''")}', '${cat.emoji}', ${desc}, ${cat.isFeatured ? 1 : 0});\n`;
}

// 2. Global Tools
for (const gt of seedData.globalTools) {
  sql += `INSERT OR IGNORE INTO global_tools (id, slug, name, website_url, logo_url) VALUES ('${gt.id}', '${gt.slug}', '${gt.name.replace(/'/g, "''")}', '${gt.websiteUrl}', '${gt.logoUrl}');\n`;
}

// 3. Desi Tools
for (const tool of seedData.desiTools) {
  const price = tool.startingPriceInr !== undefined ? tool.startingPriceInr : 'NULL';
  sql += `INSERT OR IGNORE INTO desi_tools (
    id, slug, name, tagline, description, website_url, logo_url, primary_color, category_id,
    has_gst_invoice, has_indian_data_residency, has_inr_pricing, has_upi_support,
    is_open_source, has_ist_support, is_self_hostable, has_free_tier,
    pricing_model, starting_price_inr, status
  ) VALUES (
    '${tool.id}', '${tool.slug}', '${tool.name.replace(/'/g, "''")}', '${tool.tagline.replace(/'/g, "''")}',
    '${tool.description.replace(/'/g, "''")}', '${tool.websiteUrl}', '${tool.logoUrl}', '${tool.primaryColor}',
    '${tool.categoryId}', ${tool.hasGstInvoice ? 1 : 0}, ${tool.hasIndianDataResidency ? 1 : 0},
    ${tool.hasInrPricing ? 1 : 0}, ${tool.hasUpiSupport ? 1 : 0}, ${tool.isOpenSource ? 1 : 0},
    ${tool.hasIstSupport ? 1 : 0}, ${tool.isSelfHostable ? 1 : 0}, ${tool.hasFreeTier ? 1 : 0},
    '${tool.pricingModel}', ${price}, 'published'
  );\n`;

  // Alternatives mapping
  for (const altSlug of tool.globalAlternatives) {
    const globalTool = seedData.globalTools.find((g) => g.slug === altSlug);
    if (globalTool) {
      sql += `INSERT OR IGNORE INTO tool_alternatives (id, global_tool_id, desi_tool_id) VALUES ('alt_${tool.slug}_${globalTool.slug}', '${globalTool.id}', '${tool.id}');\n`;
    }
  }
}

const outputPath = join(process.cwd(), 'scripts', 'seed.sql');
writeFileSync(outputPath, sql, 'utf-8');
console.log('Generated seed.sql successfully at:', outputPath);
