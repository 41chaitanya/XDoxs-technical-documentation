import type { APIRoute } from 'astro';
import { verifyToken } from '../../../lib/auth/jwt';
import { getDocDraft, updateDocDraft } from '../../../lib/db/docs';
import { unpublishDoc } from '../../../lib/docs/publisher';
import { invalidateDocPath } from '../../../lib/aws/cloudfront';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('auth_token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { 'Content-Type': 'application/json' },
      });
    }

    const { draftId } = await request.json();
    if (!draftId) {
      return new Response(JSON.stringify({ error: 'Draft ID required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const draft = await getDocDraft(draftId);
    if (!draft) {
      return new Response(JSON.stringify({ error: 'Draft not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete rendered HTML from S3 and revert status in MongoDB
    try {
      await unpublishDoc(draft.category, draft.slug);
    } catch {
      // Non-blocking — HTML may already be gone
    }

    // Revert status back to draft in MongoDB
    await updateDocDraft(draftId, { status: 'draft' });

    // Invalidate CloudFront for this specific doc path so it stops being served
    let invalidationId: string | null = null;
    try {
      invalidationId = await invalidateDocPath(draft.category, draft.slug);
    } catch (cfErr) {
      console.error('CloudFront invalidation failed (non-blocking):', cfErr);
    }

    return new Response(JSON.stringify({
      success: true,
      invalidationId,
      message: `Document unpublished. CF invalidation for /docs/${draft.category}/${draft.slug}`
    }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unpublish error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
