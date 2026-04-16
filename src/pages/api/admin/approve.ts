import type { APIRoute } from 'astro';
import { verifyToken } from '../../../lib/auth/jwt';
import { getDocDraft, updateDocDraft } from '../../../lib/db/docs';
import { publishDocToStatic } from '../../../lib/docs/publisher';

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
    
    if (!payload || payload.role !== 'super_admin') {
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
    
    const draft = await getDocDraft(draftId);
    if (!draft) {
      return new Response(JSON.stringify({ error: 'Draft not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Pre-render HTML and save — do this BEFORE status update
    await publishDocToStatic(draft);

    // Update status to approved
    await updateDocDraft(draftId, {
      status: 'approved',
      publishedAt: new Date(),
    });

    // 🚀 Trigger rebuild on Vercel (if deploy hook is configured)
    const deployHook = import.meta.env.VERCEL_DEPLOY_HOOK;
    if (deployHook) {
      try {
        await fetch(deployHook, { method: 'POST' });
        console.log('✅ Rebuild triggered on Vercel');
      } catch (error) {
        console.error('❌ Failed to trigger rebuild:', error);
        // Don't fail the approval if rebuild fails
      }
    } else {
      console.log('⚠️ No deploy hook configured - manual rebuild required');
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: deployHook 
          ? 'Document approved and rebuild triggered' 
          : 'Document approved - manual rebuild required'
      }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Approve error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
