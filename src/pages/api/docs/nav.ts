import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db/mongodb';
import { COLLECTIONS } from '../../../lib/db/models';

export const GET: APIRoute = async () => {
  try {
    const db = await getDb();
    const allDocs = await db.collection(COLLECTIONS.DOC_DRAFTS)
      .find({ status: 'approved' })
      .project({ title: 1, category: 1, slug: 1 })
      .toArray();

    // Group docs by category
    const docsByCategory = allDocs.reduce((acc: Record<string, any[]>, doc: any) => {
      if (!acc[doc.category]) acc[doc.category] = [];
      acc[doc.category].push(doc);
      return acc;
    }, {});

    const categories = Object.keys(docsByCategory).sort();

    return new Response(JSON.stringify({
      success: true,
      categories,
      docsByCategory
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });
  } catch (error) {
    console.error('Error fetching nav docs:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch navigation data'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
