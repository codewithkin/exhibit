# Authentication Flow Guide - Exhibit

## Overview
This guide covers the complete authentication system for Exhibit, including email/password auth, social login, verification badges, and session management. We use Better Auth as our authentication provider with Prisma as the database adapter.

---

## Technology Stack

### Core Authentication
```typescript
// Better Auth - Modern auth for TypeScript
- @better-auth/core
- @better-auth/prisma-adapter

// Session management
- @better-auth/session
- jose (JWT handling)

// Social providers
- @better-auth/oauth (Google, Apple optional)

// Password security
- bcryptjs
```

### Database Schema (Prisma)
```prisma
// packages/db/prisma/schema/auth.prisma

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Artist-specific fields
  isArtist      Boolean   @default(false)
  isVerified    Boolean   @default(false)  // Verification badge
  verifiedAt    DateTime?
  bio           String?
  location      String?
  website       String?
  instagram     String?
  
  // Relationships
  accounts      Account[]
  sessions      Session[]
  artworks      Artwork[]
  exhibitions   Exhibition[]
  
  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String  // "email" | "oauth"
  provider          String  // "credentials" | "google" | "apple"
  providerAccountId String?
  password          String? // Hashed, only for email auth
  
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
  @@map("verification_tokens")
}

model VerificationRequest {
  id          String   @id @default(cuid())
  userId      String
  status      String   // "pending" | "approved" | "rejected"
  
  // Submission data
  portfolioUrl String?
  statement    String?
  
  createdAt   DateTime @default(now())
  reviewedAt  DateTime?
  reviewedBy  String?
  
  @@map("verification_requests")
}
```

---

## Backend Setup

### 1. Better Auth Configuration

#### `packages/auth/src/index.ts`
```typescript
import { betterAuth } from '@better-auth/core'
import { prismaAdapter } from '@better-auth/prisma-adapter'
import { db } from '@repo/db'
import { env } from '@repo/env/server'

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
  
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },
  
  // Optional: Social providers
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      enabled: !!env.GOOGLE_CLIENT_ID,
    },
  },
  
  secret: env.AUTH_SECRET,
  
  callbacks: {
    async signIn({ user, account }) {
      // Log sign-in event
      console.log(`User ${user.email} signed in via ${account.provider}`)
      return true
    },
    
    async session({ session, user }) {
      // Add custom fields to session
      session.user.isArtist = user.isArtist
      session.user.isVerified = user.isVerified
      return session
    },
  },
})

export type Auth = typeof auth
```

### 2. Password Utilities

#### `packages/auth/src/lib/passwords.ts`
```typescript
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}
```

### 3. Server API Routes

#### `apps/server/src/routes/auth.ts`
```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { auth } from '@repo/auth'
import { db } from '@repo/db'
import { hashPassword, validatePassword } from '@repo/auth/lib/passwords'

const authRouter = new Hono()

// Sign Up
const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  isArtist: z.boolean().default(false),
})

authRouter.post('/signup', zValidator('json', signUpSchema), async (c) => {
  const { email, password, name, isArtist } = c.req.valid('json')
  
  // Validate password strength
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    return c.json({ error: passwordValidation.errors[0] }, 400)
  }
  
  // Check if user exists
  const existingUser = await db.user.findUnique({
    where: { email },
  })
  
  if (existingUser) {
    return c.json({ error: 'Email already registered' }, 400)
  }
  
  // Hash password
  const hashedPassword = await hashPassword(password)
  
  // Create user and account
  const user = await db.user.create({
    data: {
      email,
      name,
      isArtist,
      accounts: {
        create: {
          type: 'email',
          provider: 'credentials',
          password: hashedPassword,
        },
      },
    },
    include: {
      accounts: true,
    },
  })
  
  // TODO: Send verification email
  
  return c.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      isArtist: user.isArtist,
    },
  })
})

// Sign In
const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

authRouter.post('/signin', zValidator('json', signInSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  
  // Find user with account
  const user = await db.user.findUnique({
    where: { email },
    include: {
      accounts: {
        where: {
          provider: 'credentials',
        },
      },
    },
  })
  
  if (!user || user.accounts.length === 0) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }
  
  const account = user.accounts[0]
  
  if (!account.password) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }
  
  // Verify password
  const { verifyPassword } = await import('@repo/auth/lib/passwords')
  const isValid = await verifyPassword(password, account.password)
  
  if (!isValid) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }
  
  // Create session
  const session = await auth.createSession({
    userId: user.id,
  })
  
  return c.json({
    success: true,
    session: session.sessionToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      isArtist: user.isArtist,
      isVerified: user.isVerified,
    },
  })
})

// Sign Out
authRouter.post('/signout', async (c) => {
  const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (sessionToken) {
    await auth.deleteSession(sessionToken)
  }
  
  return c.json({ success: true })
})

// Get Current User
authRouter.get('/me', async (c) => {
  const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (!sessionToken) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const session = await auth.validateSession(sessionToken)
  
  if (!session) {
    return c.json({ error: 'Invalid session' }, 401)
  }
  
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      isArtist: true,
      isVerified: true,
      bio: true,
      location: true,
      website: true,
      instagram: true,
    },
  })
  
  return c.json({ user })
})

export { authRouter }
```

