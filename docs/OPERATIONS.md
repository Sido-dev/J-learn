# Deployment and operations

## Suitable hosting target

A single Docker-capable Linux host (for example an organization-managed VM) behind a TLS reverse proxy, with managed PostgreSQL 17 or the provided private Compose database, is a straightforward first target. The application binds port 3000. The Compose port is loopback-only so a TLS proxy must provide public access. No external environment has been provisioned or published.

1. Set `POSTGRES_PASSWORD` to a long unique, URL-safe random value (hex works well) in a protected environment file or secret manager. Set `APP_ORIGIN` to the exact HTTPS URL, without a trailing slash. Do not reuse the CI-only password.
2. Review `.env.example`; set `TRUST_PROXY_HOPS` to the actual number of trusted reverse proxies (1 for the described VM/proxy arrangement). Do not expose the application port directly to the internet.
3. Run `docker compose config` to validate interpolation, then `docker compose up --build -d`. The migration service runs the additive schema and content seed before app startup. This workflow needs Docker/PostgreSQL; it was not executed in this workspace.
4. Configure the reverse proxy with automatic TLS, request-body limit at or above 96 KiB, sane connection timeouts, and forwarded HTTPS. Preserve cookies and Origin. Forward only from trusted proxy addresses. Add upstream request limiting if serving multiple app replicas.
5. Check `/api/health` (process) and `/api/ready` (database), then smoke-test guest creation, account upgrade, login/logout, a quiz retry, review, bookmarks, journal, and export over HTTPS. Inspect Secure/HttpOnly/SameSite cookies and CSP headers in the live environment.

For managed PostgreSQL instead of Compose's database, set `DATABASE_URL` in the application and one-off migration job to the provider connection URL, with verified TLS per provider guidance. Never set `rejectUnauthorized=false`. Use a least-privilege runtime role and a separate migration role in managed environments; the simple local Compose example uses one application database owner for setup.

## Build/start and schema management

- Build: `npm ci && npm run build` in a build job, never with real secrets in the source tree.
- Migrate: `node dist/migrate.js` with runtime database credentials. Includes conflict-safe immutable content seeding. `npm run seed` is the source/development equivalent.
- Start: `NODE_ENV=production node dist/server.js` with `APP_ORIGIN` and `DATABASE_URL` set. The server refuses a missing/non-HTTPS application origin. SQLite is disabled in production unless `ALLOW_SQLITE=true` is explicitly chosen on a single persistent-disk instance.
- `AUTO_MIGRATE=false` is the production default. Do not automatically run future destructive changes. New migrations require review, staging tests, and a backup. Migrations 001/002 are additive; they do not drop existing user data. Migration 002 backfills durable completion from all historical attempts and creates session/guided/activity tables. Back up first. Run migration/seed for every release, even when only content changes, before replacing the running app. Old immutable content snapshots and in-progress MCQ snapshots remain available. Do not delete the existing SQLite database to upgrade.
- The runtime container is non-root. Application error events contain event/request ID only. Collect platform logs with limited access and retention. Set health alerting, disk/connection monitoring, and resource limits based on measured traffic before production enrollment.

## Backup and restore

PostgreSQL: configure managed daily backups and point-in-time recovery where available. Retain, for example, seven daily and four weekly backups under the organization's approved retention policy. Encrypt backups and restrict access. Use `pg_dump --format=custom --file=sumi-backup.dump "$DATABASE_URL"` from a protected shell; do not paste the connection string into shared logs. Credentials should come from the secret manager, not shell history.

Restore first into a **new empty database** using `pg_restore --no-owner --dbname="$RESTORE_DATABASE_URL" sumi-backup.dump`. Verify counts, private-data isolation, login, attempts, and readiness. Repoint the app only after a reviewed maintenance plan. Never run restore/clean against the live database casually. Test restore quarterly. Account deletion is immediate in application tables; encrypted historical backups age out under retention and must not silently resurrect deleted accounts. Maintain a restricted deletion ledger for restore reconciliation if public enrollment is enabled.

SQLite local demo: `npm run backup -- /absolute/path/sumi-backup.sqlite` uses Node's online backup API for a consistent copy. Stop the app before replacing the live database with an approved backup; preserve ownership/permissions. Copying only a live WAL-mode database file is not a safe backup strategy. `.data/` must never be committed or included in a client/source archive.

## Rollback

Keep previous image digests and content/schema versions. For an application-only regression, redeploy the previous image against the compatible additive schema. Do not delete historical content snapshots or reverse migrations automatically. If a schema/data rollback is necessary, use a new restored database, validate it, and perform an explicit reviewed cutover. Record migration versions and the deployed image digest. Test a restore and rollback in staging before release.

## Service limits and failure behavior

API limit: 180 requests/minute/IP; authentication: 30 requests/15 minutes/IP; two concurrent memory-hard password hashes. These are process-local: stay single-instance or add shared limits before scaling. JSON body: 96 KiB; journal: 8,000 characters; recording: at most 60 seconds in browser memory; drawings: normalized bounded points. PostgreSQL max pool: 10; connect timeout: 5s; statements: 10s. HTTP request timeout: 15s. Graceful shutdown drains connections, closes the pool, and has a 10s bounded fallback.

The client reports network/timeouts. MCQ question order, option order, answers, scores and cycle are stored on the server; refresh/resume works with the same authenticated journal. Unsubmitted selection and lesson drafts use per-user tab storage where available. No cookie or an expired guest session means no access until the same account signs in; create an account before clearing guest cookies. There is no offline install/cache or background sync. Voice/microphone failures leave text learning available. There is no paid AI integration to fail or expose credentials. A future AI tutor must remain server-side, rate limited, timed out, and unable to alter scores/permissions.

## Upgrade 1.0 → 1.1

Stop writes, take an online backup (or approved PostgreSQL backup), install/build this release, and run `node dist/migrate.js` using the existing database. Verify schema migration 2, retained account/attempt counts, durable completions, a new four-option session, and a pre-existing attempt/export. Then start the new app. The migration regression test reconstructs the old schema and proves retained accounts/version-one content plus backfilled completions on SQLite. Live PostgreSQL/Compose upgrade and restore still require staging validation. Never run tests against the live database.
