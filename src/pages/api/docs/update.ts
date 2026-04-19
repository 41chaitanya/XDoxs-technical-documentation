import type { APIRoute } from 'astro';
import { verifyToken } from '../../../lib/auth/jwt';
import { updateDocDraft, getDocDraft } from '../../../lib/db/docs';
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

    // Handle append mode
    let finalContent = content;
    if (append && content) {
      finalContent = draft.content ? `${draft.content}\n\n${content}` : content;
    }

    // Re-split topics if content changed
    const topics = finalContent ? splitMarkdownIntoTopics(finalContent) : draft.topics;
    
    const updatedDraft = await updateDocDraft(draftId, { 
      content: finalContent,
      topics 
    });

    // Sync updated content to S3
    if (finalContent && draft.category && draft.slug) {
      try {
        await uploadMarkdown(draft.category, draft.slug, finalContent);
      } catch (s3Err) {
        console.error('S3 sync failed (non-blocking):', s3Err);
      }
    }
    
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
    const { draftId, ...updates } = data;
    
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
    const hasContentChange = updates.content !== undefined || updates.topics !== undefined;
    const isStatusExplicit = updates.status !== undefined;
    const wasUnpublished = draft.status === 'approved' && hasContentChange && !isStatusExplicit;
    if (wasUnpublished) {
      updates.status = 'draft';
    }

    const updatedDraft = await updateDocDraft(draftId, updates);
    
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
