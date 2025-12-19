# 📝 SEO Metadata Template for New Pages

## Quick Reference Guide

When creating a new page in GPUAlpha, **always add SEO metadata** using one of these methods:

---

## Method 1: Layout File (Recommended for Routes)

Create a `layout.tsx` file in your route folder:

### Template for Public Pages (Indexable)

```typescript
// app/your-route/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Page Title',
  description: 'A clear, concise description of what this page offers (150-160 characters). Include relevant keywords naturally.',
  keywords: [
    'keyword 1',
    'keyword 2',
    'keyword 3',
    // Add 5-10 relevant keywords
  ],
  openGraph: {
    title: 'Your Page Title | GPUAlpha',
    description: 'Your page description for social media sharing.',
    url: 'https://gpualpha.com/your-route',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Page Title | GPUAlpha',
    description: 'Your page description for Twitter sharing.',
  },
  alternates: {
    canonical: 'https://gpualpha.com/your-route',
  },
}

export default function YourRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
```

### Template for Private Pages (Noindex)

```typescript
// app/private-route/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Private Page Title',
  description: 'Description of the private page.',
  robots: {
    index: false, // Don't index private pages
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function PrivateRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
```

### Template for Dynamic Routes

```typescript
// app/dynamic/[id]/layout.tsx
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Fetch data for dynamic metadata
  // const data = await fetchData(params.id)
  
  return {
    title: `Dynamic Page Title - ${params.id}`,
    description: 'Description based on dynamic content.',
    // Add other metadata...
  }
}

export default function DynamicRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
```

---

## Method 2: Metadata Export (For Server Components)

If your page is a server component, you can export metadata directly:

```typescript
// app/your-route/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Page Title',
  description: 'Your page description',
  // ... other metadata
}

export default function YourPage() {
  return <div>Your page content</div>
}
```

**Note**: This only works for server components. Client components (`'use client'`) must use layout files.

---

## SEO Checklist for New Pages

- [ ] **Title**: Clear, descriptive, 50-60 characters
- [ ] **Description**: Compelling, 150-160 characters, includes keywords
- [ ] **Keywords**: 5-10 relevant keywords
- [ ] **Open Graph**: Title, description, URL, image
- [ ] **Twitter Card**: Title, description, image
- [ ] **Canonical URL**: Set to prevent duplicate content
- [ ] **Robots**: Set `index: false` for private pages
- [ ] **Update sitemap.xml**: Add public pages to sitemap

---

## Examples from GPUAlpha

### Public Page Example (Info)
See: `app/info/layout.tsx`

### Private Page Example (Dashboard)
See: `app/dashboard/layout.tsx`

### Dynamic Route Example (User Profile)
See: `app/users/[id]/layout.tsx`

---

## Best Practices

1. **Title Format**: `Page Name | GPUAlpha` (uses template from root layout)
2. **Description Length**: 150-160 characters (optimal for search results)
3. **Keywords**: Natural, relevant, don't stuff
4. **Canonical URLs**: Always include to prevent duplicate content
5. **Open Graph**: Essential for social media sharing
6. **Private Pages**: Always set `robots.index = false`

---

## Common Mistakes to Avoid

❌ **Don't**: Forget to add metadata
❌ **Don't**: Use duplicate titles across pages
❌ **Don't**: Write descriptions over 160 characters
❌ **Don't**: Keyword stuff
❌ **Don't**: Forget canonical URLs
❌ **Don't**: Index private/user pages

✅ **Do**: Add metadata for every page
✅ **Do**: Use unique, descriptive titles
✅ **Do**: Write compelling descriptions
✅ **Do**: Include relevant keywords naturally
✅ **Do**: Set canonical URLs
✅ **Do**: Use noindex for private pages

---

## Need Help?

- Check existing layouts in `app/*/layout.tsx` for examples
- See `SEO_IMPLEMENTATION_PLAN.md` for detailed guide
- Review `SEO_PAGES_ANALYSIS.md` for page-specific recommendations

