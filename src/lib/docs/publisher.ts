import { renderMarkdown } from '../markdown/render';
import { extractLangBlocks } from '../markdown/lang';
import { getDb } from '../db/mongodb';
import { COLLECTIONS } from '../db/models';
import type { DocDraft } from '../db/models';
import { ObjectId } from 'mongodb';
import { getMarkdown, uploadRenderedHtml, deleteRenderedHtml } from '../aws/s3';

export async function publishDocToStatic(draft: DocDraft) {
  // Load raw markdown from S3 (primary source of truth)
  const rawContent = await getMarkdown(draft.category, draft.slug) || '';
  const { en: enContent, hi: hiContent } = extractLangBlocks(rawContent);

  const renderedHtml = await renderMarkdown(enContent);
  const renderedHtmlHi = hiContent ? await renderMarkdown(hiContent) : '';

  // Upload rendered HTML to S3
  await uploadRenderedHtml(draft.category, draft.slug, renderedHtml, 'en');
  if (renderedHtmlHi) {
    await uploadRenderedHtml(draft.category, draft.slug, renderedHtmlHi, 'hi');
  }

  // Update ONLY status/date in MongoDB — no content fields
  const db = await getDb();
  const filter = draft._id
    ? { _id: ObjectId.isValid(String(draft._id)) ? new ObjectId(String(draft._id)) : draft._id }
    : { category: draft.category, slug: draft.slug };

  await db.collection(COLLECTIONS.DOC_DRAFTS).updateOne(
    filter as any,
    { $set: { status: 'approved', publishedAt: new Date() } }
  );

  console.log(`✅ Pre-rendered and saved to S3: ${draft.category}/${draft.slug}`);
  return { success: true };
}

export async function unpublishDoc(category: string, slug: string) {
  // Delete rendered HTML from S3
  try {
    await deleteRenderedHtml(category, slug);
  } catch (err) {
    console.error('Failed to delete rendered HTML from S3:', err);
  }

  // Update status in MongoDB (no content fields to clear)
  const db = await getDb();
  await db.collection(COLLECTIONS.DOC_DRAFTS).updateOne(
    { category, slug },
    { $set: { status: 'draft' } }
  );
  return { success: true };
}
