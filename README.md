# monoes-landing

> Production landing page, portfolio, agent showcase, and community platform for [monoes.me](https://monoes.me).

Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **Better-Auth**, and **Drizzle ORM**, deployed to **Cloudflare Workers** via **OpenNext**.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database & Migrations](#database--migrations)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Build & Deployment](#build--deployment)
- [Project Structure](#project-structure)
- [Moving to Another Computer (Migration Guide)](#moving-to-another-computer-migration-guide)

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Compiler) + [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [GSAP](https://gsap.com/) & [Framer Motion](https://motion.dev/)
- **Authentication**: [Better-Auth](https://www.better-auth.com/) (Email/Password, JWT plugin, OAuth Provider)
- **Database & ORM**: [Cloudflare D1 (SQLite)](https://developers.cloudflare.com/d1/) + [Drizzle ORM](https://orm.drizzle.team/)
- **File Storage**: [Cloudflare R2](https://developers.cloudflare.com/r2/) (`AVATARS`, `ORG_FILES`)
- **Edge Deployment**: [Cloudflare Workers](https://workers.cloudflare.com/) via [@opennextjs/cloudflare](https://opennext.js.org/cloudflare)
- **Testing**: Node.js native test runner (`node --test`) + [Playwright](https://playwright.dev/) for E2E

---

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm` (v10+ recommended)
- **Cloudflare Wrangler CLI**: Installed locally as devDependency (or `npx wrangler`)

---

## Quick Start

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/monoes/monoes-landing.git
cd monoes-landing
npm install
```

### 2. Configure Environment Variables

Copy the example configuration file:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and set a secure `BETTER_AUTH_SECRET` (generate with `openssl rand -hex 32`).

### 3. Initialize Local Database

Run D1 SQLite migrations locally:

```bash
npm run db:migrate:local
```

### 4. (Optional) Seed Local Admin User

```bash
export $(grep -v '^#' .dev.vars | xargs)
npm run seed:admin
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Local secrets are read by Wrangler / Cloudflare from `.dev.vars`.

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `BETTER_AUTH_SECRET` | **Yes** | 32+ char secret for JWT and session signing | `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | **Yes** | App base URL | `http://localhost:3000` |
| `ADMIN_EMAIL` | Optional | Admin account email for `seed:admin` | `admin@example.com` |
| `ADMIN_USERNAME` | Optional | Admin username for `seed:admin` | `admin` |
| `ADMIN_PASSWORD` | Optional | Admin password for `seed:admin` | `SuperSecretPassword123` |
| `RESEND_API_KEY` | Optional | Resend API key for password reset emails | `re_123456...` |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID (enables "Continue with Google") | from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret | from Google Cloud Console |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Optional | Plausible Analytics domain | `monoes.me` |

For production deployments on Cloudflare:
```bash
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
```

---

## Database & Migrations

Database schema definitions live in [`src/lib/db/schema.ts`](src/lib/db/schema.ts).

- **Apply migrations locally** (creates/updates `.wrangler/state/v3/d1`):
  ```bash
  npm run db:migrate:local
  ```
- **Generate a new migration** after editing schema:
  ```bash
  npm run db:generate
  ```
- **Apply migrations to production Cloudflare D1**:
  ```bash
  npx wrangler d1 migrations apply monoes-community --remote
  ```

---

## Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `next dev` | Start local Next.js development server |
| `npm run build` | `next build` | Next.js production build verification |
| `npm run lint` | `eslint` | Run ESLint across codebase |
| `npm test` | `node --experimental-strip-types --test 'src/**/*.test.ts'` | Run unit and integration tests |
| `npm run test:e2e` | `playwright test` | Run Playwright end-to-end tests |
| `npm run db:generate` | `drizzle-kit generate` | Generate SQL migration from schema |
| `npm run db:migrate:local` | `wrangler d1 migrations apply monoes-community --local` | Run local D1 migrations |
| `npm run seed:admin` | `tsx scripts/seed-admin.ts` | Seed admin user account |
| `npm run cf:build` | `opennextjs-cloudflare build && ...` | Build Cloudflare Worker bundle |
| `npm run deploy` | `npm run cf:build && wrangler deploy` | Deploy to Cloudflare Workers |

---

## Testing

### Unit Tests
The project uses the native Node test runner with TypeScript type stripping:

```bash
npm test
```

### E2E Tests (Playwright)
To run browser tests:

```bash
npx playwright install
npm run test:e2e
```

---

## Build & Deployment

The application compiles for Cloudflare Workers using OpenNext:

1. **Verify build locally**:
   ```bash
   npm run cf:build
   ```
2. **Deploy to Cloudflare Workers**:
   ```bash
   npm run deploy
   ```

Cloudflare bindings (D1 Database `COMMUNITY_DB`, R2 Buckets `AVATARS`, `ORG_FILES`) are defined in [`wrangler.toml`](wrangler.toml).

---

## Project Structure

```
├── drizzle/              # D1 SQL migration files
├── public/               # Static assets (images, logos, fonts, icons)
├── scripts/              # Build utilities, markdown generators, admin seeder
├── src/
│   ├── app/              # Next.js App Router (pages, API routes, layout)
│   │   ├── (main)/       # Main layout pages (community, blog, projects)
│   │   └── api/          # Better-Auth, agent API, webhooks, MCP endpoints
│   ├── components/       # UI components (community, layout, landing, research)
│   ├── lib/              # Core libraries (auth, db, schema, mcp, agents)
│   │   ├── db/           # Drizzle ORM client and schema
│   │   ├── auth.ts       # Better-Auth server configuration
│   │   └── mcp/          # Model Context Protocol tools & schemas
│   └── styles/           # Global styles and Tailwind configuration
├── wrangler.toml         # Cloudflare Worker, D1, and R2 configuration
└── next.config.ts        # Next.js configuration
```

---

## Moving to Another Computer (Migration Guide)

When moving this repository to a new computer, follow these steps:

### Option A: Via Git (Recommended)

1. **On your current computer**, ensure all changes are committed and pushed:
   ```bash
   git status
   git add .
   git commit -m "chore: save work before machine migration"
   git push origin main
   ```

2. **On your new computer**:
   ```bash
   # 1. Clone repository
   git clone https://github.com/monoes/monoes-landing.git
   cd monoes-landing

   # 2. Install dependencies
   npm install

   # 3. Create .dev.vars file
   cp .dev.vars.example .dev.vars
   # Fill in BETTER_AUTH_SECRET and ADMIN credentials

   # 4. Initialize local SQLite D1 database
   npm run db:migrate:local

   # 5. (Optional) Seed admin user
   export $(grep -v '^#' .dev.vars | xargs) && npm run seed:admin

   # 6. Verify tests and start dev server
   npm test
   npm run dev
   ```

### Option B: Via Direct File Copy (AirDrop / USB / Rsync)

If copying the directory directly without using Git remote:
- **Exclude** these generated/bulky directories before copying:
  - `node_modules/`
  - `.next/`
  - `.open-next/`
  - `.wrangler/`
- **Include** `.dev.vars` (or recreate it on the new machine).
- On the new computer, run `npm install`, `npm run db:migrate:local`, and `npm run dev`.
