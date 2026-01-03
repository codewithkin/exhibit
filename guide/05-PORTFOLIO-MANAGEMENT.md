# Portfolio Management Guide - Exhibit

## Overview
This guide covers the artist portfolio system, including profile customization, featured works, custom collections, and the public-facing artist page that serves as a professional showcase.

---

## Database Schema

```prisma
// packages/db/prisma/schema/schema.prisma

model User {
  // ... existing auth fields
  
  // Portfolio fields
  displayName   String?      // Professional name (defaults to name)
  bio           String?      @db.Text
  location      String?
  website       String?
  instagram     String?
  twitter       String?
  
  // Featured works (pinned to top of portfolio)
  featuredWorks Artwork[]    @relation("FeaturedArtworks")
  
  // Custom collections
  collections   Collection[]
  
  @@map("users")
}

model Collection {
  id          String    @id @default(cuid())
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  title       String
  description String?   @db.Text
  slug        String    // URL-friendly version
  
  // Visibility
  isPublic    Boolean   @default(true)
  
  // Relationships
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  artworks    Artwork[] @relation("CollectionArtworks")
  
  @@unique([userId, slug])
  @@index([userId])
  @@map("collections")
}

// Update Artwork model
model Artwork {
  // ... existing fields
  
  // Portfolio relationships
  featuredBy     User[]       @relation("FeaturedArtworks")
  collections    Collection[] @relation("CollectionArtworks")
  
  // Portfolio display order
  portfolioOrder Int?
  
  @@map("artworks")
}
```

---

## Backend Implementation

### 1. Profile Management

#### `apps/server/src/routes/profile.ts`
```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth, optionalAuth } from '../middleware/auth'
import { db } from '@repo/db'

const profileRouter = new Hono()

// Get user profile (public)
profileRouter.get('/:username', optionalAuth, async (c) => {
  const username = c.req.param('username')
  
  const user = await db.user.findFirst({
    where: {
      OR: [
        { name: username },
        { displayName: username },
      ],
    },
    select: {
      id: true,
      name: true,
      displayName: true,
      image: true,
      bio: true,
      location: true,
      website: true,
      instagram: true,
      twitter: true,
      isArtist: true,
      isVerified: true,
      createdAt: true,
      
      // Featured works
      featuredWorks: {
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          tags: true,
        },
      },
      
      // Collections
      collections: {
        where: { isPublic: true },
        include: {
          artworks: {
            take: 4,
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      
      // Recent artworks
      artworks: {
        where: { visibility: 'PUBLIC' },
        take: 20,
        orderBy: [
          { portfolioOrder: 'asc' },
          { createdAt: 'desc' },
        ],
        include: {
          tags: true,
        },
      },
      
      // Stats
      _count: {
        select: {
          artworks: {
            where: { visibility: 'PUBLIC' },
          },
        },
      },
    },
  })
  
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }
  
  return c.json({ user })
})

// Update profile
const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  instagram: z.string().max(30).optional(),
  twitter: z.string().max(15).optional(),
})

profileRouter.patch(
  '/me',
  requireAuth,
  zValidator('json', updateProfileSchema),
  async (c) => {
    const userId = c.get('userId')
    const data = c.req.valid('json')
    
    const user = await db.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        displayName: true,
        bio: true,
        location: true,
        website: true,
        instagram: true,
        twitter: true,
      },
    })
    
    return c.json({ user })
  }
)

// Update featured works
const updateFeaturedSchema = z.object({
  artworkIds: z.array(z.string()).max(6),
})

profileRouter.patch(
  '/me/featured',
  requireAuth,
  zValidator('json', updateFeaturedSchema),
  async (c) => {
    const userId = c.get('userId')
    const { artworkIds } = c.req.valid('json')
    
    // Verify all artworks belong to the user
    const artworks = await db.artwork.findMany({
      where: {
        id: { in: artworkIds },
        artistId: userId,
      },
    })
    
    if (artworks.length !== artworkIds.length) {
      return c.json({ error: 'Invalid artwork IDs' }, 400)
    }
    
    // Update featured works
    await db.user.update({
      where: { id: userId },
      data: {
        featuredWorks: {
          set: artworkIds.map((id) => ({ id })),
        },
      },
    })
    
    return c.json({ success: true })
  }
)

// Update artwork order
const updateOrderSchema = z.object({
  artworkOrders: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
    })
  ),
})

profileRouter.patch(
  '/me/artwork-order',
  requireAuth,
  zValidator('json', updateOrderSchema),
  async (c) => {
    const userId = c.get('userId')
    const { artworkOrders } = c.req.valid('json')
    
    // Update all orders in a transaction
    await db.$transaction(
      artworkOrders.map(({ id, order }) =>
        db.artwork.updateMany({
          where: {
            id,
            artistId: userId, // Ensure ownership
          },
          data: {
            portfolioOrder: order,
          },
        })
      )
    )
    
    return c.json({ success: true })
  }
)

export { profileRouter }
```

