import { renderMarkdown } from '../markdown/render';
import { extractLangBlocks } from '../markdown/lang';
import { getDb } from '../db/mongodb';
import { COLLECTIONS } from '../db/models';
import type { DocDraft } from '../db/models';
import { ObjectId } from 'mongodb';

export async function publishDocToStatic(draft: DocDraft) {
  const { en: enContent, hi: hiContent } = extractLangBlocks(String(draft.content || ''));

  const renderedHtml = await renderMarkdown(enContent);
  const renderedHtmlHi = hiContent ? await renderMarkdown(hiContent) : '';

  const db = await getDb();

  const filter = draft._id
    ? { _id: ObjectId.isValid(String(draft._id)) ? new ObjectId(String(draft._id)) : draft._id }
    : { category: draft.category, slug: draft.slug };

  await db.collection(COLLECTIONS.DOC_DRAFTS).updateOne(
    filter,
    { $set: { renderedHtml, renderedHtmlHi, status: 'approved', publishedAt: new Date() } }
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
