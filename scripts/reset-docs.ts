// Full doc reset:
// 1. Delete all .md files from src/content/docs
// 2. Clear doc_drafts + published_docs from MongoDB
// 3. Clear Astro content cache (.astro/data-store.json)

import fs from 'fs/promises';
import path from 'path';
import { MongoClient } from 'mongodb';

const DOCS_DIR = path.join(process.cwd(), 'src', 'content', 'docs');
const ASTRO_CACHE = path.join(process.cwd(), '.astro', 'data-store.json');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xdoxs';

async function resetDocs() {
  // 1. Delete .md files
  console.log('🗑️  Clearing .md files...');
  let fileCount = 0;

  try {
    await fs.access(DOCS_DIR);
    const categories = await fs.readdir(DOCS_DIR);

    for (const category of categories) {
      if (category === '.gitkeep') continue;
      const categoryPath = path.join(DOCS_DIR, category);
      const stat = await fs.stat(categoryPath);
      if (!stat.isDirectory()) continue;

      const files = await fs.readdir(categoryPath);
      for (const file of files.filter(f => f.endsWith('.md'))) {
        await fs.unlink(path.join(categoryPath, file));
        console.log(`   Deleted: ${category}/${file}`);
        fileCount++;
      }
    }
  } catch {
    // Directory doesn't exist — create it
    await fs.mkdir(DOCS_DIR, { recursive: true });
    console.log('   ℹ️  src/content/docs directory created');
  }
  console.log(`   ✅ ${fileCount} file(s) removed\n`);

  // 2. Clear MongoDB
  console.log('🗑️  Clearing MongoDB...');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('xdoxs');

  const drafts = await db.collection('doc_drafts').deleteMany({});
  console.log(`   ✅ doc_drafts: ${drafts.deletedCount} record(s) removed`);

  const published = await db.collection('published_docs').deleteMany({});
  console.log(`   ✅ published_docs: ${published.deletedCount} record(s) removed\n`);

  await client.close();

  // 3. Clear Astro cache
  console.log('🗑️  Clearing Astro cache...');
  try {
    await fs.unlink(ASTRO_CACHE);
    console.log('   ✅ .astro/data-store.json cleared\n');
  } catch {
    console.log('   ℹ️  No Astro cache found, skipping\n');
  }

  console.log('✅ Full reset complete — restart dev server to apply.');
}

resetDocs().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
