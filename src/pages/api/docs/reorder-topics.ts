import type { APIRoute } from 'astro';
import { verifyToken } from '../../../lib/auth/jwt';
import { getDocDraft, updateDocDraft } from '../../../lib/db/docs';
import { uploadMarkdown } from '../../../lib/aws/s3';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('auth_token')?.value;
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    const payload = verifyToken(token);
    if (!payload || (payload.role !== 'instructor' && payload.role !== 'super_admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const { draftId, topicIds } = await request.json(); // topicIds: string[] in new order
    if (!draftId || !Array.isArray(topicIds)) {
      return new Response(JSON.stringify({ error: 'draftId and topicIds required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const draft = await getDocDraft(draftId);
    if (!draft) return new Response(JSON.stringify({ error: 'Draft not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    if (draft.instructorId !== payload.userId && payload.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const topicMap = new Map((draft.topics || []).map(t => [t.id, t]));
    const reordered = topicIds
      .map((id: string, index: number) => {
        const t = topicMap.get(id);
        return t ? { ...t, order: index } : null;
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);

    const fullContent = reordered.map(t => t.content).join('\n\n');
    await updateDocDraft(draftId, { topics: reordered, content: fullContent });

    // Sync to S3
    try { await uploadMarkdown(draft.category, draft.slug, fullContent); } catch (e) { console.error('S3 sync failed:', e); }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Reorder error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
