/**
 * Import existing docs from S3 to MongoDB
 * 
 * This script:
 * 1. Lists all .md files in S3
 * 2. Downloads each file
 * 3. Creates MongoDB entries with metadata
 * 4. Sets status to 'approved' so they appear on site
 */

import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getDb } from '../src/lib/db/mongodb';
import { COLLECTIONS } from '../src/lib/db/models';

const REGION = process.env.AWS_REGION || 'ap-south-2';
const BUCKET = process.env.S3_DOCS_BUCKET || 'xdoxs-docs-656829';
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || '';
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';

async function importFromS3() {
  console.log('🔄 Importing docs from S3 to MongoDB...\n');

  if (!ACCESS_KEY || !SECRET_KEY) {
    console.error('❌ AWS credentials not found');
    process.exit(1);
  }

  const client = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    },
  });

  try {
    // List all .md files in S3
    console.log(`📦 Listing files in bucket: ${BUCKET}`);
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: 'docs/',
    });
    
    const listResult = await client.send(listCommand);
    const mdFiles = (listResult.Contents || [])
      .filter(obj => obj.Key?.endsWith('.md'))
      .map(obj => obj.Key!);

    console.log(`✅ Found ${mdFiles.length} markdown files\n`);

    if (mdFiles.length === 0) {
      console.log('No files to import');
      return;
    }

    // Connect to MongoDB
    const db = await getDb();
    const collection = db.collection(COLLECTIONS.DOC_DRAFTS);

    let imported = 0;
    let skipped = 0;

    for (const key of mdFiles) {
      // Parse S3 key: docs/category/slug.md
      const parts = key.split('/');
      if (parts.length !== 3) {
        console.log(`⚠️  Skipping invalid key: ${key}`);
        continue;
      }

      const category = parts[1];
      const slugWithExt = parts[2];
      const slug = slugWithExt.replace('.md', '');

      // Check if already exists in MongoDB
      const existing = await collection.findOne({ category, slug });
      if (existing) {
        console.log(`⏭️  Skipping (already exists): ${category}/${slug}`);
        skipped++;
        continue;
      }

      // Download content from S3
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
      });
      const getResult = await client.send(getCommand);
      const content = await getResult.Body?.transformToString('utf-8');

      if (!content) {
        console.log(`⚠️  No content for: ${key}`);
        continue;
      }

      // Extract title from markdown (first # heading)
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : slug.replace(/-/g, ' ');

      // Extract description (first paragraph after title)
      const descMatch = content.match(/^#.+\n\n(.+)$/m);
      const description = descMatch ? descMatch[1].substring(0, 160) : '';

      // Create MongoDB document
      const doc = {
        title,
        slug,
        category,
        description,
        content,
        status: 'approved',
        instructorEmail: 'imported@s3.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
        tags: [category],
      };

      await collection.insertOne(doc);
      console.log(`✅ Imported: ${category}/${slug} - "${title}"`);
      imported++;
    }

    console.log(`\n🎉 Import complete!`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${mdFiles.length}`);

  } catch (error: any) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

importFromS3();
