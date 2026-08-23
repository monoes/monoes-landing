import { sqliteTable, text, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  username: text("username").unique(),
  role: text("role").notNull().default("member"),
  blockedAt: integer("blocked_at", { mode: "timestamp" }),
  blockedBy: text("blocked_by"),
  tagline: text("tagline"),
  jobTitle: text("job_title"),
  company: text("company"),
  tagsJson: text("tags_json"),
  githubUrl: text("github_url"),
  twitterUrl: text("twitter_url"),
  linkedinUrl: text("linkedin_url"),
  websiteUrl: text("website_url"),
  avatarKey: text("avatar_key"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  issuer: text("issuer"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const feature = sqliteTable("feature", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("open"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const featureVote = sqliteTable(
  "feature_vote",
  {
    id: text("id").primaryKey(),
    featureId: text("feature_id")
      .notNull()
      .references(() => feature.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    value: integer("value").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [uniqueIndex("feature_vote_feature_user_unique").on(table.featureId, table.userId)],
);

export const bug = sqliteTable("bug", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("open"),
  severity: text("severity").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const bugComment = sqliteTable("bug_comment", {
  id: text("id").primaryKey(),
  bugId: text("bug_id")
    .notNull()
    .references(() => bug.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const bugLabel = sqliteTable("bug_label", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
});

export const bugLabelLink = sqliteTable(
  "bug_label_link",
  {
    bugId: text("bug_id")
      .notNull()
      .references(() => bug.id, { onDelete: "cascade" }),
    labelId: text("label_id")
      .notNull()
      .references(() => bugLabel.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("bug_label_link_bug_label_unique").on(table.bugId, table.labelId)],
);

export const orgUpload = sqliteTable("org_upload", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  goal: text("goal").notNull().default(""),
  topology: text("topology"),
  roleCount: integer("role_count").notNull(),
  orgJson: text("org_json").notNull(),
  uploaderId: text("uploader_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const post = sqliteTable("post", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const postVote = sqliteTable(
  "post_vote",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    value: integer("value").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [uniqueIndex("post_vote_post_user_unique").on(table.postId, table.userId)],
);

export const bugVote = sqliteTable(
  "bug_vote",
  {
    id: text("id").primaryKey(),
    bugId: text("bug_id")
      .notNull()
      .references(() => bug.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    value: integer("value").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [uniqueIndex("bug_vote_bug_user_unique").on(table.bugId, table.userId)],
);

export const orgVote = sqliteTable(
  "org_vote",
  {
    id: text("id").primaryKey(),
    orgUploadId: text("org_upload_id")
      .notNull()
      .references(() => orgUpload.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    value: integer("value").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [uniqueIndex("org_vote_org_user_unique").on(table.orgUploadId, table.userId)],
);

export const orgRun = sqliteTable("org_run", {
  id: text("id").primaryKey(),
  orgUploadId: text("org_upload_id")
    .notNull()
    .references(() => orgUpload.id, { onDelete: "cascade" }),
  uploaderId: text("uploader_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  label: text("label"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const orgRunFile = sqliteTable("org_run_file", {
  id: text("id").primaryKey(),
  orgRunId: text("org_run_id")
    .notNull()
    .references(() => orgRun.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  fileType: text("file_type").notNull(),
  r2Key: text("r2_key").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Below: tables owned by the better-auth "jwt" and "@better-auth/oauth-provider"
// plugins (src/lib/auth.ts), generated via
// `npx @better-auth/cli generate --config scripts/better-auth-schema-config.ts`.
// Column shapes are dictated by those plugins' own runtime queries — don't
// hand-edit field names/types without regenerating and diffing.

export const jwks = sqliteTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
  alg: text("alg"),
  crv: text("crv"),
});

export const oauthClient = sqliteTable(
  "oauth_client",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id").notNull().unique(),
    clientSecret: text("client_secret"),
    clientDiscoveryId: text("client_discovery_id"),
    disabled: integer("disabled", { mode: "boolean" }).default(false),
    skipConsent: integer("skip_consent", { mode: "boolean" }),
    enableEndSession: integer("enable_end_session", { mode: "boolean" }),
    subjectType: text("subject_type"),
    scopes: text("scopes", { mode: "json" }),
    clientCredentialsScopes: text("client_credentials_scopes", { mode: "json" }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
    name: text("name"),
    uri: text("uri"),
    icon: text("icon"),
    contacts: text("contacts", { mode: "json" }),
    tos: text("tos"),
    policy: text("policy"),
    softwareId: text("software_id"),
    softwareVersion: text("software_version"),
    softwareStatement: text("software_statement"),
    redirectUris: text("redirect_uris", { mode: "json" }).notNull(),
    postLogoutRedirectUris: text("post_logout_redirect_uris", { mode: "json" }),
    backchannelLogoutUri: text("backchannel_logout_uri"),
    backchannelLogoutSessionRequired: integer("backchannel_logout_session_required", { mode: "boolean" }),
    tokenEndpointAuthMethod: text("token_endpoint_auth_method"),
    applicationType: text("application_type"),
    jwks: text("jwks"),
    jwksUri: text("jwks_uri"),
    grantTypes: text("grant_types", { mode: "json" }),
    responseTypes: text("response_types", { mode: "json" }),
    requirePKCE: integer("require_pkce", { mode: "boolean" }),
    dpopBoundAccessTokens: integer("dpop_bound_access_tokens", { mode: "boolean" }).default(false),
    referenceId: text("reference_id"),
    metadata: text("metadata", { mode: "json" }),
  },
  (table) => [index("oauthClient_userId_idx").on(table.userId)],
);

export const oauthResource = sqliteTable("oauth_resource", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull().unique(),
  name: text("name").notNull(),
  accessTokenTtl: integer("access_token_ttl"),
  refreshTokenTtl: integer("refresh_token_ttl"),
  signingAlgorithm: text("signing_algorithm"),
  signingKeyId: text("signing_key_id"),
  allowedScopes: text("allowed_scopes", { mode: "json" }),
  customClaims: text("custom_claims", { mode: "json" }),
  dpopBoundAccessTokensRequired: integer("dpop_bound_access_tokens_required", { mode: "boolean" }).default(false),
  disabled: integer("disabled", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  policyVersion: integer("policy_version").default(1),
  metadata: text("metadata", { mode: "json" }),
});

export const oauthClientResource = sqliteTable(
  "oauth_client_resource",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: "cascade" }),
    resourceId: text("resource_id")
      .notNull()
      .references(() => oauthResource.identifier, { onDelete: "cascade" }),
    metadata: text("metadata", { mode: "json" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    index("oauthClientResource_clientId_idx").on(table.clientId),
    index("oauthClientResource_resourceId_idx").on(table.resourceId),
  ],
);

export const oauthRefreshToken = /* table */ sqliteTable(
  "oauth_refresh_token",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull().unique(),
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: "cascade" }),
    sessionId: text("session_id").references(() => session.id, { onDelete: "set null" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    referenceId: text("reference_id"),
    authorizationCodeId: text("authorization_code_id"),
    resources: text("resources", { mode: "json" }),
    requestedUserInfoClaims: text("requested_user_info_claims", { mode: "json" }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }),
    revoked: integer("revoked", { mode: "timestamp_ms" }),
    rotatedAt: integer("rotated_at", { mode: "timestamp_ms" }),
    rotationReplayResponse: text("rotation_replay_response"),
    rotationReplayExpiresAt: integer("rotation_replay_expires_at", { mode: "timestamp_ms" }),
    authTime: integer("auth_time", { mode: "timestamp_ms" }),
    confirmation: text("confirmation", { mode: "json" }),
    scopes: text("scopes", { mode: "json" }).notNull(),
  },
  (table) => [
    index("oauthRefreshToken_clientId_idx").on(table.clientId),
    index("oauthRefreshToken_sessionId_idx").on(table.sessionId),
    index("oauthRefreshToken_userId_idx").on(table.userId),
    index("oauthRefreshToken_authorizationCodeId_idx").on(table.authorizationCodeId),
  ],
);

export const oauthAccessToken = /* table */ sqliteTable(
  "oauth_access_token",
  {
    id: text("id").primaryKey(),
    token: text("token").unique(),
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: "cascade" }),
    sessionId: text("session_id").references(() => session.id, { onDelete: "set null" }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    referenceId: text("reference_id"),
    authorizationCodeId: text("authorization_code_id"),
    resources: text("resources", { mode: "json" }),
    requestedUserInfoClaims: text("requested_user_info_claims", { mode: "json" }),
    refreshId: text("refresh_id").references(() => oauthRefreshToken.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }),
    revoked: integer("revoked", { mode: "timestamp_ms" }),
    confirmation: text("confirmation", { mode: "json" }),
    scopes: text("scopes", { mode: "json" }).notNull(),
  },
  (table) => [
    index("oauthAccessToken_clientId_idx").on(table.clientId),
    index("oauthAccessToken_sessionId_idx").on(table.sessionId),
    index("oauthAccessToken_userId_idx").on(table.userId),
    index("oauthAccessToken_authorizationCodeId_idx").on(table.authorizationCodeId),
    index("oauthAccessToken_refreshId_idx").on(table.refreshId),
  ],
);

export const oauthConsent = sqliteTable(
  "oauth_consent",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    referenceId: text("reference_id"),
    resources: text("resources", { mode: "json" }),
    requestedUserInfoClaims: text("requested_user_info_claims", { mode: "json" }),
    scopes: text("scopes", { mode: "json" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (table) => [index("oauthConsent_clientId_idx").on(table.clientId), index("oauthConsent_userId_idx").on(table.userId)],
);

export const oauthClientAssertion = sqliteTable("oauth_client_assertion", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});

// Owned by the app (not a better-auth plugin table) — see
// docs/mastermind/specs/2026-08-23-verified-email-claim-design.md. Backs
// the headless "verified_email" identity-assertion flow: an agent submits
// an email, the user relays a one-time code back, and a matched+unexpired
// row issues a real oauth_access_token row on verification.
export const emailClaimRequest = sqliteTable("email_claim_request", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  codeHash: text("code_hash").notNull(),
  clientId: text("client_id")
    .notNull()
    .references(() => oauthClient.clientId, { onDelete: "cascade" }),
  scope: text("scope").notNull(),
  attempts: integer("attempts").notNull().default(0),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  consumedAt: integer("consumed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
