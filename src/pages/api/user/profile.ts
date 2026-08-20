import type { APIRoute } from 'astro';
import { users } from '@/lib/server/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { generateFunnyUsername } from '@/lib/username';

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  const user = locals.user;

  if (!user || !db) {
    return new Response(JSON.stringify({ error: 'Unauthorized. Please sign in.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as any;

    // 1. Funny Username Generator helper endpoint
    if (body.action === 'generateUsername') {
      const generated = generateFunnyUsername();
      return new Response(JSON.stringify({ username: generated }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { firstName, lastName, username, image } = body;

    const trimmedFirst = firstName ? String(firstName).trim() : '';
    const trimmedLast = lastName ? String(lastName).trim() : '';
    const fullName = `${trimmedFirst} ${trimmedLast}`.trim() || user.name;

    let cleanUsername = username ? String(username).trim().toLowerCase() : null;

    if (cleanUsername) {
      // Validate username pattern
      if (!/^[a-z0-9-_]{3,30}$/.test(cleanUsername)) {
        return new Response(
          JSON.stringify({ error: 'Username must be 3-30 characters with letters, numbers, hyphens, or underscores.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Check uniqueness if changed
      const existing = await db
        .select()
        .from(users)
        .where(and(eq(users.username, cleanUsername), ne(users.id, user.id)))
        .get();

      if (existing) {
        return new Response(
          JSON.stringify({ error: 'This username is already taken. Please choose another one.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const updatePayload: any = {
      name: fullName,
      firstName: trimmedFirst || null,
      lastName: trimmedLast || null,
      updatedAt: new Date(),
    };

    if (cleanUsername) updatePayload.username = cleanUsername;
    if (image !== undefined) updatePayload.image = image || null;

    await db.update(users).set(updatePayload).where(eq(users.id, user.id));

    return new Response(JSON.stringify({ success: true, message: 'Profile updated successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to update profile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
