import type { APIRoute } from 'astro';
import { verifyToken, generateToken } from '../../../lib/auth/jwt';

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
    
    // Only super_admin can switch roles
    if (!payload || payload.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Forbidden - Only super admin can switch roles' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const { targetRole } = await request.json();
    
    const validRoles = ['student', 'instructor', 'admin', 'super_admin'];
    if (!targetRole || !validRoles.includes(targetRole)) {
      return new Response(JSON.stringify({ error: 'Invalid role' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Generate new token with target role
    const newToken = generateToken({
      userId: payload.userId,
      email: payload.email,
      role: targetRole,
    });
    
    // Set new cookie
    cookies.set('auth_token', newToken, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return new Response(JSON.stringify({ 
      success: true,
      role: targetRole,
      message: `Switched to ${targetRole} role`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Role switch error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
