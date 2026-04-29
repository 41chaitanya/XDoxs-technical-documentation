import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db/mongodb';
import { COLLECTIONS } from '../../../lib/db/models';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;
    
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { category, slug, tabs } = await request.json();

    if (!category || !slug || !tabs || tabs.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Category, slug, and at least one tab required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = await getDb();
    const draftsCollection = db.collection(COLLECTIONS.DOC_DRAFTS);

    // Check if slug already exists in this category
    const existing = await draftsCollection.findOne({ slug, category });
    if (existing) {
      return new Response(JSON.stringify({ success: false, error: 'A document with this name already exists in this category' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create draft document with tabs
    const draft = {
      instructorId: user.userId,
      instructorEmail: user.email,
      authorRole: 'admin',
      category,
      title: tabs[0].title, // Use first tab title as main title
      slug,
      description: `Documentation for ${tabs[0].title}`,
      content: tabs[0].content, // Keep first tab content for backward compatibility
      tabs: tabs,
      tags: [category],
      status: 'pending_review', // Goes to super admin for review
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await draftsCollection.insertOne(draft);

    return new Response(JSON.stringify({ 
      success: true,
      docId: result.insertedId.toString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to create document' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
