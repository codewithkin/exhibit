# UI/UX Implementation Guide - Exhibit

## Overview
This guide translates the design system into concrete implementation steps for web (Next.js), native (Expo), and shared components. Focus on building a cohesive, elegant interface that prioritizes artwork presentation.

---

## Technology Stack

### Web (Next.js App Router)
```typescript
// Core
- Next.js 14+ (App Router)
- React 18+
- TypeScript 5+

// Styling
- Tailwind CSS 3.4+
- shadcn/ui components
- CSS Modules (when needed)

// State & Data
- React Query (TanStack Query)
- Zustand (client state)
- Server Components (default)

// Forms
- React Hook Form
- Zod validation
```

### Native (Expo React Native)
```typescript
// Core
- Expo SDK 50+
- React Native
- TypeScript 5+

// Styling
- NativeWind (Tailwind for RN)
- React Native Reanimated 3
- Expo Linear Gradient

// Navigation
- Expo Router (file-based)
- React Navigation 6

// Forms
- React Hook Form
- Zod validation
```

### Shared Packages
```typescript
// packages/ui/
- Shared design tokens
- Utility functions
- Type definitions
- Validation schemas (Zod)
```

---

## Setup Instructions

### 1. Install Design Dependencies

#### Web
```bash
# In apps/web
cd apps/web

# Install Tailwind & shadcn
pnpm add -D tailwindcss postcss autoprefixer
pnpm add tailwindcss-animate class-variance-authority clsx tailwind-merge

# Install shadcn CLI
pnpm add -D @shadcn/ui

# Install fonts
pnpm add next/font

# Install icons
pnpm add lucide-react

# Install UI primitives
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-slot
```

#### Native
```bash
# In apps/native
cd apps/native

# Install NativeWind
pnpm add nativewind
pnpm add -D tailwindcss

# Install animations
pnpm add react-native-reanimated react-native-gesture-handler

# Install icons
pnpm add lucide-react-native

# Install UI components
pnpm add @shopify/restyle
```

### 2. Configure Tailwind

#### Web - `apps/web/tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
      fontFamily: {
        display: ['var(--font-crimson)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.25rem',
        sm: '0.125rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '1440px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

#### Native - `apps/native/tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // Match web config
      colors: {
        // Same color tokens as web
      },
      fontFamily: {
        display: ['CrimsonPro-Regular'],
        'display-medium': ['CrimsonPro-Medium'],
        'display-semibold': ['CrimsonPro-SemiBold'],
        body: ['Inter-Regular'],
        'body-medium': ['Inter-Medium'],
        'body-semibold': ['Inter-SemiBold'],
      },
    },
  },
  plugins: [],
}
```

### 3. Set Up CSS Variables

#### Web - `apps/web/src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light mode */
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --ring: 0 0% 3.9%;
    --radius: 0.25rem;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --ring: 0 0% 83.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

### 4. Configure Fonts

#### Web - `apps/web/src/app/layout.tsx`
```typescript
import { Inter, Crimson_Pro } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${crimsonPro.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  )
}
```

#### Native - `apps/native/app/_layout.tsx`
```typescript
import { useFonts } from 'expo-font'
import { SplashScreen } from 'expo-router'

// Prevent auto-hide before fonts load
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'CrimsonPro-Regular': require('../assets/fonts/CrimsonPro-Regular.ttf'),
    'CrimsonPro-Medium': require('../assets/fonts/CrimsonPro-Medium.ttf'),
    'CrimsonPro-SemiBold': require('../assets/fonts/CrimsonPro-SemiBold.ttf'),
  })

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync()
    }
  }, [loaded, error])

  if (!loaded && !error) {
    return null
  }

  return (
    <Stack>
      {/* Routes */}
    </Stack>
  )
}
```

---

## Core Component Implementation

### Button Component

#### Web - `apps/web/src/components/ui/button.tsx`
```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "border border-foreground bg-transparent hover:bg-muted",
        ghost: "hover:bg-muted",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-12 px-8 py-3",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

#### Native - `apps/native/components/ui/button.tsx`
```typescript
import { Pressable, Text, View } from 'react-native'
import { styled } from 'nativewind'
import type { ComponentProps } from 'react'

const StyledPressable = styled(Pressable)
const StyledText = styled(Text)

interface ButtonProps extends ComponentProps<typeof Pressable> {
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
  children: React.ReactNode
}

