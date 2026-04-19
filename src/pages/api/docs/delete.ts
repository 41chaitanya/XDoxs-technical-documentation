import type { APIRoute } from 'astro';
import { verifyToken } from '../../../lib/auth/jwt';
import { deleteDocDraft, getDocDraft } from '../../../lib/db/docs';
import { deleteDocContent } from '../../../lib/aws/s3';

export const DELETE: APIRoute = async ({ request, cookies }) => {
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
    
    const { draftId } = await request.json();
    
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
    
    const success = await deleteDocDraft(draftId);

    // Remove ALL content from S3 (markdown + rendered HTML)
    if (success && draft.category && draft.slug) {
      try {
        await deleteDocContent(draft.category, draft.slug);
      } catch (s3Err) {
        console.error('S3 delete failed (non-blocking):', s3Err);
      }
    }
    
    return new Response(JSON.stringify({ success }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Delete doc error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
