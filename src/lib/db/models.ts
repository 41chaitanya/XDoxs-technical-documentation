// Database models and types
import type { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'super_admin' | 'admin' | 'instructor' | 'student';
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
  authorRole?: 'admin' | 'instructor'; // Track who created it
  category: string;
  title: string; // Main document title
  slug: string;
  description: string;
  content: string; // Full markdown content (for backward compatibility)
  renderedHtml?: string; // Pre-rendered HTML — English (generated at publish time)
  renderedHtmlHi?: string; // Pre-rendered HTML — Hinglish (generated at publish time)
  tabs?: Tab[]; // Multiple tabs (each tab = one uploaded MD file)
  tags: string[];
  status: 'draft' | 'pending_admin_review' | 'pending_review' | 'approved' | 'rejected' | 'needs_changes';
  feedback?: string; // Admin/Super admin feedback
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

export interface BlogPost {
  _id?: ObjectId;
  authorId: string;
  authorEmail: string;
  authorName: string;
  authorRole: 'instructor' | 'student'; // Track who wrote it
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown content
  coverImage?: string;
  category: string; // tech category like 'javascript', 'react', etc.
  tags: string[];
  status: 'draft' | 'pending_admin_review' | 'pending_review' | 'published' | 'rejected';
  views: number;
  likes: number;
  feedback?: string; // Admin/Super admin feedback
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface Notification {
  _id?: ObjectId;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string; // Optional URL to relevant page
  createdAt: Date;
}

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  DOC_DRAFTS: 'doc_drafts',
  PUBLISHED_DOCS: 'published_docs',
  BLOG_POSTS: 'blog_posts',
  NOTIFICATIONS: 'notifications',
} as const;
