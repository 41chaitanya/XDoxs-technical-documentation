import type { APIRoute } from 'astro';
import { verifyToken } from '../../../lib/auth/jwt';
import { getDocDraft, updateDocDraft } from '../../../lib/db/docs';
import { publishDocToStatic } from '../../../lib/docs/publisher';
import { uploadMarkdown } from '../../../lib/aws/s3';
import { invalidateDocPath, invalidateNavOnly } from '../../../lib/aws/cloudfront';

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

    // Smart CloudFront invalidation — NO full /* invalidation
    let invalidationId: string | null = null;
    try {
      if (isRepublish) {
        // Edited doc: invalidate specific doc path + nav + homepage
        invalidationId = await invalidateDocPath(draft.category, draft.slug);
      } else {
        // New doc: only invalidate nav + homepage (sidebar update)
        invalidationId = await invalidateNavOnly();
      }
    } catch (cfErr) {
      console.error('CloudFront invalidation failed (non-blocking):', cfErr);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        isRepublish,
        invalidationId,
        message: isRepublish 
          ? `Document approved & republished. CF invalidation for /docs/${draft.category}/${draft.slug}` 
          : 'Document approved & published!'
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