export function Button({ 
  variant = 'default', 
  size = 'default',
  children,
  className,
  ...props 
}: ButtonProps) {
  const baseClasses = 'items-center justify-center rounded-sm'
  
  const variantClasses = {
    default: 'bg-primary',
    secondary: 'bg-transparent border border-foreground',
    ghost: 'bg-transparent',
    destructive: 'bg-destructive',
  }
  
  const sizeClasses = {
    default: 'h-11 px-6 py-3',
    sm: 'h-9 px-4 py-2',
    lg: 'h-12 px-8 py-3',
  }

  const textColorClasses = {
    default: 'text-primary-foreground',
    secondary: 'text-foreground',
    ghost: 'text-foreground',
    destructive: 'text-destructive-foreground',
  }

  return (
    <StyledPressable
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <StyledText className={`font-body-medium text-sm ${textColorClasses[variant]}`}>
        {children}
      </StyledText>
    </StyledPressable>
  )
}
```

### Card Component

#### Web - `apps/web/src/components/ui/card.tsx`
```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-card text-card-foreground border border-border",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-display text-xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

### Input Component

#### Web - `apps/web/src/components/ui/input.tsx`
```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full border border-input bg-background px-3.5 py-2.5 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 rounded-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

---

## Layout Components

### Navigation Header

#### Web - `apps/web/src/components/header.tsx`
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { UserMenu } from '@/components/user-menu'
import { Search, Upload } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-8xl mx-auto px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-display text-2xl font-semibold">Exhibit</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Button variant="ghost" asChild>
            <Link href="/discover">Discover</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/exhibitions">Exhibitions</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/artists">Artists</Link>
          </Button>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="default" asChild>
            <Link href="/upload">
              <Upload className="h-4 w-4 mr-2" />
              Share Work
            </Link>
          </Button>

          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
```

### Artwork Grid

#### Web - `apps/web/src/components/artwork-grid.tsx`
```typescript
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import type { Artwork } from '@/types'

interface ArtworkGridProps {
  artworks: Artwork[]
  columns?: 2 | 3 | 4
}

export function ArtworkGrid({ artworks, columns = 3 }: ArtworkGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }

  return (
    <div className={`grid grid-cols-1 ${gridCols[columns]} gap-8`}>
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  )
}

function ArtworkCard({ artwork }: { artwork: Artwork }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link href={`/artwork/${artwork.id}`}>
      <Card
        className="group overflow-hidden transition-all hover:border-foreground/20 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <div className="relative aspect-square bg-muted">
          <Image
            src={artwork.imageUrl}
            alt={`${artwork.title} by ${artwork.artist.name}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Metadata */}
        <div className="p-4 space-y-1">
          <h3 className="font-display text-lg font-medium line-clamp-1">
            {artwork.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {artwork.artist.name}
          </p>
          {artwork.forSale && artwork.price && (
            <p className="text-sm font-medium">
              ${artwork.price.toLocaleString()}
            </p>
          )}
        </div>
      </Card>
    </Link>
  )
}
```

### Full-Bleed Artwork Viewer

#### Web - `apps/web/src/components/artwork-viewer.tsx`
```typescript
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ZoomIn, ZoomOut, Heart, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ArtworkViewerProps {
  artwork: {
    id: string
    title: string
    imageUrl: string
    artist: { name: string }
    year?: number
    medium?: string
    dimensions?: string
  }
  onClose: () => void
}

