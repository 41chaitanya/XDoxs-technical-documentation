import type { APIRoute } from 'astro';
import { renderMarkdown } from '../../../lib/markdown/render';

export const POST: APIRoute = async ({ request }) => {
  try {
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
