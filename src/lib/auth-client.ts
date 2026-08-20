import { createAuthClient } from 'better-auth/client';
import { adminClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4321',
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession, getSession, admin: adminApi } = authClient;
