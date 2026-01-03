# Artwork Posting & Upload Flow Guide - Exhibit

## Overview
This guide covers the complete artwork upload and posting system, including high-fidelity image handling, metadata management, licensing options, and the multi-step posting flow for web and native platforms.

---

## Technology Stack

### File Upload & Storage
```typescript
// Storage
- AWS S3 or Cloudflare R2 (object storage)
- @aws-sdk/client-s3
- @aws-sdk/s3-request-presigner (presigned URLs)

// Image processing
- sharp (Node.js image processing)
- blurhash (placeholder generation)

// File validation
- file-type (MIME type detection)
- image-size (dimension validation)
```

### Database Schema
```prisma
// packages/db/prisma/schema/schema.prisma

model Artwork {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Core fields
  title       String
  description String?  @db.Text
  year        Int?
  
  // Media details
  medium      String?  // "Oil on canvas", "Digital", etc.
  dimensions  String?  // "24 x 36 inches"
  
  // Image data
  imageUrl      String   // Full-size image URL
  thumbnailUrl  String   // Square thumbnail
  mediumUrl     String   // Medium size (1200px)
  blurHash      String?  // For placeholder
  width         Int      // Original width
  height        Int      // Original height
  fileSize      Int      // In bytes
  
  // Visibility & licensing
  visibility  Visibility @default(PUBLIC)
  license     License    @default(DISPLAY_ONLY)
  
  // Commerce
  forSale     Boolean    @default(false)
  price       Decimal?   @db.Decimal(10, 2)
  currency    String     @default("USD")
  
  // Relationships
  artistId    String
  artist      User       @relation(fields: [artistId], references: [id], onDelete: Cascade)
  tags        Tag[]      @relation("ArtworkTags")
  exhibitions Exhibition[] @relation("ExhibitionArtworks")
  
  // Critique
  critiqueEnabled  Boolean @default(false)
  critiqueSafeSpace Boolean @default(false) // Only invited reviewers
  
  @@index([artistId])
  @@index([visibility])
  @@index([forSale])
  @@map("artworks")
}

enum Visibility {
  PUBLIC
  FOLLOWERS_ONLY
  PRIVATE
}

enum License {
  DISPLAY_ONLY      // No downloads
  CC_BY             // Attribution
  CC_BY_NC          // Attribution, non-commercial
  CC_BY_ND          // Attribution, no derivatives
  CC_BY_NC_ND       // Attribution, non-commercial, no derivatives
  COMMERCIAL_INQUIRY // Contact for licensing
}

model Tag {
  id       String    @id @default(cuid())
  name     String    @unique
  artworks Artwork[] @relation("ArtworkTags")
  
  @@map("tags")
}
```

---

## Backend Implementation

### 1. Upload Configuration

#### Environment Variables
```bash
# .env
S3_BUCKET=exhibit-artworks
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your_key
S3_SECRET_ACCESS_KEY=your_secret
CDN_URL=https://cdn.exhibit.com
```

#### Storage Client - `apps/server/src/lib/storage.ts`
```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '@repo/env/server'

const s3Client = new S3Client({
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
})

/**
 * Generate presigned URL for direct upload to S3
 */
export async function generateUploadUrl(
  fileName: string,
  contentType: string,
  userId: string
): Promise<{ uploadUrl: string; fileKey: string }> {
  const fileKey = `uploads/${userId}/${Date.now()}-${fileName}`
  
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: fileKey,
    ContentType: contentType,
    // ACL: 'public-read', // If using public bucket
  })
  
  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300, // 5 minutes
  })
  
  return { uploadUrl, fileKey }
}

/**
 * Delete file from S3
 */
export async function deleteFile(fileKey: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: fileKey,
  })
  
  await s3Client.send(command)
}

/**
 * Get public URL for file
 */
export function getPublicUrl(fileKey: string): string {
  return `${env.CDN_URL}/${fileKey}`
}
```

### 2. Image Processing

