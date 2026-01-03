# Branding & Design System Guide - Exhibit

## Overview
Exhibit's visual identity must communicate sophistication, elegance, and respect for artists' work. The design system prioritizes content over chrome, with a minimal color palette that lets artwork shine.

---

## Brand Identity

### Core Values
- **Artist-First**: Every design decision prioritizes the creator's work
- **Timeless Elegance**: Avoid trends; build something that ages well
- **Intentional Minimalism**: Remove everything that doesn't serve the art
- **Professional Quality**: Gallery-level presentation standards

### Brand Personality
- Sophisticated but approachable
- Quiet confidence, not loud branding
- Respectful of artistic expression
- Community-focused without being casual

---

## Color System

### Primary Palette
```typescript
// Near-monochromatic base
--background: 0 0% 100%          // Pure white
--foreground: 0 0% 3.9%          // Near black
--muted: 0 0% 96.1%              // Subtle gray backgrounds
--muted-foreground: 0 0% 45.1%   // Secondary text

// Dark mode
--background-dark: 0 0% 3.9%
--foreground-dark: 0 0% 98%
--muted-dark: 0 0% 14.9%
--muted-foreground-dark: 0 0% 63.9%
```

### Accent Colors (Use Sparingly)
```typescript
// Single accent for critical actions
--accent: 0 0% 9%                // Near-black accent
--accent-foreground: 0 0% 98%    // White on accent

// Optional: Subtle warm accent for emphasis
--warm-accent: 24 6% 10%         // Very subtle warm gray
```

### Semantic Colors
```typescript
// Success (sales, approvals)
--success: 142 76% 36%           // Muted green
--success-foreground: 0 0% 98%

// Warning (pending, review)
--warning: 38 92% 50%            // Amber
--warning-foreground: 0 0% 9%

// Destructive (delete, reject)
--destructive: 0 84% 60%         // Muted red
--destructive-foreground: 0 0% 98%
```

### Color Usage Rules
1. **Default to monochrome**: 95% of UI should use grayscale
2. **Accent only for CTAs**: Primary buttons, critical actions
3. **Let artwork provide color**: The gallery is the color
4. **Semantic colors**: Only for their specific purposes
5. **Avoid gradients**: Stick to solid colors

---

## Typography

### Font Stack
```typescript
// Display & Headings
--font-display: "Crimson Pro", "Georgia", serif
// Elegant, classical serif for titles and artist names

// Body Text
--font-body: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
// Clean, highly readable sans-serif for UI and descriptions

// Monospace (metadata, dimensions)
--font-mono: "JetBrains Mono", "SF Mono", monospace
```

### Type Scale
```typescript
// Display sizes
--text-display-xl: 3.5rem      // 56px - Exhibition titles
--text-display-lg: 2.25rem     // 36px - Page headings
--text-display-md: 1.875rem    // 30px - Section headers

// Content sizes
--text-xl: 1.25rem             // 20px - Large emphasis
--text-lg: 1.125rem            // 18px - Artwork titles
--text-base: 1rem              // 16px - Body text
--text-sm: 0.875rem            // 14px - Metadata, captions
--text-xs: 0.75rem             // 12px - Labels, tags
```

### Typography Rules
1. **Generous line height**: 1.6 for body, 1.2 for headings
2. **Wide measure**: 65-75 characters for reading comfort
3. **Ample whitespace**: Double spacing between sections
4. **Weight variation**: Use font weight (not color) for hierarchy
5. **Optical sizing**: Adjust letter-spacing for large display text

---

## Spacing System

### Base Unit: 4px
```typescript
// Spacing scale (rem values)
--space-1: 0.25rem    // 4px
--space-2: 0.5rem     // 8px
--space-3: 0.75rem    // 12px
--space-4: 1rem       // 16px
--space-5: 1.25rem    // 20px
--space-6: 1.5rem     // 24px
--space-8: 2rem       // 32px
--space-10: 2.5rem    // 40px
--space-12: 3rem      // 48px
--space-16: 4rem      // 64px
--space-20: 5rem      // 80px
--space-24: 6rem      // 96px
```

### Layout Spacing Rules
1. **Consistent margins**: Use 16px, 24px, 32px, 64px
2. **Breathing room**: Minimum 64px around featured artwork
3. **Section separation**: 80-96px between major sections
4. **Card padding**: 24px minimum for content cards
5. **Touch targets**: Minimum 44x44px for interactive elements

---

## Components

### Buttons
```typescript
// Primary (rare use - only for critical actions)
- Background: --accent
- Padding: 12px 24px
- Border-radius: 2px (minimal)
- Font: --font-body, 14px, 500 weight
- Hover: Subtle opacity change (0.9)

// Secondary (most common)
- Background: transparent
- Border: 1px solid --foreground
- Padding: 12px 24px
- Hover: Background --muted

// Ghost (navigation, tertiary actions)
- Background: transparent
- No border
- Padding: 8px 16px
- Hover: Background --muted
```

