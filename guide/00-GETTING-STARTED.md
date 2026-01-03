# Exhibit - Development Roadmap & Getting Started

## Overview
This document provides a strategic roadmap for building Exhibit MVP, with prioritized phases, implementation order, and success milestones.

---

## Quick Start

### Prerequisites
```bash
# Required
- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- Git

# Optional (for production)
- AWS S3 or Cloudflare R2
- Stripe account
- Domain name
```

### Initial Setup
```bash
# Clone and install
git clone <your-repo-url> exhibit
cd exhibit
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env
cp apps/server/.env.example apps/server/.env
cp apps/native/.env.example apps/native/.env

# Configure database
# Edit .env files with your PostgreSQL connection string

# Generate Prisma client and run migrations
cd packages/db
pnpm db:push
pnpm db:generate

# Start development servers
cd ../..
pnpm dev
```

---

## MVP Development Phases

### Phase 1: Foundation (Weeks 1-2)
**Goal**: Set up project structure, authentication, and basic UI

#### Tasks
1. **Project Setup**
   - [ ] Initialize monorepo structure
   - [ ] Configure Turborepo
   - [ ] Set up shared packages (db, auth, env, ui)
   - [ ] Configure TypeScript and ESLint
   - [ ] Set up Git repository

2. **Design System Implementation**
   - [ ] Install Tailwind CSS + shadcn/ui (web)
   - [ ] Install NativeWind (native)
   - [ ] Implement design tokens (colors, typography, spacing)
   - [ ] Create base components (Button, Card, Input, etc.)
   - [ ] Set up dark mode

3. **Authentication System**
   - [ ] Set up Better Auth
   - [ ] Create auth database schema
   - [ ] Implement signup/signin (backend)
   - [ ] Build signup/signin forms (frontend)
   - [ ] Add session management
   - [ ] Create protected routes

**Git Commits**:
```bash
git commit -m "chore: initialize monorepo with Turborepo"
git commit -m "feat(ui): implement design system with Tailwind and shadcn"
git commit -m "feat(auth): add Better Auth with email/password"
git commit -m "feat(web): create signup and signin pages"
git commit -m "feat(server): implement auth endpoints"
```

**Success Criteria**:
- Users can sign up and sign in
- Sessions persist across page reloads
- Dark mode toggles work
- Responsive on mobile, tablet, desktop

---

### Phase 2: Core Content (Weeks 3-4)
**Goal**: Enable artists to post artwork and build portfolios

#### Tasks
1. **Image Upload System**
   - [ ] Set up S3/R2 storage
   - [ ] Implement presigned URL generation
   - [ ] Add image processing (sharp, blurhash)
   - [ ] Create upload API endpoints
   - [ ] Build upload UI component
   - [ ] Add image validation

2. **Artwork Posting**
   - [ ] Create Artwork database model
   - [ ] Implement artwork CRUD endpoints
   - [ ] Build multi-step post form
   - [ ] Add metadata fields (title, medium, dimensions, etc.)
   - [ ] Implement licensing options
   - [ ] Add for-sale toggle and pricing

3. **Portfolio System**
   - [ ] Update User model with portfolio fields
   - [ ] Create artist profile page
   - [ ] Add featured works management
   - [ ] Build portfolio grid layout
   - [ ] Implement artwork reordering

**Git Commits**:
```bash
git commit -m "feat(server): add S3 storage and image processing"
git commit -m "feat(server): implement artwork CRUD endpoints"
git commit -m "feat(web): create artwork upload flow"
git commit -m "feat(web): build artist profile page"
git commit -m "feat(db): add portfolio and featured works schema"
```

**Success Criteria**:
- Artists can upload high-quality images
- Artworks display correctly with metadata
- Artist profiles show featured works
- Images are optimized and fast-loading

---

### Phase 3: Discovery (Week 5)
**Goal**: Enable users to discover and follow artists

#### Tasks
1. **Feed System**
   - [ ] Create Follow model
   - [ ] Implement feed endpoints (following, global, curated)
   - [ ] Build discover page with tabs
   - [ ] Add infinite scroll
   - [ ] Implement chronological sorting

2. **Search & Filtering**
   - [ ] Create search endpoints
   - [ ] Add tag system
   - [ ] Build search UI
   - [ ] Implement filters (medium, for-sale, etc.)
   - [ ] Add trending tags

3. **Social Features**
   - [ ] Add follow/unfollow functionality
   - [ ] Create favorites system
   - [ ] Show follower counts
   - [ ] Add "Save to favorites" button

**Git Commits**:
```bash
git commit -m "feat(db): add Follow and Favorite models"
git commit -m "feat(server): implement feed endpoints"
git commit -m "feat(server): add search and filtering"
git commit -m "feat(web): create discover page with feeds"
git commit -m "feat(web): implement follow system"
```