#### Processing Service - `apps/server/src/lib/image-processor.ts`
```typescript
import sharp from 'sharp'
import { encode } from 'blurhash'
import sizeOf from 'image-size'

interface ProcessedImage {
  original: {
    width: number
    height: number
    fileSize: number
  }
  thumbnail: Buffer
  medium: Buffer
  blurHash: string
}

/**
 * Process uploaded image: generate thumbnails and blur hash
 */
export async function processImage(
  imageBuffer: Buffer
): Promise<ProcessedImage> {
  // Get original dimensions
  const dimensions = sizeOf(imageBuffer)
  
  if (!dimensions.width || !dimensions.height) {
    throw new Error('Invalid image dimensions')
  }
  
  // Generate thumbnail (400x400, square crop)
  const thumbnail = await sharp(imageBuffer)
    .resize(400, 400, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: 85 })
    .toBuffer()
  
  // Generate medium size (1200px wide, maintain aspect ratio)
  const medium = await sharp(imageBuffer)
    .resize(1200, null, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 90, progressive: true })
    .toBuffer()
  
  // Generate blur hash for placeholder
  const blurHashImage = await sharp(imageBuffer)
    .resize(32, 32, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  
  const blurHash = encode(
    new Uint8ClampedArray(blurHashImage.data),
    blurHashImage.info.width,
    blurHashImage.info.height,
    4,
    4
  )
  
  return {
    original: {
      width: dimensions.width,
      height: dimensions.height,
      fileSize: imageBuffer.length,
    },
    thumbnail,
    medium,
    blurHash,
  }
}

/**
 * Validate image file
 */
export async function validateImage(
  buffer: Buffer
): Promise<{ valid: boolean; error?: string }> {
  try {
    const metadata = await sharp(buffer).metadata()
    
    // Check file size (50MB max)
    if (buffer.length > 50 * 1024 * 1024) {
      return { valid: false, error: 'File size exceeds 50MB' }
    }
    
    // Check dimensions (8000x8000 max)
    if (metadata.width && metadata.width > 8000) {
      return { valid: false, error: 'Image width exceeds 8000px' }
    }
    if (metadata.height && metadata.height > 8000) {
      return { valid: false, error: 'Image height exceeds 8000px' }
    }
    
    // Check format
    const validFormats = ['jpeg', 'png', 'webp', 'tiff']
    if (metadata.format && !validFormats.includes(metadata.format)) {
      return { valid: false, error: 'Unsupported image format' }
    }
    
    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Invalid image file' }
  }
}
```

### 3. Upload API Routes

#### `apps/server/src/routes/upload.ts`
```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth'
import { generateUploadUrl, getPublicUrl } from '../lib/storage'
import { processImage, validateImage } from '../lib/image-processor'
import { db } from '@repo/db'

const uploadRouter = new Hono()

// Step 1: Request upload URL
const requestUploadSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  fileSize: z.number().max(50 * 1024 * 1024), // 50MB
})

uploadRouter.post(
  '/request-upload',
  requireAuth,
  zValidator('json', requestUploadSchema),
  async (c) => {
    const userId = c.get('userId')
    const { fileName, contentType } = c.req.valid('json')
    
    // Validate content type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff']
    if (!validTypes.includes(contentType)) {
      return c.json({ error: 'Invalid file type' }, 400)
    }
    
    // Generate presigned URL
    const { uploadUrl, fileKey } = await generateUploadUrl(
      fileName,
      contentType,
      userId
    )
    
    return c.json({
      uploadUrl,
      fileKey,
      expiresIn: 300, // 5 minutes
    })
  }
)

// Step 2: Process uploaded image
const processUploadSchema = z.object({
  fileKey: z.string(),
})

uploadRouter.post(
  '/process-upload',
  requireAuth,
  zValidator('json', processUploadSchema),
  async (c) => {
    const { fileKey } = c.req.valid('json')
    
    // Download image from S3 (in real implementation)
    // For now, assume we have the buffer
    const imageBuffer = await downloadFromS3(fileKey)
    
    // Validate image
    const validation = await validateImage(imageBuffer)
    if (!validation.valid) {
      return c.json({ error: validation.error }, 400)
    }
    
    // Process image
    const processed = await processImage(imageBuffer)
    
    // Upload processed versions to S3
    const thumbnailKey = `${fileKey}-thumb`
    const mediumKey = `${fileKey}-medium`
    
    await uploadToS3(thumbnailKey, processed.thumbnail, 'image/jpeg')
    await uploadToS3(mediumKey, processed.medium, 'image/jpeg')
    
    return c.json({
      imageUrl: getPublicUrl(fileKey),
      thumbnailUrl: getPublicUrl(thumbnailKey),
      mediumUrl: getPublicUrl(mediumKey),
      blurHash: processed.blurHash,
      width: processed.original.width,
      height: processed.original.height,
      fileSize: processed.original.fileSize,
    })
  }
)

export { uploadRouter }
```

