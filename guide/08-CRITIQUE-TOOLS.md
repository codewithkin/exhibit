# Critique Tools Guide - Exhibit

## Database Schema

```prisma
model Critique {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())
  
  artworkId  String
  artwork    Artwork  @relation(fields: [artworkId], references: [id], onDelete: Cascade)
  
  reviewerId String
  reviewer   User     @relation(fields: [reviewerId], references: [id])
  
  // Structured feedback
  composition Int?     // 1-5 rating
  color      Int?
  technique  Int?
  
  // Text feedback
  strengths  String?  @db.Text
  improvements String? @db.Text
  general    String   @db.Text
  
  // Visual annotations
  annotations Annotation[]
  
  @@index([artworkId])
  @@map("critiques")
}

model Annotation {
  id         String   @id @default(cuid())
  critiqueId String
  critique   Critique @relation(fields: [critiqueId], references: [id], onDelete: Cascade)
  
  x          Float    // Percentage position
  y          Float
  note       String   @db.Text
  
  @@index([critiqueId])
  @@map("annotations")
}

// Update Artwork model
model Artwork {
  critiques Critique[]
}
```

---

## Backend API

```typescript
// apps/server/src/routes/critiques.ts
import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { z } from 'zod'
import { db } from '@repo/db'

const critiquesRouter = new Hono()

critiquesRouter.post(
  '/',
  requireAuth,
  async (c) => {
    const userId = c.get('userId')
    const { artworkId, general, annotations } = await c.req.json()
    
    const artwork = await db.artwork.findUnique({
      where: { id: artworkId },
    })
    
    if (!artwork?.critiqueEnabled) {
      return c.json({ error: 'Critiques not enabled' }, 400)
    }
    
    const critique = await db.critique.create({
      data: {
        artworkId,
        reviewerId: userId,
        general,
        annotations: {
          create: annotations,
        },
      },
      include: { annotations: true },
    })
    
    return c.json({ critique })
  }
)

export { critiquesRouter }
```

---

## Frontend

```typescript
// apps/web/src/components/annotation-tool.tsx
'use client'

export function AnnotationTool({ imageUrl }: { imageUrl: string }) {
  const [annotations, setAnnotations] = useState<Array<{ x: number, y: number, note: string }>>([])
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    const note = prompt('Add note:')
    if (note) {
      setAnnotations([...annotations, { x, y, note }])
    }
  }
  
  return (
    <div className="relative" onClick={handleClick}>
      <img src={imageUrl} className="w-full" />
      {annotations.map((ann, i) => (
        <div
          key={i}
          className="absolute w-6 h-6 bg-red-500 rounded-full"
          style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
          title={ann.note}
        />
      ))}
    </div>
  )
}
```

---

## Git Commits

```bash
git add packages/db/prisma/schema/
git commit -m "feat(db): add Critique and Annotation models"

git add apps/server/src/routes/critiques.ts
git commit -m "feat(server): implement critique submission endpoints"

git add apps/web/src/components/annotation-tool.tsx
git commit -m "feat(web): create visual annotation tool for critiques"
```
