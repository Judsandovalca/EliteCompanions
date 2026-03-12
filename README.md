# Elite Companions Marketplace

A full-stack marketplace web application for browsing and filtering companion profiles. Built as a monorepo with a Next.js frontend and a Node.js/GraphQL backend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Data Fetching | Apollo Client / Apollo Server |
| API | GraphQL |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 6 |
| Cache | Redis (ioredis) |
| Package Manager | pnpm (workspaces) |

## Project Structure

```
├── client/                  # Next.js frontend
│   └── src/
│       ├── app/             # Pages (home, companion detail)
│       ├── components/      # Header, CompanionGrid, FilterBar, etc.
│       └── lib/             # Apollo client, GraphQL queries, types
├── server/                  # Express + Apollo Server backend
│   ├── prisma/              # Schema, migrations, seed script
│   └── src/
│       ├── schema/          # GraphQL type definitions
│       └── resolvers/       # Query resolvers (filtering, pagination)
├── package.json             # Root workspace scripts
└── pnpm-workspace.yaml
```

## Features

- Companion profile grid with infinite scroll
- Filtering by location, age, ethnicity, body type, hair color, price range, and verification status
- Sorting by newest, rating, or price
- Detail pages with multi-image gallery
- BlurHash image placeholders for fast perceived loading
- Cursor-based pagination
- Responsive design (mobile, tablet, desktop)

## Prerequisites

- Node.js v18+
- pnpm
- PostgreSQL database
- Redis (optional)

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp server/.env.example server/.env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (with pgbouncer) |
| `DIRECT_URL` | Direct PostgreSQL connection string |
| `REDIS_URL` | Redis connection string (optional) |
| `PORT` | Server port (default: `4000`) |
| `CORS_ORIGIN` | Allowed origin (default: `http://localhost:3000`) |

### 3. Set up the database

```bash
# Run migrations
pnpm db:migrate

# Seed with sample data (48 companion profiles)
pnpm db:seed
```

### 4. Start development servers

```bash
# Run both client and server concurrently
pnpm dev
```

Or run them individually:

```bash
pnpm dev:client    # Next.js on http://localhost:3000
pnpm dev:server    # GraphQL API on http://localhost:4000/graphql
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Run client and server concurrently |
| `pnpm dev:client` | Start Next.js dev server |
| `pnpm dev:server` | Start GraphQL API dev server |
| `pnpm build` | Build both client and server |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed the database |
| `pnpm db:studio` | Open Prisma Studio GUI |

## GraphQL API

Available at `http://localhost:4000/graphql` with the following queries:

- **`companions(input)`** — List companions with filtering, sorting, and cursor-based pagination
- **`companion(id)`** — Get a single companion with full details and images
- **`categories`** — List all categories with companion counts
- **`featuredCompanions(limit)`** — Get featured companions sorted by rating

Health check endpoint: `GET http://localhost:4000/health`
