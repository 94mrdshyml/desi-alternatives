import type { APIRoute } from 'astro';
import { toolReviews } from '@/lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  const user = locals.user;

  if (!db || !user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as any;
    const { action, reviewId, status } = body;

    if (!reviewId) {
      return new Response(JSON.stringify({ error: 'Review ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'delete') {
      await db.delete(toolReviews).where(eq(toolReviews.id, reviewId));
      return new Response(JSON.stringify({ success: true, message: 'Review deleted successfully.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update_status' && status) {
      if (!['pending', 'published', 'rejected'].includes(status)) {
        return new Response(JSON.stringify({ error: 'Invalid review status.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      await db
        .update(toolReviews)
        .set({ status, updatedAt: new Date().toISOString() })
        .where(eq(toolReviews.id, reviewId));

      return new Response(JSON.stringify({ success: true, message: `Review status updated to ${status}.` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid moderation action.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Admin review action error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Failed to process action.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
