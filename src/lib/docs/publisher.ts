import { renderMarkdown } from '../markdown/render';
import { splitMarkdownIntoTopics, extractHeadingsFromTopic } from '../markdown/splitter';
import { getDb } from '../db/mongodb';
import { COLLECTIONS } from '../db/models';
import type { DocDraft } from '../db/models';
import { ObjectId } from 'mongodb';

// Called at approve time — pre-renders markdown to HTML and saves in MongoDB.
// Public pages serve this pre-rendered HTML directly — no per-request rendering.
export async function publishDocToStatic(draft: DocDraft) {
  // Strip frontmatter if present (--- ... ---) before rendering
  const content = draft.content.replace(/^---[\s\S]*?---\n?/, '').trim();

  const renderedHtml = await renderMarkdown(content);

  const db = await getDb();

  // _id can be string or ObjectId — handle both safely
  const filter = draft._id
    ? { _id: ObjectId.isValid(String(draft._id)) ? new ObjectId(String(draft._id)) : draft._id }
    : { category: draft.category, slug: draft.slug };

  await db.collection(COLLECTIONS.DOC_DRAFTS).updateOne(
    filter,
    { $set: { renderedHtml, status: 'approved', publishedAt: new Date() } }
  );

  console.log(`✅ Pre-rendered and saved: ${draft.category}/${draft.slug}`);
  return { success: true };
}

export async function unpublishDoc(category: string, slug: string) {
  // Clear pre-rendered HTML when unpublished
  const db = await getDb();
  await db.collection(COLLECTIONS.DOC_DRAFTS).updateOne(
    { category, slug },
    { $unset: { renderedHtml: '' } }
  );
  console.log(`✅ Unpublished: ${category}/${slug}`);
  return { success: true };
}