**Success Criteria**:
- Feeds load quickly (< 2s)
- Search returns relevant results
- Following/unfollowing works instantly
- Infinite scroll is smooth

---

### Phase 4: Exhibitions (Week 6)
**Goal**: Allow curators to create exhibitions and artists to submit

#### Tasks
1. **Exhibition System**
   - [ ] Create Exhibition model
   - [ ] Add ExhibitionSubmission model
   - [ ] Implement exhibition CRUD endpoints
   - [ ] Build exhibition page
   - [ ] Add submission flow

2. **Curation Tools**
   - [ ] Create curator dashboard
   - [ ] Add submission review interface
   - [ ] Implement accept/reject flow
   - [ ] Send submission notifications

**Git Commits**:
```bash
git commit -m "feat(db): add Exhibition and ExhibitionSubmission models"
git commit -m "feat(server): implement exhibition endpoints"
git commit -m "feat(web): create exhibition pages"
git commit -m "feat(web): build submission flow for artists"
```

**Success Criteria**:
- Curators can create exhibitions
- Artists can submit to open exhibitions
- Submissions can be reviewed and accepted/rejected
- Exhibition pages display accepted works beautifully

---

### Phase 5: Critique Tools (Week 7)
**Goal**: Enable structured feedback and visual annotations

#### Tasks
1. **Critique System**
   - [ ] Create Critique and Annotation models
   - [ ] Implement critique endpoints
   - [ ] Build annotation tool
   - [ ] Add structured feedback forms
   - [ ] Implement safe-space mode

2. **Critique UI**
   - [ ] Create critique request toggle
   - [ ] Build annotation overlay
   - [ ] Add feedback templates
   - [ ] Show critiques on artwork page

**Git Commits**:
```bash
git commit -m "feat(db): add Critique and Annotation models"
git commit -m "feat(server): implement critique submission endpoints"
git commit -m "feat(web): create visual annotation tool"
git commit -m "feat(web): add structured feedback forms"
```

**Success Criteria**:
- Users can place annotations on images
- Structured feedback is easy to submit
- Critiques display clearly on artwork pages
- Safe-space mode restricts visibility

---

### Phase 6: Commerce (Week 8)
**Goal**: Enable commissions and artwork purchases

#### Tasks
1. **Commission System**
   - [ ] Create CommissionRequest model
   - [ ] Implement commission endpoints
   - [ ] Build commission request form
   - [ ] Add commission management dashboard
   - [ ] Send commission notifications

2. **Marketplace**
   - [ ] Create Purchase model
   - [ ] Integrate Stripe
   - [ ] Build purchase flow
   - [ ] Add payment processing
   - [ ] Calculate platform fees

**Git Commits**:
```bash
git commit -m "feat(db): add CommissionRequest model"
git commit -m "feat(server): implement commission system"
git commit -m "feat(web): create commission request form"
git commit -m "feat(db): add Purchase model"
git commit -m "feat(server): integrate Stripe for payments"
git commit -m "feat(web): build purchase flow"
```

**Success Criteria**:
- Artists receive commission requests
- Buyers can purchase listed artworks
- Payments process successfully
- Platform fees are calculated correctly

---

### Phase 7: Communication (Week 9)
**Goal**: Add messaging and notifications

#### Tasks
1. **Messaging System**
   - [ ] Create Conversation and Message models
   - [ ] Implement messaging endpoints
   - [ ] Build messaging UI
   - [ ] Add real-time updates (optional: WebSockets)

2. **Notifications**
   - [ ] Create Notification model
   - [ ] Implement notification endpoints
   - [ ] Build notification dropdown
   - [ ] Send notifications for key events
   - [ ] Add email notifications (optional)

**Git Commits**:
```bash
git commit -m "feat(db): add Conversation and Message models"
git commit -m "feat(server): implement messaging endpoints"
git commit -m "feat(web): create messaging interface"
git commit -m "feat(db): add Notification model"
git commit -m "feat(server): implement notification system"
git commit -m "feat(web): add notification dropdown"
```

**Success Criteria**:
- Users can send and receive messages
- Notifications appear for important events
- Unread counts update correctly
- Messages load quickly

---

### Phase 8: Moderation & Polish (Week 10)
**Goal**: Add safety features and polish the experience

#### Tasks
1. **Moderation System**
   - [ ] Create Report and Block models
   - [ ] Implement reporting endpoints
   - [ ] Build report dialog
   - [ ] Create admin moderation dashboard
   - [ ] Add content filtering

2. **Polish & Optimization**
   - [ ] Add loading states everywhere
   - [ ] Implement error boundaries
   - [ ] Optimize image loading
   - [ ] Add analytics tracking
   - [ ] Improve mobile experience
   - [ ] Accessibility audit
   - [ ] Performance testing

