import type { APIRoute } from 'astro';
import { toolReviews, desiTools } from '@/lib/server/db/schema';
import { createReviewId } from '@/lib/server/id';
import { eq } from 'drizzle-orm';

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

    // Resolve author metadata
    const finalAuthorName = (user?.name || authorName || 'Anonymous Developer').trim();
    const finalAuthorRole = (authorRole || (user ? 'Verified User' : 'Software Engineer')).trim();
    const finalAuthorCompany = (authorCompany || 'Indian Tech Ecosystem').trim();
    const isVerified = Boolean(user && user.email);

    // Random stylish avatar if not provided
    const avatarList = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    ];
    const defaultAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];
    const finalAvatar = user?.image || defaultAvatar;

    const newReview = {
      id: createReviewId(),
      toolId,
      userId: user?.id || null,
      authorName: finalAuthorName,
      authorRole: finalAuthorRole,
      authorCompany: finalAuthorCompany,
      authorAvatarUrl: finalAvatar,
      rating: numRating,
      title: title.trim(),
      content: content.trim(),
      easeOfMigrationRating: Math.max(1, Math.min(5, Math.round(Number(easeOfMigrationRating) || 5))),
      valueForMoneyRating: Math.max(1, Math.min(5, Math.round(Number(valueForMoneyRating) || 5))),
      supportRating: Math.max(1, Math.min(5, Math.round(Number(supportRating) || 5))),
      dataResidencyRating: Math.max(1, Math.min(5, Math.round(Number(dataResidencyRating) || 5))),
      isVerified,
      helpfulCount: 0,
      status: 'published' as const,
    };

    await db.insert(toolReviews).values(newReview);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Review submitted successfully!',
        review: newReview,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Failed to submit review:', err);
    return new Response(JSON.stringify({ error: err.message || 'Failed to submit review.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