### 4. Artwork Creation

#### `apps/server/src/routes/artworks.ts`
```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth'
import { db } from '@repo/db'

const artworkRouter = new Hono()

// Create artwork
const createArtworkSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  year: z.number().min(1800).max(new Date().getFullYear() + 1).optional(),
  medium: z.string().max(200).optional(),
  dimensions: z.string().max(100).optional(),
  
  // Image data (from upload process)
  imageUrl: z.string().url(),
  thumbnailUrl: z.string().url(),
  mediumUrl: z.string().url(),
  blurHash: z.string().optional(),
  width: z.number(),
  height: z.number(),
  fileSize: z.number(),
  
  // Settings
  visibility: z.enum(['PUBLIC', 'FOLLOWERS_ONLY', 'PRIVATE']).default('PUBLIC'),
  license: z.enum([
    'DISPLAY_ONLY',
    'CC_BY',
    'CC_BY_NC',
    'CC_BY_ND',
    'CC_BY_NC_ND',
    'COMMERCIAL_INQUIRY',
  ]).default('DISPLAY_ONLY'),
  
  // Commerce
  forSale: z.boolean().default(false),
  price: z.number().positive().optional(),
  
  // Tags
  tags: z.array(z.string()).max(10).default([]),
  
  // Critique
  critiqueEnabled: z.boolean().default(false),
  critiqueSafeSpace: z.boolean().default(false),
})

artworkRouter.post(
  '/',
  requireAuth,
  zValidator('json', createArtworkSchema),
  async (c) => {
    const userId = c.get('userId')
    const data = c.req.valid('json')
    
    // Check if user is an artist
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { isArtist: true },
    })
    
    if (!user?.isArtist) {
      return c.json({ error: 'Only artists can post artwork' }, 403)
    }
    
    // Process tags
    const tagObjects = await Promise.all(
      data.tags.map(async (tagName) => {
        // Find or create tag
        return db.tag.upsert({
          where: { name: tagName.toLowerCase() },
          create: { name: tagName.toLowerCase() },
          update: {},
        })
      })
    )
    
    // Create artwork
    const artwork = await db.artwork.create({
      data: {
        title: data.title,
        description: data.description,
        year: data.year,
        medium: data.medium,
        dimensions: data.dimensions,
        imageUrl: data.imageUrl,
        thumbnailUrl: data.thumbnailUrl,
        mediumUrl: data.mediumUrl,
        blurHash: data.blurHash,
        width: data.width,
        height: data.height,
        fileSize: data.fileSize,
        visibility: data.visibility,
        license: data.license,
        forSale: data.forSale,
        price: data.price,
        critiqueEnabled: data.critiqueEnabled,
        critiqueSafeSpace: data.critiqueSafeSpace,
        artistId: userId,
        tags: {
          connect: tagObjects.map((tag) => ({ id: tag.id })),
        },
      },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
          },
        },
        tags: true,
      },
    })
    
    return c.json({ artwork })
  }
)

// Get artwork by ID
artworkRouter.get('/:id', async (c) => {
  const artworkId = c.req.param('id')
  
  const artwork = await db.artwork.findUnique({
    where: { id: artworkId },
    include: {
      artist: {
        select: {
          id: true,
          name: true,
          image: true,
          isVerified: true,
        },
      },
      tags: true,
    },
  })
  
  if (!artwork) {
    return c.json({ error: 'Artwork not found' }, 404)
  }
  
  // Check visibility
  if (artwork.visibility !== 'PUBLIC') {
    // Require auth for non-public artworks
    const userId = c.get('userId')
    if (!userId || artwork.artistId !== userId) {
      return c.json({ error: 'Not authorized' }, 403)
    }
  }
  
  return c.json({ artwork })
})

// Update artwork
artworkRouter.patch(
  '/:id',
  requireAuth,
  zValidator('json', createArtworkSchema.partial()),
  async (c) => {
    const userId = c.get('userId')
    const artworkId = c.req.param('id')
    const data = c.req.valid('json')
    
    // Check ownership
    const existing = await db.artwork.findUnique({
      where: { id: artworkId },
    })
    
    if (!existing) {
      return c.json({ error: 'Artwork not found' }, 404)
    }
    
    if (existing.artistId !== userId) {
      return c.json({ error: 'Not authorized' }, 403)
    }
    
    // Update artwork
    const artwork = await db.artwork.update({
      where: { id: artworkId },
      data: {
        ...data,
        tags: data.tags
          ? {
              set: [],
              connect: await Promise.all(
                data.tags.map(async (name) =>
                  db.tag.upsert({
                    where: { name: name.toLowerCase() },
                    create: { name: name.toLowerCase() },
                    update: {},
                  })
                )
              ).then((tags) => tags.map((tag) => ({ id: tag.id }))),
            }
          : undefined,
      },
      include: {
        artist: true,
        tags: true,
      },
    })
    
    return c.json({ artwork })
  }
)

// Delete artwork
artworkRouter.delete('/:id', requireAuth, async (c) => {
  const userId = c.get('userId')
  const artworkId = c.req.param('id')
  
  const artwork = await db.artwork.findUnique({
    where: { id: artworkId },
  })
  
  if (!artwork) {
    return c.json({ error: 'Artwork not found' }, 404)
  }
  
  if (artwork.artistId !== userId) {
    return c.json({ error: 'Not authorized' }, 403)
  }
  
  // Delete from database
  await db.artwork.delete({
    where: { id: artworkId },
  })
  
  // TODO: Delete files from S3
  
  return c.json({ success: true })
})

export { artworkRouter }
```

