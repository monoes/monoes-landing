declare global {
  interface CloudflareEnv {
    COMMUNITY_DB: D1Database;
    AVATARS: R2Bucket;
  }
}

export {};
