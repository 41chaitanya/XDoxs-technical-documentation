import type { APIRoute } from 'astro';
import { verifyToken } from '../../../lib/auth/jwt';
import { getDocDraft, updateDocDraft } from '../../../lib/db/docs';
import { publishDocToStatic } from '../../../lib/docs/publisher';
import { uploadMarkdown } from '../../../lib/aws/s3';
import { triggerBuild } from '../../../lib/aws/codebuild';

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
    
    // Detect if this is a first publish or republish
    const isRepublish = !!draft.publishedAt;

    // Pre-render HTML and save — do this BEFORE status update
    await publishDocToStatic(draft);

    // Update status to approved
    await updateDocDraft(draftId, {
      status: 'approved',
      publishedAt: new Date(),
    });

    // Sync final markdown to S3
    try {
      await uploadMarkdown(draft.category, draft.slug, draft.content || '');
    } catch (s3Err) {
      console.error('S3 sync failed (non-blocking):', s3Err);
    }

    // 🚀 Trigger CodeBuild with smart invalidation (optional - skip if no permissions)
    try {
      const invalidationType = isRepublish ? 'republish' : 'new';
      const buildId = await triggerBuild(invalidationType, draft.category, draft.slug);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          isRepublish,
          buildId,
          message: buildId 
            ? `Document approved and build triggered (${invalidationType})` 
            : 'Document approved — manual rebuild required'
        }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (buildErr: any) {
      console.warn('⚠️  CodeBuild trigger failed (non-blocking):', buildErr.message);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          isRepublish,
          message: 'Document approved (CodeBuild skipped - no permissions)'
        }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Approve error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
