import type { APIRoute } from 'astro';
import { userToolUsage, desiTools } from '@/lib/server/db/schema';
import { createToolUsageId } from '@/lib/server/id';
import { eq, and } from 'drizzle-orm';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  const user = locals.user;

  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Please sign in to mark this tool as used.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!db) {
    return new Response(
      JSON.stringify({ error: 'Database service unavailable.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = (await request.json()) as any;
    const { toolId } = body;

    if (!toolId) {
      return new Response(
        JSON.stringify({ error: 'Tool ID is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify tool exists
    const tool = await db.select({ id: desiTools.id }).from(desiTools).where(eq(desiTools.id, toolId)).get();
    if (!tool) {
      return new Response(
        JSON.stringify({ error: 'Tool not found.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already marked this tool as used
    const existingUsage = await db
      .select()
      .from(userToolUsage)
      .where(and(eq(userToolUsage.userId, user.id), eq(userToolUsage.toolId, toolId)))
      .get();

    let hasUsed = false;

    if (existingUsage) {
      // Remove usage mark
      await db
        .delete(userToolUsage)
        .where(and(eq(userToolUsage.userId, user.id), eq(userToolUsage.toolId, toolId)));
      hasUsed = false;
    } else {
      // Add usage mark
      await db.insert(userToolUsage).values({
        id: createToolUsageId(),
        userId: user.id,
        toolId,
      });
      hasUsed = true;
    }

    // Get total count of users using this tool
    const allUsages = await db
      .select({ id: userToolUsage.id })
      .from(userToolUsage)
      .where(eq(userToolUsage.toolId, toolId))
      .all();

    return new Response(
      JSON.stringify({
        success: true,
        hasUsed,
        totalUsersCount: allUsages.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Failed to toggle tool usage:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to update tool usage.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
