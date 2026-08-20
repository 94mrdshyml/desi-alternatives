import type { APIRoute } from 'astro';
import { categories } from '@/lib/server/db/schema';
import { createCategoryId } from '@/lib/server/id';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  const user = locals.user;

  if (!db || !user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized: Admin privileges required.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as any;
    const { action, id, name, slug, emoji, description, isFeatured } = body;

    if (action === 'create') {
      if (!name || !emoji) {
        return new Response(JSON.stringify({ error: 'Name and emoji are required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newId = createCategoryId();

      await db.insert(categories).values({
        id: newId,
        name,
        slug: generatedSlug,
        emoji,
        description: description || '',
        isFeatured: Boolean(isFeatured),
      });

      return new Response(JSON.stringify({ success: true, id: newId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update') {
      if (!id || !name || !emoji) {
        return new Response(JSON.stringify({ error: 'ID, Name, and Emoji are required for update.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      await db
        .update(categories)
        .set({
          name,
          slug: generatedSlug,
          emoji,
          description: description || '',
          isFeatured: Boolean(isFeatured),
        })
        .where(eq(categories.id, id));

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'delete') {
      if (!id) {
        return new Response(JSON.stringify({ error: 'Category ID is required for deletion.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      await db.delete(categories).where(eq(categories.id, id));

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to manage category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
