import type { APIRoute } from 'astro';
import { renderMarkdown } from '../../../lib/markdown/render';
import { verifyToken } from '../../../lib/auth/jwt';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Auth check — only instructors/admins can use the preview renderer
    const token = cookies.get('auth_token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const payload = verifyToken(token);
    if (!payload || !['instructor', 'super_admin'].includes(payload.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { content } = await request.json();
    
    if (!content) {
      return new Response(JSON.stringify({ error: 'Content required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const html = await renderMarkdown(content);
    
    return new Response(JSON.stringify({ html }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Render error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
