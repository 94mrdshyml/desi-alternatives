import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { searchLogs } from '@/lib/server/db/schema';
import { createSearchLogId } from '@/lib/server/id';

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database unavailable' }), { status: 503 });
  }

  try {
    const body = (await request.json()) as any;
    const { searchLogId, query, clickedType, clickedId, clickedSlug } = body;

    if (searchLogId) {
      // Update existing search log entry
      await db
        .update(searchLogs)
        .set({
          clickedType: clickedType || 'none',
          clickedId: clickedId || null,
          clickedSlug: clickedSlug || null,
        })
        .where(eq(searchLogs.id, searchLogId));
    } else if (query) {
      // Create new clicked log
      await db.insert(searchLogs).values({
        id: createSearchLogId(),
        query: query.slice(0, 100),
        normalizedQuery: query.trim().toLowerCase().slice(0, 100),
        resultsCount: 1,
        clickedType: clickedType || 'none',
        clickedId: clickedId || null,
        clickedSlug: clickedSlug || null,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Failed to log click' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
