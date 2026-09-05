import type { APIRoute } from 'astro';
import { toolReviews, reviewHelpfulVotes } from '@/lib/server/db/schema';
import { createReviewVoteId } from '@/lib/server/id';
import { eq, and, sql } from 'drizzle-orm';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
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
    const { reviewId } = body;

    if (!reviewId) {
      return new Response(JSON.stringify({ error: 'Review ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Voter identity identifier
    const voterId = user?.id || clientAddress || request.headers.get('cf-connecting-ip') || 'anon_voter';

    // Check if already voted
    const existingVote = await db
      .select({ id: reviewHelpfulVotes.id })
      .from(reviewHelpfulVotes)
      .where(and(eq(reviewHelpfulVotes.reviewId, reviewId), eq(reviewHelpfulVotes.voterIdentifier, voterId)))
      .get();

    if (existingVote) {
      return new Response(
        JSON.stringify({
          success: true,
          alreadyVoted: true,
          message: 'You have already marked this review as helpful.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Record vote
    await db.insert(reviewHelpfulVotes).values({
      id: createReviewVoteId(),
      reviewId,
      voterIdentifier: voterId,
    });

    // Increment helpfulCount
    await db
      .update(toolReviews)
      .set({
        helpfulCount: sql`${toolReviews.helpfulCount} + 1`,
      })
      .where(eq(toolReviews.id, reviewId));

    const updated = await db
      .select({ helpfulCount: toolReviews.helpfulCount })
      .from(toolReviews)
      .where(eq(toolReviews.id, reviewId))
      .get();

    return new Response(
      JSON.stringify({
        success: true,
        helpfulCount: updated?.helpfulCount || 1,
        message: 'Marked as helpful!',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Failed to register helpful vote:', err);
    return new Response(JSON.stringify({ error: err.message || 'Failed to register vote.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
