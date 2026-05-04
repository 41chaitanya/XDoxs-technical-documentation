import type { APIRoute } from 'astro';
import { reorderNavItems } from '../../../lib/db/navigation';
import { verifyToken } from '../../../lib/auth/jwt';
import { ObjectId } from 'mongodb';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('auth_token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const payload = verifyToken(token);
    if (!payload || !['admin', 'super_admin'].includes(payload.role)) {
      return new Response(JSON.stringify({ success: false, error: 'Insufficient permissions' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.json();
    const { category, parentId, itemIds } = body;
    
    if (!category || !itemIds || !Array.isArray(itemIds)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await reorderNavItems(
      category,
      parentId ? new ObjectId(parentId) : null,
      itemIds.map(id => new ObjectId(id))
    );
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const prerender = false;
