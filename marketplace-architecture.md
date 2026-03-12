# Marketplace Image Grid — Software Architecture

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | **Next.js (App Router)** | SSR for SEO, React Server Components, image optimization built-in |
| **Styling** | **Tailwind CSS** | Fast iteration, responsive grid utilities |
| **State** | **TanStack Query** | Infinite scroll, caching, background refetching |
| **Backend** | **Node.js + Fastify** or **Next.js API routes** | Fast JSON APIs, familiar ecosystem |
| **Database** | **PostgreSQL** | Relational data (listings, users, categories) + full-text search |
| **Search** | **Elasticsearch** or **Meilisearch** | Faceted filtering, geo-search, typo tolerance |
| **Image Storage** | **S3 + CloudFront CDN** | Cheap storage, global delivery |
| **Image Processing** | **Sharp** (on upload) + **CDN transforms** | Generate multiple sizes at upload time |
| **Cache** | **Redis** | Hot listings, session, feed caching |

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                      CLIENT                         │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐ │
│  │ Masonry  │  │ Uniform  │  │  Virtual Scroller  │ │
│  │  Grid    │  │  Grid    │  │  (renders only     │ │
│  │ (browse) │  │ (search) │  │   visible items)   │ │
│  └──────────┘  └──────────┘  └───────────────────┘ │
│           │          │               │              │
│           └──────────┼───────────────┘              │
│                      ▼                              │
│          ┌───────────────────┐                      │
│          │  TanStack Query   │                      │
│          │  Infinite scroll  │                      │
│          │  + prefetching    │                      │
│          └───────────────────┘                      │
└──────────────────┬──────────────────────────────────┘
                   │ REST / GraphQL
                   ▼
┌──────────────────────────────────────────────────────┐
│                    API LAYER                          │
│                                                      │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │  Listings  │  │   Search    │  │   Upload     │  │
│  │  Service   │  │   Service   │  │   Service    │  │
│  └─────┬──────┘  └──────┬──────┘  └──────┬───────┘  │
│        │                │                │           │
│        ▼                ▼                ▼           │
│  ┌──────────┐   ┌─────────────┐  ┌──────────────┐   │
│  │ Postgres │   │ Elastic /   │  │  S3 + Sharp  │   │
│  │          │   │ Meilisearch │  │  (resize)    │   │
│  └──────────┘   └─────────────┘  └──────────────┘   │
│        │                                  │          │
│        ▼                                  ▼          │
│  ┌──────────┐                     ┌──────────────┐   │
│  │  Redis   │                     │  CloudFront  │   │
│  │  Cache   │                     │  CDN         │   │
│  └──────────┘                     └──────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### 1. Image Pipeline

```
Upload → Sharp generates 3 variants → S3 → CloudFront

  thumb:  200x200  (grid preview, ~15KB)
  medium: 600x600  (detail view, ~50KB)
  full:   1200+    (lightbox, ~150KB)
```

- Store image dimensions in DB at upload time (prevents layout shift)
- Use `webp` format with `jpg` fallback
- BlurHash or LQIP (low-quality image placeholder) generated at upload for instant previews

### 2. Virtual Scrolling + Infinite Load

With hundreds of thousands of items, you **cannot** load them all. The approach:

- **Cursor-based pagination** (not offset) — `GET /listings?cursor=abc&limit=40`
- **Virtualized list** — only render ~20-30 items in the DOM at a time (use `react-virtuoso` or `@tanstack/virtual`)
- **Prefetch next page** when user is 70% scrolled
- **Intersection Observer** for lazy loading images as they enter viewport

### 3. Hybrid Grid Layout

```
Browse/Home page  →  Masonry grid (variable heights, visual interest)
Search results    →  Uniform grid (scannable, predictable)
Category pages    →  Toggle between both
```

Use CSS `columns` or a lib like `react-masonry-css` for masonry. Uniform grid is just CSS Grid.

### 4. API Response Shape (optimized for grid)

```json
{
  "listings": [
    {
      "id": "abc123",
      "title": "Vintage Chair",
      "price": 4500,
      "currency": "USD",
      "thumbnail": "https://cdn.example.com/thumb/abc123.webp",
      "width": 200,
      "height": 267,
      "blurHash": "LEHV6nWB2yk8pyo0adR*.7kCMdnj",
      "location": "Brooklyn, NY",
      "postedAt": "2026-03-10T..."
    }
  ],
  "nextCursor": "eyJpZCI6...",
  "hasMore": true
}
```

