import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db/mongodb';
import { COLLECTIONS } from '../../../lib/db/models';
import { verifyToken } from '../../../lib/auth/jwt';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('auth_token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = verifyToken(token);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { title, category, description, tags, content } = await request.json();

    if (!title || !category || !content) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate slug
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const db = await getDb();
    const draftsCollection = db.collection(COLLECTIONS.DOC_DRAFTS);

    // Check if slug already exists
    const existing = await draftsCollection.findOne({ slug, category });
    if (existing) {
      return new Response(JSON.stringify({ success: false, error: 'A document with this title already exists in this category' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create draft document
    const draft = {
      instructorId: payload.userId,
      instructorEmail: payload.email,
      category,
      title,
      slug,
      description: description || '',
      content,
      tabs: [],
      tags: tags || [],
      status: 'pending_review', // Goes to super admin for review
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await draftsCollection.insertOne(draft);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error submitting document:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to submit document' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
