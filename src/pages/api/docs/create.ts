import type { APIRoute } from 'astro';
import { verifyToken } from '../../../lib/auth/jwt';
import { createDocDraft } from '../../../lib/db/docs';
import { splitMarkdownIntoTopics } from '../../../lib/markdown/splitter';
import { extractLangBlocks } from '../../../lib/markdown/lang';
import { topicsToIndex } from '../../../lib/db/models';
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
    
    // Upload content to S3 first (primary storage)
    if (content) {
      await uploadMarkdown(category, slug, content);
    }

    // Split into topics — use EN content only for bilingual docs (consistent with editor)
    let contentToSplit = content || '';
    if (content) {
      const { en, hi } = extractLangBlocks(content);
      if (hi) contentToSplit = en; // bilingual: split only EN part
    }
    const topics = contentToSplit ? splitMarkdownIntoTopics(contentToSplit) : [];

    // MongoDB stores only metadata + topic index (no content)
    const draft = await createDocDraft({
      instructorId: payload.userId,
      instructorEmail: payload.email,
      category,
      title,
      slug,
      description: description || '',
      topics: topicsToIndex(topics),
      tags: tags || [],
    });
    
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
