import type { APIRoute } from 'astro';
import { renderMarkdown } from '../../../lib/markdown/render';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { content } = await request.json();

    if (!content) {
      return new Response(JSON.stringify({ success: false, error: 'No content provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const html = await renderMarkdown(content);

    return new Response(JSON.stringify({ success: true, html }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error rendering preview:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to render preview' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