---

## Frontend Implementation

### 1. Auth Client Setup

#### Web - `apps/web/src/lib/auth-client.ts`
```typescript
import { createAuthClient } from '@better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
})

export type Session = {
  user: {
    id: string
    email: string
    name: string
    image?: string
    isArtist: boolean
    isVerified: boolean
  }
  sessionToken: string
}
```

#### Native - `apps/native/lib/auth-client.ts`
```typescript
import * as SecureStore from 'expo-secure-store'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'

// Secure token storage
export async function saveSession(sessionToken: string) {
  await SecureStore.setItemAsync('session_token', sessionToken)
}

export async function getSession(): Promise<string | null> {
  return await SecureStore.getItemAsync('session_token')
}

export async function removeSession() {
  await SecureStore.deleteItemAsync('session_token')
}

// Auth API calls
export async function signUp(data: {
  email: string
  password: string
  name: string
  isArtist: boolean
}) {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Sign up failed')
  }
  
  return response.json()
}

export async function signIn(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Sign in failed')
  }
  
  const data = await response.json()
  
  // Save session token
  await saveSession(data.session)
  
  return data
}

export async function signOut() {
  const token = await getSession()
  
  if (token) {
    await fetch(`${API_URL}/auth/signout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    
    await removeSession()
  }
}

export async function getCurrentUser() {
  const token = await getSession()
  
  if (!token) {
    return null
  }
  
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  
  if (!response.ok) {
    return null
  }
  
  const data = await response.json()
  return data.user
}
```

### 2. Sign Up Form

#### Web - `apps/web/src/components/sign-up-form.tsx`
```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  isArtist: z.boolean().default(false),
})

type SignUpFormData = z.infer<typeof signUpSchema>

export function SignUpForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })
  
  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await authClient.signUp(data)
      router.push('/success?message=Account created successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Your full name"
          {...register('name')}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="At least 8 characters"
          {...register('password')}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="isArtist" {...register('isArtist')} disabled={isLoading} />
        <Label
          htmlFor="isArtist"
          className="text-sm font-normal cursor-pointer"
        >
          I'm an artist and want to share my work
        </Label>
      </div>
      
      {error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-sm">
          {error}
        </div>
      )}
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  )
}
```

### 3. Sign In Form

#### Web - `apps/web/src/components/sign-in-form.tsx`
```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInFormData = z.infer<typeof signInSchema>

export function SignInForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })
  
  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await authClient.signIn(data.email, data.password)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          disabled={isLoading}
          autoComplete="email"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="Your password"
          {...register('password')}
          disabled={isLoading}
          autoComplete="current-password"
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      
      {error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-sm">
          {error}
        </div>
      )}
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}
```

### 4. Auth Pages

#### Web - `apps/web/src/app/login/page.tsx`
```typescript
import Link from 'next/link'
import { SignInForm } from '@/components/sign-in-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-display">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your Exhibit account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/signup" className="text-foreground hover:underline">
              Create one
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### Native - `apps/native/components/sign-in.tsx`
```typescript
import { useState } from 'react'
import { View, Text, TextInput, Pressable, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { signIn } from '@/lib/auth-client'

export function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    
    setIsLoading(true)
    
    try {
      await signIn(email, password)
      router.replace('/(drawer)/(tabs)')
    } catch (error) {
      Alert.alert(
        'Sign In Failed',
        error instanceof Error ? error.message : 'Please try again'
      )
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <View className="flex-1 p-6 justify-center bg-background">
      <Text className="font-display text-3xl mb-8 text-foreground">
        Welcome back
      </Text>
      
      <View className="space-y-4">
        <View>
          <Text className="font-body-medium text-sm mb-2 text-foreground">
            Email
          </Text>
          <TextInput
            className="border border-input bg-background px-3.5 py-2.5 rounded-sm text-foreground"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>
        
        <View>
          <Text className="font-body-medium text-sm mb-2 text-foreground">
            Password
          </Text>
          <TextInput
            className="border border-input bg-background px-3.5 py-2.5 rounded-sm text-foreground"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>
        
        <Pressable
          className="bg-primary h-11 items-center justify-center rounded-sm mt-6"
          onPress={handleSignIn}
          disabled={isLoading}
        >
          <Text className="font-body-medium text-primary-foreground">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
```

---

## Verification Badge System

### Backend - Verification Request

