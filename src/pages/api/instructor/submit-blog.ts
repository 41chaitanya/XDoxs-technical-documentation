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
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const payload = verifyToken(token);
    
    if (!payload || (payload.role !== 'instructor' && payload.role !== 'super_admin')) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { title, excerpt, content, coverImage, category, tags, slug, status } = body;

    if (!title || !content || !category || !tags || tags.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = await getDb();
    
    // Get user details
    const user = await db.collection(COLLECTIONS.USERS).findOne({ email: payload.email });
    
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const blogPost = {
      authorId: user._id.toString(),
      authorEmail: user.email,
      authorName: user.fullName,
      authorRole: 'instructor' as const,
      title,
      slug,
      excerpt: excerpt || '',
      content,
      coverImage: coverImage || null,
      category,
      tags,
      status,
      views: 0,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection(COLLECTIONS.BLOG_POSTS).insertOne(blogPost);

    return new Response(JSON.stringify({ 
      success: true, 
      blogId: result.insertedId.toString() 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error submitting blog:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
