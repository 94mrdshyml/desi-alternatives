import type { APIRoute } from 'astro';
import { claimsQueue } from '@/lib/server/db/schema';
import { createClaimId } from '@/lib/server/id';

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database unavailable' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = locals.user;
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Please sign in to your account first before claiming a tool.' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const body = (await request.json()) as any;
    const { toolId, workEmail, notes } = body;

    if (!toolId || !workEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: toolId and workEmail' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const claimId = createClaimId();
    await db.insert(claimsQueue).values({
      id: claimId,
      toolId,
      userId: user.id,
      workEmail,
      notes: notes || '',
      status: 'pending',
    });

    return new Response(
      JSON.stringify({ success: true, claimId }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