#### `apps/server/src/routes/verification.ts`
```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '@repo/db'
import { requireAuth } from '../middleware/auth'

const verificationRouter = new Hono()

// Submit verification request
const submitSchema = z.object({
  portfolioUrl: z.string().url().optional(),
  statement: z.string().min(50, 'Statement must be at least 50 characters'),
})

verificationRouter.post(
  '/request',
  requireAuth,
  zValidator('json', submitSchema),
  async (c) => {
    const userId = c.get('userId')
    const { portfolioUrl, statement } = c.req.valid('json')
    
    // Check if user is an artist
    const user = await db.user.findUnique({
      where: { id: userId },
    })
    
    if (!user?.isArtist) {
      return c.json({ error: 'Only artists can request verification' }, 400)
    }
    
    // Check for existing pending request
    const existing = await db.verificationRequest.findFirst({
      where: {
        userId,
        status: 'pending',
      },
    })
    
    if (existing) {
      return c.json({ error: 'You already have a pending request' }, 400)
    }
    
    // Create request
    const request = await db.verificationRequest.create({
      data: {
        userId,
        portfolioUrl,
        statement,
        status: 'pending',
      },
    })
    
    return c.json({ success: true, request })
  }
)

// Get verification status
verificationRouter.get('/status', requireAuth, async (c) => {
  const userId = c.get('userId')
  
  const request = await db.verificationRequest.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  
  return c.json({ request })
})

export { verificationRouter }
```

---

## Session Management

### Middleware - Auth Protection

#### `apps/server/src/middleware/auth.ts`
```typescript
import { createMiddleware } from 'hono/factory'
import { auth } from '@repo/auth'

export const requireAuth = createMiddleware(async (c, next) => {
  const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (!sessionToken) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const session = await auth.validateSession(sessionToken)
  
  if (!session) {
    return c.json({ error: 'Invalid session' }, 401)
  }
  
  c.set('userId', session.userId)
  c.set('session', session)
  
  await next()
})

export const optionalAuth = createMiddleware(async (c, next) => {
  const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (sessionToken) {
    const session = await auth.validateSession(sessionToken)
    if (session) {
      c.set('userId', session.userId)
      c.set('session', session)
    }
  }
  
  await next()
})
```

### Frontend - Session Provider

#### Web - `apps/web/src/components/providers.tsx`
```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'

type User = {
  id: string
  email: string
  name: string
  image?: string
  isArtist: boolean
  isVerified: boolean
} | null

type AuthContext = {
  user: User
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContext | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Check for existing session
    authClient.getUser().then((user) => {
      setUser(user)
      setIsLoading(false)
    })
  }, [])
  
  const signOut = async () => {
    await authClient.signOut()
    setUser(null)
  }
  
  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

---

## Implementation Checklist

### Phase 1: Backend Setup
- [ ] Install Better Auth and dependencies
- [ ] Create Prisma schema for auth tables
- [ ] Run database migration
- [ ] Implement password hashing utilities
- [ ] Set up Better Auth configuration
- [ ] Create auth API routes (signup, signin, signout)

### Phase 2: Frontend Setup
- [ ] Install auth client dependencies
- [ ] Create auth client configuration
- [ ] Build sign-up form component
- [ ] Build sign-in form component
- [ ] Create auth pages (web)
- [ ] Create auth screens (native)
- [ ] Set up session provider

### Phase 3: Session Management
- [ ] Implement auth middleware
- [ ] Create protected route guards
- [ ] Set up token refresh logic
- [ ] Add session persistence (cookies/secure storage)
- [ ] Handle session expiration

### Phase 4: Verification System
- [ ] Create verification request model
- [ ] Build verification request form
- [ ] Create admin review interface
- [ ] Implement badge display logic
- [ ] Set up email notifications

### Phase 5: Testing & Security
- [ ] Test password validation
- [ ] Test session expiration
- [ ] Verify CSRF protection
- [ ] Rate limit auth endpoints
- [ ] Test on both web and native

---

## Git Commit Strategy

### Example Commit Flow
```bash
# 1. Password utilities
git add packages/auth/src/lib/passwords.ts
git commit -m "feat(auth): add password hashing and validation utilities"

# 2. Database schema
git add packages/db/prisma/schema/auth.prisma
git commit -m "feat(db): add auth schema for users, accounts, and sessions"

# 3. Backend auth routes
git add apps/server/src/routes/auth.ts
git commit -m "feat(server): implement signup and signin endpoints"

# 4. Web sign-up form
git add apps/web/src/components/sign-up-form.tsx apps/web/src/app/signup/page.tsx
git commit -m "feat(web): add sign-up form and page"

# 5. Web sign-in form
git add apps/web/src/components/sign-in-form.tsx apps/web/src/app/login/page.tsx
git commit -m "feat(web): add sign-in form and page"

# 6. Session management
git add apps/web/src/components/providers.tsx apps/server/src/middleware/auth.ts
git commit -m "feat(auth): add session management and auth middleware"
```

---

## Next Steps

1. **Email verification**: Send verification emails on signup
2. **Password reset**: Implement forgot password flow
3. **Social login**: Add Google OAuth (optional)
4. **Two-factor auth**: Add 2FA for security (future)
5. **Session analytics**: Track login patterns and security events

---

**Security Reminders**:
- Never log passwords
- Always use HTTPS in production
- Set secure cookie flags
- Implement rate limiting
- Hash passwords with bcrypt (12+ rounds)
- Validate all inputs
- Use CSRF tokens
