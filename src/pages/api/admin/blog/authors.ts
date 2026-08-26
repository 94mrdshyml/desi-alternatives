import type { APIRoute } from 'astro';
import { blogAuthors } from '@/lib/server/db/schema';
import { createBlogAuthorId } from '@/lib/server/id';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.db;
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database unavailable' }), { status: 500 });
  }

  try {
    const authors = await db.select().from(blogAuthors).orderBy(blogAuthors.name).all();
    return new Response(JSON.stringify({ authors }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  const db = locals.db;

  if (!user || (user.role !== 'admin' && user.role !== 'author')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (!db) {
    return new Response(JSON.stringify({ error: 'Database unavailable' }), { status: 500 });
  }

  try {
    const body = (await request.json()) as any;
    const { name, role, bio, avatarUrl, twitterHandle, linkedinUrl, websiteUrl } = body;

    if (!name || !name.trim()) {
      return new Response(JSON.stringify({ error: 'Author name is required' }), { status: 400 });
    }

    let slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await db.select().from(blogAuthors).where(eq(blogAuthors.slug, slug)).get();
    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const authorId = createBlogAuthorId();
    await db.insert(blogAuthors).values({
      id: authorId,
      slug,
      name: name.trim(),
      role: (role || 'Author').trim(),
      bio: bio ? bio.trim() : null,
      avatarUrl: avatarUrl || null,
      twitterHandle: twitterHandle ? twitterHandle.trim().replace(/^@/, '') : null,
      linkedinUrl: linkedinUrl ? linkedinUrl.trim() : null,
      websiteUrl: websiteUrl ? websiteUrl.trim() : null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        author: {
          id: authorId,
          slug,
          name: name.trim(),
          role: role || 'Author',
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
