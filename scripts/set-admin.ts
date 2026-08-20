import { execSync } from 'child_process';

const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address.');
  console.log('Usage: bun scripts/set-admin.ts <user-email>');
  process.exit(1);
}

const cleanEmail = email.trim().replace(/'/g, "''");

console.log(`Elevating user "${cleanEmail}" to admin on Cloudflare D1 (desi-db)...`);

try {
  const cmd = `wrangler d1 execute desi-db --remote --command="UPDATE users SET role = 'admin' WHERE email = '${cleanEmail}';"`;
  execSync(cmd, {
    stdio: 'inherit',
    env: process.env,
  });
  console.log(`✅ Success! "${cleanEmail}" is now an admin.`);
} catch (err: any) {
  console.error(`❌ Failed to update role:`, err.message);
  process.exit(1);
}
