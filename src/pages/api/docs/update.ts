import type { APIRoute } from 'astro';
import { verifyToken } from '../../../lib/auth/jwt';
import { updateDocDraft, getDocDraft } from '../../../lib/db/docs';
import { splitMarkdownIntoTopics } from '../../../lib/markdown/splitter';
import { topicsToIndex } from '../../../lib/db/models';
import { uploadMarkdown, getMarkdown } from '../../../lib/aws/s3';

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
    const { draftId, content, append = false } = data;
    
    if (!draftId) {
      return new Response(JSON.stringify({ error: 'Draft ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Verify ownership
    const draft = await getDocDraft(draftId);
    if (!draft) {
      return new Response(JSON.stringify({ error: 'Draft not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (draft.instructorId !== payload.userId && payload.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle append mode — fetch existing content from S3
    let finalContent = content;
    if (append && content) {
      const existingContent = await getMarkdown(draft.category, draft.slug) || '';
      finalContent = existingContent ? `${existingContent}\n\n${content}` : content;
    }

    // Re-split topics if content changed
    const topics = finalContent ? splitMarkdownIntoTopics(finalContent) : draft.topics;
    
    // Upload content to S3 (primary storage)
    if (finalContent && draft.category && draft.slug) {
      await uploadMarkdown(draft.category, draft.slug, finalContent);
    }

    // MongoDB gets only topic index — no content
    const updatedDraft = await updateDocDraft(draftId, { 
      topics: topics ? topicsToIndex(topics as any) : undefined,
    });
    
    return new Response(JSON.stringify({ success: true, draft: updatedDraft }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Update doc error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
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
    const { draftId, content, topics, ...metadataUpdates } = data;
    
    if (!draftId) {
      return new Response(JSON.stringify({ error: 'Draft ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Verify ownership
    const draft = await getDocDraft(draftId);
    if (!draft) {
      return new Response(JSON.stringify({ error: 'Draft not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (draft.instructorId !== payload.userId && payload.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Auto-unpublish: editing content/topics of a published doc marks it as draft
    const hasContentChange = content !== undefined || topics !== undefined;
    const isStatusExplicit = metadataUpdates.status !== undefined;
    const wasUnpublished = draft.status === 'approved' && hasContentChange && !isStatusExplicit;
    if (wasUnpublished) {
      metadataUpdates.status = 'draft';
    }

    // Upload content to S3 if provided
    if (content && draft.category && draft.slug) {
      await uploadMarkdown(draft.category, draft.slug, content);
    }

    // Build MongoDB update — topic index (no content), plus metadata
    const mongoUpdates: Record<string, any> = { ...metadataUpdates };
    if (topics) {
      // Strip content from topics before storing in MongoDB
      mongoUpdates.topics = topics.map((t: any) => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        order: t.order,
      }));
    }

    const updatedDraft = await updateDocDraft(draftId, mongoUpdates);
    
    return new Response(JSON.stringify({ success: true, draft: updatedDraft, wasUnpublished }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Update doc error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
