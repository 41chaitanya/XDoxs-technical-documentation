import type { APIRoute } from 'astro';
import { verifyToken } from '../../../lib/auth/jwt';
import { getDocDraft, updateDocDraft } from '../../../lib/db/docs';
import { splitMarkdownIntoTopics } from '../../../lib/markdown/splitter';
import { uploadMarkdown, getMarkdown } from '../../../lib/aws/s3';

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('auth_token')?.value;
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    const payload = verifyToken(token);
    if (!payload || (payload.role !== 'instructor' && payload.role !== 'super_admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const { draftId, topicId } = await request.json();
    if (!draftId || !topicId) {
      return new Response(JSON.stringify({ error: 'draftId and topicId required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const draft = await getDocDraft(draftId);
    if (!draft) return new Response(JSON.stringify({ error: 'Draft not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    if (draft.instructorId !== payload.userId && payload.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    // Load content from S3, split into topics, remove the target
    const markdown = await getMarkdown(draft.category, draft.slug) || '';
    const splitTopics = splitMarkdownIntoTopics(markdown);
    const topicIndex = draft.topics || [];

    // Find the position of the topic to delete
    const deleteIdx = topicIndex.findIndex(t => t.id === topicId);
    if (deleteIdx === -1) {
      return new Response(JSON.stringify({ error: 'Topic not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // Remove from both arrays
    splitTopics.splice(deleteIdx, 1);
    const updatedTopics = topicIndex
      .filter(t => t.id !== topicId)
      .map((t, i) => ({ ...t, order: i }));

    // Rebuild content and upload to S3
    const fullContent = splitTopics.map(t => t.content).join('\n\n');
    await uploadMarkdown(draft.category, draft.slug, fullContent);

    // Update topic index in MongoDB (no content)
    await updateDocDraft(draftId, { topics: updatedTopics });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Delete topic error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
