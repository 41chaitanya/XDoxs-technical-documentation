/**
 * CloudFront cache invalidation for smart cache management.
 * 
 * Strategy:
 *   - Republish existing doc: invalidate specific doc path + nav + homepage
 *   - New doc published: invalidate nav + homepage only (no existing cache to bust)
 *   - Unpublish: invalidate specific doc path + nav + homepage
 *   - CI/CD full deploy: invalidate everything (/*)
 */

import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';

const REGION = process.env.AWS_REGION || 'ap-south-2';
const DISTRIBUTION_ID =
  process.env.CLOUDFRONT_DISTRIBUTION_ID || '';
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || '';
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';

let _client: CloudFrontClient | null = null;

function getCFClient(): CloudFrontClient {
  if (!_client) {
    _client = new CloudFrontClient({
      region: REGION,
      ...(ACCESS_KEY && SECRET_KEY
        ? { credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY } }
        : {}),
    });
  }
  return _client;
}

/** Create a CloudFront invalidation for the given paths */
async function invalidate(paths: string[]): Promise<string | null> {
  if (!DISTRIBUTION_ID) {
    console.warn('⚠️  CLOUDFRONT_DISTRIBUTION_ID not set — skipping invalidation');
    return null;
  }

  const client = getCFClient();
  const callerRef = `xdoxs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const result = await client.send(
    new CreateInvalidationCommand({
      DistributionId: DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: callerRef,
        Paths: {
          Quantity: paths.length,
          Items: paths,
        },
      },
    })
  );

  const invalidationId = result.Invalidation?.Id || 'unknown';
  console.log(`🔄 CloudFront: Invalidation ${invalidationId} created for ${paths.join(', ')}`);
  return invalidationId;
}

/**
 * Invalidate a specific doc page + navigation + homepage.
 * Used when an EXISTING doc is republished or unpublished.
 */
export async function invalidateDocPath(
  category: string,
  slug: string
): Promise<string | null> {
  return invalidate([
    `/docs/${category}/${slug}`,
    `/docs/${category}/${slug}/*`,
    '/api/docs/nav',
    '/index.html',
    '/',
  ]);
}

/**
 * Invalidate navigation + homepage only.
 * Used when a NEW doc is published for the first time.
 * (No existing doc cache path to bust.)
 */
export async function invalidateNavOnly(): Promise<string | null> {
  return invalidate([
    '/api/docs/nav',
    '/index.html',
    '/',
  ]);
}

/**
 * Invalidate everything.
 * Used by CI/CD pipeline after deploying code changes.
 */
export async function invalidateAll(): Promise<string | null> {
  return invalidate(['/*']);
}

export { DISTRIBUTION_ID };
