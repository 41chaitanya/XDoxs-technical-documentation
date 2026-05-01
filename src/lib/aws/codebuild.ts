/**
 * AWS CodeBuild trigger for automated site rebuilds.
 * 
 * Called from the admin approve/publish/unpublish APIs to rebuild
 * static site content and sync to S3.
 * 
 * Environment variable overrides are passed to CodeBuild
 * so it knows which cache invalidation strategy to use.
 */

import {
  CodeBuildClient,
  StartBuildCommand,
} from '@aws-sdk/client-codebuild';

const REGION = import.meta.env.AWS_REGION || process.env.AWS_REGION || 'ap-south-2';
const PROJECT_NAME =
  import.meta.env.CODEBUILD_PROJECT_NAME ||
  process.env.CODEBUILD_PROJECT_NAME ||
  'xdoxs-build';

let _client: CodeBuildClient | null = null;

function getCBClient(): CodeBuildClient {
  if (!_client) {
    _client = new CodeBuildClient({ region: REGION });
  }
  return _client;
}

export type InvalidationType = 'new' | 'republish' | 'unpublish' | 'full';

/**
 * Trigger a CodeBuild run with invalidation context.
 * 
 * @param type       - 'new' | 'republish' | 'unpublish' | 'full'
 * @param category   - Doc category (for targeted invalidation)
 * @param slug       - Doc slug (for targeted invalidation)
 * @returns          - CodeBuild build ID or null if not configured
 */
export async function triggerBuild(
  type: InvalidationType,
  category?: string,
  slug?: string
): Promise<string | null> {
  if (!PROJECT_NAME) {
    console.warn('⚠️  CODEBUILD_PROJECT_NAME not set — skipping build trigger');
    return null;
  }

  const client = getCBClient();

  // Pass invalidation context as environment variable overrides
  const envOverrides: Array<{ name: string; value: string; type: 'PLAINTEXT' }> = [
    { name: 'INVALIDATION_TYPE', value: type, type: 'PLAINTEXT' },
  ];

  if (category) {
    envOverrides.push({ name: 'DOC_CATEGORY', value: category, type: 'PLAINTEXT' });
  }
  if (slug) {
    envOverrides.push({ name: 'DOC_SLUG', value: slug, type: 'PLAINTEXT' });
  }

  try {
    const result = await client.send(
      new StartBuildCommand({
        projectName: PROJECT_NAME,
        environmentVariablesOverride: envOverrides,
      })
    );

    const buildId = result.build?.id || 'unknown';
    console.log(`🚀 CodeBuild: Triggered build ${buildId} (type: ${type}, path: ${category}/${slug})`);
    return buildId;
  } catch (error) {
    // Silently fail — build trigger is optional and non-blocking
    // Only log in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  CodeBuild trigger skipped (no permissions)');
    }
    return null;
  }
}
