/**
 * AWS S3 client for markdown file storage.
 * 
 * ENVIRONMENT BEHAVIOR:
 * - Local Development: S3 operations are skipped, MongoDB is used
 * - Production: S3 is used for storage with MongoDB as metadata store
 * 
 * Uses presigned URLs for secure uploads from the admin panel.
 * EC2 instance uses IAM role — no access keys needed.
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Handle both Astro (import.meta.env) and Node scripts (process.env)
const REGION = (typeof import.meta !== 'undefined' && import.meta.env?.AWS_REGION)
  || process.env.AWS_REGION
  || 'ap-south-2';

const BUCKET = (typeof import.meta !== 'undefined' && import.meta.env?.S3_DOCS_BUCKET)
  || process.env.S3_DOCS_BUCKET
  || 'xdoxs-docs-656829';

const ACCESS_KEY_ID = (typeof import.meta !== 'undefined' && import.meta.env?.AWS_ACCESS_KEY_ID)
  || process.env.AWS_ACCESS_KEY_ID;

const SECRET_ACCESS_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.AWS_SECRET_ACCESS_KEY)
  || process.env.AWS_SECRET_ACCESS_KEY;

let _client: S3Client | null = null;

/** Check if we should use S3 */
function shouldUseS3(): boolean {
  // Read from both import.meta.env (Astro SSR) and process.env (scripts)
  const enableS3Locally =
    (typeof import.meta !== 'undefined' && import.meta.env?.ENABLE_S3_LOCAL === 'true') ||
    process.env.ENABLE_S3_LOCAL === 'true';

  const isProduction =
    (typeof import.meta !== 'undefined' && import.meta.env?.PROD === true) ||
    process.env.NODE_ENV === 'production';

  if (!isProduction && !enableS3Locally) return false;

  // Need at least a region to talk to S3
  const hasRegion =
    (typeof import.meta !== 'undefined' && !!import.meta.env?.AWS_REGION) ||
    !!process.env.AWS_REGION;

  return hasRegion;
}

/** Export as isS3Enabled for external use */
export function isS3Enabled(): boolean {
  return shouldUseS3();
}

function getS3Client(): S3Client {
  if (!_client) {
    const config: any = { region: REGION };
    
    if (ACCESS_KEY_ID && SECRET_ACCESS_KEY) {
      config.credentials = {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
      };
    }
    
    _client = new S3Client(config);
  }
  return _client;
}

/** Build the S3 key for a doc's markdown file */
function docKey(category: string, slug: string): string {
  return `docs/${category}/${slug}.md`;
}

// ─── Direct Operations (server-side) ────────────────────────────

/** Upload markdown content directly to S3 */
export async function uploadMarkdown(
  category: string,
  slug: string,
  content: string
): Promise<void> {
  // Skip S3 upload in local development
  if (!shouldUseS3()) {
    console.log('🔧 Local dev: Skipping S3 upload (MongoDB only)');
    return;
  }

  // In production, attempt S3 upload (will use IAM role on EC2 or env credentials)
  try {
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: docKey(category, slug),
        Body: content,
        ContentType: 'text/markdown; charset=utf-8',
        Metadata: {
          category,
          slug,
          'updated-at': new Date().toISOString(),
        },
      })
    );
    console.log(`📦 S3: Uploaded ${docKey(category, slug)}`);
  } catch (error) {
    console.error('⚠️ S3 upload failed (non-blocking):', error);
    // Don't throw - allow operation to continue without S3
  }
}

/** Get markdown content from S3 */
export async function getMarkdown(
  category: string,
  slug: string
): Promise<string | null> {
  try {
    const client = getS3Client();
    const response = await client.send(
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: docKey(category, slug),
      })
    );
    return (await response.Body?.transformToString('utf-8')) ?? null;
  } catch (err: any) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      return null;
    }
    console.error('⚠️ S3 fetch failed:', err);
    return null;
  }
}

