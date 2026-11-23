export interface AppConfig {
  /** Serve the sample portfolio and enable the /api/demo routes. */
  demoMode: boolean;
  /** Shared secret camera devices send as "Authorization: Bearer <token>". Device ingest is off without it. */
  deviceToken: string | null;
  /** Ed25519 private key for signing evidence. Without it a throwaway key is generated at startup. */
  signingKey: string | null;
  /** Clock override, used by tests. */
  now?: () => Date;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    // There is no real data source yet, so demo mode stays on unless explicitly turned off.
    demoMode: env.PARIDHI_DEMO_MODE !== 'false',
    deviceToken: env.PARIDHI_DEVICE_TOKEN?.trim() || null,
    signingKey: env.PARIDHI_SIGNING_KEY?.trim() || null
  };
}
