/**
 * Clear All Documentation Script
 * 
 * This script deletes all documentation from MongoDB
 * Use this to start fresh with the new tab-based system
 * 
 * Usage: npm run clear-docs
 */

import { getDb } from '../src/lib/db/mongodb';
import { COLLECTIONS } from '../src/lib/db/models';

async function clearAllDocs() {
  console.log('🗑️  Clearing all documentation from database...\n');

  try {
    const db = await getDb();

    // Delete all doc drafts
    const draftsCollection = db.collection(COLLECTIONS.DOC_DRAFTS);
    const result = await draftsCollection.deleteMany({});
    
    console.log(`✅ Deleted ${result.deletedCount} documents from ${COLLECTIONS.DOC_DRAFTS}`);
    
    // Delete all published docs
    const publishedCollection = db.collection(COLLECTIONS.PUBLISHED_DOCS);
    const publishedResult = await publishedCollection.deleteMany({});
    
    console.log(`✅ Deleted ${publishedResult.deletedCount} documents from ${COLLECTIONS.PUBLISHED_DOCS}`);
    
    console.log('\n✅ All documentation cleared successfully!\n');
    console.log('You can now upload new docs with the tab-based system.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing docs:', error);
    process.exit(1);
  }
}

clearAllDocs();
