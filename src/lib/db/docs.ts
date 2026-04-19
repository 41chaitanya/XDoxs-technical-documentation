// Document operations — MongoDB stores metadata only, content lives in S3
import { getDb } from './mongodb';
import { COLLECTIONS, type DocDraft, type TopicIndex, stripContentFields } from './models';
import { ObjectId } from 'mongodb';

export async function createDocDraft(data: {
  instructorId: string;
  instructorEmail: string;
  category: string;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  topics?: TopicIndex[];
}): Promise<DocDraft> {
  const db = await getDb();
  const draftsCollection = db.collection<DocDraft>(COLLECTIONS.DOC_DRAFTS);
  
  // Only metadata — no content, renderedHtml, or renderedHtmlHi
  const draft: DocDraft = {
    ...data,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const result = await draftsCollection.insertOne(stripContentFields(draft) as any);
  draft._id = result.insertedId;
  
  return draft;
}

export async function updateDocDraft(
  draftId: string,
  updates: Partial<Omit<DocDraft, '_id' | 'instructorId' | 'createdAt'>>
): Promise<DocDraft | null> {
  const db = await getDb();
  const draftsCollection = db.collection<DocDraft>(COLLECTIONS.DOC_DRAFTS);
  
  // Strip S3-only fields — never persist content to MongoDB
  const safeUpdates = stripContentFields({ ...updates });
  
  const result = await draftsCollection.findOneAndUpdate(
    { _id: new ObjectId(draftId) } as any,
    { 
      $set: { 
        ...safeUpdates, 
        updatedAt: new Date() 
      } 
    },
    { returnDocument: 'after' }
  );
  
  return result || null;
}

export async function getDocDraft(draftId: string): Promise<DocDraft | null> {
  const db = await getDb();
  const draftsCollection = db.collection<DocDraft>(COLLECTIONS.DOC_DRAFTS);
  
  return await draftsCollection.findOne({ _id: new ObjectId(draftId) } as any);
}

export async function getInstructorDrafts(instructorId: string): Promise<DocDraft[]> {
  const db = await getDb();
  const draftsCollection = db.collection<DocDraft>(COLLECTIONS.DOC_DRAFTS);
  
  return await draftsCollection
    .find({ instructorId })
    .sort({ updatedAt: -1 })
    .toArray();
}

export async function getPendingReviews(): Promise<DocDraft[]> {
  const db = await getDb();
  const draftsCollection = db.collection<DocDraft>(COLLECTIONS.DOC_DRAFTS);
  
  return await draftsCollection
    .find({ status: 'pending_review' })
    .sort({ updatedAt: -1 })
    .toArray();
}

export async function getAllDrafts(): Promise<DocDraft[]> {
  const db = await getDb();
  const draftsCollection = db.collection<DocDraft>(COLLECTIONS.DOC_DRAFTS);
  
  return await draftsCollection
    .find({})
    .sort({ updatedAt: -1 })
    .toArray();
}

export async function deleteDocDraft(draftId: string): Promise<boolean> {
  const db = await getDb();
  const draftsCollection = db.collection<DocDraft>(COLLECTIONS.DOC_DRAFTS);
  
  const result = await draftsCollection.deleteOne({ _id: new ObjectId(draftId) } as any);
  return result.deletedCount > 0;
}
