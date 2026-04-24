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

const REGION = import.meta.env.AWS_REGION || process.env.AWS_REGION || 'ap-south-2';
const BUCKET = import.meta.env.S3_DOCS_BUCKET || process.env.S3_DOCS_BUCKET || 'xdoxs-docs-content';

let _client: S3Client | null = null;

/** Check if we should use S3 (production deployment only, not local preview) */
function shouldUseS3(): boolean {
  // Check if explicitly enabled for local testing
  const enableS3Locally = process.env.ENABLE_S3_LOCAL === 'true';
  
  // In production, always try to use S3 if credentials are available
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Skip S3 if:
  // 1. Not in production AND not explicitly enabled for local testing
  // 2. OR AWS credentials are not available
  if (!isProduction && !enableS3Locally) {
    return false;
  }
  
  // Check if AWS credentials are available
  if (!process.env.AWS_REGION && !process.env.AWS_ACCESS_KEY_ID) {
    return false;
  }
  
  return true;
}

function getS3Client(): S3Client {
  if (!_client) {
    _client = new S3Client({ region: REGION });
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
  const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    console.log('🔧 Local dev: Skipping S3 fetch (using MongoDB)');
    return null;
  }

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
    return null; // Fallback to MongoDB
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
