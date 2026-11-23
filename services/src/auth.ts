import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';

export interface AuthUser {
  id: string;
  email: string | null;
}

/** Resolves a bearer token to the signed-in user, or throws if it is invalid or expired. */
export type TokenVerifier = (token: string) => Promise<AuthUser>;

export interface VerifierOptions {
  issuer: string;
  audience: string;
  /** A JWKS resolver (asymmetric signing keys) or a shared secret (legacy HS256). */
  key: JWTVerifyGetKey | Uint8Array;
}

export function createTokenVerifier({ issuer, audience, key }: VerifierOptions): TokenVerifier {
  return async (token) => {
    const { payload } =
      key instanceof Uint8Array
        ? await jwtVerify(token, key, { issuer, audience, algorithms: ['HS256'] })
        : await jwtVerify(token, key, { issuer, audience });
    if (!payload.sub) throw new Error('Token has no subject');
    return { id: payload.sub, email: typeof payload.email === 'string' ? payload.email : null };
  };
}

/**
 * Verifies Supabase Auth access tokens. New Supabase projects sign tokens with asymmetric
 * keys published at the JWKS endpoint, so no secret is needed. Projects still on the legacy
 * shared secret can pass it as `jwtSecret`.
 */
export function createSupabaseVerifier(supabaseUrl: string, jwtSecret?: string | null): TokenVerifier {
  const issuer = `${supabaseUrl.replace(/\/+$/, '')}/auth/v1`;
  const key = jwtSecret
    ? new TextEncoder().encode(jwtSecret)
    : createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
  return createTokenVerifier({ issuer, audience: 'authenticated', key });
}
