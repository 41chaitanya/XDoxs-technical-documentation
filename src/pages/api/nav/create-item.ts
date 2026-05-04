/**
 * POST /api/nav/create-item
 * Create a new navigation item (folder or doc)
 */

import type { APIRoute } from 'astro';
import { createNavItem } from '../../../lib/db/navigation';
import { verifyToken } from '../../../lib/auth/jwt';
import { ObjectId } from 'mongodb';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Verify authentication
    const token = cookies.get('auth_token')?.value;
    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const payload = verifyToken(token);
    if (!payload || !['admin', 'super_admin'].includes(payload.role)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Insufficient permissions'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.json();
    const { category, type, name, slug, s3Key, parentId, order, level } = body;
    
    if (!category || !type || !name || level === undefined) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (type === 'doc' && (!slug || !s3Key)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Docs require slug and s3Key'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const itemId = await createNavItem({
      category,
      type,
      name,
      slug: type === 'doc' ? slug : undefined,
      s3Key: type === 'doc' ? s3Key : undefined,
      parentId: parentId ? new ObjectId(parentId) : null,
      order: order || 0,
      level,
      createdBy: payload.email
    });
    
    return new Response(JSON.stringify({
      success: true,
      itemId: itemId.toString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error creating nav item:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to create navigation item'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const prerender = false;
