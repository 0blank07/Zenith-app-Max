# Zenith App (Zenith-app-Max)

A high-performance Next.js application for FC Mobile / EA FC enthusiasts, providing a comprehensive player database, market tools, and a blog CMS.

## Project Overview

- **Framework:** Next.js 14 (App Router)
- **Runtime:** Node.js
- **Primary Technologies:** React 18, TypeScript/JavaScript, PostgreSQL (Blog CMS), Supabase (Market Data), Chart.js, Sharp.
- **Architecture:** 
  - **App Router-first:** Core routes (`/`, `/players`, `/player/[id]`, `/tools`, `/blogs`) are built using Next.js App Router.
  - **Legacy SPA Compatibility:** An isolated legacy runtime is mounted at `/legacy`, supported by `scripts/prepare-legacy.mjs`.
  - **Rendering Strategy:** 
    - **SSG (Static Site Generation):** Top 10,000 players (defined in `src/data/top-players.json`) are pre-rendered at build time for optimal SEO and performance.
    - **Dynamic SSR/ISR:** Other players and dynamic pages are rendered on demand and cached using Incremental Static Regeneration (ISR).
    - **ISR Windows:** Player/Market pages (50 days), Blog pages (1 hour).

## Building and Running

### Setup
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production Build & Start
```bash
# Optional: Refresh top player list before build
npm run generate:top-players

# Build with 10k player pre-render (standard)
npm run build

# Start production server
npm run start
```

### Maintenance & Database
- **Check Rollout Status:** `npm run rollout:status` (Shows pre-render limits).
- **Blog Migrations:** `npm run db:migrate:blog` (Requires `BLOG_DATABASE_URL`).
- **Seed Blog Users:** `npm run db:seed:blog-users` (Requires admin/editor env vars).
- **On-demand Revalidation:** `npm run revalidate:call -- --endpoint <url> --secret <secret> --paths <paths>`

## Key Directories

- `app/`: Next.js App Router pages, components, and API routes.
- `src/lib/`: Core business logic, database repositories, and server-side utilities.
- `src/data/`: Static JSON data sources (e.g., `top-players.json`).
- `scripts/`: Build-time preparations, database migrations, and maintenance scripts.
- `assets/`: Global CSS and legacy JavaScript files.
- `public/`: Static assets, including the processed legacy bundle.

## Development Conventions

1. **Routing:** Prefer App Router for all new features. Legacy support is restricted to `/legacy`.
2. **Data Fetching:** Use Server Components for data fetching whenever possible.
3. **SEO:** Utilize `generateMetadata` and JSON-LD helpers located in `src/lib/server/blog/seo.mjs` and related files.
4. **Client Components:** Keep interactive logic (e.g., Squad Builder, Compare Tool) in `.client.js` components.
5. **Authentication:** Blog admin routes (`/admin/:path*`) are protected via `middleware.js` using signed session cookies.
6. **Pre-rendering:** The `MAX_PRERENDER_LIMIT` is 10,000. Use `PRERENDER_TIER` or `TOP_PLAYERS_PRERENDER_LIMIT` to control build-time generation.

## Documentation Reference
For deeper architectural audits and run guides, refer to:
- `Documentation-zenith.md`: Run and validation guide.
- `zenith-details.md`: Internal architecture and runtime details.


## Quality gates (all must pass before commit)
- Lint: `npm run lint` (Next.js ESLint, `.eslintrc.json`; note that `next.config.js` sets `eslint.ignoreDuringBuilds: true`)
- Type check: NOT SET UP (no script in `package.json`; `tsconfig.json` exists with `allowJs: true`, `strict: false`; `next.config.js` sets `typescript.ignoreBuildErrors: true`)
- Tests: Node.js test runner (`node:test`, `node:assert/strict`) via `node --test <file>.test.mjs` (e.g. `tests/e2e/redeem-codes.test.mjs`) or `npm run test:price` (repo-wide test script is NOT SET UP)
- Build: `npm run build` only when needed. It pre-renders up to 10,000 players, so use PRERENDER_TIER / TOP_PLAYERS_PRERENDER_LIMIT to reduce it for routine checks.

## Safety rules (project-specific)
- Never run db:migrate:blog, db:seed:blog-users or revalidate:call against production without my explicit approval each time. Show the exact command and target first.
- Don't modify /legacy or scripts/prepare-legacy.mjs unless I ask.

## SEO rules
- Keep existing public URLs, canonicals, metadata and JSON-LD working. No route renames or redirects without my approval.
- Check metadata and schema changes with the seo skill.

## Deploy (fill from the real setup; don't guess)
- Host: Linode VPS. PM2 process name: ASK OWNER (no ecosystem config in repo). Nginx config: ASK OWNER (no Nginx reverse proxy config in repo; managed on host/VPS).
- Deploy steps: ASK OWNER (conceptual workflow in `zenith-details.md` is `git push -> VPS pull -> npm install -> npm run build -> restart`, but no automated pipeline/scripts in repo). Rollback: ASK OWNER (no rollback scripts or strategy defined in repo). Smoke-test URLs: `/`, `/players`, `/player/<id>`, `/market`, `/tools` (`/tools/squad-builder`, `/tools/player-compare`, `/tools/watchlist`), `/blogs`, `/blogs/reviews`, `/robots.txt`, `/sitemap.xml`, `/fc-mobile-redeem-codes`.

## Language
- New code in: ASK OWNER (codebase is ~100% JavaScript: 221 `.js`, 87 `.mjs`, 2 `.jsx`, 0 `.ts`/`.tsx` application files; `typescript` devDependency and `tsconfig.json` exist but app code is purely JS). When editing an existing file, match its style.
