import type { APIRoute } from 'astro';
import { users } from '@/lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  const currentUser = locals.user;

  if (!db || !currentUser || currentUser.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized: Admin privileges required.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { userId, role, action } = (await request.json()) as any;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'setRole' && role && ['admin', 'author', 'user'].includes(role)) {
      await db.update(users).set({ role }).where(eq(users.id, userId));
      return new Response(JSON.stringify({ success: true, updatedRole: role }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'promote-admin') {
      await db.update(users).set({ role: 'admin' }).where(eq(users.id, userId));
      return new Response(JSON.stringify({ success: true, updatedRole: 'admin' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'promote-author') {
      await db.update(users).set({ role: 'author' }).where(eq(users.id, userId));
      return new Response(JSON.stringify({ success: true, updatedRole: 'author' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'demote-user') {
      await db.update(users).set({ role: 'user' }).where(eq(users.id, userId));
      return new Response(JSON.stringify({ success: true, updatedRole: 'user' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'ban') {
      await db.update(users).set({ banned: true }).where(eq(users.id, userId));
      return new Response(JSON.stringify({ success: true, banned: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'unban') {
      await db.update(users).set({ banned: false, banReason: null, banExpires: null }).where(eq(users.id, userId));
      return new Response(JSON.stringify({ success: true, banned: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action or parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to update user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
