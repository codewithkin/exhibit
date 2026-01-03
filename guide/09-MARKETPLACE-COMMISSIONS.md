# Marketplace & Commissions Guide - Exhibit

## Database Schema

```prisma
model CommissionRequest {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  artistId    String
  artist      User     @relation("ReceivedCommissions", fields: [artistId], references: [id])
  
  clientId    String
  client      User     @relation("SentCommissions", fields: [clientId], references: [id])
  
  title       String
  description String   @db.Text
  budget      Decimal  @db.Decimal(10, 2)
  timeline    String
  
  status      CommissionStatus @default(PENDING)
  
  @@index([artistId])
  @@index([clientId])
  @@map("commission_requests")
}

enum CommissionStatus {
  PENDING
  ACCEPTED
  DECLINED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model Purchase {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())
  
  artworkId  String
  artwork    Artwork  @relation(fields: [artworkId], references: [id])
  
  buyerId    String
  buyer      User     @relation("Purchases", fields: [buyerId], references: [id])
  
  amount     Decimal  @db.Decimal(10, 2)
  platformFee Decimal @db.Decimal(10, 2)
  
  status     PurchaseStatus @default(PENDING)
  
  stripePaymentId String?
  
  @@index([artworkId])
  @@index([buyerId])
  @@map("purchases")
}

enum PurchaseStatus {
  PENDING
  COMPLETED
  CANCELLED
  REFUNDED
}

// Update User model
model User {
  receivedCommissions CommissionRequest[] @relation("ReceivedCommissions")
  sentCommissions     CommissionRequest[] @relation("SentCommissions")
  purchases           Purchase[]          @relation("Purchases")
}

// Update Artwork model
model Artwork {
  purchases Purchase[]
}
```

---

## Backend API

```typescript
// apps/server/src/routes/commissions.ts
import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { z } from 'zod'
import { db } from '@repo/db'

const commissionsRouter = new Hono()

// Request commission
commissionsRouter.post(
  '/',
  requireAuth,
  async (c) => {
    const clientId = c.get('userId')
    const { artistId, title, description, budget, timeline } = await c.req.json()
    
    const request = await db.commissionRequest.create({
      data: {
        artistId,
        clientId,
        title,
        description,
        budget,
        timeline,
      },
    })
    
    return c.json({ request })
  }
)

// Accept/decline commission
commissionsRouter.patch(
  '/:id',
  requireAuth,
  async (c) => {
    const userId = c.get('userId')
    const requestId = c.req.param('id')
    const { status } = await c.req.json()
    
    const request = await db.commissionRequest.findUnique({
      where: { id: requestId },
    })
    
    if (request?.artistId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    const updated = await db.commissionRequest.update({
      where: { id: requestId },
      data: { status },
    })
    
    return c.json({ request: updated })
  }
)

export { commissionsRouter }
```

```typescript
// apps/server/src/routes/purchases.ts
import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { db } from '@repo/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const purchasesRouter = new Hono()

// Initiate purchase
purchasesRouter.post(
  '/',
  requireAuth,
  async (c) => {
    const buyerId = c.get('userId')
    const { artworkId } = await c.req.json()
    
    const artwork = await db.artwork.findUnique({
      where: { id: artworkId },
      include: { artist: true },
    })
    
    if (!artwork?.forSale || !artwork.price) {
      return c.json({ error: 'Artwork not for sale' }, 400)
    }
    
    const platformFee = artwork.price * 0.1 // 10% platform fee
    
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(artwork.price) * 100), // cents
      currency: 'usd',
      metadata: { artworkId, buyerId },
    })
    
    const purchase = await db.purchase.create({
      data: {
        artworkId,
        buyerId,
        amount: artwork.price,
        platformFee,
        stripePaymentId: paymentIntent.id,
      },
    })
    
    return c.json({
      purchase,
      clientSecret: paymentIntent.client_secret,
    })
  }
)

export { purchasesRouter }
```

---

## Frontend

```typescript
// apps/web/src/components/commission-form.tsx
'use client'

export function CommissionForm({ artistId }: { artistId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    await fetch('/api/commissions', {
      method: 'POST',
      body: JSON.stringify({
        artistId,
        title: formData.get('title'),
        description: formData.get('description'),
        budget: Number(formData.get('budget')),
        timeline: formData.get('timeline'),
      }),
    })
    
    setIsSubmitting(false)
    toast.success('Commission request sent!')
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="title" placeholder="Project title" required />
      <Textarea name="description" placeholder="Describe your vision..." required />
      <Input name="budget" type="number" placeholder="Budget (USD)" required />
      <Input name="timeline" placeholder="Timeline (e.g., 2-3 weeks)" required />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Request'}
      </Button>
    </form>
  )
}
```

---

## Git Commits

```bash
git add packages/db/prisma/schema/
git commit -m "feat(db): add CommissionRequest and Purchase models"

git add apps/server/src/routes/commissions.ts
git commit -m "feat(server): implement commission request system"

git add apps/server/src/routes/purchases.ts
git commit -m "feat(server): add Stripe integration for purchases"

git add apps/web/src/components/commission-form.tsx
git commit -m "feat(web): create commission request form"
```
