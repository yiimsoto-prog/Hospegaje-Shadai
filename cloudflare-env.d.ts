interface CloudflareEnv {
  DB: D1Database;
  ASSETS: Fetcher;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface CloudflareEnv {}
}

export {};
