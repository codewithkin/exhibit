# Feed & Discovery Guide - Exhibit

## Overview
Exhibit's discovery system prioritizes chronological feeds (algorithm-free) with curated sections, artist following, and powerful search/filtering capabilities.

---

## Database Schema

```prisma
// Follows relationship
model Follow {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  
  followerId  String
  followingId String
  
  follower    User     @relation("Follower", fields: [followerId], references: [id], onDelete: Cascade)
  following   User     @relation("Following", fields: [followingId], references: [id], onDelete: Cascade)
  
  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
  @@map("follows")
}

// Add to User model
model User {
  // ...
  followers  Follow[] @relation("Following")
  following  Follow[] @relation("Follower")
}

// Saved/Favorited artworks
model Favorite {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  
  userId    String
  artworkId String
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  artwork   Artwork  @relation(fields: [artworkId], references: [id], onDelete: Cascade)
  
  @@unique([userId, artworkId])
  @@index([userId])
  @@map("favorites")
}
```

---

## Backend API

### Feed Endpoints

#### `apps/server/src/routes/feed.ts`
```typescript
import { Hono } from 'hono'
import { optionalAuth, requireAuth } from '../middleware/auth'
import { db } from '@repo/db'

const feedRouter = new Hono()

// Chronological feed (Following)
feedRouter.get('/following', requireAuth, async (c) => {
  const userId = c.get('userId')
  const cursor = c.req.query('cursor')
  const limit = parseInt(c.req.query('limit') || '20')
  
  const artworks = await db.artwork.findMany({
    where: {
      artist: {
        followers: {
          some: {
            followerId: userId,
          },
        },
      },
      visibility: 'PUBLIC',
    },
    include: {
      artist: {
        select: {
          id: true,
          name: true,
          displayName: true,
          image: true,
          isVerified: true,
        },
      },
      tags: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  })
  
  const hasMore = artworks.length > limit
  const items = hasMore ? artworks.slice(0, -1) : artworks
  const nextCursor = hasMore ? items[items.length - 1].id : null
  
  return c.json({ artworks: items, nextCursor, hasMore })
})

// Global chronological feed
feedRouter.get('/global', optionalAuth, async (c) => {
  const cursor = c.req.query('cursor')
  const limit = parseInt(c.req.query('limit') || '30')
  
  const artworks = await db.artwork.findMany({
    where: {
      visibility: 'PUBLIC',
    },
    include: {
      artist: {
        select: {
          id: true,
          name: true,
          displayName: true,
          image: true,
          isVerified: true,
        },
      },
      tags: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  })
  
  const hasMore = artworks.length > limit
  const items = hasMore ? artworks.slice(0, -1) : artworks
  const nextCursor = hasMore ? items[items.length - 1].id : null
  
  return c.json({ artworks: items, nextCursor, hasMore })
})

// Curated feed (Staff picks)
feedRouter.get('/curated', optionalAuth, async (c) => {
  const cursor = c.req.query('cursor')
  const limit = parseInt(c.req.query('limit') || '20')
  
  // For MVP: artworks by verified artists
  // Later: implement curation system
  const artworks = await db.artwork.findMany({
    where: {
      visibility: 'PUBLIC',
      artist: {
        isVerified: true,
      },
    },
    include: {
      artist: {
        select: {
          id: true,
          name: true,
          displayName: true,
          image: true,
          isVerified: true,
        },
      },
      tags: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  })
  
  const hasMore = artworks.length > limit
  const items = hasMore ? artworks.slice(0, -1) : artworks
  const nextCursor = hasMore ? items[items.length - 1].id : null
  
  return c.json({ artworks: items, nextCursor, hasMore })
})

export { feedRouter }
```

### Search & Discovery

#### `apps/server/src/routes/search.ts`
```typescript
import { Hono } from 'hono'
import { db } from '@repo/db'

const searchRouter = new Hono()

// Search artworks
searchRouter.get('/artworks', async (c) => {
  const query = c.req.query('q') || ''
  const tags = c.req.query('tags')?.split(',') || []
  const medium = c.req.query('medium')
  const forSale = c.req.query('forSale') === 'true'
  const limit = parseInt(c.req.query('limit') || '30')
  
  const artworks = await db.artwork.findMany({
    where: {
      visibility: 'PUBLIC',
      AND: [
        query
          ? {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                {
                  artist: {
                    OR: [
                      { name: { contains: query, mode: 'insensitive' } },
                      { displayName: { contains: query, mode: 'insensitive' } },
                    ],
                  },
                },
              ],
            }
          : {},
        tags.length > 0
          ? {
              tags: {
                some: {
                  name: { in: tags },
                },
              },
            }
          : {},
        medium ? { medium: { contains: medium, mode: 'insensitive' } } : {},
        forSale ? { forSale: true } : {},
      ],
    },
    include: {
      artist: {
        select: {
          id: true,
          name: true,
          displayName: true,
          image: true,
          isVerified: true,
        },
      },
      tags: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  
  return c.json({ artworks })
})

// Search artists
searchRouter.get('/artists', async (c) => {
  const query = c.req.query('q') || ''
  const verified = c.req.query('verified') === 'true'
  const limit = parseInt(c.req.query('limit') || '20')
  
  const artists = await db.user.findMany({
    where: {
      isArtist: true,
      AND: [
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { displayName: { contains: query, mode: 'insensitive' } },
            { bio: { contains: query, mode: 'insensitive' } },
          ],
        },
        verified ? { isVerified: true } : {},
      ],
    },
    select: {
      id: true,
      name: true,
      displayName: true,
      image: true,
      bio: true,
      isVerified: true,
      _count: {
        select: {
          artworks: {
            where: { visibility: 'PUBLIC' },
          },
          followers: true,
        },
      },
    },
    take: limit,
  })
  
  return c.json({ artists })
})

// Get trending tags
searchRouter.get('/tags/trending', async (c) => {
  const limit = parseInt(c.req.query('limit') || '20')
  
  const tags = await db.tag.findMany({
    include: {
      _count: {
        select: {
          artworks: {
            where: {
              visibility: 'PUBLIC',
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            },
          },
        },
      },
    },
    orderBy: {
      artworks: {
        _count: 'desc',
      },
    },
    take: limit,
  })
  
  return c.json({ tags })
})

export { searchRouter }
```

