import type { APIRoute } from 'astro';
import { claimsQueue, desiTools } from '@/lib/server/db/schema';
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
    const { claimId, action } = (await request.json()) as any;

    if (!claimId || !action || !['approve', 'reject'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const claim = await db.select().from(claimsQueue).where(eq(claimsQueue.id, claimId)).get();
    if (!claim) {
      return new Response(JSON.stringify({ error: 'Claim not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'approve') {
      // Assign tool ownership
      await db
        .update(desiTools)
        .set({ claimedById: claim.userId })
        .where(eq(desiTools.id, claim.toolId));

      await db
        .update(claimsQueue)
        .set({ status: 'approved', reviewedAt: new Date().toISOString() })
        .where(eq(claimsQueue.id, claimId));
    } else {
      await db
        .update(claimsQueue)
        .set({ status: 'rejected', reviewedAt: new Date().toISOString() })
        .where(eq(claimsQueue.id, claimId));
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
