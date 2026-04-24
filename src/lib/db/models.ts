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

export interface Tab {
  id: string;
  title: string;
  content: string; // Full markdown content for this tab
  order: number;
}

export interface DocDraft {
  _id?: ObjectId;
  instructorId: string;
  instructorEmail: string;
  category: string;
  title: string; // Main document title
  slug: string;
  description: string;
  content: string; // Full markdown content (for backward compatibility)
  renderedHtml?: string; // Pre-rendered HTML — English (generated at publish time)
  renderedHtmlHi?: string; // Pre-rendered HTML — Hinglish (generated at publish time)
  tabs?: Tab[]; // Multiple tabs (each tab = one uploaded MD file)
  tags: string[];
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'needs_changes';
  feedback?: string; // Admin feedback
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface PublishedDoc {
  _id?: ObjectId;
  docDraftId: string;
  category: string;
  title: string;
  slug: string;
  content: string;
  filePath: string; // Path to generated .md file
  publishedAt: Date;
  publishedBy: string; // Admin ID
}

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  DOC_DRAFTS: 'doc_drafts',
  PUBLISHED_DOCS: 'published_docs',
} as const;