### 2. Collections Management

#### `apps/server/src/routes/collections.ts`
```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth'
import { db } from '@repo/db'

const collectionsRouter = new Hono()

// Create collection
const createCollectionSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
  artworkIds: z.array(z.string()).default([]),
})

collectionsRouter.post(
  '/',
  requireAuth,
  zValidator('json', createCollectionSchema),
  async (c) => {
    const userId = c.get('userId')
    const { title, description, isPublic, artworkIds } = c.req.valid('json')
    
    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    // Check for duplicate slug
    const existing = await db.collection.findUnique({
      where: {
        userId_slug: {
          userId,
          slug,
        },
      },
    })
    
    if (existing) {
      return c.json({ error: 'A collection with this name already exists' }, 400)
    }
    
    // Verify artworks belong to user
    if (artworkIds.length > 0) {
      const artworks = await db.artwork.findMany({
        where: {
          id: { in: artworkIds },
          artistId: userId,
        },
      })
      
      if (artworks.length !== artworkIds.length) {
        return c.json({ error: 'Invalid artwork IDs' }, 400)
      }
    }
    
    // Create collection
    const collection = await db.collection.create({
      data: {
        title,
        slug,
        description,
        isPublic,
        userId,
        artworks: {
          connect: artworkIds.map((id) => ({ id })),
        },
      },
      include: {
        artworks: {
          include: {
            tags: true,
          },
        },
      },
    })
    
    return c.json({ collection })
  }
)

// Get collection
collectionsRouter.get('/:id', async (c) => {
  const collectionId = c.req.param('id')
  
  const collection = await db.collection.findUnique({
    where: { id: collectionId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          displayName: true,
          image: true,
          isVerified: true,
        },
      },
      artworks: {
        orderBy: { createdAt: 'desc' },
        include: {
          tags: true,
        },
      },
    },
  })
  
  if (!collection) {
    return c.json({ error: 'Collection not found' }, 404)
  }
  
  // Check visibility
  if (!collection.isPublic) {
    const userId = c.get('userId')
    if (!userId || collection.userId !== userId) {
      return c.json({ error: 'Not authorized' }, 403)
    }
  }
  
  return c.json({ collection })
})

// Update collection
collectionsRouter.patch(
  '/:id',
  requireAuth,
  zValidator('json', createCollectionSchema.partial()),
  async (c) => {
    const userId = c.get('userId')
    const collectionId = c.req.param('id')
    const data = c.req.valid('json')
    
    // Check ownership
    const existing = await db.collection.findUnique({
      where: { id: collectionId },
    })
    
    if (!existing) {
      return c.json({ error: 'Collection not found' }, 404)
    }
    
    if (existing.userId !== userId) {
      return c.json({ error: 'Not authorized' }, 403)
    }
    
    // Update collection
    const collection = await db.collection.update({
      where: { id: collectionId },
      data: {
        title: data.title,
        description: data.description,
        isPublic: data.isPublic,
        artworks: data.artworkIds
          ? {
              set: [],
              connect: data.artworkIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        artworks: true,
      },
    })
    
    return c.json({ collection })
  }
)

// Delete collection
collectionsRouter.delete('/:id', requireAuth, async (c) => {
  const userId = c.get('userId')
  const collectionId = c.req.param('id')
  
  const collection = await db.collection.findUnique({
    where: { id: collectionId },
  })
  
  if (!collection) {
    return c.json({ error: 'Collection not found' }, 404)
  }
  
  if (collection.userId !== userId) {
    return c.json({ error: 'Not authorized' }, 403)
  }
  
  await db.collection.delete({
    where: { id: collectionId },
  })
  
  return c.json({ success: true })
})

export { collectionsRouter }
```

---

## Frontend Implementation

### 1. Artist Profile Page

#### `apps/web/src/app/artist/[username]/page.tsx`
```typescript
import { notFound } from 'next/navigation'
import { ArtworkGrid } from '@/components/artwork-grid'
import { CollectionList } from '@/components/collection-list'
import { FeaturedWorks } from '@/components/featured-works'
import { ProfileHeader } from '@/components/profile-header'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

async function getArtistProfile(username: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/profile/${username}`,
    { cache: 'no-store' }
  )
  
  if (!response.ok) {
    return null
  }
  
  return response.json()
}

