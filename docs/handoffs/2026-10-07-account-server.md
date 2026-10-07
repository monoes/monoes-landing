# Account server checkpoint — 2026-10-07

Branch feat/account-gate-server contains the deploy-hardening commits through dbb9f58 plus the OAuth HTTP test helper and local diagnostic spike sources preserved at this checkpoint. Server production Tasks 3–8 are not implemented. Deploy hardening also has its own feat/account-gate-deploy-hardening branch.

Authoritative requirements and measured findings are in monoes/mono-agent branch feat/monoes-account-gate: docs/mastermind/plans/2026-10-05-monoes-account-gate-a-server.md and docs/mastermind/specs/2026-10-05-monoes-account-gate-spike-findings.md. Start with that repo's docs/handoffs/2026-10-07-account-gate.md. Task 2 and two review fixes are complete; the provider hook must be built from the amended plan rather than assuming upstream account-wide revocation is acceptable.

scripts/spikes are diagnostic SOURCE ONLY. They were ignored local files and are explicitly preserved for cross-machine continuation; no local database, .env file, token, signing secret, server output or node_modules is committed. Run only against a newly created local development instance/database with synthetic accounts. Preserve the local-only conditions in plan A. Do not run against production.

Refresh-token replay must end only its own family. Token-route decisions use the stored token row; revoke-route caller pinning reads nonempty client_id values from raw cloned request text, without content-type gating. Workerd verification of BOM/+json shapes remains.

Verification: OAuth helper and all TypeScript spike files passed Node syntax checking. Deployment workflow tests pass 4/4. Full server unit/Playwright/workerd suites have not been rerun for this checkpoint. No deployment or production migration was performed. Production owner steps remain in plan A.
