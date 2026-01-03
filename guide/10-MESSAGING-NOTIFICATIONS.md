# Messaging & Notifications Guide - Exhibit

## Database Schema

```prisma
model Conversation {
  id        String    @id @default(cuid())
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  participants User[]  @relation("ConversationParticipants")
  messages     Message[]
  
  @@map("conversations")
}

model Message {
  id             String       @id @default(cuid())
  createdAt      DateTime     @default(now())
  
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  senderId       String
  sender         User         @relation(fields: [senderId], references: [id])
  
  content        String       @db.Text
  read           Boolean      @default(false)
  
  @@index([conversationId])
  @@index([senderId])
  @@map("messages")
}

model Notification {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type      NotificationType
  title     String
  message   String
  link      String?
  
  read      Boolean  @default(false)
  
  @@index([userId])
  @@index([read])
  @@map("notifications")
}

enum NotificationType {
  FOLLOW
  LIKE
  COMMENT
  COMMISSION_REQUEST
  EXHIBITION_ACCEPTED
  PURCHASE
  MESSAGE
}

// Update User model
model User {
  conversations Conversation[] @relation("ConversationParticipants")
  messages      Message[]
  notifications Notification[]
}
```

---

## Backend API

```typescript
// apps/server/src/routes/messages.ts
import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { db } from '@repo/db'

const messagesRouter = new Hono()

// Get conversations
messagesRouter.get('/conversations', requireAuth, async (c) => {
  const userId = c.get('userId')
  
  const conversations = await db.conversation.findMany({
    where: {
      participants: {
        some: { id: userId },
      },
    },
    include: {
      participants: {
        where: {
          id: { not: userId },
        },
        select: {
          id: true,
          name: true,
          displayName: true,
          image: true,
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
  
  return c.json({ conversations })
})

// Send message
messagesRouter.post('/', requireAuth, async (c) => {
  const senderId = c.get('userId')
  const { recipientId, content } = await c.req.json()
  
  // Find or create conversation
  let conversation = await db.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { id: senderId } } },
        { participants: { some: { id: recipientId } } },
      ],
    },
  })
  
  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        participants: {
          connect: [{ id: senderId }, { id: recipientId }],
        },
      },
    })
  }
  
  const message = await db.message.create({
    data: {
      conversationId: conversation.id,
      senderId,
      content,
    },
  })
  
  // Create notification
  await db.notification.create({
    data: {
      userId: recipientId,
      type: 'MESSAGE',
      title: 'New message',
      message: content.substring(0, 100),
      link: `/messages/${conversation.id}`,
    },
  })
  
  return c.json({ message })
})

export { messagesRouter }
```

```typescript
// apps/server/src/routes/notifications.ts
import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { db } from '@repo/db'

const notificationsRouter = new Hono()

// Get notifications
notificationsRouter.get('/', requireAuth, async (c) => {
  const userId = c.get('userId')
  const unreadOnly = c.req.query('unread') === 'true'
  
  const notifications = await db.notification.findMany({
    where: {
      userId,
      ...(unreadOnly && { read: false }),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  
  return c.json({ notifications })
})

// Mark as read
notificationsRouter.patch('/:id/read', requireAuth, async (c) => {
  const userId = c.get('userId')
  const notificationId = c.req.param('id')
  
  await db.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: { read: true },
  })
  
  return c.json({ success: true })
})

// Mark all as read
notificationsRouter.post('/read-all', requireAuth, async (c) => {
  const userId = c.get('userId')
  
  await db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  })
  
  return c.json({ success: true })
})

export { notificationsRouter }
```

---

## Frontend

```typescript
// apps/web/src/components/notifications-dropdown.tsx
'use client'

export function NotificationsDropdown() {
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetch('/api/notifications?unread=true').then(r => r.json()),
  })
  
  const unreadCount = data?.notifications?.filter((n: any) => !n.read).length || 0
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-xs flex items-center justify-center text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <h3 className="font-semibold mb-2">Notifications</h3>
          {data?.notifications?.map((notification: any) => (
            <Link
              key={notification.id}
              href={notification.link || '#'}
              className="block p-2 hover:bg-muted rounded-sm"
            >
              <p className="font-medium text-sm">{notification.title}</p>
              <p className="text-xs text-muted-foreground">{notification.message}</p>
            </Link>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## Git Commits

```bash
git add packages/db/prisma/schema/
git commit -m "feat(db): add Conversation, Message, and Notification models"

git add apps/server/src/routes/messages.ts
git commit -m "feat(server): implement messaging system"

git add apps/server/src/routes/notifications.ts
git commit -m "feat(server): add notification endpoints"

git add apps/web/src/components/notifications-dropdown.tsx
git commit -m "feat(web): create notifications dropdown component"
```
