/**
 * Migrate existing MongoDB docs content to S3.
 * 
 * Run once after setting up the S3 docs content bucket.
 * 
 * Usage:
 *   S3_DOCS_BUCKET=xdoxs-docs-content AWS_REGION=us-east-1 npx tsx deploy/migrate-to-s3.ts
 */

import { MongoClient } from 'mongodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xdoxs';
const BUCKET = process.env.S3_DOCS_BUCKET || 'xdoxs-docs-content';
const REGION = process.env.AWS_REGION || 'ap-south-2';

async function migrate() {
  console.log('=== XDoxs: Migrate MongoDB docs to S3 ===\n');
  console.log(`MongoDB:  ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`);
  console.log(`S3:       s3://${BUCKET}/`);
  console.log(`Region:   ${REGION}\n`);

  // Connect to MongoDB
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('xdoxs');

  // Get all docs with content
  const docs = await db
    .collection('doc_drafts')
    .find({ content: { $exists: true, $ne: '' } })
    .project({ category: 1, slug: 1, title: 1, content: 1, status: 1 })
    .toArray();

  console.log(`Found ${docs.length} docs with content\n`);

  // Upload each to S3
  const s3 = new S3Client({ region: REGION });
  let success = 0;
  let failed = 0;

  for (const doc of docs) {
    const key = `docs/${doc.category}/${doc.slug}.md`;
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: doc.content,
          ContentType: 'text/markdown; charset=utf-8',
          Metadata: {
            category: doc.category,
            slug: doc.slug,
            status: doc.status || 'unknown',
          },
        })
      );
      console.log(`  ✅ ${key} (${doc.title})`);
      success++;
    } catch (err: any) {
      console.error(`  ❌ ${key}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== Migration complete: ${success} succeeded, ${failed} failed ===`);

  await client.close();
  process.exit(failed > 0 ? 1 : 0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