export default async function ArtistProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const data = await getArtistProfile(params.username)
  
  if (!data?.user) {
    notFound()
  }
  
  const { user } = data
  
  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <ProfileHeader user={user} />
      
      {/* Featured Works */}
      {user.featuredWorks.length > 0 && (
        <section className="max-w-8xl mx-auto px-6 py-16">
          <h2 className="font-display text-2xl mb-8">Featured Works</h2>
          <FeaturedWorks artworks={user.featuredWorks} />
        </section>
      )}
      
      {/* Collections */}
      {user.collections.length > 0 && (
        <section className="max-w-8xl mx-auto px-6 py-16 border-t">
          <h2 className="font-display text-2xl mb-8">Collections</h2>
          <CollectionList collections={user.collections} />
        </section>
      )}
      
      {/* All Works */}
      <section className="max-w-8xl mx-auto px-6 py-16 border-t">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl">
            All Works ({user._count.artworks})
          </h2>
        </div>
        <ArtworkGrid artworks={user.artworks} columns={3} />
      </section>
    </div>
  )
}
```

### 2. Profile Header Component

#### `apps/web/src/components/profile-header.tsx`
```typescript
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Globe, Instagram, Twitter, BadgeCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProfileHeaderProps {
  user: {
    name: string
    displayName?: string
    image?: string
    bio?: string
    location?: string
    website?: string
    instagram?: string
    twitter?: string
    isVerified: boolean
    _count: {
      artworks: number
    }
  }
  isOwner?: boolean
}