### Cards
```typescript
// Artwork card
- Background: --background
- Border: 1px solid --muted
- Border-radius: 0px (sharp corners)
- Padding: 0 (image full-bleed)
- Shadow: none (avoid depth)
- Hover: Subtle border color shift

// Info card
- Background: --muted
- No border
- Padding: 24px
- Sharp corners
```

### Inputs
```typescript
// Text input
- Background: --background
- Border: 1px solid --muted-foreground
- Border-radius: 2px
- Padding: 10px 14px
- Focus: Border --foreground, no shadow
- Font: --font-body, 16px

// Textarea
- Same as input
- Min-height: 120px
- Resize: vertical only
```

### Navigation
```typescript
// Header
- Height: 64px
- Background: --background
- Border-bottom: 1px solid --muted
- Logo: Wordmark only, left-aligned
- Links: Ghost buttons, right-aligned

// Sidebar (artist/curator tools)
- Width: 240px
- Background: --muted
- No border
- Fixed positioning
```

---

## Layout Principles

### Grid System
```typescript
// Desktop (1440px standard)
- Max-width: 1440px
- Columns: 12
- Gutter: 24px
- Margin: 80px

// Tablet (768px)
- Max-width: 768px
- Columns: 8
- Gutter: 20px
- Margin: 40px

// Mobile (375px)
- Max-width: 100%
- Columns: 4
- Gutter: 16px
- Margin: 20px
```

### Artwork Presentation Layouts

#### Full-Bleed Viewer
```
- 100vw x 100vh viewport
- Artwork centered and scaled to fit
- Max 90vh height to allow for metadata
- Background: --background
- UI overlays minimal, auto-hide on idle
```

#### Grid Gallery
```
- Masonry layout (Tailwind CSS or custom)
- Variable heights based on artwork aspect ratio
- Fixed width columns (3 cols desktop, 2 tablet, 1 mobile)
- Gap: 32px desktop, 24px tablet, 16px mobile
```

#### Portfolio View
```
- Pinned works: 2x2 grid at top (large)
- Chronological works: 3-column grid below
- Maintain aspect ratios
- Lazy loading after 12 items
```

---

## Iconography

