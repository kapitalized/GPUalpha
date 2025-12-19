import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication Error',
  description: 'An error occurred during authentication.',
  robots: {
    index: false, // Don't index error pages
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function AuthErrorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