---

## Frontend Implementation

### 1. Upload Hook (Web)

#### `apps/web/src/hooks/use-upload.ts`
```typescript
'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface UploadResult {
  imageUrl: string
  thumbnailUrl: string
  mediumUrl: string
  blurHash?: string
  width: number
  height: number
  fileSize: number
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const uploadImage = async (file: File): Promise<UploadResult | null> => {
    setIsUploading(true)
    setProgress(0)
    
    try {
      // Step 1: Request upload URL
      const response = await fetch('/api/upload/request-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to get upload URL')
      }
      
      const { uploadUrl, fileKey } = await response.json()
      setProgress(20)
      
      // Step 2: Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file')
      }
      
      setProgress(60)
      
      // Step 3: Process image
      const processResponse = await fetch('/api/upload/process-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileKey }),
      })
      
      if (!processResponse.ok) {
        throw new Error('Failed to process image')
      }
      
      const result = await processResponse.json()
      setProgress(100)
      
      return result
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Upload failed'
      )
      return null
    } finally {
      setIsUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }
  
  return { uploadImage, isUploading, progress }
}
```

### 2. Multi-Step Post Form

#### `apps/web/src/components/post-artwork-form.tsx`
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
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageUpload } from '@/components/image-upload'
import { useUpload } from '@/hooks/use-upload'
import { useRouter } from 'next/navigation'

const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  year: z.coerce.number().min(1800).optional(),
  medium: z.string().max(200).optional(),
  dimensions: z.string().max(100).optional(),
  visibility: z.enum(['PUBLIC', 'FOLLOWERS_ONLY', 'PRIVATE']),
  license: z.enum([
    'DISPLAY_ONLY',
    'CC_BY',
    'CC_BY_NC',
    'CC_BY_ND',
    'CC_BY_NC_ND',
    'COMMERCIAL_INQUIRY',
  ]),
  forSale: z.boolean(),
  price: z.coerce.number().positive().optional(),
  tags: z.string(), // Comma-separated
  critiqueEnabled: z.boolean(),
})

