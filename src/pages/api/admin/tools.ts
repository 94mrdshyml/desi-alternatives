import type { APIRoute } from 'astro';
import { desiTools } from '@/lib/server/db/schema';
import { eq } from 'drizzle-orm';

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
    const { toolId, action } = (await request.json()) as any;

    if (!toolId || !action || !['publish', 'archive', 'delete'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'publish') {
      await db.update(desiTools).set({ status: 'published' }).where(eq(desiTools.id, toolId));
    } else if (action === 'archive') {
      await db.update(desiTools).set({ status: 'archived' }).where(eq(desiTools.id, toolId));
    } else if (action === 'delete') {
      await db.delete(desiTools).where(eq(desiTools.id, toolId));
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
