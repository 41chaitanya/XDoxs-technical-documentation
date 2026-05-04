import type { APIRoute } from 'astro';
import { deleteNavItem } from '../../../lib/db/navigation';
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
    const { itemId } = body;
    
    if (!itemId) {
      return new Response(JSON.stringify({ success: false, error: 'Item ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await deleteNavItem(new ObjectId(itemId));
    
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
