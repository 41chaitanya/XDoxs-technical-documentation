/**
 * generate-index.ts
 *
 * Lists all .md files in S3 under docs/ and uploads a generated
 * index.json so CloudFront can serve it without needing S3 ListObjects
 * at runtime.
 *
 * Run:  npx tsx scripts/generate-index.ts
 */

import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Manually parse .env so we don't need the dotenv package
function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (key && !(key in process.env)) process.env[key] = val;
    }
  } catch {
    // .env not found — rely on shell env
  }
}
loadEnv();

const REGION = process.env.AWS_REGION || 'ap-south-2';
const BUCKET = process.env.S3_DOCS_BUCKET || '';
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || '';
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';

if (!BUCKET || !ACCESS_KEY || !SECRET_KEY) {
  console.error('❌ Missing required env vars: S3_DOCS_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY');
  process.exit(1);
}

const client = new S3Client({
  region: REGION,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function main() {
  console.log(`📋 Listing docs in s3://${BUCKET}/docs/ …`);

  const result = await client.send(
    new ListObjectsV2Command({ Bucket: BUCKET, Prefix: 'docs/' })
  );

  const files = (result.Contents || []).filter(o => o.Key?.endsWith('.md'));

  if (files.length === 0) {
    console.warn('⚠️  No .md files found under docs/. Have you run upload-samples yet?');
    process.exit(0);
  }

  const index = files
    .map(f => {
      const parts = (f.Key || '').split('/'); // docs/<category>/<slug>.md
      if (parts.length !== 3) return null;
      const category = parts[1];
      const slug = parts[2].replace('.md', '');
      return {
        category,
        slug,
        title: titleFromSlug(slug),
        description: `Learn ${titleFromSlug(slug)}`,
      };
    })
    .filter(Boolean);

  console.log(`✅ Found ${index.length} docs:`);
  index.forEach(d => console.log(`   ${d!.category}/${d!.slug}`));

  // Upload index.json
  const body = JSON.stringify(index, null, 2);
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: 'docs/index.json',
      Body: body,
      ContentType: 'application/json',
      CacheControl: 'public, max-age=300', // 5-min CDN cache
    })
  );

  console.log(`\n🚀 Uploaded docs/index.json to s3://${BUCKET}`);
  console.log('   CloudFront will serve it at: /docs/index.json');
  console.log('\n✅ Done! Restart your dev server to pick up the new index.');
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
