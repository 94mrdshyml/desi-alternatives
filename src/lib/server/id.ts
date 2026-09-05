import { customAlphabet } from 'nanoid';

// Standard 24-character alphanumeric generator for Stripe-style IDs
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nanoid24 = customAlphabet(alphabet, 24);

export const ID_PREFIXES = {
  tool: 'tool_',
  category: 'cat_',
  globalTool: 'gt_',
  alternative: 'alt_',
  claim: 'claim_',
  edit: 'edit_',
  user: 'user_',
  session: 'sess_',
  verification: 'ver_',
  account: 'acc_',
  pricingPlan: 'plan_',
  blogAuthor: 'author_',
  blogPost: 'post_',
  blogPostTool: 'bpt_',
  searchLog: 'srch_',
  review: 'rev_',
  reviewVote: 'vote_',
} as const;

export type IdPrefixKey = keyof typeof ID_PREFIXES;

export function generateId(prefix: string): string {
  return `${prefix}${nanoid24()}`;
}

export const createToolId = () => generateId(ID_PREFIXES.tool);
export const createCategoryId = () => generateId(ID_PREFIXES.category);
export const createGlobalToolId = () => generateId(ID_PREFIXES.globalTool);
export const createAlternativeId = () => generateId(ID_PREFIXES.alternative);
export const createClaimId = () => generateId(ID_PREFIXES.claim);
export const createEditId = () => generateId(ID_PREFIXES.edit);
export const createUserId = () => generateId(ID_PREFIXES.user);
export const createSessionId = () => generateId(ID_PREFIXES.session);
export const createVerificationId = () => generateId(ID_PREFIXES.verification);
export const createAccountId = () => generateId(ID_PREFIXES.account);
export const createPricingPlanId = () => generateId(ID_PREFIXES.pricingPlan);
export const createBlogAuthorId = () => generateId(ID_PREFIXES.blogAuthor);
export const createBlogPostId = () => generateId(ID_PREFIXES.blogPost);
export const createBlogPostToolId = () => generateId(ID_PREFIXES.blogPostTool);
export const createSearchLogId = () => generateId(ID_PREFIXES.searchLog);
export const createReviewId = () => generateId(ID_PREFIXES.review);
export const createReviewVoteId = () => generateId(ID_PREFIXES.reviewVote);
