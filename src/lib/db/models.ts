// Database models and types
import type { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'super_admin' | 'instructor' | 'student';
  createdAt: Date;
}

/** Topic index stored in MongoDB — metadata only, no content */
export interface TopicIndex {
  id: string;
  title: string;
  slug: string;
  order: number;
}

/** Full topic with content — runtime only, content loaded from S3 */
export interface Topic extends TopicIndex {
  content: string;
}

/**
 * DocDraft — metadata stored in MongoDB.
 *
 * Content fields (markdown, rendered HTML) are stored in S3:
 *   - Raw markdown  → s3://bucket/docs/{category}/{slug}.md
 *   - Rendered HTML  → s3://bucket/docs/{category}/{slug}.html
 *   - Rendered HI    → s3://bucket/docs/{category}/{slug}.hi.html
 */
export interface DocDraft {
  _id?: ObjectId;
  instructorId: string;
  instructorEmail: string;
  category: string;
  title: string;
  slug: string;
  description: string;
  // Content lives in S3 — NOT persisted to MongoDB
  content?: string;
  renderedHtml?: string;
  renderedHtmlHi?: string;
  topics?: TopicIndex[]; // Topic index (no content) — content derived from S3 markdown
  tags: string[];
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'needs_changes';
  feedback?: string; // Admin feedback
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

/** Fields that must NOT be persisted to MongoDB (stored in S3 instead) */
export const S3_ONLY_FIELDS = ['content', 'renderedHtml', 'renderedHtmlHi'] as const;

/** Strip S3-only content fields before writing to MongoDB */
export function stripContentFields<T extends Record<string, any>>(doc: T): Omit<T, 'content' | 'renderedHtml' | 'renderedHtmlHi'> {
  const copy = { ...doc };
  for (const field of S3_ONLY_FIELDS) {
    delete copy[field];
  }
  return copy;
}

/** Strip content from topic objects, keeping only the index */
export function topicsToIndex(topics: Topic[]): TopicIndex[] {
  return topics.map(({ id, title, slug, order }) => ({ id, title, slug, order }));
}

export interface PublishedDoc {
  _id?: ObjectId;
  docDraftId: string;
  category: string;
  title: string;
  slug: string;
  filePath: string; // S3 key for the markdown file
  publishedAt: Date;
  publishedBy: string; // Admin ID
}

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  DOC_DRAFTS: 'doc_drafts',
  PUBLISHED_DOCS: 'published_docs',
} as const;
