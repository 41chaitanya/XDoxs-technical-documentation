/**
 * POST /api/nav/move-item
 * Move item to new parent (drag & drop)
 */

import type { APIRoute } from 'astro';
import { moveNavItem } from '../../../lib/db/navigation';
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
    const { itemId, newParentId, newOrder } = body;
    
    if (!itemId || newOrder === undefined) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await moveNavItem(
      new ObjectId(itemId),
      newParentId ? new ObjectId(newParentId) : null,
      newOrder
    );
    
    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error moving nav item:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to move navigation item'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const prerender = false;
