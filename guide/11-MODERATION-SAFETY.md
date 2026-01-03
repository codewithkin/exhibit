# Moderation & Safety Guide - Exhibit

## Database Schema

```prisma
model Report {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  
  reporterId  String
  reporter    User     @relation("Reports", fields: [reporterId], references: [id])
  
  targetType  ReportTargetType
  targetId    String   // ID of artwork, user, or comment
  
  reason      ReportReason
  description String?  @db.Text
  
  status      ReportStatus @default(PENDING)
  reviewedAt  DateTime?
  reviewedBy  String?
  resolution  String?  @db.Text
  
  @@index([targetId])
  @@index([status])
  @@map("reports")
}

enum ReportTargetType {
  ARTWORK
  USER
  COMMENT
  MESSAGE
}

enum ReportReason {
  SPAM
  INAPPROPRIATE_CONTENT
  HARASSMENT
  COPYRIGHT_VIOLATION
  HATE_SPEECH
  FAKE_ACCOUNT
  OTHER
}

enum ReportStatus {
  PENDING
  REVIEWING
  RESOLVED
  DISMISSED
}

model Block {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())
  
  blockerId  String
  blocker    User     @relation("Blocker", fields: [blockerId], references: [id])
  
  blockedId  String
  blocked    User     @relation("Blocked", fields: [blockedId], references: [id])
  
  @@unique([blockerId, blockedId])
  @@index([blockerId])
  @@map("blocks")
}

// Update User model
model User {
  reports    Report[]  @relation("Reports")
  blockedBy  Block[]   @relation("Blocked")
  blocking   Block[]   @relation("Blocker")
}
```

---

## Backend API

```typescript
// apps/server/src/routes/moderation.ts
import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { z } from 'zod'
import { db } from '@repo/db'

const moderationRouter = new Hono()

// Submit report
moderationRouter.post(
  '/report',
  requireAuth,
  async (c) => {
    const reporterId = c.get('userId')
    const { targetType, targetId, reason, description } = await c.req.json()
    
    const report = await db.report.create({
      data: {
        reporterId,
        targetType,
        targetId,
        reason,
        description,
      },
    })
    
    return c.json({ report })
  }
)

// Block user
moderationRouter.post(
  '/block/:userId',
  requireAuth,
  async (c) => {
    const blockerId = c.get('userId')
    const blockedId = c.req.param('userId')
    
    if (blockerId === blockedId) {
      return c.json({ error: 'Cannot block yourself' }, 400)
    }
    
    const block = await db.block.create({
      data: { blockerId, blockedId },
    })
    
    return c.json({ block })
  }
)

// Unblock user
moderationRouter.delete(
  '/block/:userId',
  requireAuth,
  async (c) => {
    const blockerId = c.get('userId')
    const blockedId = c.req.param('userId')
    
    await db.block.deleteMany({
      where: { blockerId, blockedId },
    })
    
    return c.json({ success: true })
  }
)

// Admin: Get pending reports
moderationRouter.get(
  '/reports',
  requireAuth,
  async (c) => {
    // TODO: Check if user is admin/moderator
    
    const reports = await db.report.findMany({
      where: { status: 'PENDING' },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return c.json({ reports })
  }
)

// Admin: Resolve report
moderationRouter.patch(
  '/reports/:id',
  requireAuth,
  async (c) => {
    const reportId = c.req.param('id')
    const { status, resolution } = await c.req.json()
    
    const report = await db.report.update({
      where: { id: reportId },
      data: {
        status,
        resolution,
        reviewedAt: new Date(),
        reviewedBy: c.get('userId'),
      },
    })
    
    return c.json({ report })
  }
)

export { moderationRouter }
```

---

## Frontend

```typescript
// apps/web/src/components/report-dialog.tsx
'use client'

export function ReportDialog({
  targetType,
  targetId,
}: {
  targetType: 'ARTWORK' | 'USER' | 'COMMENT'
  targetId: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  
  const handleSubmit = async () => {
    await fetch('/api/moderation/report', {
      method: 'POST',
      body: JSON.stringify({
        targetType,
        targetId,
        reason,
        description,
      }),
    })
    
    setIsOpen(false)
    toast.success('Report submitted')
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Flag className="h-4 w-4 mr-2" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Reason</Label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded-sm p-2"
            >
              <option value="">Select a reason</option>
              <option value="SPAM">Spam</option>
              <option value="INAPPROPRIATE_CONTENT">Inappropriate Content</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="COPYRIGHT_VIOLATION">Copyright Violation</option>
              <option value="HATE_SPEECH">Hate Speech</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          
          <div>
            <Label>Additional details</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more context..."
            />
          </div>
          
          <Button onClick={handleSubmit} disabled={!reason}>
            Submit Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

```typescript
// apps/web/src/app/admin/reports/page.tsx (Admin dashboard)
'use client'

export default function AdminReportsPage() {
  const { data } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => fetch('/api/moderation/reports').then(r => r.json()),
  })
  
  return (
    <div className="p-6">
      <h1 className="font-display text-3xl mb-6">Pending Reports</h1>
      
      <div className="space-y-4">
        {data?.reports?.map((report: any) => (
          <Card key={report.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{report.reason}</p>
                <p className="text-sm text-muted-foreground">
                  Reported by {report.reporter.name}
                </p>
                <p className="text-sm mt-2">{report.description}</p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => resolveReport(report.id, 'RESOLVED')}
                >
                  Resolve
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => resolveReport(report.id, 'DISMISSED')}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

## Content Moderation Policies

### Community Guidelines
1. **Respect others**: No harassment, hate speech, or threats
2. **Original work**: Only post your own artwork or work you have rights to
3. **Appropriate content**: No explicit or illegal content
4. **No spam**: Genuine engagement only
5. **Constructive critique**: Feedback should be helpful and respectful

### Moderator Actions
- **Warning**: First offense for minor violations
- **Content removal**: Remove violating artwork/comments
- **Temporary ban**: 7-30 days for repeated violations
- **Permanent ban**: Severe or repeated violations

### Automated Filters
- Rate limiting on posts/comments
- Spam detection keywords
- Duplicate content detection
- New account restrictions

---

## Git Commits

```bash
git add packages/db/prisma/schema/
git commit -m "feat(db): add Report and Block models for moderation"

git add apps/server/src/routes/moderation.ts
git commit -m "feat(server): implement moderation and reporting system"

git add apps/web/src/components/report-dialog.tsx
git commit -m "feat(web): create report content dialog"

git add apps/web/src/app/admin/reports/
git commit -m "feat(web): add admin moderation dashboard"
```

---

## Implementation Checklist

- [ ] Create Report and Block models
- [ ] Implement reporting endpoints
- [ ] Add block/unblock functionality
- [ ] Build report dialog component
- [ ] Create admin moderation dashboard
- [ ] Set up content filtering
- [ ] Add rate limiting
- [ ] Create moderation guidelines doc
- [ ] Train moderator team
- [ ] Set up alert system for flagged content

---

**Next Steps**:
1. Implement automated content filtering
2. Add appeal system for banned users
3. Create detailed moderation logs
4. Set up escalation procedures
5. Regular policy reviews