type PostFormData = z.infer<typeof postSchema>

export function PostArtworkForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [uploadedImage, setUploadedImage] = useState<any>(null)
  const { uploadImage, isUploading, progress } = useUpload()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      visibility: 'PUBLIC',
      license: 'DISPLAY_ONLY',
      forSale: false,
      critiqueEnabled: false,
    },
  })
  
  const forSale = watch('forSale')
  
  const handleImageUpload = async (file: File) => {
    const result = await uploadImage(file)
    if (result) {
      setUploadedImage(result)
      setStep(2)
    }
  }
  
  const onSubmit = async (data: PostFormData) => {
    if (!uploadedImage) {
      return
    }
    
    try {
      const response = await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          ...uploadedImage,
          tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create artwork')
      }
      
      const { artwork } = await response.json()
      router.push(`/artwork/${artwork.id}`)
    } catch (error) {
      console.error('Submit error:', error)
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8 space-x-4">
        <div className={`flex items-center ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
          <div className="flex items-center justify-center w-8 h-8 rounded-full border-2">
            1
          </div>
          <span className="ml-2 text-sm">Upload</span>
        </div>
        <div className="w-16 h-0.5 bg-border" />
        <div className={`flex items-center ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
          <div className="flex items-center justify-center w-8 h-8 rounded-full border-2">
            2
          </div>
          <span className="ml-2 text-sm">Details</span>
        </div>
        <div className="w-16 h-0.5 bg-border" />
        <div className={`flex items-center ${step >= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
          <div className="flex items-center justify-center w-8 h-8 rounded-full border-2">
            3
          </div>
          <span className="ml-2 text-sm">Settings</span>
        </div>
      </div>
      
      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl mb-2">Share your work</h2>
            <p className="text-muted-foreground">
              Upload a high-quality image of your artwork
            </p>
          </div>
          
          <ImageUpload
            onUpload={handleImageUpload}
            isUploading={isUploading}
            progress={progress}
          />
        </div>
      )}
      
      {/* Step 2: Details */}
      {step === 2 && (
        <form onSubmit={handleSubmit((data) => setStep(3))} className="space-y-6">
          <div>
            <h2 className="font-display text-2xl mb-2">Add details</h2>
            <p className="text-muted-foreground">
              Tell us about your artwork
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Untitled"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Share the story behind your work..."
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  {...register('year')}
                  placeholder="2024"
                />
              </div>
              
              <div>
                <Label htmlFor="medium">Medium</Label>
                <Input
                  id="medium"
                  {...register('medium')}
                  placeholder="Oil on canvas"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                {...register('dimensions')}
                placeholder="24 x 36 inches"
              />
            </div>
            
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                {...register('tags')}
                placeholder="portrait, oil painting, contemporary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate tags with commas
              </p>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit">Continue</Button>
          </div>
        </form>
      )}
      
      {/* Step 3: Settings */}
      {step === 3 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h2 className="font-display text-2xl mb-2">Settings & pricing</h2>
            <p className="text-muted-foreground">
              Choose how your work is shared and licensed
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <select
                id="visibility"
                {...register('visibility')}
                className="flex h-11 w-full border border-input bg-background px-3 py-2 text-sm rounded-sm"
              >
                <option value="PUBLIC">Public</option>
                <option value="FOLLOWERS_ONLY">Followers only</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="license">License</Label>
              <select
                id="license"
                {...register('license')}
                className="flex h-11 w-full border border-input bg-background px-3 py-2 text-sm rounded-sm"
              >
                <option value="DISPLAY_ONLY">Display only</option>
                <option value="CC_BY">CC BY (Attribution)</option>
                <option value="CC_BY_NC">CC BY-NC (Non-commercial)</option>
                <option value="COMMERCIAL_INQUIRY">Commercial inquiry</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="forSale" {...register('forSale')} />
                <Label htmlFor="forSale" className="font-normal cursor-pointer">
                  Available for purchase
                </Label>
              </div>
              
              {forSale && (
                <div>
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register('price')}
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="critiqueEnabled" {...register('critiqueEnabled')} />
              <Label htmlFor="critiqueEnabled" className="font-normal cursor-pointer">
                Enable critique requests
              </Label>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish Artwork'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
```

### 3. Image Upload Component

#### `apps/web/src/components/image-upload.tsx`
```typescript
'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface ImageUploadProps {
  onUpload: (file: File) => void
  isUploading: boolean
  progress: number
}

export function ImageUpload({ onUpload, isUploading, progress }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/tiff': ['.tif', '.tiff'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  })
  
  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile)
    }
  }
  
  const handleClear = () => {
    setPreview(null)
    setSelectedFile(null)
  }
  
  if (preview) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-video bg-muted rounded-sm overflow-hidden">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain"
          />
          {!isUploading && (
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 p-2 bg-background/80 rounded-sm hover:bg-background"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {isUploading && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">
              Processing... {progress}%
            </p>
          </div>
        )}
        
        {!isUploading && selectedFile && (
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={handleUpload}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90"
            >
              Upload
            </button>
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-foreground bg-muted' : 'border-border hover:border-foreground/50'
      )}
    >
      <input {...getInputProps()} />
      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <p className="text-lg mb-2">
        {isDragActive ? 'Drop your image here' : 'Drag and drop your artwork'}
      </p>
      <p className="text-sm text-muted-foreground">
        or click to browse • JPEG, PNG, WebP, or TIFF • Max 50MB
      </p>
    </div>
  )
}
```

---

## Implementation Checklist

### Phase 1: Backend Setup
- [ ] Set up S3/R2 bucket and credentials
- [ ] Install sharp and image processing libraries
- [ ] Create storage client utilities
- [ ] Implement image processing service
- [ ] Create upload API routes
- [ ] Add artwork CRUD endpoints

### Phase 2: Database
- [ ] Create Artwork schema
- [ ] Create Tag schema
- [ ] Run migrations
- [ ] Seed test data

### Phase 3: Frontend (Web)
- [ ] Create upload hook
- [ ] Build image upload component
- [ ] Implement multi-step form
- [ ] Add form validation
- [ ] Create upload page
- [ ] Test full flow

### Phase 4: Frontend (Native)
- [ ] Implement image picker
- [ ] Create upload flow
- [ ] Build post form
- [ ] Test on iOS/Android

### Phase 5: Polish
- [ ] Add progress indicators
- [ ] Implement error handling
- [ ] Add image preview/crop
- [ ] Optimize performance
- [ ] Test edge cases

---

## Git Commit Strategy

```bash
# 1. Storage utilities
git add apps/server/src/lib/storage.ts
git commit -m "feat(server): add S3 storage utilities for file upload"

# 2. Image processing
git add apps/server/src/lib/image-processor.ts
git commit -m "feat(server): add image processing and blur hash generation"

# 3. Upload API
git add apps/server/src/routes/upload.ts
git commit -m "feat(server): implement upload request and processing endpoints"

# 4. Artwork CRUD
git add apps/server/src/routes/artworks.ts
git commit -m "feat(server): add artwork creation and management endpoints"

# 5. Upload hook
git add apps/web/src/hooks/use-upload.ts
git commit -m "feat(web): add upload hook for image handling"

# 6. Upload component
git add apps/web/src/components/image-upload.tsx
git commit -m "feat(web): create drag-and-drop image upload component"

# 7. Post form
git add apps/web/src/components/post-artwork-form.tsx
git commit -m "feat(web): implement multi-step artwork posting form"
```

---

## Next Steps

1. **Image optimization**: WebP conversion, adaptive sizing
2. **Batch upload**: Support multiple images at once
3. **Edit uploaded work**: Allow post-publish editing
4. **Draft system**: Save incomplete posts
5. **Collections**: Group artworks into series

---

**Performance Tips**:
- Use presigned URLs for direct S3 upload
- Generate thumbnails asynchronously
- Lazy load images in galleries
- Cache processed images in CDN
- Use blur hash for smooth loading