### Follow System

#### `apps/server/src/routes/follows.ts`
```typescript
import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { db } from '@repo/db'

const followsRouter = new Hono()

// Follow user
followsRouter.post('/:userId', requireAuth, async (c) => {
  const currentUserId = c.get('userId')
  const targetUserId = c.req.param('userId')
  
  if (currentUserId === targetUserId) {
    return c.json({ error: 'Cannot follow yourself' }, 400)
  }
  
  // Check if target user exists
  const targetUser = await db.user.findUnique({
    where: { id: targetUserId },
  })
  
  if (!targetUser) {
    return c.json({ error: 'User not found' }, 404)
  }
  
  // Create follow
  try {
    await db.follow.create({
      data: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    })
    
    return c.json({ success: true })
  } catch (error) {
    // Already following
    return c.json({ error: 'Already following' }, 400)
  }
})

// Unfollow user
followsRouter.delete('/:userId', requireAuth, async (c) => {
  const currentUserId = c.get('userId')
  const targetUserId = c.req.param('userId')
  
  await db.follow.deleteMany({
    where: {
      followerId: currentUserId,
      followingId: targetUserId,
    },
  })
  
  return c.json({ success: true })
})

// Get followers
followsRouter.get('/:userId/followers', async (c) => {
  const userId = c.req.param('userId')
  
  const followers = await db.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          id: true,
          name: true,
          displayName: true,
          image: true,
          isVerified: true,
        },
      },
    },
  })
  
  return c.json({ followers: followers.map((f) => f.follower) })
})

// Get following
followsRouter.get('/:userId/following', async (c) => {
  const userId = c.req.param('userId')
  
  const following = await db.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          name: true,
          displayName: true,
          image: true,
          isVerified: true,
        },
      },
    },
  })
  
  return c.json({ following: following.map((f) => f.following) })
})

export { followsRouter }
```

---

## Frontend Implementation

### Feed Page

#### `apps/web/src/app/discover/page.tsx`
```typescript
'use client'

import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ArtworkGrid } from '@/components/artwork-grid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

type FeedType = 'following' | 'global' | 'curated'

async function fetchFeed(type: FeedType, cursor?: string) {
  const url = new URL(`/api/feed/${type}`, window.location.origin)
  if (cursor) url.searchParams.set('cursor', cursor)
  
  const response = await fetch(url.toString())
  if (!response.ok) throw new Error('Failed to fetch feed')
  return response.json()
}

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<FeedType>('global')
  
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['feed', activeTab],
    queryFn: ({ pageParam }) => fetchFeed(activeTab, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  })
  
  const artworks = data?.pages.flatMap((page) => page.artworks) ?? []
  
  return (
    <div className="max-w-8xl mx-auto p-6">
      <h1 className="font-display text-4xl mb-8">Discover</h1>
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FeedType)}>
        <TabsList className="mb-8">
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="global">All Works</TabsTrigger>
          <TabsTrigger value="curated">Curated</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {isLoading ? (
            <div>Loading...</div>
          ) : artworks.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No artworks found</p>
            </div>
          ) : (
            <>
              <ArtworkGrid artworks={artworks} columns={3} />
              
              {hasNextPage && (
                <div className="mt-8 text-center">
                  <Button onClick={() => fetchNextPage()}>Load More</Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### Search Page

#### `apps/web/src/app/search/page.tsx`
```typescript
'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ArtworkGrid } from '@/components/artwork-grid'
import { Button } from '@/components/ui/button'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/search/artworks?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data.artworks)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="max-w-8xl mx-auto p-6">
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search artworks, artists, tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 h-14 text-lg"
          />
        </div>
      </form>
      
      {isLoading ? (
        <div className="text-center py-16">Loading...</div>
      ) : results.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-6">
            {results.length} results for "{query}"
          </p>
          <ArtworkGrid artworks={results} columns={3} />
        </>
      ) : query ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No results found for "{query}"</p>
        </div>
      ) : null}
    </div>
  )
}
```

---

## Implementation Checklist

- [ ] Create Follow model
- [ ] Implement feed endpoints
- [ ] Add search functionality
- [ ] Build discover page with tabs
- [ ] Create search interface
- [ ] Add infinite scroll
- [ ] Implement follow/unfollow
- [ ] Add favorites system

---

## Git Commits

```bash
git add packages/db/prisma/schema/
git commit -m "feat(db): add Follow and Favorite models"

git add apps/server/src/routes/feed.ts
git commit -m "feat(server): implement chronological feed endpoints"

git add apps/server/src/routes/search.ts
git commit -m "feat(server): add search and discovery endpoints"

git add apps/server/src/routes/follows.ts
git commit -m "feat(server): implement follow system"

git add apps/web/src/app/discover/
git commit -m "feat(web): create discover page with feed tabs"
```

This guide is intentionally condensed. Would you like me to continue with the remaining guides (Exhibitions, Critique, Marketplace, Messaging, Moderation) in a similar focused format?

