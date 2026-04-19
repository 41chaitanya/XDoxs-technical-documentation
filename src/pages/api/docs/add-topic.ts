import type { APIRoute } from 'astro';
import { verifyToken } from '../../../lib/auth/jwt';
import { getDocDraft, updateDocDraft } from '../../../lib/db/docs';
import type { Topic, TopicIndex } from '../../../lib/db/models';
import { uploadMarkdown, getMarkdown } from '../../../lib/aws/s3';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('auth_token')?.value;
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    const payload = verifyToken(token);
    if (!payload || (payload.role !== 'instructor' && payload.role !== 'super_admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const { draftId, title, content = '' } = await request.json();
    if (!draftId || !title) {
      return new Response(JSON.stringify({ error: 'draftId and title required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const draft = await getDocDraft(draftId);
    if (!draft) return new Response(JSON.stringify({ error: 'Draft not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    if (draft.instructorId !== payload.userId && payload.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const topicContent = content || `## ${title}\n\nStart writing here...`;
    const newTopicIndex: TopicIndex = {
      id: `topic-${Date.now()}`,
      title,
      slug,
      order: (draft.topics || []).length,
    };

    // Update topic index in MongoDB (no content)
    const updatedTopics = [...(draft.topics || []), newTopicIndex];
    await updateDocDraft(draftId, { topics: updatedTopics });

    // Append new topic content to S3 markdown
    const existingContent = await getMarkdown(draft.category, draft.slug) || '';
    const fullContent = existingContent ? `${existingContent}\n\n${topicContent}` : topicContent;
    await uploadMarkdown(draft.category, draft.slug, fullContent);

    return new Response(JSON.stringify({ success: true, topic: { ...newTopicIndex, content: topicContent } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Add topic error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