export function ArtworkViewer({ artwork, onClose }: ArtworkViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [showUI, setShowUI] = useState(true)

  return (
    <div 
      className="fixed inset-0 z-50 bg-background"
      onMouseMove={() => setShowUI(true)}
    >
      {/* Close Button */}
      <div
        className={cn(
          "absolute top-6 right-6 z-10 transition-opacity duration-300",
          !showUI && "opacity-0"
        )}
      >
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Artwork */}
      <div className="flex items-center justify-center h-full p-12">
        <div 
          className="relative max-w-full max-h-full"
          style={{ transform: `scale(${zoom})` }}
        >
          <Image
            src={artwork.imageUrl}
            alt={`${artwork.title} by ${artwork.artist.name}`}
            width={2400}
            height={2400}
            className="max-w-full max-h-[85vh] object-contain"
            priority
          />
        </div>
      </div>

      {/* Bottom UI */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-6 transition-opacity duration-300",
          !showUI && "opacity-0"
        )}
      >
        <div className="max-w-4xl mx-auto flex items-end justify-between">
          {/* Artwork Info */}
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-semibold">
              {artwork.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {artwork.artist.name}
              {artwork.year && ` • ${artwork.year}`}
            </p>
            {artwork.medium && (
              <p className="text-sm text-muted-foreground font-mono">
                {artwork.medium}
                {artwork.dimensions && ` • ${artwork.dimensions}`}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(3, zoom + 0.25))}>
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## Responsive Patterns

### Mobile Navigation

#### Web - `apps/web/src/components/mobile-nav.tsx`
```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu */}
      <nav
        className={cn(
          "fixed top-16 left-0 right-0 bg-background border-b z-50 transition-transform duration-200",
          isOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="container py-6 space-y-4">
          <Link
            href="/discover"
            className="block py-2 text-lg"
            onClick={() => setIsOpen(false)}
          >
            Discover
          </Link>
          <Link
            href="/exhibitions"
            className="block py-2 text-lg"
            onClick={() => setIsOpen(false)}
          >
            Exhibitions
          </Link>
          <Link
            href="/artists"
            className="block py-2 text-lg"
            onClick={() => setIsOpen(false)}
          >
            Artists
          </Link>
          <div className="pt-4">
            <Button className="w-full" asChild>
              <Link href="/upload">Share Your Work</Link>
            </Button>
          </div>
        </div>
      </nav>
    </div>
  )
}
```

---

## Image Optimization

### Next.js Image Component Setup

#### `apps/web/next.config.ts`
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['your-cdn.com', 'your-storage.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

export default nextConfig
```

### Progressive Image Loading

#### `apps/web/src/components/progressive-image.tsx`
```typescript
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProgressiveImageProps {
  src: string
  alt: string
  blurDataURL?: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
}

export function ProgressiveImage({
  src,
  alt,
  blurDataURL,
  className,
  ...props
}: ProgressiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <Image
      src={src}
      alt={alt}
      placeholder={blurDataURL ? 'blur' : 'empty'}
      blurDataURL={blurDataURL}
      className={cn(
        'transition-opacity duration-300',
        isLoading ? 'opacity-0' : 'opacity-100',
        className
      )}
      onLoadingComplete={() => setIsLoading(false)}
      {...props}
    />
  )
}
```

---

## Animation Utilities

### Fade-In Components

#### `apps/web/src/components/animations/fade-in.tsx`
```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={cn(
        'transition-opacity duration-500',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      {children}
    </div>
  )
}
```

---

## Skeleton Loading States

#### `apps/web/src/components/ui/skeleton.tsx`
```typescript
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
```

#### Usage Example
```typescript
// Artwork grid loading
export function ArtworkGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Install and configure Tailwind CSS (web + native)
- [ ] Set up CSS variables and design tokens
- [ ] Configure fonts (Google Fonts for web, local for native)
- [ ] Install shadcn/ui components
- [ ] Set up dark mode toggle
- [ ] Create utility functions (cn, etc.)

### Phase 2: Core Components
- [ ] Button component (all variants)
- [ ] Card component
- [ ] Input/Textarea components
- [ ] Dialog/Modal component
- [ ] Dropdown menu component
- [ ] Navigation header
- [ ] Mobile navigation

### Phase 3: Artwork Components
- [ ] Artwork card component
- [ ] Artwork grid (masonry layout)
- [ ] Full-bleed viewer
- [ ] Progressive image loading
- [ ] Zoom/pan functionality
- [ ] Image optimization config

### Phase 4: Layout & Pages
- [ ] Homepage layout
- [ ] Artist profile layout
- [ ] Exhibition page layout
- [ ] Responsive breakpoints
- [ ] Skeleton loading states
- [ ] Empty states

### Phase 5: Polish
- [ ] Fade-in animations
- [ ] Hover transitions
- [ ] Focus states (accessibility)
- [ ] Loading indicators
- [ ] Toast notifications
- [ ] Error boundaries

---

## Next Steps

1. **Create shared UI package**: Extract common components to `packages/ui`
2. **Build pattern library**: Document component usage in Storybook
3. **Accessibility audit**: Test with screen readers and keyboard navigation
4. **Performance testing**: Lighthouse scores, image optimization
5. **Responsive testing**: Test on actual devices (iOS, Android, various screens)
6. **Dark mode refinement**: Test artwork visibility in both modes

---

**Remember**: Every component should be built with the artwork in mind. If it competes for attention, simplify it further.
