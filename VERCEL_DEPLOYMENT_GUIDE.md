# AuraVisa Global — Vercel Deployment & DevOps Guide

This guide documents the root causes of the previous Vercel deployment failure, the architectural changes implemented to resolve them, and step-by-step deployment instructions for production.

---

## 1. Diagnostic Summary & Root Causes

When deploying a full-stack React + Vite + Express + SQLite + Prisma application to Vercel, traditional long-running Node.js setups fail due to five specific constraints:

| Issue | Root Cause | Resolution Implemented |
|---|---|---|
| **API 404 / Missing Handler** | Express was started using `app.listen()` inside `server.ts`. Vercel does not run long-running servers; it requires exported serverless function handlers in the `/api` directory. | Extracted Express app into `server/src/app.ts` and created `/api/index.ts` exporting `handler(req, res)` for Vercel Serverless Functions. Kept `server.ts` for local dev on port 3000. |
| **Routing Conflicts & SPA 404s** | Refreshing routes like `/login` or `/customer/dashboard` returned 404 on Vercel without an SPA fallback rewrite, or a naive `/*` rewrite swallowed `/api/*` endpoints. | Added `vercel.json` with ordered rewrites: `/api/(.*)` routes to `/api`, while non-API paths `((?!api).*)` route to `/index.html`. |
| **Prisma Client Runtime Error** | `package.json` build command was only `vite build`. `@prisma/client` engine was not generated during the Vercel build step, causing "Prisma Client has not been generated yet" on first API call. | Updated `package.json` build command to `prisma generate && vite build` and configured `buildCommand` in `vercel.json`. |
| **Read-Only Filesystem & SQLite Lock** | Vercel Serverless runs on AWS Lambda containers with a read-only filesystem (except `/tmp`). An app attempting to write to `prisma/dev.db` crashed with `EROFS: read-only file system`. | Added automatic serverless detection in `server/src/db.ts`: on Vercel, if SQLite is used, the seeded `prisma/dev.db` is safely copied to `/tmp/auravisa_dev.db` so writes (login, audit logs, submissions) work without throwing EROFS. |
| **Upload Directory Crash on Cold Start** | `storageService.ts` called `fs.mkdirSync` on root directory path `storage/uploads`, throwing EROFS on serverless cold starts. | Configured `config.storagePath` to safely default to `/tmp/auravisa_uploads` when `process.env.VERCEL` is active, with try/catch guards. |
| **Hardcoded Relative Fetch URLs** | `src/services/api.ts` hardcoded relative paths. If a user deploys frontend to Vercel and backend to a container host (Cloud Run/Railway), API calls failed. | Updated `api.ts` to inspect `import.meta.env.VITE_API_BASE_URL` when configured, while remaining seamlessly relative for unified Vercel deployments. |

---

## 2. Deployment Architectures

### Option A: Unified Vercel Deployment (Default)
Both the frontend and the Express API run on Vercel:
- Frontend static assets built to `dist/` and served via Vercel Edge CDN.
- Backend API handled via Vercel Serverless Function at `/api/index.ts`.
- **Zero-Config Testing**: SQLite operates from `/tmp/auravisa_dev.db` with seeded test accounts.
- **Production Note**: Since `/tmp` is ephemeral and reset between container lifecycles, connect a persistent PostgreSQL database for production data durability.

### Option B: Decoupled Deployment (Recommended for High Traffic)
- **Frontend**: Hosted on Vercel (Edge CDN, fast static delivery). Set environment variable `VITE_API_BASE_URL="https://api.yourdomain.com"`.
- **Backend**: Hosted on a container platform (Google Cloud Run, Railway, Render, or VPS) running `npm start` (`tsx server.ts`).
- Full persistent disk for SQLite or managed Cloud SQL / PostgreSQL.

---

## 3. Vercel Dashboard Configuration Settings

When importing the Git repository into Vercel:

1. **Framework Preset**: `Vite`
2. **Root Directory**: `./` (workspace root)
3. **Build Command**: `prisma generate && vite build` (or leave default, `vercel.json` defines this)
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Required Environment Variables in Vercel:

| Variable Name | Environment | Description | Example |
|---|---|---|---|
| `SESSION_SECRET` | Production & Preview (Server) | Secret key for signing sessions and iframe tokens | `c4b8e9f28a7d16538902beaf...` (min 32 chars) |
| `GEMINI_API_KEY` | Production & Preview (Server) | Google Gemini API key for live AI visa assistant | `AIzaSy...` |
| `DATABASE_URL` | Production & Preview (Server) | Database connection URL | `file:./prisma/dev.db` (ephemeral) OR `postgresql://...` |
| `FRONTEND_ORIGIN` | Production & Preview (Server) | Allowed origin for CORS headers | `https://your-project.vercel.app` |
| `NODE_ENV` | Production & Preview (Server) | Runtime environment | `production` |
| `VITE_API_BASE_URL` | Production & Preview (Client) | Only needed if backend is hosted on a separate domain | `https://api.yourdomain.com` (leave blank for Option A) |

> **Security Warning**: Never prefix server secrets (`GEMINI_API_KEY`, `SESSION_SECRET`, `DATABASE_URL`) with `VITE_`.

---

## 4. Production Database Setup (PostgreSQL)

To use a managed PostgreSQL database (Neon, Supabase, Cloud SQL, AWS RDS) instead of ephemeral SQLite:

1. In `prisma/schema.prisma`, update the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set `DATABASE_URL` in your Vercel project environment settings:
   ```
   DATABASE_URL="postgresql://user:password@ep-cool-project.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```
3. Push schema to PostgreSQL:
   ```bash
   npx prisma db push
   ```
4. Re-run seed if needed:
   ```bash
   npx tsx prisma/seed.ts
   ```

---

## 5. Verification Commands

Run locally to verify build and test passes before pushing:
```bash
# Verify TypeScript typing across client and server
npm run lint

# Verify full production build (Prisma generation + Vite build)
npm run build

# Run automated integration tests
npm test
```