### Icon System
- **Library**: Lucide React (clean, minimal, consistent)
- **Size**: 20px default, 24px for emphasis, 16px for inline
- **Stroke**: 1.5px (matches Inter's weight)
- **Color**: Always --foreground or --muted-foreground
- **Usage**: Sparingly - prefer text labels

### Essential Icons
```typescript
- Upload (upload cloud)
- Search (search)
- Menu (menu/hamburger)
- User (user circle)
- Heart (heart for favorites)
- Comment (message square)
- Share (share)
- More (more horizontal)
- Close (x)
- Check (check)
- Arrow (arrow right/left)
- Plus (plus)
- Edit (edit/pencil)
- Settings (settings/gear)
```

---

## Animation & Motion

### Principles
1. **Subtle over showy**: Avoid drawing attention away from art
2. **Fast transitions**: 150-250ms max
3. **Easing**: Ease-out for entrances, ease-in for exits
4. **Purpose-driven**: Only animate state changes

### Transition Speeds
```typescript
--transition-fast: 150ms
--transition-base: 200ms
--transition-slow: 300ms
```

### Animation Guidelines
```typescript
// Page transitions
- Fade in: 200ms ease-out
- No sliding or complex animations

// Hover states
- Opacity/color: 150ms ease-out
- Transform: 200ms ease-out (minimal scale, e.g., 1.02)

// Modals/dialogs
- Backdrop: Fade 200ms
- Content: Fade + subtle scale (0.95 → 1) 250ms

// Loading states
- Skeleton screens (no spinners unless necessary)
- Subtle pulse animation
- Progress bars: Linear, no bouncing
```

---

## Image Handling

### Upload Specifications
```typescript
// Max file size: 50MB
// Formats: JPEG, PNG, WebP, TIFF
// Max dimensions: 8000x8000px
// Preserve EXIF data (optional display)
```

### Display Optimization
```typescript
// Thumbnail: 400x400px (1:1 crop for grid)
// Medium: 1200px wide (maintains aspect)
// Full: 2400px wide (high-res display)
// Original: Stored for purchases/downloads

// Image loading
- Progressive JPEGs
- Blur-up placeholders (20px preview)
- Lazy loading below fold
- WebP with JPEG fallback
```

### Aspect Ratio Handling
```typescript
// Preserve original aspect ratios
// Support: 1:1, 4:5, 3:4, 2:3, 16:9, 21:9
// Use object-fit: contain (never crop in viewer)
// Grid thumbnails: object-fit: cover with fixed ratio
```

---

## Accessibility

### WCAG 2.1 AA Compliance
```typescript
// Color contrast
- Body text: Minimum 7:1 (AAA)
- Large text: Minimum 4.5:1
- Interactive elements: 3:1 against background

// Focus indicators
- 2px solid --accent outline
- 2px offset from element
- Never remove :focus styles

// Touch targets
- Minimum 44x44px
- 8px spacing between targets

// Text sizing
- Support 200% zoom
- Relative units (rem/em) only
- Min font-size: 14px (0.875rem)
```

### Semantic HTML
```typescript
// Proper heading hierarchy (h1 → h2 → h3)
// Landmarks (<nav>, <main>, <aside>, <footer>)
// ARIA labels for icon buttons
// Alt text mandatory for artwork (title + artist)
// Form labels properly associated
```

---

## Dark Mode

### Strategy
```typescript
// System preference detection
- prefers-color-scheme media query
- User override persisted to localStorage
- Smooth transition between modes (200ms)

// Color adjustments
- Invert background/foreground
- Reduce contrast slightly (90% vs 100%)
- Artwork backgrounds: Always pure black (#000)
- Reduce image brightness by 5% in dark mode
```

### Implementation (Tailwind + shadcn)
```typescript
// Use CSS variables for all colors
// Tailwind dark: variant for overrides
// Store preference in user settings
```

---

## Responsive Breakpoints

```typescript
// Mobile first approach
sm: '640px'    // Large phone
md: '768px'    // Tablet
lg: '1024px'   // Desktop
xl: '1280px'   // Large desktop
2xl: '1440px'  // Max content width
```

### Responsive Rules
1. **Single column mobile**: No complex layouts under 640px
2. **Touch-friendly**: Larger tap targets on mobile (48px)
3. **Simplified navigation**: Hamburger menu below 768px
4. **Image optimization**: Serve smaller images on mobile
5. **Typography scale**: Reduce display sizes by 25% on mobile

---

## Component Library Setup

### Technology Stack
```typescript
// Base: Tailwind CSS v3+
// Components: shadcn/ui (Radix primitives)
// Icons: Lucide React
// Fonts: Google Fonts (Crimson Pro + Inter)
```

### File Structure
```
packages/ui/
  ├── components/
  │   ├── button.tsx
  │   ├── card.tsx
  │   ├── input.tsx
  │   ├── dialog.tsx
  │   └── ...
  ├── lib/
  │   └── utils.ts
  ├── styles/
  │   ├── globals.css
  │   └── tokens.css
  └── index.ts
```

### Design Tokens (CSS Variables)
```css
/* tokens.css */
:root {
  /* Colors */
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  
  /* Typography */
  --font-display: 'Crimson Pro', serif;
  --font-body: 'Inter', sans-serif;
  
  /* Spacing */
  --space-unit: 0.25rem;
  
  /* Transitions */
  --transition-fast: 150ms;
}
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Install Tailwind CSS + shadcn/ui
- [ ] Configure design tokens (CSS variables)
- [ ] Set up font loading (Google Fonts)
- [ ] Create base component primitives (Button, Card, Input)
- [ ] Implement dark mode toggle
- [ ] Set up responsive grid system

### Phase 2: Core Components
- [ ] Navigation header component
- [ ] Artwork card component
- [ ] Gallery grid layouts (masonry, standard)
- [ ] Full-bleed artwork viewer
- [ ] Modal/dialog system
- [ ] Form components (with validation states)

### Phase 3: Polish
- [ ] Animation utilities
- [ ] Loading states (skeletons)
- [ ] Toast notifications
- [ ] Accessibility audit
- [ ] Performance optimization (code splitting)
- [ ] Storybook documentation (optional)

---

## Brand Voice & Messaging

### Tone Guidelines
- **Professional but warm**: "Welcome to Exhibit" not "Hey there!"
- **Direct and clear**: No jargon or overly clever copy
- **Empowering**: "Showcase your work" not "Upload files"
- **Respectful**: Always "artist" or "creator", never "user"

### Microcopy Examples
```typescript
// Upload flow
"Share your work" (not "Upload image")
"Add details" (not "Enter metadata")
"Publish to gallery" (not "Submit")

// Errors
"We couldn't process that image. Please try a different file."
(not "Error 500: Processing failed")

// Success
"Your work is now live on Exhibit."
(not "Upload successful!")

// Empty states
"Your collection is waiting for its first piece."
(not "No items found")
```

---

## Next Steps

1. **Review with stakeholders**: Confirm brand direction
2. **Create mood board**: Collect visual references (galleries, museums)
3. **Design key screens**: Homepage, artwork view, artist profile
4. **Build component library**: Implement in shared package
5. **Create pattern library**: Document usage in Storybook/Markdown
6. **Accessibility audit**: Test with screen readers and keyboard nav

---

## References & Inspiration

### Visual References
- **Museum websites**: MoMA, Guggenheim, Tate Modern (clean, content-focused)
- **Portfolio platforms**: Cargo Collective (minimal chrome), Format (elegant grids)
- **Art marketplaces**: Artsy (sophisticated UI), Saatchi Art (gallery feel)

### Design Systems
- **Apple Human Interface**: Clarity and restraint
- **Material Design**: Elevation and hierarchy (use sparingly)
- **Radix Primitives**: Accessible component patterns

### Anti-patterns to Avoid
- ❌ Social media aesthetics (Instagram, Pinterest clones)
- ❌ Busy dashboards with overwhelming data
- ❌ Gamification (badges, points, streaks)
- ❌ Infinite scroll without purpose
- ❌ Auto-playing videos or animations
- ❌ Intrusive notifications or pop-ups

---

**Remember**: The design system serves the artwork, not the other way around. When in doubt, remove rather than add.
