declare global {
  interface CloudflareEnv {
    COMMUNITY_DB: D1Database;
    AVATARS: R2Bucket;
    ORG_FILES: R2Bucket;
  }
}

export {};
