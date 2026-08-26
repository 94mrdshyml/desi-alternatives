import type { APIRoute } from 'astro';
import { blogPosts, blogPostTools } from '@/lib/server/db/schema';
import { createBlogPostId, createBlogPostToolId } from '@/lib/server/id';
import { eq, and, ne } from 'drizzle-orm';

function calculateReadingTime(content: string): number {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  const db = locals.db;

  if (!user || (user.role !== 'admin' && user.role !== 'author')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!db) {
    return new Response(JSON.stringify({ error: 'Database unavailable' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as any;
    const { action } = body;

    // 1. Check Slug Availability
    if (action === 'check-slug') {
      const rawSlug = String(body.slug || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/(^-|-$)/g, '');

      if (!rawSlug) {
        return new Response(JSON.stringify({ available: false, error: 'Slug cannot be empty' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const excludeId = body.id;
      let query;
      if (excludeId) {
        query = await db
          .select({ id: blogPosts.id })
          .from(blogPosts)
          .where(and(eq(blogPosts.slug, rawSlug), ne(blogPosts.id, excludeId)))
          .get();
      } else {
        query = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, rawSlug)).get();
      }

      return new Response(
        JSON.stringify({
          available: !query,
          slug: rawSlug,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Create Post
    if (action === 'create') {
      const {
        title,
        slug: requestedSlug,
        subtitle,
        content,
        coverImageUrl,
        authorId,
        categoryId,
        status,
        metaTitle,
        metaDescription,
        canonicalUrl,
        publishedAt,
        taggedToolIds,
      } = body;

      if (!title || !title.trim()) {
        return new Response(JSON.stringify({ error: 'Article title is required' }), { status: 400 });
      }

      let slug = (requestedSlug || title)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      if (!slug) {
        slug = `post-${Date.now()}`;
      }

      // Ensure uniqueness
      const existing = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, slug)).get();
      if (existing) {
        slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const postId = createBlogPostId();
      const readTime = calculateReadingTime(content || '');
      const postStatus = status === 'published' ? 'published' : status === 'scheduled' ? 'scheduled' : 'draft';
      const actualPublishedAt = postStatus === 'published' ? (publishedAt || new Date().toISOString()) : publishedAt || null;

      await db.insert(blogPosts).values({
        id: postId,
        slug,
        title: title.trim(),
        subtitle: subtitle ? subtitle.trim() : null,
        content: content || '',
        coverImageUrl: coverImageUrl || null,
        authorId: authorId || null,
        categoryId: categoryId || null,
        status: postStatus,
        readingTimeMinutes: readTime,
        metaTitle: metaTitle ? metaTitle.trim() : title.trim(),
        metaDescription: metaDescription ? metaDescription.trim() : (subtitle ? subtitle.trim().slice(0, 160) : null),
        canonicalUrl: canonicalUrl ? canonicalUrl.trim() : null,
        publishedAt: actualPublishedAt,
      });

      // Synchronize tagged tools
      if (Array.isArray(taggedToolIds) && taggedToolIds.length > 0) {
        for (const toolId of taggedToolIds) {
          if (toolId) {
            await db.insert(blogPostTools).values({
              id: createBlogPostToolId(),
              postId,
              desiToolId: toolId,
            });
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          postId,
          slug,
          status: postStatus,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Update Post
    if (action === 'update') {
      const {
        id,
        title,
        slug: requestedSlug,
        subtitle,
        content,
        coverImageUrl,
        authorId,
        categoryId,
        status,
        metaTitle,
        metaDescription,
        canonicalUrl,
        publishedAt,
        taggedToolIds,
      } = body;

      if (!id) {
        return new Response(JSON.stringify({ error: 'Post ID is required for update' }), { status: 400 });
      }

      const existingPost = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).get();
      if (!existingPost) {
        return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 });
      }

      let slug = (requestedSlug || existingPost.slug || title)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check uniqueness excluding current post
      const slugConflict = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, slug), ne(blogPosts.id, id)))
        .get();

      if (slugConflict) {
        slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const readTime = calculateReadingTime(content !== undefined ? content : existingPost.content);
      const postStatus = status || existingPost.status;
      let actualPublishedAt = existingPost.publishedAt;
      if (postStatus === 'published' && !actualPublishedAt) {
        actualPublishedAt = publishedAt || new Date().toISOString();
      } else if (publishedAt) {
        actualPublishedAt = publishedAt;
      }

      await db
        .update(blogPosts)
        .set({
          title: title !== undefined ? title.trim() : existingPost.title,
          slug,
          subtitle: subtitle !== undefined ? (subtitle ? subtitle.trim() : null) : existingPost.subtitle,
          content: content !== undefined ? content : existingPost.content,
          coverImageUrl: coverImageUrl !== undefined ? (coverImageUrl || null) : existingPost.coverImageUrl,
          authorId: authorId !== undefined ? (authorId || null) : existingPost.authorId,
          categoryId: categoryId !== undefined ? (categoryId || null) : existingPost.categoryId,
          status: postStatus,
          readingTimeMinutes: readTime,
          metaTitle: metaTitle !== undefined ? (metaTitle ? metaTitle.trim() : null) : existingPost.metaTitle,
          metaDescription: metaDescription !== undefined ? (metaDescription ? metaDescription.trim() : null) : existingPost.metaDescription,
          canonicalUrl: canonicalUrl !== undefined ? (canonicalUrl ? canonicalUrl.trim() : null) : existingPost.canonicalUrl,
          publishedAt: actualPublishedAt,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(blogPosts.id, id));

      // Synchronize tagged tools
      if (Array.isArray(taggedToolIds)) {
        await db.delete(blogPostTools).where(eq(blogPostTools.postId, id));
        for (const toolId of taggedToolIds) {
          if (toolId) {
            await db.insert(blogPostTools).values({
              id: createBlogPostToolId(),
              postId: id,
              desiToolId: toolId,
            });
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          postId: id,
          slug,
          status: postStatus,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. Quick Toggle Status (Publish / Unpublish)
    if (action === 'publish' || action === 'unpublish') {
      const { id } = body;
      if (!id) return new Response(JSON.stringify({ error: 'Post ID is required' }), { status: 400 });

      const post = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).get();
      if (!post) return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 });

      const nextStatus = action === 'publish' ? 'published' : 'draft';
      const publishedAt = nextStatus === 'published' && !post.publishedAt ? new Date().toISOString() : post.publishedAt;

      await db
        .update(blogPosts)
        .set({
          status: nextStatus,
          publishedAt,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(blogPosts.id, id));

      return new Response(JSON.stringify({ success: true, status: nextStatus }), { status: 200 });
    }

    // 5. Delete Post
    if (action === 'delete') {
      const { id } = body;
      if (!id) return new Response(JSON.stringify({ error: 'Post ID is required' }), { status: 400 });

      await db.delete(blogPostTools).where(eq(blogPostTools.postId, id));
      await db.delete(blogPosts).where(eq(blogPosts.id, id));

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Invalid action parameter' }), { status: 400 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