export function ProfileHeader({ user, isOwner }: ProfileHeaderProps) {
  return (
    <div className="border-b bg-muted/30">
      <div className="max-w-8xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted border-2">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.displayName || user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-4xl font-display">
                {(user.displayName || user.name).charAt(0)}
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="font-display text-4xl">
                {user.displayName || user.name}
              </h1>
              {user.isVerified && (
                <BadgeCheck className="h-6 w-6 text-primary" />
              )}
            </div>
            
            {user.bio && (
              <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
                {user.bio}
              </p>
            )}
            
            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {user.location}
                </div>
              )}
              
              <div>{user._count.artworks} works</div>
            </div>
            
            {/* Links */}
            <div className="flex flex-wrap gap-2">
              {user.website && (
                <Button variant="secondary" size="sm" asChild>
                  <a href={user.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              
              {user.instagram && (
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={`https://instagram.com/${user.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="h-4 w-4 mr-2" />
                    @{user.instagram}
                  </a>
                </Button>
              )}
              
              {user.twitter && (
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={`https://twitter.com/${user.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    @{user.twitter}
                  </a>
                </Button>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            {isOwner ? (
              <Button asChild>
                <Link href="/settings/profile">Edit Profile</Link>
              </Button>
            ) : (
              <>
                <Button>Follow</Button>
                <Button variant="secondary">Message</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 3. Edit Profile Form

#### `apps/web/src/app/settings/profile/page.tsx`
```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

const profileSchema = z.object({
  displayName: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  instagram: z.string().max(30).optional(),
  twitter: z.string().max(15).optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function EditProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })
  
  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/profile/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
      
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="font-display text-3xl mb-8">Edit Profile</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            {...register('displayName')}
            placeholder="Your professional name"
          />
          {errors.displayName && (
            <p className="text-sm text-destructive">{errors.displayName.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            {...register('bio')}
            placeholder="Tell us about yourself..."
            rows={4}
          />
          {errors.bio && (
            <p className="text-sm text-destructive">{errors.bio.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register('location')}
            placeholder="City, Country"
          />
        </div>
        
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            {...register('website')}
            placeholder="https://yourwebsite.com"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-input bg-muted rounded-l-sm text-sm">
                @
              </span>
              <Input
                id="instagram"
                {...register('instagram')}
                placeholder="username"
                className="rounded-l-none"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="twitter">Twitter</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-input bg-muted rounded-l-sm text-sm">
                @
              </span>
              <Input
                id="twitter"
                {...register('twitter')}
                placeholder="username"
                className="rounded-l-none"
              />
            </div>
          </div>
        </div>
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  )
}
```

### 4. Featured Works Manager

#### `apps/web/src/components/featured-works-manager.tsx`
```typescript
'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import Image from 'next/image'
import { GripVertical, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Artwork {
  id: string
  title: string
  thumbnailUrl: string
}

interface FeaturedWorksManagerProps {
  artworks: Artwork[]
  featured: Artwork[]
  onUpdate: (artworkIds: string[]) => void
}

export function FeaturedWorksManager({
  artworks,
  featured: initialFeatured,
  onUpdate,
}: FeaturedWorksManagerProps) {
  const [featured, setFeatured] = useState(initialFeatured)
  const [isLoading, setIsLoading] = useState(false)
  
  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    
    const items = Array.from(featured)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    setFeatured(items)
  }
  
  const handleAdd = (artwork: Artwork) => {
    if (featured.length >= 6) {
      toast.error('You can only feature up to 6 works')
      return
    }
    setFeatured([...featured, artwork])
  }
  
  const handleRemove = (id: string) => {
    setFeatured(featured.filter((a) => a.id !== id))
  }
  
  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onUpdate(featured.map((a) => a.id))
      toast.success('Featured works updated')
    } catch (error) {
      toast.error('Failed to update featured works')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-xl mb-4">Featured Works</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select up to 6 works to feature at the top of your portfolio
        </p>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="featured" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-3 md:grid-cols-6 gap-4"
              >
                {featured.map((artwork, index) => (
                  <Draggable key={artwork.id} draggableId={artwork.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="relative aspect-square bg-muted rounded-sm overflow-hidden group"
                      >
                        <Image
                          src={artwork.thumbnailUrl}
                          alt={artwork.title}
                          fill
                          className="object-cover"
                        />
                        <div
                          {...provided.dragHandleProps}
                          className="absolute top-2 left-2 p-1 bg-background/80 rounded-sm cursor-grab"
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <button
                          onClick={() => handleRemove(artwork.id)}
                          className="absolute top-2 right-2 p-1 bg-background/80 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      
      <div>
        <h4 className="font-medium mb-4">Your Works</h4>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {artworks
            .filter((a) => !featured.find((f) => f.id === a.id))
            .map((artwork) => (
              <button
                key={artwork.id}
                onClick={() => handleAdd(artwork)}
                className="relative aspect-square bg-muted rounded-sm overflow-hidden hover:ring-2 hover:ring-primary transition-all"
              >
                <Image
                  src={artwork.thumbnailUrl}
                  alt={artwork.title}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
        </div>
      </div>
      
      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Featured Works'}
      </Button>
    </div>
  )
}
```

---

## Implementation Checklist

### Phase 1: Backend
- [ ] Update User schema with portfolio fields
- [ ] Create Collection model
- [ ] Implement profile endpoints
- [ ] Create collection CRUD endpoints
- [ ] Add featured works management
- [ ] Add artwork reordering

### Phase 2: Frontend Pages
- [ ] Create artist profile page
- [ ] Build profile header component
- [ ] Implement edit profile form
- [ ] Create collections display
- [ ] Add featured works section

### Phase 3: Management Tools
- [ ] Build featured works manager
- [ ] Create collection editor
- [ ] Add drag-and-drop reordering
- [ ] Implement artwork selection UI

### Phase 4: Polish
- [ ] Add loading states
- [ ] Implement optimistic updates
- [ ] Add profile customization options
- [ ] Test responsive layouts

---

## Git Commit Strategy

```bash
# 1. Database schema
git add packages/db/prisma/schema/
git commit -m "feat(db): add portfolio and collections schema"

# 2. Profile API
git add apps/server/src/routes/profile.ts
git commit -m "feat(server): implement profile management endpoints"

# 3. Collections API
git add apps/server/src/routes/collections.ts
git commit -m "feat(server): add collections CRUD endpoints"

# 4. Profile page
git add apps/web/src/app/artist/
git commit -m "feat(web): create artist profile page"

# 5. Profile components
git add apps/web/src/components/profile-header.tsx apps/web/src/components/featured-works.tsx
git commit -m "feat(web): add profile header and featured works components"

# 6. Edit profile
git add apps/web/src/app/settings/profile/
git commit -m "feat(web): implement profile editing interface"
```

---

## Next Steps

1. **Profile analytics**: Track profile views and engagement
2. **Social features**: Following/followers system
3. **Custom themes**: Allow profile customization
4. **Export portfolio**: PDF or website export
5. **Portfolio insights**: Analytics for artists

---

**UX Considerations**:
- Make editing intuitive with inline controls
- Show preview before saving changes
- Allow rearranging works with drag-and-drop
- Provide clear limits (6 featured works)
- Auto-save drafts
