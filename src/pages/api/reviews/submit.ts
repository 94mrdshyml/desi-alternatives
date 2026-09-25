import type { APIRoute } from 'astro';
import { toolReviews, desiTools } from '@/lib/server/db/schema';
import { createReviewId } from '@/lib/server/id';
import { eq, and } from 'drizzle-orm';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  const user = locals.user;

  if (!db) {
    return new Response(JSON.stringify({ error: 'Database service unavailable.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!user) {
    return new Response(JSON.stringify({ error: 'Please sign in to write a review.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as any;
    const {
      toolId,
      authorName,
      authorRole,
      authorCompany,
      rating,
      title,
      content,
      easeOfMigrationRating = 5,
      valueForMoneyRating = 5,
      supportRating = 5,
      dataResidencyRating = 5,
    } = body;

    if (!toolId || !title?.trim() || !content?.trim() || !rating) {
      return new Response(
        JSON.stringify({ error: 'Please provide all required review fields (Rating, Title, and Review Details).' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const numRating = Math.max(1, Math.min(5, Math.round(Number(rating))));
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return new Response(JSON.stringify({ error: 'Rating must be between 1 and 5 stars.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify tool exists
    const tool = await db.select({ id: desiTools.id }).from(desiTools).where(eq(desiTools.id, toolId)).get();
    if (!tool) {
      return new Response(JSON.stringify({ error: 'Selected tool was not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // One review per user per tool (also enforced by a unique index)
    const existingReview = await db
      .select({ id: toolReviews.id })
      .from(toolReviews)
      .where(and(eq(toolReviews.userId, user.id), eq(toolReviews.toolId, toolId)))
      .get();
    if (existingReview) {
      return new Response(JSON.stringify({ error: 'You have already reviewed this tool.' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Resolve author metadata
    const finalAuthorName = String(authorName || user.name || 'Anonymous Developer').trim().slice(0, 80);
    const finalAuthorRole = String(authorRole || 'Verified User').trim().slice(0, 80);
    const finalAuthorCompany = String(authorCompany || 'Indian Tech Ecosystem').trim().slice(0, 80);
    const isVerified = Boolean(user.emailVerified);

    // Use user profile avatar or deterministic Dicebear glyph avatar
    const finalAvatar =
      user.image || `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(finalAuthorName)}`;

    const newReview = {
      id: createReviewId(),
      toolId,
      userId: user.id,
      authorName: finalAuthorName,
      authorRole: finalAuthorRole,
      authorCompany: finalAuthorCompany,
      authorAvatarUrl: finalAvatar,
      rating: numRating,
      title: String(title).trim().slice(0, 150),
      content: String(content).trim().slice(0, 5000),
      easeOfMigrationRating: Math.max(1, Math.min(5, Math.round(Number(easeOfMigrationRating) || 5))),
      valueForMoneyRating: Math.max(1, Math.min(5, Math.round(Number(valueForMoneyRating) || 5))),
      supportRating: Math.max(1, Math.min(5, Math.round(Number(supportRating) || 5))),
      dataResidencyRating: Math.max(1, Math.min(5, Math.round(Number(dataResidencyRating) || 5))),
      isVerified,
      helpfulCount: 0,
      // New reviews wait for admin approval in /admin/moderation
      status: 'pending' as const,
    };

    await db.insert(toolReviews).values(newReview);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thanks! Your review has been submitted and will appear after admin approval.',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Failed to submit review:', err);
    return new Response(JSON.stringify({ error: 'Failed to submit review.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
