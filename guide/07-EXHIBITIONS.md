# Exhibitions System Guide - Exhibit

## Database Schema

```prisma
model Exhibition {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  title       String
  slug        String   @unique
  description String   @db.Text
  
  startDate   DateTime
  endDate     DateTime?
  
  curatorId   String
  curator     User     @relation("CuratedExhibitions", fields: [curatorId], references: [id])
  
  artworks    Artwork[] @relation("ExhibitionArtworks")
  submissions ExhibitionSubmission[]
  
  isPublished Boolean  @default(false)
  maxSubmissions Int?
  acceptingSubmissions Boolean @default(false)
  
  @@index([curatorId])
  @@index([isPublished])
  @@map("exhibitions")
}

model ExhibitionSubmission {
  id           String     @id @default(cuid())
  createdAt    DateTime   @default(now())
  
  exhibitionId String
  exhibition   Exhibition @relation(fields: [exhibitionId], references: [id], onDelete: Cascade)
  
  artistId     String
  artist       User       @relation(fields: [artistId], references: [id], onDelete: Cascade)
  
  artworkIds   String[]   // Array of artwork IDs
  statement    String     @db.Text
  
  status       SubmissionStatus @default(PENDING)
  reviewedAt   DateTime?
  reviewNote   String?
  
  @@unique([exhibitionId, artistId])
  @@index([exhibitionId])
  @@index([artistId])
  @@map("exhibition_submissions")
}

enum SubmissionStatus {
  PENDING
  ACCEPTED
  REJECTED
}

// Update User model
model User {
  curatedExhibitions Exhibition[] @relation("CuratedExhibitions")
  submissions        ExhibitionSubmission[]
}
```

---

## Backend API

```typescript
// apps/server/src/routes/exhibitions.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth, optionalAuth } from '../middleware/auth'
import { db } from '@repo/db'

const exhibitionsRouter = new Hono()

// Create exhibition (curator/admin only)
exhibitionsRouter.post(
  '/',
  requireAuth,
  zValidator('json', z.object({
    title: z.string().min(1).max(200),
    description: z.string(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    maxSubmissions: z.number().positive().optional(),
  })),
  async (c) => {
    const userId = c.get('userId')
    const data = c.req.valid('json')
    
    // Check if user is curator (for MVP, use isVerified)
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user?.isVerified) {
      return c.json({ error: 'Only curators can create exhibitions' }, 403)
    }
    
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    
    const exhibition = await db.exhibition.create({
      data: {
        ...data,
        slug,
        curatorId: userId,
      },
    })
    
    return c.json({ exhibition })
  }
)

// Submit to exhibition
exhibitionsRouter.post(
  '/:id/submit',
  requireAuth,
  zValidator('json', z.object({
    artworkIds: z.array(z.string()).min(1).max(10),
    statement: z.string().min(50).max(1000),
  })),
  async (c) => {
    const userId = c.get('userId')
    const exhibitionId = c.req.param('id')
    const { artworkIds, statement } = c.req.valid('json')
    
    const exhibition = await db.exhibition.findUnique({
      where: { id: exhibitionId },
    })
    
    if (!exhibition?.acceptingSubmissions) {
      return c.json({ error: 'Exhibition not accepting submissions' }, 400)
    }
    
    const submission = await db.exhibitionSubmission.create({
      data: {
        exhibitionId,
        artistId: userId,
        artworkIds,
        statement,
      },
    })
    
    return c.json({ submission })
  }
)

export { exhibitionsRouter }
```

---

## Frontend

```typescript
// apps/web/src/app/exhibitions/[slug]/page.tsx
export default async function ExhibitionPage({ params }: { params: { slug: string } }) {
  const exhibition = await fetch(`/api/exhibitions/${params.slug}`).then(r => r.json())
  
  return (
    <div className="max-w-8xl mx-auto p-6">
      <h1 className="font-display text-5xl mb-4">{exhibition.title}</h1>
      <p className="text-lg text-muted-foreground mb-8">{exhibition.description}</p>
      
      <ArtworkGrid artworks={exhibition.artworks} columns={3} />
    </div>
  )
}
```

---

## Git Commits

```bash
git add packages/db/prisma/schema/
git commit -m "feat(db): add Exhibition and ExhibitionSubmission models"

git add apps/server/src/routes/exhibitions.ts
git commit -m "feat(server): implement exhibitions and submission system"

git add apps/web/src/app/exhibitions/
git commit -m "feat(web): create exhibition pages and submission flow"
```
