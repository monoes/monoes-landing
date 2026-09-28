-- The fixed public OAuth client MonoAgent (desktop app + CLI) signs in with:
-- authorization code + PKCE, no client secret, loopback redirects. Any port on
-- 127.0.0.1 / [::1] matches the registered URIs (RFC 8252 §7.3): the
-- oauth-provider plugin's findRegisteredRedirectUri ignores the port for
-- loopback IP hosts.
INSERT OR IGNORE INTO `oauth_client` (
	`id`, `client_id`, `client_secret`, `disabled`, `skip_consent`, `scopes`,
	`user_id`, `created_at`, `updated_at`, `name`, `uri`, `redirect_uris`,
	`token_endpoint_auth_method`, `application_type`, `grant_types`,
	`response_types`, `require_pkce`, `dpop_bound_access_tokens`, `metadata`
) VALUES (
	'monoagent-public-client', 'monoagent', NULL, 0, 0,
	'["openid","profile","email","offline_access","library:read","library:write","community:read","community:write"]',
	NULL, 1790500000000, 1790500000000, 'MonoAgent', 'https://monoes.me/projects/mono-agent',
	'["http://127.0.0.1/callback","http://[::1]/callback"]',
	'none', 'native', '["authorization_code","refresh_token"]',
	'["code"]', 1, 0, '{}'
);
