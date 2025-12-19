# 🎯 SEO Implementation Plan - GPUAlpha

## Overview

This document outlines the plan to add comprehensive SEO metadata to all GPUAlpha pages.

---

## Implementation Strategy

### Option 1: Root Layout Metadata (Quick Fix)
Add default metadata to `app/layout.tsx` that applies to all pages.

### Option 2: Per-Page Metadata (Recommended)
Create metadata exports for each page using Next.js 14 metadata API.

### Option 3: Hybrid Approach (Best)
- Default metadata in root layout
- Page-specific metadata overrides
- Dynamic metadata for dynamic routes

---

## Step-by-Step Implementation

### Step 1: Update Root Layout (`app/layout.tsx`)

Add default metadata:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'GPUAlpha - GPU Compute Price Index',
    template: '%s | GPUAlpha'
  },
  description: 'Track real-time GPU compute prices, market trends, and price indices. Comprehensive data on NVIDIA, AMD GPUs, spot prices, and compute availability.',
  keywords: ['GPU prices', 'compute index', 'GPU market', 'NVIDIA prices', 'AMD prices', 'GPU spot prices', 'GPU analytics'],
  authors: [{ name: 'GPUAlpha' }],
  creator: 'GPUAlpha',
  publisher: 'GPUAlpha',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gpualpha.com',
    siteName: 'GPUAlpha',
    title: 'GPUAlpha - GPU Compute Price Index',
    description: 'Track real-time GPU compute prices, market trends, and price indices.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GPUAlpha - GPU Compute Price Index'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GPUAlpha - GPU Compute Price Index',
    description: 'Track real-time GPU compute prices, market trends, and price indices.',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}
```

### Step 2: Add Page-Specific Metadata

For each page, create a metadata export. Since pages are client components, we need to either:

**Option A**: Create separate `layout.tsx` files for each route with metadata
**Option B**: Convert pages to server components with metadata exports
**Option C**: Use `generateMetadata` function in layout files

---

## Recommended Metadata for Each Page

### 1. Homepage (`app/page.tsx`)

Create `app/layout.tsx` (if not exists) or update root layout:

```typescript
// app/page.tsx - Convert to server component OR create app/page/layout.tsx
export const metadata: Metadata = {
  title: 'GPU Compute Price Index',
  description: 'Track real-time GPU compute prices, market trends, and price indices. Get comprehensive data on NVIDIA, AMD GPUs, spot prices, and compute availability.',
  openGraph: {
    title: 'GPU Compute Price Index | GPUAlpha',
    description: 'Track real-time GPU compute prices, market trends, and price indices.',
    url: 'https://gpualpha.com'
  }
}
```

### 2. Overview (`app/overview/page.tsx`)

Create `app/overview/layout.tsx`:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Overview - GPU Compute Price Index Platform',
  description: 'Comprehensive GPU compute price indexing platform. Track trends, spot prices, chip availability, and market insights for financial institutions, cloud providers, and AI companies.',
  openGraph: {
    title: 'GPU Compute Price Index Overview | GPUAlpha Platform',
    description: 'Comprehensive GPU compute price indexing platform.',
    url: 'https://gpualpha.com/overview'
  }
}
```

### 3. Info (`app/info/page.tsx`)

Create `app/info/layout.tsx`:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GPU Specifications & Information',
  description: 'Comprehensive GPU information database. Detailed specs, features, release dates, and use cases for NVIDIA and AMD graphics cards. Find the perfect GPU for your needs.',
  openGraph: {
    title: 'GPU Specifications & Information | GPUAlpha',
    description: 'Comprehensive GPU information database with detailed specs and features.',
    url: 'https://gpualpha.com/info'
  }
}
```

### 4. History (`app/history/page.tsx`)

Create `app/history/layout.tsx`:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GPU Price History & Charts',
  description: 'View historical GPU price data with interactive charts. Track price trends over 7 days, 30 days, 90 days, or all-time. Analyze volatility and price movements.',
  openGraph: {
    title: 'GPU Price History & Charts | GPUAlpha',
    description: 'View historical GPU price data with interactive charts.',
    url: 'https://gpualpha.com/history'
  }
}
```

### 5. Analytics (`app/analytics/page.tsx`)

