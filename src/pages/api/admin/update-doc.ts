import type { APIRoute } from 'astro';
import { verifyToken } from '../../../lib/auth/jwt';
import { updateDocDraft } from '../../../lib/db/docs';

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
    
    if (!payload || payload.role !== 'admin' && payload.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const { draftId, content } = await request.json();
    
    if (!draftId || !content) {
      return new Response(JSON.stringify({ error: 'Draft ID and content required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Update the draft with new content and set status to pending_review
    await updateDocDraft(draftId, {
      content,
      status: 'pending_review',
      feedback: 'Updated content - awaiting re-review',
    });
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Changes submitted for review'
    }), {
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
