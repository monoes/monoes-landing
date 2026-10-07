-- The audience a MonoAgent access token is bound to (RFC 8707 `resource`), and
-- the only OAuth client allowed to ask for it. The oauth-provider plugin
-- answers a `resource` that is not a row here with invalid_target and, with its
-- default enforcePerClientResources, one the client is not linked to.
-- allowed_scopes stays NULL on purpose: a non-null list narrows the scopes of
-- every token issued for the resource instead of only validating them.
INSERT OR IGNORE INTO `oauth_resource` (
	`id`, `identifier`, `name`, `access_token_ttl`, `refresh_token_ttl`,
	`signing_algorithm`, `signing_key_id`, `allowed_scopes`, `custom_claims`,
	`dpop_bound_access_tokens_required`, `disabled`, `created_at`, `updated_at`,
	`policy_version`, `metadata`
) VALUES (
	'monoagent-resource', 'https://monoes.me/api/monoagent', 'MonoAgent',
	NULL, NULL, NULL, NULL, NULL, NULL,
	0, 0, 1791206580558, 1791206580558,
	1, '{}'
);
INSERT OR IGNORE INTO `oauth_client_resource` (
	`id`, `client_id`, `resource_id`, `metadata`, `created_at`
) VALUES (
	'monoagent-client-resource', 'monoagent', 'https://monoes.me/api/monoagent',
	'{}', 1791206580558
);
