/**
 * Strip content fields from MongoDB doc_drafts.
 * 
 * Removes: content, renderedHtml, renderedHtmlHi from documents
 * Removes: content from each topic (keeps id, title, slug, order only)
 * 
 * Run: npx tsx scripts/strip-mongo-content.ts
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xdoxs';

async function stripContent() {
  console.log('=== Strip content fields from MongoDB ===\n');
  console.log(`MongoDB: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}\n`);

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('xdoxs');
  const col = db.collection('doc_drafts');

  // Count docs before
  const total = await col.countDocuments();
  const withContent = await col.countDocuments({ content: { $exists: true } });
  const withHtml = await col.countDocuments({ renderedHtml: { $exists: true } });
  const withHtmlHi = await col.countDocuments({ renderedHtmlHi: { $exists: true } });

  console.log(`Total docs:            ${total}`);
  console.log(`With content:          ${withContent}`);
  console.log(`With renderedHtml:     ${withHtml}`);
  console.log(`With renderedHtmlHi:   ${withHtmlHi}\n`);

  // Step 1: $unset content fields from all docs
  const unsetResult = await col.updateMany(
    {},
    {
      $unset: {
        content: '',
        renderedHtml: '',
        renderedHtmlHi: '',
      },
    }
  );
  console.log(`✅ Stripped content/renderedHtml/renderedHtmlHi from ${unsetResult.modifiedCount} docs`);

  // Step 2: Clean topic arrays — keep only index fields (id, title, slug, order)
  const docsWithTopics = await col
    .find({ 'topics.content': { $exists: true } })
    .project({ _id: 1, topics: 1 })
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
      await col.updateOne({ _id: doc._id }, { $set: { topics: cleanTopics } });
      topicsCleaned++;
    }
  }
  console.log(`✅ Cleaned topic content from ${topicsCleaned} docs`);

  // Verify
  const afterContent = await col.countDocuments({ content: { $exists: true } });
  const afterHtml = await col.countDocuments({ renderedHtml: { $exists: true } });
  const afterTopicContent = await col.countDocuments({ 'topics.content': { $exists: true } });
  console.log(`\n--- Verification ---`);
  console.log(`Docs with content:          ${afterContent}`);
  console.log(`Docs with renderedHtml:     ${afterHtml}`);
  console.log(`Docs with topic.content:    ${afterTopicContent}`);
  console.log(`\n=== Done ===`);

  await client.close();
}

stripContent().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