/** Delete markdown file from S3 */
export async function deleteMarkdown(
  category: string,
  slug: string
): Promise<void> {
  const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    console.log('🔧 Local dev: Skipping S3 delete (MongoDB only)');
    return;
  }

  try {
    const client = getS3Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: docKey(category, slug),
      })
    );
    console.log(`🗑️  S3: Deleted ${docKey(category, slug)}`);
  } catch (error) {
    console.error('⚠️ S3 delete failed (non-blocking):', error);
    // Don't throw - allow operation to continue
  }
}

/** List all markdown files in S3 (optionally filtered by category) */
export async function listMarkdownFiles(
  category?: string
): Promise<Array<{ key: string; lastModified?: Date }>> {
  const client = getS3Client();
  const prefix = category ? `docs/${category}/` : 'docs/';
  const result = await client.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
    })
  );
  return (result.Contents || []).map((obj) => ({
    key: obj.Key || '',
    lastModified: obj.LastModified,
  }));
}

// ─── Presigned URL Operations ───────────────────────────────────

/** Generate a presigned PUT URL for uploading MD content from the client */
export async function getPresignedUploadUrl(
  category: string,
  slug: string,
  expiresIn: number = 300 // 5 minutes
): Promise<string> {
  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: docKey(category, slug),
    ContentType: 'text/markdown; charset=utf-8',
    Metadata: {
      category,
      slug,
      'updated-at': new Date().toISOString(),
    },
  });
  return getSignedUrl(client, command, { expiresIn });
}

/** Generate a presigned GET URL for downloading MD content */
export async function getPresignedDownloadUrl(
  category: string,
  slug: string,
  expiresIn: number = 300
): Promise<string> {
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: docKey(category, slug),
  });
  return getSignedUrl(client, command, { expiresIn });
}

export { BUCKET, REGION, docKey };

/** 
 * Load complete doc content from S3 with tab parsing
 * Returns markdown content parsed into tabs structure
 */
export async function getDocContent(
  category: string,
  slug: string
): Promise<{ 
  markdown: string; 
  tabs: any[];
  title: string;
  description: string;
  category: string;
  slug: string;
}> {
  if (!isS3Enabled()) {
    console.warn('⚠️  S3 not configured');
    return { 
      markdown: '', 
      tabs: [], 
      title: slug,
      description: '',
      category,
      slug
    };
  }
  
  // Get markdown from S3
  const markdown = await getMarkdown(category, slug);
  
  if (!markdown) {
    return { 
      markdown: '', 
      tabs: [], 
      title: slug,
      description: '',
      category,
      slug
    };
  }
  
  // Parse tabs from markdown
  const tabs = parseTabsFromMarkdown(markdown);
  
  // Extract title from first # heading
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : slug.replace(/-/g, ' ');
  
  // Extract description (first paragraph after title)
  const descMatch = markdown.match(/^#.+\n\n(.+)$/m);
  const description = descMatch ? descMatch[1].substring(0, 160) : '';
  
  return {
    markdown,
    tabs,
    title,
    description,
    category,
    slug
  };
}

/** 
 * Parse tab structure from markdown content
 * Supports tab markers: <!-- TAB: Title -->
 */
function parseTabsFromMarkdown(markdown: string): any[] {
  // Check if markdown has tab markers: <!-- TAB: Title -->
  const tabPattern = /<!--\s*TAB:\s*(.+?)\s*-->([\s\S]*?)(?=<!--\s*TAB:|$)/g;
  const tabs: any[] = [];
  let match;
  let order = 0;
  
  while ((match = tabPattern.exec(markdown)) !== null) {
    const title = match[1].trim();
    const content = match[2].trim();
    tabs.push({
      id: `tab-${Date.now()}-${order}`,
      title,
      content,
      order
    });
    order++;
  }
  
  // If no tabs found, create single tab with all content
  if (tabs.length === 0) {
    // Extract title from first # heading
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'Overview';
    
    tabs.push({
      id: `tab-${Date.now()}-0`,
      title,
      content: markdown,
      order: 0
    });
  }
  
  return tabs;
}
