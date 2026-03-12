# Elite Companions Marketplace

A full-stack marketplace web application for browsing, publishing, and managing companion profiles. Built as a monorepo with a Next.js frontend and a Node.js/GraphQL backend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Data Fetching | Apollo Client / Apollo Server |
| API | GraphQL |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 6 |
| Auth | JWT (HTTP-only cookies) + bcrypt |
| Storage | AWS S3 (image uploads) |
| Package Manager | pnpm (workspaces) |

## Project Structure

```
├── client/                  # Next.js frontend
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Landing page — companion grid
│       │   ├── companion/[id]/       # Companion detail page
│       │   ├── mi-perfil/            # User profile & publication management
│       │   └── publish/              # Create new companion listing
│       ├── components/
│       │   ├── Header.tsx            # Navigation + search strip
│       │   ├── CompanionCard.tsx     # Card with hover tooltip
│       │   ├── CompanionGrid.tsx     # Responsive grid layout
│       │   ├── FeaturedSection.tsx   # Featured companions carousel
│       │   ├── FilterBar.tsx         # Sidebar filters
│       │   ├── AuthModal.tsx         # Login/register modal
│       │   └── icons/               # Reusable SVG icon components
│       └── lib/
│           ├── apollo.ts            # Apollo Client config
│           ├── auth.tsx             # AuthProvider + useAuth hook
│           ├── queries.ts           # GraphQL queries & mutations
│           ├── types.ts             # Shared TypeScript interfaces
│           └── upload.ts            # Image upload utilities
├── server/
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   ├── migrations/              # SQL migrations
│   │   └── seed.ts                  # Seed script (48 profiles)
│   └── src/
│       ├── index.ts                 # Express + Apollo Server entry
│       ├── auth.ts                  # JWT signing, verification, cookie handling
│       ├── schema/typeDefs.ts       # GraphQL type definitions
│       ├── resolvers/index.ts       # Query & mutation resolvers
│       └── routes/upload.ts         # Image upload endpoint (S3)
├── docs/                            # Project documentation
├── package.json                     # Root workspace scripts
└── pnpm-workspace.yaml
```

## Features

### Browsing & Discovery
- Companion profile grid with infinite scroll
- Filtering by location, age, ethnicity, body type, hair color, price range, verification status, and tags
- Sorting by newest, rating, or price
- Hover tooltips showing tagline and tags on companion cards
- Featured companions section on landing page
- Responsive design (mobile, tablet, desktop, 2K+)

### Companion Profiles
- Detail pages with multi-image gallery and fullscreen lightbox
- Physical attributes, services, languages, and bio
- Tags system (`#rubia`, `#morena`, `#bilingue`, etc.) with GIN-indexed filtering
- WhatsApp contact button
- Verified and featured badges

### User System
- Cookie-based JWT authentication (HTTP-only, secure, sameSite)
- Registration and login via modal dialog
- "Mi Perfil" dashboard for managing publications
- Publish page for creating new companion listings with image upload
- Toggle publication active/inactive status
- Stats overview (total, active, inactive publications)

### Performance
- BlurHash image placeholders for fast perceived loading
- Intersection Observer lazy loading for card images
- Cursor-based pagination
- Root font-size scaling for 2K+ displays

## Prerequisites

- Node.js v18+
- pnpm
- PostgreSQL database
- AWS S3 bucket (for image uploads)

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
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `PORT` | Server port (default: `4000`) |
| `CORS_ORIGIN` | Allowed origin (default: `http://localhost:3000`) |
| `AWS_ACCESS_KEY_ID` | AWS credentials for S3 uploads |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials for S3 uploads |
| `AWS_S3_BUCKET` | S3 bucket name for images |
| `AWS_REGION` | AWS region |

### 3. Set up the database

```bash
# Run migrations
pnpm db:migrate

# Seed with sample data (48 companion profiles with tags)
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

Available at `http://localhost:4000/graphql`.

### Queries

| Query | Description |
|-------|-------------|
| `companions(input)` | List companions with filtering, sorting, and cursor pagination |
| `companion(id)` | Get a single companion with full details and images |
| `categories` | List all categories with companion counts |
| `featuredCompanions(limit)` | Get featured companions sorted by rating |
| `me` | Get current authenticated user |
| `myCompanions` | Get current user's companion listings |

### Mutations

| Mutation | Description |
|----------|-------------|
| `register(input)` | Create a new user account |
| `login(input)` | Authenticate and receive session cookie |
| `logout` | Clear session cookie |
| `createCompanion(input)` | Create a new companion listing |
| `toggleCompanionStatus(id)` | Toggle companion active/inactive |

Health check endpoint: `GET http://localhost:4000/health`

## Database Schema

Core models:

- **User** — accounts with email, name, hashed password, role (USER/ADMIN)
- **Companion** — profiles with attributes, pricing, location, services, tags, status, owner relation
- **CompanionImage** — multi-resolution images (thumb, medium, full) with blur hashes
- **Category** — service categories with many-to-many companion relation

## Documentation

See the `docs/` folder for detailed documentation:

- [Authentication](docs/auth.md) — JWT cookie flow, security, and API reference
- [Next Steps](docs/next-steps.md) — Planned features and tasks
