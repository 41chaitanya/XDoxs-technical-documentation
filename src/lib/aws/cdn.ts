/**
 * CloudFront CDN content fetcher.
 *
 * Tries CloudFront first for cached delivery.
 * Falls back to direct S3 SDK access when CloudFront isn't serving S3 content.
 */

import { listMarkdownFiles, isS3Enabled, getMarkdown } from './s3';

const CLOUDFRONT_DOMAIN = (typeof import.meta !== 'undefined' && import.meta.env?.CLOUDFRONT_DOMAIN)
  || process.env.CLOUDFRONT_DOMAIN
  || '';

/** Build a CloudFront URL for a doc markdown file */
function cdnUrl(category: string, slug: string): string {
  const domain = CLOUDFRONT_DOMAIN.replace(/\/$/, '');
  return `${domain}/docs/${category}/${slug}.md`;
}

/** Build a CloudFront URL for the docs index */
function cdnIndexUrl(): string {
  const domain = CLOUDFRONT_DOMAIN.replace(/\/$/, '');
  return `${domain}/docs/index.json`;
}

/** Check if CloudFront is configured */
export function isCdnEnabled(): boolean {
  return (
    !!CLOUDFRONT_DOMAIN &&
    !CLOUDFRONT_DOMAIN.includes('your-cloudfront-domain') &&
    CLOUDFRONT_DOMAIN.startsWith('https://')
  );
}

/**
 * Fetch markdown content for a doc.
 * Priority: CloudFront CDN → S3 SDK direct
 */
export async function fetchDocFromCdn(
  category: string,
  slug: string
): Promise<string | null> {
  // ── 1. Try CloudFront ──
  if (isCdnEnabled()) {
    const url = cdnUrl(category, slug);
    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'text/markdown, text/plain, */*' },
        redirect: 'manual', // don't follow redirects — a redirect means CDN isn't serving S3
      });

      // Only accept a real 200 with actual content (not a redirect)
      if (response.status === 200) {
        const text = await response.text();
        // Sanity check: markdown won't start with <!DOCTYPE
        if (text && !text.trimStart().startsWith('<')) {
          console.log(`✅ CDN: Served ${category}/${slug}.md`);
          return text;
        }
      }
      console.warn(`⚠️  CDN: ${category}/${slug}.md not served (${response.status}), falling back to S3`);
    } catch (error) {
      console.warn(`⚠️  CDN fetch failed, falling back to S3:`, (error as Error).message);
    }
  }

  // ── 2. Direct S3 SDK ──
  if (isS3Enabled()) {
    try {
      const content = await getMarkdown(category, slug);
      if (content) {
        console.log(`✅ S3: Served ${category}/${slug}.md`);
        return content;
      }
    } catch (error) {
      console.error(`❌ S3 fetch failed for ${category}/${slug}:`, error);
    }
  }

  console.error(`❌ Doc not found: ${category}/${slug}`);
  return null;
}

/**
 * Fetch the docs index.
 * Priority: CloudFront index.json → S3 ListObjects
 */
export async function fetchDocsIndexFromCdn(): Promise<Array<{
  category: string;
  slug: string;
  title: string;
  description?: string;
}>> {
  // ── 1. Try CloudFront index.json ──
  if (isCdnEnabled()) {
    const url = cdnIndexUrl();
    try {
      const response = await fetch(url, { redirect: 'manual' });

      if (response.status === 200) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          if (Array.isArray(data) && data.length > 0) {
            console.log(`✅ CDN: Loaded docs index (${data.length} docs)`);
            return data;
          }
        } catch {
          // Not JSON — CDN is redirecting, fall through
        }
      }
      console.warn(`⚠️  CDN: index.json not served (${response.status}), falling back to S3 listing`);
    } catch (error) {
      console.warn('⚠️  CDN: index.json fetch failed:', (error as Error).message);
    }
  }

  // ── 2. Direct S3 ListObjects ──
  if (isS3Enabled()) {
    try {
      const files = await listMarkdownFiles();
      const docs = files
        .filter(f => f.key.endsWith('.md') && !f.key.endsWith('index.json'))
        .map(f => {
          const parts = f.key.split('/'); // docs/<category>/<slug>.md
          if (parts.length !== 3) return null;
          const category = parts[1];
          const slug = parts[2].replace('.md', '');
          const title = slug
            .split('-')
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          return { category, slug, title, description: `Learn ${title}` };
        })
        .filter(Boolean) as Array<{ category: string; slug: string; title: string; description: string }>;

      console.log(`✅ S3: Found ${docs.length} docs`);
      return docs;
    } catch (error) {
      console.error('❌ S3 listing failed:', error);
    }
  }

  console.error('❌ No docs source available — check ENABLE_S3_LOCAL and AWS credentials in .env');
  return [];
}

export { CLOUDFRONT_DOMAIN, cdnUrl };
