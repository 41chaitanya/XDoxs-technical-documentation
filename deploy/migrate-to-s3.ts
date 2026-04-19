/**
 * Migrate existing MongoDB docs content to S3 and strip content from MongoDB.
 * 
 * Phase 1: Upload all markdown + rendered HTML to S3
 * Phase 2: Remove content, renderedHtml, renderedHtmlHi fields from MongoDB
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
  const collection = db.collection('doc_drafts');

  // Get all docs with content
  const docs = await collection
    .find({ content: { $exists: true, $ne: '' } })
    .project({ category: 1, slug: 1, title: 1, content: 1, renderedHtml: 1, renderedHtmlHi: 1, status: 1 })
    .toArray();

  console.log(`Found ${docs.length} docs with content\n`);

  // Phase 1: Upload each to S3
  const s3 = new S3Client({ region: REGION });
  let success = 0;
  let failed = 0;

  console.log('--- Phase 1: Upload content to S3 ---\n');

  for (const doc of docs) {
    const mdKey = `docs/${doc.category}/${doc.slug}.md`;
    try {
      // Upload raw markdown
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: mdKey,
          Body: doc.content,
          ContentType: 'text/markdown; charset=utf-8',
          Metadata: {
            category: doc.category,
            slug: doc.slug,
            status: doc.status || 'unknown',
          },
        })
      );
      console.log(`  ✅ ${mdKey} (${doc.title})`);

      // Upload rendered HTML (English) if exists
      if (doc.renderedHtml) {
        const htmlKey = `docs/${doc.category}/${doc.slug}.html`;
        await s3.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: htmlKey,
            Body: doc.renderedHtml,
            ContentType: 'text/html; charset=utf-8',
          })
        );
        console.log(`  ✅ ${htmlKey}`);
      }

      // Upload rendered HTML (Hinglish) if exists
      if (doc.renderedHtmlHi) {
        const hiKey = `docs/${doc.category}/${doc.slug}.hi.html`;
        await s3.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: hiKey,
            Body: doc.renderedHtmlHi,
            ContentType: 'text/html; charset=utf-8',
          })
        );
        console.log(`  ✅ ${hiKey}`);
      }

      success++;
    } catch (err: any) {
      console.error(`  ❌ ${mdKey}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n--- Phase 1 complete: ${success} succeeded, ${failed} failed ---\n`);

  // Phase 2: Strip content fields from MongoDB (only if all uploads succeeded)
  if (failed === 0) {
    console.log('--- Phase 2: Strip content from MongoDB ---\n');

    const stripResult = await collection.updateMany(
      {},
      {
        $unset: {
          content: '',
          renderedHtml: '',
          renderedHtmlHi: '',
        },
      }
    );

    // Also strip content from topic arrays (keep only index fields)
    const docsWithTopics = await collection
      .find({ 'topics.content': { $exists: true } })
      .toArray();

    let topicsCleaned = 0;
    for (const doc of docsWithTopics) {
      if (doc.topics && Array.isArray(doc.topics)) {
        const cleanTopics = doc.topics.map((t: any) => ({
          id: t.id,
          title: t.title,
          slug: t.slug,
          order: t.order,
        }));
        await collection.updateOne(
          { _id: doc._id },
          { $set: { topics: cleanTopics } }
        );
        topicsCleaned++;
      }
    }

    console.log(`  ✅ Stripped content fields from ${stripResult.modifiedCount} documents`);
    console.log(`  ✅ Cleaned topic content from ${topicsCleaned} documents`);
    console.log('\n--- Phase 2 complete ---');
  } else {
    console.log('⚠️  Skipping Phase 2 (strip MongoDB) because some S3 uploads failed.');
    console.log('   Fix the errors and re-run the migration.');
  }

  console.log(`\n=== Migration complete: ${success} succeeded, ${failed} failed ===`);

  await client.close();
  process.exit(failed > 0 ? 1 : 0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