**Git Commits**:
```bash
git commit -m "feat(db): add Report and Block models"
git commit -m "feat(server): implement moderation system"
git commit -m "feat(web): create report dialog"
git commit -m "feat(web): add admin moderation dashboard"
git commit -m "perf: optimize image loading and caching"
git commit -m "a11y: improve keyboard navigation and screen reader support"
```

**Success Criteria**:
- Users can report inappropriate content
- Moderators can review and resolve reports
- Site loads quickly (Lighthouse score > 90)
- Accessible to keyboard and screen reader users

---

## Post-MVP Enhancements

### Phase 9: Native App (Weeks 11-12)
- Port core features to React Native
- Implement native image picker
- Add offline support
- Publish to App Store and Play Store

### Phase 10: Advanced Features
- Artist verification workflow
- Advanced analytics dashboard
- Email campaigns
- Social sharing previews
- Print-on-demand integration
- AI-powered recommendations (optional)

---

## Development Best Practices

### Code Organization
```
apps/
  web/          # Next.js app
  server/       # Hono backend
  native/       # Expo app

packages/
  auth/         # Authentication logic
  db/           # Prisma schema and client
  env/          # Environment variables
  ui/           # Shared components (future)
```

### Git Workflow
```bash
# Feature branches
git checkout -b feat/artwork-upload
# Make changes
git add .
git commit -m "feat(web): implement artwork upload flow"
git push origin feat/artwork-upload
# Create PR, review, merge to main
```

### Commit Message Format
```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- perf: Performance improvement
- test: Tests
- chore: Maintenance

Examples:
feat(web): add artwork grid component
fix(server): resolve upload timeout issue
docs(guide): update authentication guide
```

### Testing Strategy
1. **Manual testing**: Test each feature thoroughly
2. **E2E tests** (optional): Playwright for critical flows
3. **Unit tests** (optional): Vitest for utilities
4. **Visual testing**: Check responsive designs

---

## Deployment

### Production Setup
```bash
# Database
- PostgreSQL on Railway, Supabase, or AWS RDS
- Run migrations: pnpm db:push

# Server
- Deploy to Railway, Fly.io, or AWS
- Set environment variables
- Configure CORS

# Web App
- Deploy to Vercel or Netlify
- Set environment variables
- Configure custom domain

# Storage
- AWS S3 or Cloudflare R2
- Configure bucket policies
- Set up CDN
```

### Environment Variables
```env
# Database
DATABASE_URL=

# Auth
AUTH_SECRET=

# Storage
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
CDN_URL=

# Payments
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=

# API
NEXT_PUBLIC_API_URL=
```

---

## Success Metrics

### MVP Launch Goals (Month 1)
- 100+ artist signups
- 500+ artworks posted
- 3 curated exhibitions
- 10+ commission requests
- 50+ active daily users

### Growth Metrics (Month 3)
- 500+ artists
- 5,000+ artworks
- 10 exhibitions
- 100+ purchases/commissions
- 500+ daily active users

---

## Resource Requirements

### Team (Minimum)
- 1 Full-stack developer (or you!)
- 1 Designer (part-time)
- 1 Community manager (part-time)
- 1 Curator (part-time)

### Budget (Estimated Monthly)
- Hosting: $50-100
- Database: $25-50
- Storage: $20-50
- Domain: $10
- Stripe fees: 2.9% + $0.30 per transaction
- **Total**: ~$150-250/month

---

## Support & Resources

### Documentation
1. [Branding & Design System](./01-BRANDING-AND-DESIGN-SYSTEM.md)
2. [UI Implementation](./02-UI-IMPLEMENTATION.md)
3. [Authentication](./03-AUTHENTICATION.md)
4. [Posting & Upload](./04-POSTING-AND-UPLOAD.md)
5. [Portfolio Management](./05-PORTFOLIO-MANAGEMENT.md)
6. [Feed & Discovery](./06-FEED-AND-DISCOVERY.md)
7. [Exhibitions](./07-EXHIBITIONS.md)
8. [Critique Tools](./08-CRITIQUE-TOOLS.md)
9. [Marketplace & Commissions](./09-MARKETPLACE-COMMISSIONS.md)
10. [Messaging & Notifications](./10-MESSAGING-NOTIFICATIONS.md)
11. [Moderation & Safety](./11-MODERATION-SAFETY.md)

### Tech Stack References
- [Next.js Docs](https://nextjs.org/docs)
- [Expo Docs](https://docs.expo.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [Better Auth](https://better-auth.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

---

## Next Steps

1. **Review guides**: Read through all 11 implementation guides
2. **Set up project**: Follow Phase 1 setup instructions
3. **Start building**: Implement features in order
4. **Test continuously**: Validate each feature before moving on
5. **Ship early**: Launch with core features, iterate based on feedback

---

**Good luck building Exhibit! 🎨**

Remember: 
- Start simple, iterate quickly
- Ship early and often
- Listen to your users
- Focus on the art, not the algorithm
- Build a community, not just a platform
