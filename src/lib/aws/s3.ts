/**
 * AWS S3 client — PRIMARY storage for doc content.
 *
 * S3 stores:
 *   - Raw markdown:     docs/{category}/{slug}.md
 *   - Rendered HTML EN: docs/{category}/{slug}.html
 *   - Rendered HTML HI: docs/{category}/{slug}.hi.html
 *
 * MongoDB stores only metadata (title, slug, category, status, topic index, etc.)
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION = process.env.AWS_REGION || 'ap-south-2';
const BUCKET = process.env.S3_DOCS_BUCKET || 'xdoxs-docs-content';
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || '';
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';

let _client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: REGION,
      ...(ACCESS_KEY && SECRET_KEY
        ? { credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY } }
        : {}),
    });
  }
  return _client;
}

/** Build the S3 key for a doc's markdown file */
function docKey(category: string, slug: string): string {
  return `docs/${category}/${slug}.md`;
}

/** Build the S3 key for rendered HTML */
function htmlKey(category: string, slug: string, lang: 'en' | 'hi' = 'en'): string {
  return lang === 'hi'
    ? `docs/${category}/${slug}.hi.html`
    : `docs/${category}/${slug}.html`;
}

// ─── Markdown Operations ────────────────────────────────────────

/** Upload markdown content to S3 (primary storage) */
export async function uploadMarkdown(
  category: string,
  slug: string,
  content: string
): Promise<void> {
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
    throw err;
  }
}

/** Delete markdown file from S3 */
export async function deleteMarkdown(
  category: string,
  slug: string
): Promise<void> {
  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: docKey(category, slug),
    })
  );
  console.log(`🗑️  S3: Deleted ${docKey(category, slug)}`);
}

// ─── Rendered HTML Operations ───────────────────────────────────

/** Upload pre-rendered HTML to S3 */
export async function uploadRenderedHtml(
  category: string,
  slug: string,
  html: string,
  lang: 'en' | 'hi' = 'en'
): Promise<void> {
  const client = getS3Client();
  const key = htmlKey(category, slug, lang);
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: html,
      ContentType: 'text/html; charset=utf-8',
      Metadata: {
        category,
        slug,
        lang,
        'rendered-at': new Date().toISOString(),
      },
    })
  );
  console.log(`📦 S3: Uploaded rendered HTML ${key}`);
}

/** Get pre-rendered HTML from S3 */
export async function getRenderedHtml(
  category: string,
  slug: string,
  lang: 'en' | 'hi' = 'en'
): Promise<string | null> {
  try {
    const client = getS3Client();
    const response = await client.send(
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: htmlKey(category, slug, lang),
      })
    );
    return (await response.Body?.transformToString('utf-8')) ?? null;
  } catch (err: any) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw err;
  }
}

/** Delete all rendered HTML for a doc (both languages) */
export async function deleteRenderedHtml(
  category: string,
  slug: string
): Promise<void> {
  const client = getS3Client();
  const keys = [htmlKey(category, slug, 'en'), htmlKey(category, slug, 'hi')];
  await client.send(
    new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: {
        Objects: keys.map(Key => ({ Key })),
        Quiet: true,
      },
    })
  );
  console.log(`🗑️  S3: Deleted rendered HTML for ${category}/${slug}`);
}

// ─── Composite Helpers ──────────────────────────────────────────

/** Load all content for a doc from S3 (markdown + rendered HTML) */
export async function getDocContent(
  category: string,
  slug: string
): Promise<{ markdown: string; htmlEn: string | null; htmlHi: string | null }> {
  const [markdown, htmlEn, htmlHi] = await Promise.all([
    getMarkdown(category, slug),
    getRenderedHtml(category, slug, 'en'),
    getRenderedHtml(category, slug, 'hi'),
  ]);
  return { markdown: markdown || '', htmlEn, htmlHi };
}

/** Delete all S3 objects for a doc (markdown + HTML) */
export async function deleteDocContent(
  category: string,
  slug: string
): Promise<void> {
  const client = getS3Client();
  const keys = [
    docKey(category, slug),
    htmlKey(category, slug, 'en'),
    htmlKey(category, slug, 'hi'),
  ];
  await client.send(
    new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: {
        Objects: keys.map(Key => ({ Key })),
        Quiet: true,
      },
    })
  );
  console.log(`🗑️  S3: Deleted all content for ${category}/${slug}`);
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
