/**
 * DEV ONLY: Upload sample documentation to S3
 * 
 * This script uploads sample docs for testing purposes.
 * DO NOT run in production!
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';

// Load .env without requiring dotenv package
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
  } catch { /* rely on shell env */ }
}
loadEnv();

const REGION = process.env.AWS_REGION || 'ap-south-2';
const BUCKET = process.env.S3_DOCS_BUCKET || 'xdoxs-docs-656829';
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || '';
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';

// Sample docs to upload
const SAMPLE_DOCS = [
  { file: 'css-fundamentals.md', category: 'css', slug: 'css-fundamentals' },
  { file: 'javascript-fundamentals.md', category: 'javascript', slug: 'javascript-fundamentals' },
  { file: 'nodejs-fundamentals.md', category: 'nodejs', slug: 'nodejs-fundamentals' },
  { file: 'python-fundamentals.md', category: 'python', slug: 'python-fundamentals' },
  { file: 'java-fundamentals.md', category: 'java', slug: 'java-fundamentals' },
  { file: 'rust-fundamentals.md', category: 'rust', slug: 'rust-fundamentals' },
  { file: 'devops-fundamentals.md', category: 'devops', slug: 'devops-fundamentals' },
];

async function uploadSampleDocs() {
  console.log('🚀 Uploading sample docs to S3...\n');

  // Check credentials
  if (!ACCESS_KEY || !SECRET_KEY) {
    console.error('❌ AWS credentials not found!');
    console.log('Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    process.exit(1);
  }

  const client = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    },
  });

  let uploaded = 0;
  let failed = 0;

  for (const doc of SAMPLE_DOCS) {
    try {
      // Read file
      const filePath = join(process.cwd(), 'project-explanation', 'docs-samples', doc.file);
      const content = readFileSync(filePath, 'utf-8');

      // Upload to S3
      const key = `docs/${doc.category}/${doc.slug}.md`;
      await client.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: content,
          ContentType: 'text/markdown; charset=utf-8',
          Metadata: {
            category: doc.category,
            slug: doc.slug,
            'uploaded-at': new Date().toISOString(),
          },
        })
      );

      console.log(`✅ Uploaded: ${key}`);
      uploaded++;
    } catch (error: any) {
      console.error(`❌ Failed to upload ${doc.file}:`, error.message);
      failed++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Uploaded: ${uploaded}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${SAMPLE_DOCS.length}`);

  if (uploaded > 0) {
    console.log(`\n🎉 Sample docs uploaded successfully!`);
    console.log(`\n📝 Test URLs:`);
    SAMPLE_DOCS.forEach(doc => {
      console.log(`   http://localhost:4322/docs/${doc.category}/${doc.slug}`);
    });
  }
}

uploadSampleDocs();
