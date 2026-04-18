/**
 * S3 Presigned URL API
 * 
 * GET  - Generate a presigned download URL for a doc's markdown
 * POST - Generate a presigned upload URL for uploading markdown to S3
 * 
 * Used by the admin panel to upload/download MD files directly to/from S3.
 */

import type { APIRoute } from 'astro';
import { verifyToken } from '../../../lib/auth/jwt';
import { getPresignedUploadUrl, getPresignedDownloadUrl } from '../../../lib/aws/s3';

/** Generate a presigned UPLOAD URL */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('auth_token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = verifyToken(token);
    if (!payload || (payload.role !== 'instructor' && payload.role !== 'super_admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { category, slug } = await request.json();
    if (!category || !slug) {
      return new Response(JSON.stringify({ error: 'category and slug required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = await getPresignedUploadUrl(category, slug);

    return new Response(JSON.stringify({ success: true, uploadUrl: url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Presigned upload URL error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/** Generate a presigned DOWNLOAD URL */
export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    const token = cookies.get('auth_token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = verifyToken(token);
    if (!payload || (payload.role !== 'instructor' && payload.role !== 'super_admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const category = url.searchParams.get('category');
    const slug = url.searchParams.get('slug');
    if (!category || !slug) {
      return new Response(JSON.stringify({ error: 'category and slug query params required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const downloadUrl = await getPresignedDownloadUrl(category, slug);

    return new Response(JSON.stringify({ success: true, downloadUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Presigned download URL error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