Create `app/analytics/layout.tsx`:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GPU Market Analytics & Insights',
  description: 'Advanced GPU market analytics and insights. Index performance, brand distribution, price analysis, volatility metrics, and market trends for informed decision-making.',
  openGraph: {
    title: 'GPU Market Analytics & Insights | GPUAlpha',
    description: 'Advanced GPU market analytics and insights.',
    url: 'https://gpualpha.com/analytics'
  }
}
```

### 6. Leaderboard (`app/leaderboard/page.tsx`)

Create `app/leaderboard/layout.tsx`:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GPU Price Prediction Leaderboard',
  description: 'See top GPU price predictors ranked by accuracy, points, and prediction streaks. Compete with the community to predict GPU price movements.',
  openGraph: {
    title: 'GPU Price Prediction Leaderboard | GPUAlpha',
    description: 'See top GPU price predictors ranked by accuracy and points.',
    url: 'https://gpualpha.com/leaderboard'
  }
}
```

### 7. Predictions (`app/predictions/page.tsx`)

Create `app/predictions/layout.tsx`:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GPU Price Predictions',
  description: 'Make and track GPU price predictions. Submit your forecasts for 7-day, 30-day, and 90-day timeframes. Earn points and compete on the leaderboard.',
  openGraph: {
    title: 'GPU Price Predictions | GPUAlpha',
    description: 'Make and track GPU price predictions.',
    url: 'https://gpualpha.com/predictions'
  }
}
```

### 8. Dashboard (`app/dashboard/page.tsx`)

Create `app/dashboard/layout.tsx`:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Dashboard',
  description: 'Your personal GPU price prediction dashboard. Track your accuracy, points, predictions, and performance over time.',
  robots: {
    index: false, // Don't index user dashboards
    follow: false
  }
}
```

### 9. User Profile (`app/users/[id]/page.tsx`)

Create `app/users/[id]/layout.tsx` with dynamic metadata:

```typescript
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Fetch user data to generate dynamic metadata
  // For now, use generic metadata
  return {
    title: 'User Profile',
    description: 'View user profile and prediction statistics.',
    robots: {
      index: false, // Don't index user profiles for privacy
      follow: false
    }
  }
}
```

---

## Step 3: Update Sitemap

Update `public/sitemap.xml` to include all public pages:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://gpualpha.com</loc>
    <lastmod>2025-01-XX</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://gpualpha.com/overview</loc>
    <lastmod>2025-01-XX</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://gpualpha.com/info</loc>
    <lastmod>2025-01-XX</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://gpualpha.com/history</loc>
    <lastmod>2025-01-XX</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://gpualpha.com/analytics</loc>
    <lastmod>2025-01-XX</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://gpualpha.com/leaderboard</loc>
    <lastmod>2025-01-XX</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://gpualpha.com/predictions</loc>
    <lastmod>2025-01-XX</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
```

---

## Step 4: Add Structured Data (JSON-LD)

Add structured data to homepage for rich snippets:

```typescript
// In app/page.tsx or layout
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "GPUAlpha",
  "description": "GPU Compute Price Index and Market Intelligence Platform",
  "url": "https://gpualpha.com",
  "applicationCategory": "FinanceApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

---

## Implementation Priority

1. **High Priority** (Do First):
   - ✅ Root layout metadata
   - ✅ Homepage metadata
   - ✅ Overview metadata
   - ✅ Update sitemap

2. **Medium Priority**:
   - ✅ Info page metadata
   - ✅ History page metadata
   - ✅ Analytics page metadata

3. **Low Priority**:
   - ✅ Leaderboard metadata
   - ✅ Predictions metadata
   - ✅ Dashboard noindex
   - ✅ User profile noindex

---

## Testing Checklist

After implementation:

- [ ] Verify metadata appears in page source (`<head>`)
- [ ] Test with Google Rich Results Test
- [ ] Test Open Graph tags with Facebook Debugger
- [ ] Test Twitter Card with Twitter Card Validator
- [ ] Verify sitemap is accessible
- [ ] Check robots.txt
- [ ] Test canonical URLs
- [ ] Verify noindex on protected pages

---

## Tools for Testing

- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **Schema.org Validator**: https://validator.schema.org/

