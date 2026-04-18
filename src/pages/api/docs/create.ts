import type { APIRoute } from 'astro';
import { verifyToken } from '../../../lib/auth/jwt';
import { createDocDraft } from '../../../lib/db/docs';
import { splitMarkdownIntoTopics } from '../../../lib/markdown/splitter';
import { uploadMarkdown } from '../../../lib/aws/s3';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('auth_token')?.value;
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const payload = verifyToken(token);
    
    if (!payload || (payload.role !== 'instructor' && payload.role !== 'super_admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const data = await request.json();
    const { category, title, slug, description, content, tags } = data;
    
    if (!category || !title || !slug) {
      return new Response(JSON.stringify({ error: 'Missing required fields: category, title, slug' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Split markdown into topics (only if content exists)
    const topics = content ? splitMarkdownIntoTopics(content) : [];
    
    const draft = await createDocDraft({
      instructorId: payload.userId,
      instructorEmail: payload.email,
      category,
      title,
      slug,
      description: description || '',
      content: content || '',
      topics,
      tags: tags || [],
    });

    // Sync markdown content to S3 for durable storage
    if (content) {
      try {
        await uploadMarkdown(category, slug, content);
      } catch (s3Err) {
        console.error('S3 upload failed (non-blocking):', s3Err);
      }
    }
    
    return new Response(JSON.stringify({ success: true, draft }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create doc error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
