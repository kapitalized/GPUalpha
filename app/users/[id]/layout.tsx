import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // In a real implementation, you would fetch user data here
  // For now, we use generic metadata with noindex for privacy
  return {
    title: 'User Profile',
    description: 'View user profile and prediction statistics.',
    robots: {
      index: false, // Don't index user profiles for privacy
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  }
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

