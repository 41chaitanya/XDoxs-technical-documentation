import type { APIRoute } from 'astro';
import { verifyToken } from '../../../lib/auth/jwt';
import { getDocDraft, updateDocDraft } from '../../../lib/db/docs';
import { splitMarkdownIntoTopics } from '../../../lib/markdown/splitter';
import { uploadMarkdown, getMarkdown } from '../../../lib/aws/s3';

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

    // Load content from S3 and split into topics
    const markdown = await getMarkdown(draft.category, draft.slug) || '';
    const splitTopics = splitMarkdownIntoTopics(markdown);
    const topicIndex = draft.topics || [];

    // Build a map from topic id -> position in current order
    const idToPos = new Map(topicIndex.map((t, i) => [t.id, i]));

    // Reorder topic index and content based on new order
    const reorderedIndex = topicIds
      .map((id: string, index: number) => {
        const meta = topicIndex.find(t => t.id === id);
        return meta ? { ...meta, order: index } : null;
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);

    // Reorder content sections to match
    const reorderedContent = topicIds
      .map((id: string) => {
        const pos = idToPos.get(id);
        return pos !== undefined && splitTopics[pos] ? splitTopics[pos].content : '';
      })
      .filter(Boolean);

    // Upload reordered content to S3
    const fullContent = reorderedContent.join('\n\n');
    await uploadMarkdown(draft.category, draft.slug, fullContent);

    // Update topic index in MongoDB (no content)
    await updateDocDraft(draftId, { topics: reorderedIndex });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Reorder error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