- Keep payloads **small** — only what the grid card needs
- Full listing details fetched on click/hover

### 5. Database Schema (core tables)

```sql
-- Listings
CREATE TABLE listings (
  id            UUID PRIMARY KEY,
  seller_id     UUID REFERENCES users(id),
  title         TEXT NOT NULL,
  description   TEXT,
  price         INTEGER NOT NULL, -- stored in cents
  currency      VARCHAR(3) DEFAULT 'USD',
  category_id   UUID REFERENCES categories(id),
  status        VARCHAR(20) DEFAULT 'active', -- active, sold, removed
  location      GEOGRAPHY(POINT, 4326),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_created ON listings(created_at DESC);
CREATE INDEX idx_listings_location ON listings USING GIST(location);

-- Listing Images
CREATE TABLE listing_images (
  id            UUID PRIMARY KEY,
  listing_id    UUID REFERENCES listings(id) ON DELETE CASCADE,
  position      SMALLINT NOT NULL,
  s3_key        TEXT NOT NULL,
  width         INTEGER NOT NULL,
  height        INTEGER NOT NULL,
  blur_hash     VARCHAR(32),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listing_images_listing ON listing_images(listing_id, position);
```

### 6. Caching Strategy

| What | Where | TTL |
|------|-------|-----|
| Hot feed (first 2 pages) | Redis | 60s |
| Category counts | Redis | 5min |
| Search results | Elasticsearch query cache | 30s |
| Images | CloudFront CDN | 30 days |
| Listing detail | Redis | 5min, invalidate on edit |

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.2s |
| Grid images visible | < 2s |
| Infinite scroll next page | < 300ms |
| Image placeholder → loaded | < 500ms |
| API response (listing page) | < 100ms |

---

## MVP Build Order & Progress

| # | Task | Status |
|---|------|--------|
| 1 | Image upload + processing pipeline (S3 + Sharp + variants) | Placeholder (picsum.photos) — no real upload yet |
| 2 | Listings API with cursor pagination | Done — GraphQL via Apollo Server, Prisma, Redis cache, full filtering/sorting |
| 3 | Grid component with virtual scrolling + lazy images | Done — `CompanionGrid` with IntersectionObserver infinite scroll, `CompanionCard` with lazy load |
| 4 | Search with basic filters (category, price range, location) | Done — `FilterBar` with city, ethnicity, body type, hair, age range, verified, sort |
| 5 | BlurHash placeholders for polish | Partial — field stored in DB, blur placeholder gradient shown, no actual BlurHash decoding |
| 6 | CDN + caching layer for scale | Partial — Redis caching in resolvers, no real CDN yet |

---

## What's Built

### Server (`server/`)
- **Express + Apollo Server** GraphQL API on port 4000
- **Prisma schema**: `Companion`, `CompanionImage`, `Category`, `CategoriesOnCompanions` models
- **Resolvers**: `companions` (cursor paginated + filtered), `companion` (detail), `categories`, `featuredCompanions`
- **Redis caching** with graceful fallback if unavailable
- **Seed script**: 48 dummy companions with picsum placeholder images

### Client (`client/`)
- **Next.js App Router** with Tailwind CSS, dark theme (`zinc-950` base)
- **Apollo Client** with `InMemoryCache` merge policy for infinite scroll
- **Components**:
  - `Header` — sticky nav with logo, Browse/Categories/Featured links, Sign In/Join buttons
  - `FilterBar` — city, ethnicity, body type, hair color, age range, sort, verified toggle, expandable
  - `CompanionGrid` — fetches via `GET_COMPANIONS`, infinite scroll with IntersectionObserver, loading skeletons
  - `CompanionCard` — lazy-loaded images, aspect ratio preservation, badges (Featured/Verified/Price), rating, location
- **GraphQL queries**: listing feed, detail, categories, featured
- **Landing page** (`page.tsx`): hero section + grid + footer

### Not Yet Built
- ~~/companion/[id] detail page~~ Done — full gallery with lightbox, keyboard nav, attributes, categories, CTA
- `/categories` page
- `/featured` page
- Mobile hamburger menu (nav hidden on mobile, no toggle)
- Real image upload/S3 pipeline
- BlurHash decoding/rendering
- User auth (Sign In / Join are placeholder buttons)
