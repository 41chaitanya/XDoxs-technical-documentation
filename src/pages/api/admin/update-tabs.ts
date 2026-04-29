import type { APIRoute } from 'astro';
import { updateDocDraft } from '../../../lib/db/docs';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;
    
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { draftId, tabs } = await request.json();

    if (!draftId || !tabs || tabs.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Draft ID and tabs required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update the draft with new tabs and set status to pending_review
    await updateDocDraft(draftId, {
      tabs,
      title: tabs[0].title, // Update main title from first tab
      content: tabs[0].content, // Update content for backward compatibility
      status: 'pending_review',
      feedback: 'Updated tabs - awaiting review',
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Tabs updated successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Update tabs error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
