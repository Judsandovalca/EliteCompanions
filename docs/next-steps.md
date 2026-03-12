# Next Steps & Tasks

Planned features and improvements organized by priority.

---

## High Priority

### WhatsApp Contact Integration
- Add `phone` field to Companion model and GraphQL schema
- Build WhatsApp deep link (`https://wa.me/<phone>?text=...`) on the detail page contact button
- Add phone input to the publish form
- Validate phone number format (international)

### Edit Companion Publication
- Create `/publish/[id]` edit page (reuse publish form)
- Add `updateCompanion` GraphQL mutation
- Pre-populate form with existing companion data
- Add "Editar" button to Mi Perfil companion cards

### Image Upload Flow
- Connect the publish form image uploader to the S3 upload endpoint
- Support drag-and-drop and multi-file selection
- Show upload progress with preview thumbnails
- Generate blur hashes on the server after upload
- Set primary image selection

### Search Functionality
- Wire the Header search bar to the `companions` query
- Support text search across name, tagline, bio, tags
- Add full-text search index (PostgreSQL `tsvector`)
- Combine with existing category/city filters

---

## Medium Priority

### Reviews & Ratings
- Create `Review` model (rating, comment, reviewer, companion)
- Add `createReview` mutation with auth guard
- Display reviews on companion detail page
- Compute average rating from actual reviews instead of seed data

### Favorites System
- Create `Favorite` model (userId + companionId)
- Add `toggleFavorite` mutation
- Build `/favorites` page showing saved companions
- Add heart icon toggle on companion cards
- Persist favorites across sessions via database

### Tag Filtering on Landing Page
- Add clickable tag pills in the filter sidebar
- Clicking a tag on a card filters the grid by that tag
- Show popular/trending tags section
- URL-based tag filtering (`/?tag=rubia`)

### Categories & Featured Pages
- Build `/categories` page with category cards and companion counts
- Build `/featured` page with curated featured companions
- Add admin ability to feature/unfeature companions

---

## Low Priority

### Admin Dashboard
- Create `/admin` route with role-based access (ADMIN only)
- Companion moderation: approve, suspend, delete listings
- User management: view users, change roles
- Content reporting and review queue

### Profile Verification
- Add verification request flow for companions
- Upload ID document (private, admin-only access)
- Admin approval workflow
- Show verification badge on approved profiles

### Notifications
- Email notifications for new reviews, status changes
- In-app notification bell with unread count
- Notification preferences in user settings

### SEO & Performance
- Add `generateMetadata` for dynamic companion pages
- Open Graph tags for social sharing
- Sitemap generation
- Server-side rendering for the landing page
- Image optimization with Next.js `<Image>` component

### Internationalization (i18n)
- Extract all Spanish strings to translation files
- Add English language support
- Language switcher in the header
- URL-based locale routing (`/en/`, `/es/`)

### Analytics
- Track page views and companion profile visits
- View count display on companion cards
- Popular companions ranking
- Basic dashboard with charts for publication owners

---

## Technical Debt

### Testing
- Set up Jest + React Testing Library for client components
- Add integration tests for GraphQL resolvers
- Add E2E tests with Playwright for critical flows (register, publish, browse)

### Code Quality
- Add ESLint strict rules across the monorepo
- Set up Husky + lint-staged for pre-commit hooks
- Add CI pipeline (GitHub Actions) for lint, type-check, and tests

### Infrastructure
- Dockerize the application (client + server + database)
- Add production deployment config (Vercel for client, Railway/Fly for server)
- Set up environment-specific configs (dev, staging, prod)
- Add rate limiting to GraphQL API
- Add request logging and error monitoring (Sentry)

### Security
- Add CSRF token validation
- Rate limit login/register endpoints
- Add password reset flow (email-based)
- Implement refresh token rotation
- Add input sanitization for user-generated content (bio, tagline)
