/**
 * GET /api/nav/get-tree?category=backend
 * Get navigation tree for a category
 */

import type { APIRoute } from 'astro';
import { getNavTree } from '../../../lib/db/navigation';

export const GET: APIRoute = async ({ url }) => {
  try {
    const category = url.searchParams.get('category');
    
    if (!category) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Category is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const tree = await getNavTree(category);
    
    return new Response(JSON.stringify({
      success: true,
      tree
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error getting nav tree:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to get navigation tree'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const prerender = false;
