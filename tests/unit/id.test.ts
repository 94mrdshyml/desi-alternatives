import { describe, it, expect } from 'vitest';
import {
  createToolId,
  createCategoryId,
  createGlobalToolId,
  createAlternativeId,
  createClaimId,
  createEditId,
  createUserId,
  createSessionId,
  createVerificationId,
  createAccountId,
  ID_PREFIXES,
} from '@/lib/server/id';

describe('Stripe-Style Prefixed ID Generator', () => {
  it('generates IDs with correct prefixes and lengths', () => {
    const toolId = createToolId();
    expect(toolId.startsWith(ID_PREFIXES.tool)).toBe(true);
    expect(toolId.length).toBe(ID_PREFIXES.tool.length + 24);

    const catId = createCategoryId();
    expect(catId.startsWith(ID_PREFIXES.category)).toBe(true);
    expect(catId.length).toBe(ID_PREFIXES.category.length + 24);

    const gtId = createGlobalToolId();
    expect(gtId.startsWith(ID_PREFIXES.globalTool)).toBe(true);
    expect(gtId.length).toBe(ID_PREFIXES.globalTool.length + 24);

    const altId = createAlternativeId();
    expect(altId.startsWith(ID_PREFIXES.alternative)).toBe(true);
    expect(altId.length).toBe(ID_PREFIXES.alternative.length + 24);

    const claimId = createClaimId();
    expect(claimId.startsWith(ID_PREFIXES.claim)).toBe(true);
    expect(claimId.length).toBe(ID_PREFIXES.claim.length + 24);

    const editId = createEditId();
    expect(editId.startsWith(ID_PREFIXES.edit)).toBe(true);
    expect(editId.length).toBe(ID_PREFIXES.edit.length + 24);

    const userId = createUserId();
    expect(userId.startsWith(ID_PREFIXES.user)).toBe(true);
    expect(userId.length).toBe(ID_PREFIXES.user.length + 24);

    const sessionId = createSessionId();
    expect(sessionId.startsWith(ID_PREFIXES.session)).toBe(true);
    expect(sessionId.length).toBe(ID_PREFIXES.session.length + 24);

    const verId = createVerificationId();
    expect(verId.startsWith(ID_PREFIXES.verification)).toBe(true);
    expect(verId.length).toBe(ID_PREFIXES.verification.length + 24);

    const accId = createAccountId();
    expect(accId.startsWith(ID_PREFIXES.account)).toBe(true);
    expect(accId.length).toBe(ID_PREFIXES.account.length + 24);
  });

  it('generates unique random IDs consecutively', () => {
    const id1 = createToolId();
    const id2 = createToolId();
    expect(id1).not.toBe(id2);
  });
});
